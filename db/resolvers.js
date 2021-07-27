const Usuario = require("../models/Usuario");
const Produto = require("../models/Produto");
const Cliente = require("../models/Cliente");
const Pedido = require("../models/Pedido");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
require("dotenv").config({ path: "local.env" }); 

const criarToken = (usuario, secreta, expiresIn) => {
  console.log(usuario);
  const { id, email, nome, sobrenome } = usuario;

  return jwt.sign( { id, email, nome, sobrenome }, secreta, { expiresIn });
}; 

// Resolvers
const resolvers = {
  Query: {
    obterUsuario: async (_, {}, ctx) => {
      return ctx.usuario;
      // const usuarioId = await jwt.verify(token, process.env.SECRETA);
      // return usuarioId;
    },
    obterProdutos: async () => {
      try {
        const produtos = await Produto.find({});
        return produtos;
      } catch (error) {
        console.log(error);
      }
    },
    obterUmProduto: async (_, { id }) => {
      // verificar se o produto existe
      const produto = await Produto.findById(id);
      if (!produto) {
        throw new Error("Produto não existe");
      }
      return produto;
    },
    obterClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obterClientesVendedor: async (_, {}, ctx) => {
      try {
        const clientes = await Cliente.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obterUmCliente: async (_, { id }, ctx) => {
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("Cliente não existe");
      }
      // Quem criou pode ver
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Não existe permissão");
      }
      return cliente;
    },
    // Pedidos
    obterPedidos: async () => {
      try {
        const pedidos = await Pedido.find({});
        return pedidos;

      } catch (error) {
        console.log(error);
      }
    },
    obterPedidosVendedor: async (_, {}, ctx) => {
      try {
        const pedidos = await Pedido.find({ vendedor: ctx.usuario.id }).populate('cliente');
        // console.log(pedidos);
        return pedidos;

      } catch (error) {
        console.log(error);
      }
    },
    obterUmPedido: async (_, {id}, ctx) => {
      // Se existe 
      const pedido = await Pedido.findById(id);
      if(!pedido) {
        throw new Error("Pedido não existe");
      }
      // Quem criou
      if(pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Permissão negada");
      }
      return pedido;
    },
    obterPedidoEstado: async (_, {estado}, ctx) => {
      const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado})
      return pedidos;
    },
    melhoresClientes: async () => {
      const clientes = await Pedido.aggregate([
        { $match: {estado: 'COMPLETADO'} },
        { $group: {
          _id: "$cliente",
          total: { $sum: '$total'}
        }},
        {
          $lookup: {
            from: 'clientes',
            localField: '_id',
            foreignField: '_id',
            as: 'cliente'
          }
        },
        {
          $limit: 10
        },
        {
          $sort: { total: -1}
        }
      ]);
      return clientes;
    },
    melhoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: {estado: 'COMPLETADO'} },
        { $group: {
          _id: '$vendedor',
          total: {$sum: '$total'}
        }},
        {
          $lookup: { 
            from: 'usuarios',
            localField: '_id',
            foreignField: '_id',
            as: 'vendedor'
          }
        },
        {
          $limit: 10
        },
        {
          $sort: { total: -1 }
        }
      ]);
      return vendedores;
    },
    buscarProduto: async (_, { texto }) => {
      const produtos = await Produto.find({ $text: { $search: texto}}).limit(10)
      return produtos;
    }
  },
  Mutation: {
    novoUsuario: async (_, { input }) => {
      const { email, password } = input;

      // Se já existe esse usuario
      const existeUsuario = await Usuario.findOne({ email });
      //console.log(existeUsuario);
      if (existeUsuario) {
        throw new Error("Usuario já existe");
      }

      // Hash password
      const salt = bcryptjs.genSaltSync(10);
      input.password = bcryptjs.hashSync(password, salt);

      try {
        // Save on Mongo
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      // Se o usuario existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error("Usuário ou senha não encontrados");
      }
      // Se o password esta correto
      const passwordCorreto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );
      if (!passwordCorreto) {
        throw new Error("Usuário ou senha não encontrados");
      }
      // Criar Token
      return {
        token: criarToken(existeUsuario, process.env.SECRETA, "24h"),
      };
    },
    novoProduto: async (_, { input }) => {
      try {
        const produto = new Produto(input);
        const resultado = await produto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    atualizarProduto: async (_, { id, input }) => {
      // verificar se o produto existe
      let produto = await Produto.findById(id);
      if (!produto) {
        throw new Error("Produto não existe");
      }
      // salvar
      produto = await Produto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return produto;
    },
    eliminarProduto: async (_, { id }) => {
      let produto = await Produto.findById(id);
      if (!produto) {
        throw new Error("Produto não existe");
      }
      // Eliminar
      await Produto.findOneAndDelete({ _id: id });
      return "Produto excluido";
    },
    novoCliente: async (_, { input }, ctx) => {
      // console.log(ctx);
      const { email } = input;
      // Cliente esta registrado
      //console.log(input);
      const cliente = await Cliente.findOne({ email });
      if (cliente) {
        throw new Error("Cliente já existe");
      }
      const novoCliente = new Cliente(input);
      // referencia ao vendedor
      novoCliente.vendedor = ctx.usuario.id;
      // salvar
      try {
        const resultado = await novoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    atualizarCliente: async (_, { id, input }, ctx) => {
      // Verificar se existe
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("Cliente não existe");
      }
      // Verificar se o vendedor e quem edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Não existe permissão");
      }
      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      // Verificar se existe
      let cliente = await Cliente.findById(id);
      if (!cliente) {
        throw new Error("Cliente não existe");
      }
      // Verificar se o vendedor e quem edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Não existe permissão");
      }
      await Cliente.findOneAndDelete({ _id: id });
      return "Cliente excluido";
    },
    novoPedido: async (_, { input }, ctx) => {
      const { cliente } = input;
      // Verificar se existe
      let clienteExiste = await Cliente.findById(cliente);
      if (!clienteExiste) {
        throw new Error("Cliente não existe");
      }
      // Verificar se o cliente é do vendedor
      if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Não existe permissão");
      }
      // Stock disponivel
        //console.log(input.pedido)
      for await ( const artigo of input.pedido) {
        const { id } = artigo;
        const produto = await Produto.findById(id);
        //console.log(produto);

        if(artigo.quantidade > produto.existencia){
          throw new Error(`O Produto: ${produto.nome} excede a quantidade disponivel`);
        } else {
          // quantidade do pedido menos a quantidade do banco de dados
          produto.existencia = produto.existencia - artigo.quantidade;

          await produto.save();
        }
      }
      // Criar um novo pedido 
      const novoPedido = new Pedido(input);

      novoPedido.vendedor = ctx.usuario.id;

      // Salvar
      const resultado = await novoPedido.save();
      return resultado;
    },
    atualizarPedido: async (_, {id, input}, ctx) => {
      const { cliente } = input;
      // Se o pedido existe
      const existePedido = await Pedido.findById(id);
      if (!existePedido) {
        throw new Error("Pedido não existe");
      }
      // Se o cliente existe
      const existeCliente = await Cliente.findById(cliente);
      if (!existeCliente) {
        throw new Error("Cliente não existe");
      }
      // Se o cliente e o pedido pertencem ao vendedor
      if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("Não existe permissão");
      }
      // Revisar o stock
      if (input.pedido) {
        for await (const artigo of input.pedido) {
          const { id } = artigo;
          const produto = await Produto.findById(id);
          //console.log(produto);

          if (artigo.quantidade > produto.existencia) {
            throw new Error(
              `O Produto: ${produto.nome} excede a quantidade disponivel`
            );
          } else {
            // quantidade do pedido menos a quantidade do banco de dados
            produto.existencia = produto.existencia - artigo.quantidade;

            await produto.save();
          }
        }
      }
      // Salvar
      const resultado = await Pedido.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return resultado;
    },
    eliminarPedido: async(_, { id }, ctx) => {
      const pedido = await Pedido.findById(id)
      if (!pedido) {
        throw new Error("Pedido não existe");
      }
      // vendedor
      if(pedido.vendedor.toString() !== ctx.usuario.id){
        throw new Error("Não existe permissão");
      }
      await Pedido.findByIdAndDelete({ _id: id})
      return 'Pedido excluido';
    },
  },
};

module.exports = resolvers;
