const mongoose = require('mongoose')
require('dotenv').config({ path: 'local.env'});

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex:true,
        });
        console.log('Mongo Online');
    } catch (error) {
        console.log('Erro !!');
        console.log(error);
        process.exit(1);
    }
}

module.exports = conectarDB;