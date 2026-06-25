export const RETIRO_ID = '00000000-0000-4000-8000-000000000001'
export const SUPERVISOR_ID = '00000000-0000-4000-8000-000000000101'
export const GERENTE_ID = '00000000-0000-4000-8000-000000000102'
export const CAPATAZ_ID = '00000000-0000-4000-8000-000000000103'
export const MOVIMENTACAO_ID = '00000000-0000-4000-8000-000000000201'
export const TAREFA_ID = '00000000-0000-4000-8000-000000000301'
export const TICKET_ID = '00000000-0000-4000-8000-000000000401'
export const EVIDENCIA_ID = '00000000-0000-4000-8000-000000000501'

export const mockSupervisor = {
  id: SUPERVISOR_ID,
  nome: 'Supervisor Teste',
  identificador: 'supervisor-teste',
  login: 'supervisor@agroflow.com',
  senha_hash: 'hashed-password',
  status: 'ativo',
  cargo: 'supervisor',
  retiro_id: RETIRO_ID,
}

export const mockGerente = {
  id: GERENTE_ID,
  nome: 'Gerente Teste',
  identificador: 'gerente-teste',
  login: 'gerente@agroflow.com',
  senha_hash: 'hashed-password',
  status: 'ativo',
  cargo: 'gerente',
  retiro_id: RETIRO_ID,
}

export const mockCapataz = {
  id: CAPATAZ_ID,
  nome: 'Capataz Teste',
  identificador: 'capataz-teste',
  login: 'capataz@agroflow.com',
  senha_hash: 'hashed-password',
  status: 'ativo',
  cargo: 'capataz',
  retiro_id: RETIRO_ID,
}

export const mockMovimentacao = {
  id: MOVIMENTACAO_ID,
  retiro_id: RETIRO_ID,
  capataz_id: CAPATAZ_ID,
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
  validado_por: SUPERVISOR_ID,
  data_validacao: '2026-05-29T12:00:00.000Z',
}

export const mockTarefa = {
  id: TAREFA_ID,
  retiro_id: RETIRO_ID,
  criada_por: SUPERVISOR_ID,
  atribuida_a: CAPATAZ_ID,
  descricao: 'Verificar cerca do piquete 3',
  categoria: 'manutencao',
  prioridade: 'alta',
  status: 'pendente',
  aprovado_por: null,
  data_criacao: '2026-05-29T10:30:00.000Z',
  sincronizado: false,
}

export const mockTicket = {
  id: TICKET_ID,
  retiro_id: RETIRO_ID,
  aberto_por: CAPATAZ_ID,
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
  id: EVIDENCIA_ID,
  usuario_id: CAPATAZ_ID,
  tipo: 'mensagem',
  data_criacao: '2026-05-29T11:30:00.000Z',
}

export const mockRelatorioLinha = {
  Data: '29/05/2026',
  Tipo: 'nascimento',
  Retiro: RETIRO_ID,
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
