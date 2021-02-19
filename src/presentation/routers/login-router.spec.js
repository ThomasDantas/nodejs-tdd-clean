// spec - teste
const LoginRouter = require('../routers/login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')
const InvalidParamError = require('../helpers/invalid-param-error')
const ServerError = require('../helpers/server-error')

const makeSut = () => {
  const authUseCase = makeAuthUseCase()
  const emailValidator = makeEmailValidator()
  const sut = new LoginRouter(authUseCase, emailValidator)
  return {
    sut,
    authUseCase,
    emailValidator
  }
}

const makeEmailValidator = () => {
  class EmailValidator {
    isValid (email) {
      return this.isEmailValid
    }
  }

  const emailValidator = new EmailValidator()
  emailValidator.isEmailValid = true

  return emailValidator
}

const makeEmailValidatorWithError = () => {
  class EmailValidator {
    isValid () {
      throw new Error()
    }
  }

  return new EmailValidator()
}

const makeAuthUseCase = () => {
  class AuthUseCase {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }

  const authUseCase = new AuthUseCase()
  authUseCase.accessToken = 'valid_token'
  return authUseCase
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCase {
    auth () {
      throw new Error()
    }
  }
  return new AuthUseCase()
}

describe('Login Router', () => {
  test('should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'anyway'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'anyway@gmail.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpRequest = {}
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should call AuthUseCase with correct params', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'anyway@gmail.com',
        password: 'anyway_password'
      }
    }
    await sut.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()
    authUseCase.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid@gmail.com',
        password: 'invalid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid@gmail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCase.accessToken)
  })

  test('should return 500 if no AuthUseCase is provided', async () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'valid@gmail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if no AuthUseCase has no auth method', async () => {
    class AuthUseCase {}
    const authUseCase = new AuthUseCase()
    const sut = new LoginRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'valid@gmail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if AuthUseCase throws', async () => {
    const authUseCase = makeAuthUseCaseWithError()
    const sut = new LoginRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'valid@gmail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidator } = makeSut()
    emailValidator.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'anyway'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('should return 500 if no EmailValidator is provided', async () => {
    const authUseCase = makeAuthUseCase()
    const sut = new LoginRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'valid@gmail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if no EmailValidator has no isValid method', async () => {
    const authUseCase = makeAuthUseCase()
    const sut = new LoginRouter(authUseCase, {})
    const httpRequest = {
      body: {
        email: 'valid@gmail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if EmailValidator throws', async () => {
    const authUseCase = makeAuthUseCase()
    const emailValidator = makeEmailValidatorWithError()
    const sut = new LoginRouter(authUseCase, emailValidator)
    const httpRequest = {
      body: {
        email: 'valid@gmail.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
