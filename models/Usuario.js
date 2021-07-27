const mongoose = require('mongoose');

const UsuariosSchema = mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    sobrenome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    confirmPassword: {
        type: String,
        required: true,
        trim: true,
    },
    criado: {
        type: Date,
        default: Date.now()
    },
    rol: {
        type: String,
        default: 'USUARIO'
    }
});

module.exports = mongoose.model('Usuario', UsuariosSchema);