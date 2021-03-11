const request = require('supertest')
const app = require('./app')

describe('App Setup', () => {
  test('Should disable x-powered-by header', async () => {
    app.get('/test_x_powered_by', (req, res) => {
      res.send('hello')
    })

    const res = await request(app)
      .get('/test')

    expect(res.headers['x-powered-by']).toBeUndefined()
  })

  test('Should enable cors', async () => {
    app.get('/test_cors', (req, res) => {
      res.send('hello')
    })

    const res = await request(app)
      .get('/test')

    expect(res.headers['access-control-allow-origin']).toBe('*')
    expect(res.headers['access-control-allow-methods']).toBe('*')
    expect(res.headers['access-control-allow-headers']).toBe('*')
  })
})
