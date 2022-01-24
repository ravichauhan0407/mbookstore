const User=require('../models/user')

const bcrypt=require('bcryptjs')

const {check,validationResult}=require('express-validator')




exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage:req.flash('error')
  });
};


exports.postLogin = (req, res, next) => {
   
  const email=req.body.email;
  const password=req.body.password;

  User.findOne({email:email})
    .then(user => {

     if(!user)
     {
        req.flash('error','Invalid email or password');
        return res.redirect('/login')
     }

      bcrypt.compare(password,user.password)
      .then(domatch=>
        {
          if(domatch)
          {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            return  res.redirect('/');
          });
        }
         req.flash('error','Invalid email or password');
         return res.redirect('/login')
        })
     
    })
    .catch(err => { next(new Error(err))});
};

exports.getSignup=(req,res,next)=>
{
   console.log(res.locals)
     res.render('auth/signup',{
       path:'/signup',
       pageTitle:'SignUp',
       errorMessage:req.flash('error') 
     })
}
exports.postSignup=(req,res,next)=>
{

     const email=req.body.email;
     const password=req.body.password;
     const confirmPassword=req.body.confirmPassword;
     const error=validationResult(req);

     if(!error.isEmpty())
     {
          console.log(error);
          return res.status(422).render('auth/signup',{
            path:'/signup',
            pageTitle:'SIgn Up',
            errorMessage:error.array()[0].msg
          }
          )
     }
     User.findOne({email:email}).then(userdoc=>
      {
         if(userdoc) 
         {
          req.flash('error','Email already Exist');
           return res.redirect('/signup')
         }

          return  bcrypt.hash(password,12);

      })
      .then(hashedPassword=>
        {
          const user=User({email:email,password:hashedPassword,cart:{items:[]}})
          return user.save();
        })
      .then((result)=>
      {
        res.redirect('/login')

        
      })
      .catch((err)=>{ next(new Error(err))})
}
exports.postLogout=(req,res,next)=>
{
    
     req.session.destroy(()=>
     {
         res.redirect('/login');
     })
}


exports.getResetPassword = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage:req.flash('error')
  });
};