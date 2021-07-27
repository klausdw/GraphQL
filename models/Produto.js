const mongoose = require('mongoose');

const ProdutosSchema = mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    existencia: {
        type: Number,
        required: true,
        trim: true
    },
    preco: {
        type: Number,
        required: true,
        trim: true
    },
    criado: {
        type: Date,
        default: Date.now()
    }
});

ProdutosSchema.index({ nome: 'text'});

module.exports = mongoose.model('Produto', ProdutosSchema);