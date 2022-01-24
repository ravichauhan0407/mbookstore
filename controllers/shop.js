const Product = require('../models/product');
const Order = require('../models/order');
const ITEM_PER_PAGE=2;
exports.getProducts = (req, res, next) => {
     
          let page =req.query.page||1;
         
     let totalPage;
  
    Product.find()
    .count()
    .then(num=>
      {
          
          totalPage=Math.ceil(num/2);
          page=Math.ceil(page);
          return Product.find().skip((page-1)*ITEM_PER_PAGE).limit(ITEM_PER_PAGE)
          

      })
    .then(products => {
     
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        page:page,
        totalPage:totalPage
       
      
      });
    })
    .catch(err => {
       
         next(new Error(err))
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
    
      });
    })
    .catch(err => { next(new Error(err))});
};

exports.getIndex = (req, res, next) => {

  let page =req.query.page||1;
         
  let totalPage;

 Product.find()
 .count()
 .then(num=>
   {
       
       totalPage=Math.ceil(num/2);
       page=Math.ceil(page);
       return Product.find().skip((page-1)*ITEM_PER_PAGE).limit(ITEM_PER_PAGE)
       

   })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        page:page,
        totalPage:totalPage
   
      });
    })
    .catch(err => {
       
      next(new Error(err))
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
     
      });
    })
    .catch(err => { next(new Error(err))});
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => { next(new Error(err))});
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email:req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => { next(new Error(err))});
};

exports.getOrders = (req, res, next) => {
  console.log('helllo')
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      
      });
    })
    .catch(err => { next(new Error(err))});
};
