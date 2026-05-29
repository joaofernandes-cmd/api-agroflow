import request from 'supertest'
import app from '../../app'

describe('GET /health', () => {
  it('deve responder com status ok', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
})
