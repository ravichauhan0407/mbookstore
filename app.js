const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session=require('express-session')
const MongodbStore=require('connect-mongodb-session')(session);
const errorController = require('./controllers/error');
const User = require('./models/user');
const flash=require('connect-flash')
const csurf=require('csurf')
const createHash=require('hash-generator')
const helmet=require('helmet')
const multer =require('multer')
const compression=require('compression')
const morgan=require('morgan')
const fs=require('fs')


var fileFilter=(req,file,cb)=>
{
     if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg')
     {
          cb(null,true);
     }
     else
     {
         cb(null,false);
     }
}
var fileStorage=multer.diskStorage(
  {
      destination:(req,file,cb)=>
      {
          
          cb(null,'images');
      },
      filename:(req,file,cb)=>
      {
          const hash=createHash(8)
         cb(null,hash+file.originalname)
      }
  }
)

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes=require('./routes/auth')

const accessLogStream=fs.createWriteStream(
   path.join(__dirname,'access.log'),{flags:'a'}
)



app.use(helmet())
app.use(compression())
app.use(morgan('combined',{stream:accessLogStream}))

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({storage: fileStorage,fileFilter:fileFilter}).single('image'))





const store=new MongodbStore({
  uri: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.mrsr9.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`,
  collection:'sessions'
})
const csurfProtection=csurf()
app.use(session({ secret:'my secret' , resave:false , saveUninitialized:false,store:store }))
app.use(flash())
app.use(csurfProtection)
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err))
});

app.use((req,res,next)=>
{
    
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next()
})



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)

app.use(errorController.get500)
app.use(errorController.get404);
app.use((error,req,res,next)=>
{
      res.redirect('/500')
})

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.mrsr9.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`,{ useNewUrlParser: true,useUnifiedTopology: true }
  )
  .then(result => {
    app.listen(process.env.PORT||3000);
  })
  .catch(err => {
    console.log(err);
  });
