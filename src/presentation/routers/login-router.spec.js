// spec - teste

class LoginRouter {
  route (httpRequest) {
    if (!httpRequest.body.email) {
      return {
        statusCode: 400
      }
    }
  }
}

describe('Login Router', () => {
  test('should return 400 if no email is provided', () => {
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        password: 'anyway'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})
