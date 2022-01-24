const express = require('express');

const authController = require('../controllers/auth');

const {check,body}=require('express-validator')

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login',check('email').isEmail().withMessage('please enter valid email') ,authController.postLogin)
router.get('/signup',authController.getSignup)
router.post('/signup',[check('email').isEmail().withMessage('please enter valid email'),

body('password').isLength({min:8}).withMessage('Password length should have at least 8'),
body('confirmPassword').custom((value,{req})=>{
    
     if(value!=req.body.password)
     {
         throw new Error('Passwords should be match');
     }
     return true;
})],authController.postSignup)
router.post('/logout',authController.postLogout)
router.get('/reset',authController.getResetPassword)
module.exports = router;