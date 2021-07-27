const mongoose = require('mongoose');

const ClientesSchema = mongoose.Schema({
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
    empresa: {
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
    telefone: {
        type: String,
        trim: true,
    },
    criado: {
        type: Date,
        default: Date.now()
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario'
    }
});

module.exports = mongoose.model('Cliente', ClientesSchema);