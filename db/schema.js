const { gql } = require("apollo-server");

// Schema
const typeDefs = gql`
type Usuario{
    id: ID
    nome: String
    sobrenome: String
    email: String
    criado: String
    rol: Roles
}

type Token {
    token: String
}

type Produto {
    id: ID
    nome: String
    existencia: Int
    preco: Float
    criado: String
}
type Cliente {
    id: ID
    nome: String
    sobrenome: String
    empresa: String
    email: String
    telefone: String
    vendedor: ID
}
type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: Cliente
    vendedor: ID
    data: String
    estado: EstadoPedido
}
type PedidoGrupo {
    id: ID
    quantidade: Int
    nome: String
    preco: Float
}
type TopCliente {
    total: Float
    cliente: [Cliente]
}
type TopVendedor {
    total: Float
    vendedor: [Usuario]
}

input UsuarioInput {
    nome: String
    sobrenome: String
    email: String
    password: String
    confirmPassword: String
}
input AutenticarInput {
    email: String!
    password: String!
}
input ProdutoInput {
    nome: String!
    existencia: Int!
    preco: Float!
}
input ClientInput {
    nome: String!
    sobrenome: String!
    empresa: String!
    email: String!
    telefone: String
}
input PedidoProdutoInput {
    id: ID
    quantidade: Int
    nome: String
    preco: Float
}
input PedidoInput {
    pedido: [PedidoProdutoInput]
    total: Float
    cliente: ID
    estado: EstadoPedido
}

enum EstadoPedido {
    PENDENTE
    COMPLETADO
    CANCELADO
}

enum Roles {
    USUARIO
    ADMIN
    CANDIDATO
    CLIENTE
}

type Query {
    # Usuarios
    # obterUsuario(token: String!): Usuario
    obterUsuario: Usuario
    # Produtos
    obterProdutos: [Produto]
    obterUmProduto(id: ID!): Produto
    # Cliente
    obterClientes: [Cliente]
    obterClientesVendedor: [Cliente]
    obterUmCliente(id: ID!): Cliente
    #Pedidos
    obterPedidos: [Pedido]
    obterPedidosVendedor: [Pedido]
    obterUmPedido(id: ID!): Pedido
    obterPedidoEstado(estado: String!):[Pedido]
    # Buscas Avancadas
    melhoresClientes: [TopCliente]
    melhoresVendedores: [TopVendedor]
    buscarProduto(texto: String!): [Produto]
}

type Mutation {
    # Usuarios
    novoUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: AutenticarInput): Token
    
    # Produtos
    novoProduto(input: ProdutoInput): Produto
    atualizarProduto( id: ID!, input : ProdutoInput): Produto
    eliminarProduto(id: ID!): String

    # Clientes
    novoCliente(input: ClientInput): Cliente
    atualizarCliente(id: ID!, input : ClientInput): Cliente
    eliminarCliente(id:ID!): String

    # Pedidos
    novoPedido(input: PedidoInput): Pedido
    atualizarPedido(id: ID!, input : PedidoInput): Pedido
    eliminarPedido(id:ID!): String
}
`;

module.exports = typeDefs;
