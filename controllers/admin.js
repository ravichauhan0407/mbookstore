const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage:''
    
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  
  if(!image)
  {
       return res.status(422).render('admin/edit-product',
       {
        pageTitle: 'Add Product',
        path: '/admin/edit-product',
        editing: true,
        product: {
          title: title,
          price: price,
          description: description,
          
        },
        errorMessage:'Attach file is not Image'

       })
            
       
  }
  
  const imageUrl='/'+image.path;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      next(new Error(err))
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
     
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        errorMessage:null
  
      });
    })
    .catch(err => { next(new Error(err))});
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image =req.file;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image)
      {
          product.imageUrl='/'+image.path;
      }
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => { next(new Error(err))});
};

exports.getProducts = (req, res, next) => {
  Product.find({userId:req.user._id})
    .then(products => {
      
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
    
      });
    })
    .catch(err => { next(new Error(err))});
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId =req.params.productId
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.json({message:'success'});
    })
    .catch(err =>{ next(new Error(err))});
};
