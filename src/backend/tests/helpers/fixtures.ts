export const mockSupervisor = {
  id: 'user-001',
  nome: 'Supervisor Teste',
  login: 'supervisor@agroflow.com',
  senha_hash: 'hashed-password',
  status: 'ativo',
  cargo: 'supervisor',
  retiro_id: 1,
}

export const mockGerente = {
  id: 'user-002',
  nome: 'Gerente Teste',
  login: 'gerente@agroflow.com',
  senha_hash: 'hashed-password',
  status: 'ativo',
  cargo: 'gerente',
  retiro_id: 1,
}

export const mockCapataz = {
  id: 'user-003',
  nome: 'Capataz Teste',
  login: 'capataz@agroflow.com',
  senha_hash: 'hashed-password',
  status: 'ativo',
  cargo: 'capataz',
  retiro_id: 1,
}

export const mockMovimentacao = {
  id: 1,
  retiro_id: 1,
  capataz_id: 'user-003',
  validado_por: null,
  tipo: 'nascimento',
  origem: 'Acurizal',
  destino: null,
  quantidade: 1,
  status: 'pendente',
  sincronizado: false,
  data_criacao: '2026-05-29T10:00:00.000Z',
  data_validacao: null,
  causa_obito: null,
  estagio_vida: 'BEZERRO 0 A 7 MESES',
}

export const mockMovimentacaoValidada = {
  ...mockMovimentacao,
  status: 'validado',
  sincronizado: true,
  validado_por: 'user-001',
  data_validacao: '2026-05-29T12:00:00.000Z',
}

export const mockTarefa = {
  id: 11,
  retiro_id: 1,
  criada_por: 'user-001',
  atribuida_a: 'user-003',
  descricao: 'Verificar cerca do piquete 3',
  categoria: 'manutencao',
  prioridade: 'alta',
  status: 'pendente',
  aprovado_por: null,
  data_criacao: '2026-05-29T10:30:00.000Z',
  sincronizado: false,
}

export const mockTicket = {
  id: 21,
  retiro_id: 1,
  aberto_por: 'user-003',
  categoria: 'cerca',
  localizacao: 'Piquete 3',
  status: 'pendente',
  atribuido_a: null,
  aprovado_por: null,
  descricao: 'Cerca rompida na lateral do piquete',
  prioridade: 'media',
  data_criacao: '2026-05-29T11:00:00.000Z',
  data_realizado: '2026-05-29T11:15:00.000Z',
  sincronizado: false,
}

export const mockEvidencia = {
  id: 31,
  usuario_id: 'user-003',
  tipo: 'mensagem',
  data_criacao: '2026-05-29T11:30:00.000Z',
}

export const mockRelatorioLinha = {
  Data: '29/05/2026',
  Tipo: 'nascimento',
  Retiro: 1,
  Origem: 'Acurizal',
  Destino: '-',
  Quantidade: 1,
  'Estágio de Vida': 'BEZERRO 0 A 7 MESES',
  'Causa do Óbito': '-',
}

export const mockSincronizacaoStatus = {
  movimentacoesNaoSincronizadas: 1,
  tarefasNaoSincronizadas: 1,
  ticketsNaoSincronizados: 1,
  temConexao: true,
}
