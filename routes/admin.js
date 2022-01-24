const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();
const auth=require('../middleware/auth.js')

// /admin/add-product => GET
router.get('/add-product',auth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product',adminController.postEditProduct);

router.delete('/product/:productId', adminController.postDeleteProduct);

module.exports = router;
