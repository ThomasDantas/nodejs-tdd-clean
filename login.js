// const express = require('express')
// const router = express.Router()
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')

module.exports = () => {
  const router = new SignUpRouter()
  router.post('/signup', ExpressRouterAdapater.adapt(router))
}

class ExpressRouterAdapater {
  static adapt (router) {
    return async (req, res) => {
      const htttpRequest = {
        body: req.body
      }
      const httpReponse = await router.route(htttpRequest)
      res.status(httpReponse.statusCode).json(httpReponse.body)
    }
  }
}

// presentation = expoe pro client
class SignUpRouter {
  async route (htttpRequest) {
    const { email, password, repeatPassword } = htttpRequest.body
    const newUser = new SignUpUseCase().signUp(email, password, repeatPassword)
    return {
      statusCode: 200,
      body: newUser
    }
  }
}

// domain - regra de negocio
class SignUpUseCase {
  async signUp (email, password, repeatPassword) {
    if (password === repeatPassword) {
      new AddAccountRepository().add(email, password)
    }
  }
}

// infra - framework/orm
class AddAccountRepository {
  async add (email, password) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}
