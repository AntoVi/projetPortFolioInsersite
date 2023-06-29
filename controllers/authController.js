const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email')

const signToken = id => {
    return jwt.sign({ id:id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
      if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });
}

exports.signup = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req,res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new AppError('Veuillez remplir le mot de passe et le mail', 400))
    }

    const user = await User.findOne({email: email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('mot de passe ou email incorrects', 401))
    }

   createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if its here
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
      }

    if(!token) {
        return next(new AppError('Utilisateur non connecté, veuillez vous connecter', 401))
    }
    // 2) Verificate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // 3) Check if user still exists 
    const currentUser = await User.findById(decoded.id)
    if(!currentUser) {
        return next(new AppError('Utilisateur supprimé', 401))
    }

    // 4) check if user changed password after the token was issued 
    // problème sur cette partie : ne fonctionne pas
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new AppError('Cet utilisateur a modifié son mot de passe, veuillez vous reconnecter.', 401)
        );
      }

    //Grant access to protected Route
    req.user = currentUser;
    res.locals.user = currentUser;
    next()
})

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {

        // 1) verify the token
        const decoded = await promisify(jwt.verify) (
            req.cookies.jwt,
            process.env.JWT_SECRET
        )
        // 2) Check if user still exists 
        const currentUser = await User.findById(decoded.id)
        if(!currentUser) {
            return next()
        }

        // 4) check if user changed password after the token was issued 
        // problème sur cette partie : ne fonctionne pas
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        }

        //There is a logged user
        res.locals.user = currentUser;
        return next()
        } catch(err) {
            return next()
        }
    }
    next();
};


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError('Vous ne pouvez pas effectuer cette action'))
        }

        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1 ) get user based on posted email
    const user = await User.findOne( {email: req.body.email })

    if(!user) {
        return next(new AppError('Aucun utilisateur avec ce mail', 404))
    }
    // 2) Generate the random reset token 
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })
    //3 sned it to user's mail

    const resetURL = `${req.protocol}://${req.get('host')}/boutique/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}. \n if you
    didnt forgot please ignore this email`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'votre jeton de renouvellement (valide pour 10 min)', 
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'jeton envoyé au mail'
        })
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false })

        return next(new AppError('Une erreur est survenue lors de l\'envoi du mail, réassayez plus tard'), 500)
    }
    
})

 

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1 Get user based on the token 
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() }})

    // 2 If token has not expired, and there is user, set the new password 
    if(!user) {
        return next(new AppError('Jeton invalide ou expiré ', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3 update changedpassword at for the user

    // 4 ) log the user in, send JWT
    createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1) Get user from collection 
    const user = await User.findById(req.user.id).select('+password');
    //2 check if posted password is correct 
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Votre mot de passe actuel est invalide', 401))
    }
    //3) Is so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save();
    
    //4) Log user in , send JWT
    createSendToken(user, 200, res);
})