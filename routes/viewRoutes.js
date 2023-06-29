const express = require('express'); 
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')

const router = express.Router(); 
 
 router.get('/', authController.isLoggedIn ,viewController.getOverview)
 router.get('/article/:slug', authController.isLoggedIn,  viewController.getArticle)
 router.get('/signup', authController.isLoggedIn,  viewController.getSignupForm)
 router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
 router.get('/portfolio', authController.isLoggedIn, viewController.getportFolio)
 router.get('/cours', authController.isLoggedIn, viewController.getCours)
 router.get('/me', authController.protect, viewController.getAccount);
 


 router.post(
    '/submit-user-data',
    authController.protect,
    viewController.updateUserData
  );

module.exports = router;