const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncrypter = () => {
  class Encrypter {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }

  const encrypter = new Encrypter()
  encrypter.isValid = true
  return encrypter
}

const makeTokenGnerator = () => {
  class TokenGenerator {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }

  const tokenGenerator = new TokenGenerator()
  tokenGenerator.accessToken = 'any_token'
  return tokenGenerator
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepository {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepository = new LoadUserByEmailRepository()
  loadUserByEmailRepository.user = {
    id: 'any_id',
    password: 'hashed_password'
  }

  return loadUserByEmailRepository
}

const makeSut = () => {
  const encrypter = makeEncrypter()
  const loadUserByEmailRepository = makeLoadUserByEmailRepository()
  const tokenGenerator = makeTokenGnerator()

  const sut = new AuthUseCase({ loadUserByEmailRepository, encrypter, tokenGenerator })
  return {
    sut,
    loadUserByEmailRepository,
    encrypter,
    tokenGenerator
  }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@gmail.com')
    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepository } = makeSut()
    await sut.auth('any_email@gmail.com', 'any_password')
    expect(loadUserByEmailRepository.email).toBe('any_email@gmail.com')
  })

  test('Should throw if no dependency is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@gmail.com', 'any_password')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase({})
    const promise = sut.auth('any_email@gmail.com', 'any_password')
    expect(promise).rejects.toThrow()
  })

  test('Should throw if no LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({ loadUserByEmailRepository: {} })
    const promise = sut.auth('any_email@gmail.com', 'any_password')
    expect(promise).rejects.toThrow()
  })

  test('Should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepository } = makeSut()
    loadUserByEmailRepository.user = null
    const accessToken = await sut.auth('invalid_email@gmail.com', 'any_password')
    expect(accessToken).toBeNull()
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut, encrypter } = makeSut()
    encrypter.isValid = false
    const accessToken = await sut.auth('valid_email@gmail.com', 'invalid_password')
    expect(accessToken).toBeNull()
  })

  test('Should call Encrypter if correct values', async () => {
    const { sut, loadUserByEmailRepository, encrypter } = makeSut()
    await sut.auth('valid_email@gmail.com', 'any_password')
    expect(encrypter.password).toBe('any_password')
    expect(encrypter.hashedPassword).toBe(loadUserByEmailRepository.user.password)
  })

  test('Should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepository, tokenGenerator } = makeSut()
    await sut.auth('valid_email@gmail.com', 'valid_password')
    expect(tokenGenerator.userId).toBe(loadUserByEmailRepository.user.id)
  })

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGenerator } = makeSut()
    const accessToken = await sut.auth('valid_email@gmail.com', 'valid_password')
    expect(accessToken).toBe(tokenGenerator.accessToken)
    expect(accessToken).toBeTruthy()
  })
})
