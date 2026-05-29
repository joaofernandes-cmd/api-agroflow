jest.mock('../middlewares/auth.middleware', () => ({
  __esModule: true,
  gerarToken: jest.fn(() => 'mock-jwt-token'),
  autenticarUsuario: (req: any, _res: any, next: any) => {
    // Os testes mockados precisam de um usuario autenticado padrao para
    // percorrer rotas protegidas sem depender de JWT real.
    req.usuario = {
      id: 'user-001',
      login: 'supervisor@agroflow.com',
      cargo: 'supervisor',
      retiro_id: 1,
    }

    return next()
  },
}))

jest.mock('../middlewares/role.middleware', () => ({
  __esModule: true,
  exigirCargo: () => (_req: any, _res: any, next: any) => next(),
}))

jest.mock('../database/connection', () => {
  const sqlMock = jest.fn(() => undefined) as jest.Mock & { begin: jest.Mock }
  sqlMock.begin = jest.fn(async (callback: any) => callback(jest.fn()))

  return {
    __esModule: true,
    default: sqlMock,
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})
