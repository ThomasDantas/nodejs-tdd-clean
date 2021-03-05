const { MongoClient } = require('mongodb')

let client, db

const makeSut = () => {
  class LoadUserByEmailRepository {
    constructor (userModel) {
      this.userModel = userModel
    }

    async load (email) {
      const user = this.userModel.findOne({ email })
      return user
    }
  }

  return new LoadUserByEmailRepository()
}

describe('LoadUserByEmail Repository', () => {
  beforeAll(async () => {
    client = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    db = client.db()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await client.close()
  })

  test('Should return null if no user is found', async () => {
    const userModel = db.collection('users')
    const sut = makeSut(userModel)
    const user = await sut.load('invalid_email@mail.com')
    expect(user).toBeNull()
  })

  test('Should return an user if user is found', async () => {
    const userModel = db.collection('users')
    await userModel.insertOne({
      email: 'valid_email@mail.com'
    })
    const sut = makeSut(userModel)
    const user = await sut.load('valid_email@mail.com')
    expect(user.email).toBe('valid_email@mail.com')
  })
})
