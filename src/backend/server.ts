import 'dotenv/config'
import app from './app'

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  const address = server.address()
  if (typeof address === 'object' && address) {
    console.log(`Servidor rodando na porta ${address.port}`)
  } else {
    console.log(`Servidor rodando na porta ${port}`)
  }
})