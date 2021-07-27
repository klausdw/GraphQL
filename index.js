const { ApolloServer, gql } = require('apollo-server')
require("dotenv").config({ path: "local.env" }); 
// Imports
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const jwt = require('jsonwebtoken')
// DB
const conectarDB = require('./config/db')

conectarDB();

// servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        //console.log(req.headers['authorization'])
        // console.log(req.headers);
        const token = req.headers['authorization'] || '';
        if(token) {
            try {
                // remove Bearer
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                //console.log(usuario);
                return { usuario }
            } catch (error) {
                console.log('Erro no Token');
                console.log(error);
            }
        }
    }
});

server.listen({ port: process.env.PORT || 4000 }).then( ({url}) => {
    console.log(`Online on: ${url}`)
})
