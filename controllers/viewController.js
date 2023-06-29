const Article = require('./../models/articleModel')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')

exports.getOverview = catchAsync(async (req, res, next) => {
    //1) get tour data from collection 
    const articles = await Article.find();
    // 2) build template 
    // 3) render that template using tour data from 1) 

    res.status(200).render('overview', {
        title: 'Tous les articles',
        articles: articles
    })
})

exports.getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findOne({ slug: req.params.slug })

  if(!article) {
    return next(new AppError('Aucun article avec ce nom', 404))
  }

  res.status(200).render('article', {
    title: `${article.name}`,
    article: article
  })
})

exports.getportFolio = (req, res) => {
  res.status(200).render('portfolio', {
    title: 'Bienvenue sur le portfolio'
  })
}

exports.getCours = (req, res) => {
  res.status(200).render('cours', {
    title: 'Bienvenue sur les cours suivis chez insersite'
  })
}

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
      title: 'Créez votre compte'
  })
}

// exports.getSignupForm = catchAsync( async (req, res, next) => {
//   const newUser = await User.create({
//       name: req.body.name,
//       email: req.body.email,
//       password: req.body.password,
//       passwordConfirm: req.body.passwordConfirm
//   });

//   res.status(200).render('signup', {
//     title: 'Your account',
//     user: newUser
//   });
// })

 exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Connectez-vous à votre compte'
    })
 }

 exports.getAccount = (req, res) => {
    res.status(200).render('account', {
      title: 'Votre compte'
    });
  };
  
  exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });
  
