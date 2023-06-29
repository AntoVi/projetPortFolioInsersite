const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down')
    console.log(err.name, err.message)
    process.exit(1); 
  })

dotenv.config({path: './config.env'});
const app = require('./app')


mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => console.log('CONNECTION A LA DB REUSSIE'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`l'application tourne sur le port ${port}...`)
});