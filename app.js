const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cookieParser = require('cookie-parser')
const cors = require('cors')


const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController');
const articleRouter = require('./routes/articleRoutes')
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes')
const app = express()

// Initialisation des middlewares
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

// securité HTTP
// app.use(helmet())

app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"],
        },
      },
    })
  );

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); 
}

// limitation de requete de la meme IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Trop de requête venant de la même IP, réassayez dans une heure !'
});
app.use('/boutique', limiter)

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// Protection contre les injections noSQL 
app.use(mongoSanitize());

// Protection contre les injections XSS 
app.use(xss());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

// Routes

app.use('/', viewRouter)
app.use('/boutique/v1/articles', articleRouter);
app.use('/boutique/v1/users', userRouter);


app.all('*', (req, res, next) => {
    next(new AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur`, 404))
})

app.use(globalErrorHandler)


//lancement server

module.exports = app;
