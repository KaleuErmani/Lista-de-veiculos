import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(express.json()) 
app.use(cors())

const listaVeiculos = [{id: 1, modelo: 'civic', marca: 'honda', ano: 2008, cor: 'branco', preço: 55000}]

// 1 - Crie um Endpoint para Criar veículo
// -> Seu carro deve ter os seguintes dados : modelo, marca,
// ano, cor e preço.
// -> O veículo deve ser adicionado na lista de veículos que
// armazena todos os veículos cadastrados
// -> Todo veículo deve ter um identificador único. Este
// identificador deve ser gerado de forma automáticaz

app.post('/listaVeiculos', (request, response) => {
    const {modelo, marca, ano, cor, preço} = request.body

    const novoVeiculo = {
        id: listaVeiculos.length + 1,
        modelo,
        marca,
        ano,
        cor,
        preço,
    }

    listaVeiculos.push(novoVeiculo)

    response.status(201).json({message: 'Veiculo adicionado com sucesso!', novoVeiculo})
})


// 2 - Crie um Endpoint o para ler todos os veículos
// ->O sistema deve listar os veículos com o seguinte layout:
// ID: 1 | Modelo: Civic| Marca: Honda | Ano: 2014/2015 | Cor: Azul |
// Preço: R$40.000
// ID: 1 | Modelo: Civic| Marca: Honda | Ano: 2014/2015 | Cor: Azul |
// Preço: R$40.000

app.get('/listaVeiculos', (request, response) => {

    if(listaVeiculos.length === 0) {
        return response.status(404).json({message: 'Nenhum veiculo encontrado!'}) 
    }
    response.json(listaVeiculos)
})

//3 - Crie um Endpoint filtrar veículos por marca
// -> O sistema deve pedir para o usuário digitar a marca que
// quer filtrar
// -> Deve ser listado os veículos que forem da mesma marca
// -> A lista deve ter o seguinte layout:
// ID: 1 | Modelo: Civic| Cor: Azul | Preço: R$40.000

app.get('/listaVeiculos/marca/:marca', (request, response) => { 
    const { marca } = request.params
  
    const veiculosFiltrados = listaVeiculos.filter(veiculo => veiculo.marca === marca)
  
    if (veiculosFiltrados.length === 0) {
        return response.status(404).json({ message: 'Nenhum veículo encontrado!' })
    }
    response.status(200).json(veiculosFiltrados)
  })

app.listen(3000, () => {
    console.log('O servidor esta rodando na porta 3000.')
})

// 4 - Crie um Endpoint para Atualizar veículo
// -> O usuário deve digitar o IDENTIFICADOR do veículo
// -> O Sistema deve verificar se o veículo existe ou não e
// mostrar a seguinte mensagem caso o veículo não exista:
// "Veículo, não encontrado. O usuário deve voltar para o menu
// inicial depois"
// -> Se o veículo existir, o sistema deve permitir que o usuário
// atualize somente a cor e o preço.

app.put('/listaVeiculos/:id', (request, response) => {
    const { id } = request.params
    const veiculo = listaVeiculos.find(veiculo => veiculo.id == (id))

    const { cor: corAlterada, preço} = request.body

    if(!veiculo) {
        return response.status(404).json({message: 'Veículo não encontrado.'})
    }

    veiculo.cor = corAlterada
    veiculo.preço = preço

    const atualizações = request.body
    Object.keys(atualizações).forEach(key => {
        if (key in veiculo) {
            veiculo[key] = veiculo[key]
        }
    })

    response.status(200).json({message: 'Veiculo atualizado com sucesso.', veiculo})
})

// 5 - Crie um Endpoint Remover veículo
// ->O usuário digitar o IDENTIFICADOR do veículo
// -> O Sistema deve verificar se o veículo existe ou não e
// mostrar a seguinte mensagem caso o veículo não exista:
// "Veículo, não encontrado. O usuário deve voltar para o menu
// inicial depois"
// -> Se o veículo existir, o sistema deve remover o veículo

app.delete('/listaVeiculos/:id', (request, response) => {
    const { id } = request.params
    const veiculoIndex = listaVeiculos.findIndex(veiculo => veiculo.id === parseInt(id))

    if (veiculoIndex === -1) {
        return response.status(404).json({message: 'Veiculo não encontrado.'})
    }   

    const [veiculoDeletado] = listaVeiculos.splice(veiculoIndex, 1)
    response.status(200).json({message: 'veiculo removido com sucesso', veiculo: veiculoDeletado})
})

// 6 - Crie um Endpoint Criar uma pessoa usuária

// -> Deve conter as seguintes informações : Nome , email ,
// senha
// -> Verificar se está sendo passado os dados ;
// -> A senha deve ser criptografada utilizando o bcrypt ;
// -> Exibir a mensagem "Usuário criado com sucesso"

const usuarios = []

app.post('/criarUsuario', async (request, response) => {
    try {
      const { nome, email, senha } = request.body

        if (!nome || !email || !senha) {
        return response.status(400).json({ message: 'Nome, email e senha são obrigatórios.' })
        }
  
        const existeUsuario = usuarios.find(usuario => usuario.email === email)

        if (existeUsuario) {
            return response.status(400).json({ message: 'Usuário já existe.' })
        }
  
        const hashedSenha = await bcrypt.hash(senha, 10)

        const novoUsuario = {
            id: uuidv4(),
            nome,
            email,
            senha: hashedSenha
        }
  
        usuarios.push(novoUsuario)
  
        response.status(201).json({message: 'Usuario criado com sucesso.', usuario: novoUsuario})
    } catch {
      response.status(500).json({message: 'Erro ao criar usuario.'})
    }
  })

// 7 - Crie um Endpoint logar uma pessoa usuária

// ->Login deve ser feito usando email e senha ;
// -> Fazer as verificações caso a pessoa usuária não colocar os
// dados;
// -> A senha precisa ser comparada com a criptografada e se
// forem iguais, logar no sistema.

app.post('/logarUsuario', async (request, response) => {
    try {
      const { email, senha } = request.body

      if (!email || !senha) {
        return response.status(400).json({ message: 'email e senha são obrigatórios.' })
        }
  
        const usuarioEncontrado = usuarios.find(usuario => usuario.email === email);
  
      if (!usuarioEncontrado) {
        return response.status(404).json({message: 'Usuario não encontrado.'})
      }
  
      const isMatch = await bcrypt.compare(senha, usuarioEncontrado.senha)
  
      if (!isMatch) {
        return response.status(400).json({message: 'Senha incorreta.'})
      }
  
      response.status(200).json({message: 'Login de usuario realizado com sucesso.'})
    } catch {
      response.status(500).json({message: 'Erro ao fazer login.'})
    }
  })