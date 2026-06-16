jest.mock('../middlewares/autenticacao.middleware', () => ({
  __esModule: true,
  COOKIE_TOKEN_AUTENTICACAO: 'agroflow_token',
  gerarToken: jest.fn(() => 'mock-jwt-token'),
  autenticarUsuario: (req: any, _res: any, next: any) => {
    // Os testes mockados precisam de um usuario autenticado padrao para
    // percorrer rotas protegidas sem depender de JWT real.
    req.usuario = {
      id: '00000000-0000-4000-8000-000000000101',
      login: 'supervisor@agroflow.com',
      cargo: 'supervisor',
      retiro_id: '00000000-0000-4000-8000-000000000001',
    }

    return next()
  },
  autenticarViewPorCookie: (req: any, _res: any, next: any) => {
    req.usuario = {
      id: '00000000-0000-4000-8000-000000000101',
      login: 'supervisor@agroflow.com',
      cargo: 'supervisor',
      retiro_id: '00000000-0000-4000-8000-000000000001',
    }

    return next()
  },
}))

jest.mock('../middlewares/cargo.middleware', () => ({
  __esModule: true,
  exigirCargo: () => (_req: any, _res: any, next: any) => next(),
  exigirCargoView: () => (_req: any, _res: any, next: any) => next(),
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
