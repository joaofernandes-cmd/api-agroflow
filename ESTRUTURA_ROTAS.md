# 🛣️ Estrutura Completa das Rotas

**Documento detalhado de todos os endpoints HTTP do projeto**

---

## APP SETUP

```
arquivo: app.ts
```

### Configuração Global
```
✓ express.json()           ← Middleware: Parse JSON
✓ loggerMiddleware()       ← Middleware: Log requisições
✓ GET /health             ← Health check (sem auth)
✓ 8 Rotas registradas
✓ 404 Handler             ← Rota não encontrada
✓ errorHandler()          ← Middleware: Tratamento de erros
```

---

## ROTA 1: USUÁRIOS

```
Base: /usuarios
arquivo: usuario.route.ts
Controller: UsuarioController
```

### Endpoint 1.1
```
POST /usuarios/login
Autenticação: ❌ NÃO requerida
Middleware: Nenhum
Corpo (Body):
  ✓ login: string
  ✓ senha: string

Função: UsuarioController.autenticar(req, res)
├─ UsuarioService.autenticar(login, senha)
├─ Valida credenciais
└─ gerarToken() se OK

Resposta 200:
{
  token: "Bearer eyJ...",
  usuario: { id, login, cargo, retiro_id }
}

Resposta 401: Token inválido ou senha incorreta
```

### Endpoint 1.2
```
POST /usuarios
Autenticação: ✅ SIM requerida (Bearer token)
Autorização: ✅ Cargo = 'gerente'
Middlewares:
  ├─ autenticarUsuario
  └─ exigirCargo('gerente')

Corpo (Body):
  ✓ retiro_id: number
  ✓ nome: string
  ✓ login: string
  ✓ senha_hash: string
  ✓ status: 'ativo' | 'inativo'
  ✓ cargo: 'capataz' | 'supervisor' | 'gerente'

Função: UsuarioController.criar(req, res)
└─ UsuarioService.criar(dados)

Resposta 201: Usuário criado
{
  id, retiro_id, nome, login, status, cargo, data_criacao
}

Resposta 403: Cargo insuficiente
Resposta 400: Validação falhou
```

### Endpoint 1.3
```
GET /usuarios
Autenticação: ✅ SIM
Autorização: ✅ Cargo = 'gerente'
Middlewares:
  ├─ autenticarUsuario
  └─ exigirCargo('gerente')

Query: Nenhum

Função: UsuarioController.listarTodos(req, res)
└─ UsuarioService.listarTodos()

Resposta 200: Array de usuários
[
  { id, nome, login, status, cargo, retiro_id },
  ...
]
```

### Endpoint 1.4
```
GET /usuarios/:id
Autenticação: ✅ SIM
Autorização: ✅ Cargo = 'gerente'
Middlewares:
  ├─ autenticarUsuario
  └─ exigirCargo('gerente')

Parâmetro: :id = UUID

Função: UsuarioController.buscarPorId(req, res)
└─ UsuarioService.buscarPorId(id)

Resposta 200: Usuário encontrado
{ id, nome, login, status, cargo, retiro_id }

Resposta 404: Não encontrado
```

### Endpoint 1.5
```
GET /usuarios/retiro/:retiroId
Autenticação: ✅ SIM
Autorização: ✅ Cargo = 'gerente'
Middlewares:
  ├─ autenticarUsuario
  └─ exigirCargo('gerente')

Parâmetro: :retiroId = number

Função: UsuarioController.listarPorRetiro(req, res)
└─ UsuarioService.listarPorRetiro(retiroId)

Resposta 200: Array de usuários do retiro
[
  { id, nome, cargo, status },
  ...
]
```

### Endpoint 1.6
```
PATCH /usuarios/:id
Autenticação: ✅ SIM
Autorização: ✅ Cargo = 'gerente'
Middlewares:
  ├─ autenticarUsuario
  └─ exigirCargo('gerente')

Parâmetro: :id = UUID
Corpo (Body): Parcial
  ? nome: string
  ? status: 'ativo' | 'inativo'

Função: UsuarioController.atualizar(req, res)
└─ UsuarioService.atualizar(id, dados)

Resposta 200: Usuário atualizado
```

### Endpoint 1.7
```
DELETE /usuarios/:id
Autenticação: ✅ SIM
Autorização: ✅ Cargo = 'gerente'
Middlewares:
  ├─ autenticarUsuario
  └─ exigirCargo('gerente')

Parâmetro: :id = UUID

Função: UsuarioController.remover(req, res)
└─ UsuarioService.remover(id)

Resposta 204: Deletado com sucesso
```

---

## ROTA 2: TAREFAS

```
Base: /tarefas
arquivo: tarefa.route.ts
Controller: TarefaController
Autenticação: ❌ NÃO exigida (mas recomendada)
```

### Endpoint 2.1
```
POST /tarefas
Corpo (Body):
  ✓ retiro_id: number
  ✓ atribuida_a: UUID
  ✓ descricao: string
  ✓ categoria: string
  ✓ prioridade: 'alta' | 'media' | 'baixa'

Função: TarefaController.criar(req, res)

Resposta 201: { id, status: 'pendente', ... }
```

### Endpoint 2.2
```
GET /tarefas
Query: Nenhum

Função: TarefaController.listarTodas(req, res)

Resposta 200: [ { id, descricao, status, prioridade }, ... ]
```

### Endpoint 2.3
```
GET /tarefas/dashboard
Query: ?retiroId=1 (opcional)

Função: TarefaController.buscarParaDashboard(req, res)
├─ Filtra por: status = 'aprovado'
└─ Filtra por: retiroId (se fornecido)

Resposta 200: [ tarefas aprovadas ]
```

### Endpoint 2.4
```
GET /tarefas/status/:status
Parâmetro: :status = 'pendente' | 'aprovado'
Query: ?retiroId=1 (opcional)

Função: TarefaController.listarPorStatus(req, res)

Resposta 200: [ tarefas com esse status ]
```

### Endpoint 2.5
```
GET /tarefas/usuario/:usuarioId
Parâmetro: :usuarioId = UUID

Função: TarefaController.listarPorUsuario(req, res)
├─ Filtra: atribuida_a = usuarioId

Resposta 200: [ tarefas atribuídas ao usuário ]
```

### Endpoint 2.6
```
GET /tarefas/prioridade/:prioridade
Parâmetro: :prioridade = 'alta' | 'media' | 'baixa'
Query: ?retiroId=1 (opcional)

Função: TarefaController.listarPorPrioridade(req, res)

Resposta 200: [ tarefas com essa prioridade ]
```

### Endpoint 2.7
```
GET /tarefas/categoria/:categoria
Parâmetro: :categoria = string
Query: ?retiroId=1 (opcional)

Função: TarefaController.listarPorCategoria(req, res)

Resposta 200: [ tarefas dessa categoria ]
```

### Endpoint 2.8
```
GET /tarefas/contagem/status
Query: ?retiroId=1 (opcional)

Função: TarefaController.contarPorStatus(req, res)

Resposta 200:
{
  pendente: 5,
  aprovado: 3
}
```

### Endpoint 2.9
```
GET /tarefas/:id
Parâmetro: :id = number

Função: TarefaController.buscarPorId(req, res)

Resposta 200: { id, descricao, status, ... }
Resposta 404: Não encontrado
```

### Endpoint 2.10
```
PATCH /tarefas/:id
Parâmetro: :id = number
Corpo (Body): Parcial
  ? descricao: string
  ? categoria: string
  ? prioridade: string

Função: TarefaController.atualizar(req, res)

Resposta 200: Tarefa atualizada
```

### Endpoint 2.11
```
PATCH /tarefas/:id/status
Parâmetro: :id = number
Corpo (Body):
  ✓ status: 'pendente' | 'aprovado'

Função: TarefaController.atualizarStatus(req, res)

Resposta 200: { id, status: 'aprovado' }
```

### Endpoint 2.12
```
DELETE /tarefas/:id
Parâmetro: :id = number

Função: TarefaController.remover(req, res)

Resposta 204: Deletado
```

---

## ROTA 3: TICKETS

```
Base: /tickets
arquivo: ticket.routes.ts
Controller: TicketController
Autenticação: ❌ NÃO exigida
```

### Endpoint 3.1
```
POST /tickets
Corpo (Body):
  ✓ retiro_id: number
  ✓ categoria: 'cerca' | 'hidraulica' | 'eletrica' | ...
  ✓ localizacao: string
  ✓ descricao: string
  ✓ prioridade: 'alta' | 'media' | 'baixa'

Função: TicketController.criar(req, res)

Resposta 201: { id, status: 'pendente', ... }
```

### Endpoint 3.2
```
GET /tickets
Query: Nenhum

Função: TicketController.listarTodos(req, res)

Resposta 200: [ { id, categoria, localizacao, status }, ... ]
```

### Endpoint 3.3
```
GET /tickets/pendentes
Query: ?retiroId=1 (opcional)

Função: TicketController.listarPendentes(req, res)

Resposta 200: [ tickets com status = 'pendente' ]
```

### Endpoint 3.4
```
GET /tickets/status
Query:
  ✓ status: 'pendente' | 'aprovado'
  ? retiroId: number (opcional)

Função: TicketController.listarPorStatus(req, res)

Resposta 200: [ tickets filtrados ]
```

### Endpoint 3.5
```
GET /tickets/prioridade
Query:
  ✓ prioridade: 'alta' | 'media' | 'baixa'
  ? retiroId: number (opcional)

Função: TicketController.listarPorPrioridade(req, res)

Resposta 200: [ tickets com prioridade ]
```

### Endpoint 3.6
```
GET /tickets/categoria
Query:
  ✓ categoria: string
  ? retiroId: number (opcional)

Função: TicketController.listarPorCategoria(req, res)

Resposta 200: [ tickets da categoria ]
```

### Endpoint 3.7
```
GET /tickets/contagem/prioridade
Query: ?retiroId=1 (opcional)

Função: TicketController.contarPorPrioridade(req, res)

Resposta 200:
{
  alta: 3,
  media: 5,
  baixa: 2
}
```

### Endpoint 3.8
```
GET /tickets/:id
Parâmetro: :id = number

Função: TicketController.buscarPorId(req, res)

Resposta 200: { id, categoria, descricao, status, ... }
```

### Endpoint 3.9
```
PATCH /tickets/:id/status
Parâmetro: :id = number
Corpo (Body):
  ✓ status: 'pendente' | 'aprovado'

Função: TicketController.atualizarStatus(req, res)

Resposta 200: Ticket atualizado
```

### Endpoint 3.10
```
PATCH /tickets/:id/prioridade
Parâmetro: :id = number
Corpo (Body):
  ✓ prioridade: 'alta' | 'media' | 'baixa'

Função: TicketController.alterarPrioridade(req, res)

Resposta 200: Ticket atualizado
```

### Endpoint 3.11
```
PATCH /tickets/:id/atribuicao
Parâmetro: :id = number
Corpo (Body):
  ✓ usuarioId: UUID

Função: TicketController.atribuirA(req, res)

Resposta 200: Ticket atribuído
```

---

## ROTA 4: MOVIMENTAÇÕES

```
Base: /movimentacoes
arquivo: movimentacao.route.ts
Controller: MovimentacaoController
Autenticação: ❌ NÃO exigida
```

### Endpoint 4.1
```
POST /movimentacoes
Corpo (Body):
  ✓ retiro_id: number
  ✓ capataz_id: UUID
  ✓ tipo: 'nascimento' | 'morte' | 'compra' | 'venda' | 'transferencia'
  ✓ estagio_vida: EstagioVida
  ? origem: RetiroNome
  ? destino: RetiroNome
  ? quantidade: number
  ? causa_obito: string (se tipo = 'morte')

Função: MovimentacaoController.criar(req, res)
├─ MovimentacaoService.criar(dados)
├─ Cria detalhes por tipo específico
└─ BEGIN TX ... COMMIT TX

Resposta 201: { id, tipo, status: 'pendente', ... }
```

### Endpoint 4.2
```
GET /movimentacoes
Query (Smart routing):
  ? retiro: number
  ? retiroId: number
  ? tipo: string
  ? tipos: string[]
  ? status: string
  ? dataInicio: date
  ? dataFim: date

Lógica:
├─ Se tem filtros → MovimentacaoController.filtrar()
└─ Else → MovimentacaoController.listarTodas()

Resposta 200: [ movimentacoes ]
```

### Endpoint 4.3
```
GET /movimentacoes/filtrar
Query: (mesmo que acima)

Função: MovimentacaoController.filtrar(req, res)
└─ MovimentacaoService.filtrar(...)

Resposta 200: [ movimentacoes filtradas ]
```

### Endpoint 4.4
```
POST /movimentacoes/sincronizar
Corpo (Body):
  Movimentação vinda do cliente offline

Função: MovimentacaoController.sincronizarRecebida(req, res)
└─ MovimentacaoService.sincronizarRecebida(dados)

Resposta 201: Movimentação sincronizada
```

### Endpoint 4.5
```
GET /movimentacoes/pendentes
Query: ?retiroId=1 (opcional)

Função: MovimentacaoController.listarPendentes(req, res)
├─ Filtra: status = 'pendente'

Resposta 200: [ movimentacoes aguardando validação ]
```

### Endpoint 4.6
```
GET /movimentacoes/dashboard
Query: ?retiroId=1 (opcional)

Função: MovimentacaoController.buscarParaDashboard(req, res)

Resposta 200: [ dados para dashboard ]
```

### Endpoint 4.7
```
GET /movimentacoes/contagem/tipo
Query: ?retiroId=1 (opcional)

Função: MovimentacaoController.contarPorTipo(req, res)

Resposta 200:
{
  nascimento: 5,
  morte: 2,
  transferencia: 8,
  ...
}
```

### Endpoint 4.8
```
GET /movimentacoes/:id
Parâmetro: :id = number

Função: MovimentacaoController.buscarPorId(req, res)

Resposta 200: { id, tipo, status, ... }
```

### Endpoint 4.9
```
PATCH /movimentacoes/:id
Parâmetro: :id = number
Corpo (Body): Parcial (compatível com tipo)

Função: MovimentacaoController.atualizar(req, res)

Resposta 200: Movimentação atualizada
```

### Endpoint 4.10
```
PATCH /movimentacoes/:id/sincronizar
Parâmetro: :id = number

Função: MovimentacaoController.sincronizar(req, res)

Resposta 200: Movimentação sincronizada
```

### Endpoint 4.11
```
DELETE /movimentacoes/:id
Parâmetro: :id = number

Função: MovimentacaoController.remover(req, res)

Resposta 204: Deletado
```

---

## ROTA 5: EVIDÊNCIAS

```
Base: /evidencias
arquivo: evidencia.route.ts
Controller: EvidenciaController
Autenticação: ❌ NÃO exigida
```

### Endpoint 5.1
```
GET /evidencias
Query: Nenhum

Função: EvidenciaController.listar(req, res)

Resposta 200: [ { id, tipo, usuario_id, data_criacao }, ... ]
```

### Endpoint 5.2
```
GET /evidencias/:id
Parâmetro: :id = number

Função: EvidenciaController.buscarPorId(req, res)

Resposta 200: { id, tipo, ... }
```

### Endpoint 5.3
```
POST /evidencias/mensagens
Corpo (Body):
  ✓ usuarioId: UUID
  ✓ conteudo: string

Função: EvidenciaController.criarMensagem(req, res)

Resposta 201: { evidencia: {...}, mensagem: {...} }
```

### Endpoint 5.4
```
POST /evidencias/audios
Corpo (Body):
  ✓ usuarioId: UUID
  ✓ urlArquivo: string

Função: EvidenciaController.criarAudio(req, res)

Resposta 201: { evidencia: {...}, audio: {...} }
```

### Endpoint 5.5
```
POST /evidencias/fotos
Corpo (Body):
  ✓ usuarioId: UUID
  ✓ urlArquivo: string
  ✓ latitude: number
  ✓ longitude: number

Função: EvidenciaController.criarFoto(req, res)
├─ Valida georreferenciamento
└─ Cria foto com coordenadas

Resposta 201: { evidencia: {...}, foto: {...} }
```

---

## ROTA 6: RELATÓRIOS

```
Base: /relatorios
arquivo: relatorio.route.ts
Controller: RelatorioController
Autenticação: ✅ SIM (Bearer token)
Autorização: ✅ Cargo = 'gerente' | 'supervisor'
Middlewares (em toda rota):
  ├─ autenticarUsuario
  └─ exigirCargo('gerente', 'supervisor')
```

### Endpoint 6.1
```
GET /relatorios/movimentacoes/dados
Query:
  ? dataInicio: date
  ? dataFim: date
  ? retiroId: number

Função: RelatorioController.buscarDadosMovimentacoes(req, res)

Resposta 200: [ { id, tipo, quantidade, ... }, ... ]
```

### Endpoint 6.2
```
GET /relatorios/tarefas/dados
Query: (mesmo que acima)

Função: RelatorioController.buscarDadosTarefas(req, res)

Resposta 200: [ { id, descricao, status, ... }, ... ]
```

### Endpoint 6.3
```
GET /relatorios/movimentacoes
Query: (mesmo que acima)

Função: RelatorioController.formatarRelatorioMovimentacoes(req, res)
├─ Formata dados para exportação
└─ Pronto para Excel/CSV

Resposta 200: [ { data, tipo, qtd, ... }, ... ]
```

### Endpoint 6.4
```
GET /relatorios/semanal
Query: ?retiroId=1 (opcional)

Função: RelatorioController.gerarRelatorioSemanal(req, res)
├─ Agrupa dados desta semana
├─ Por dia/tipo
└─ Consolidado

Resposta 200: [ relatório semanal ]
```

### Endpoint 6.5
```
GET /relatorios/mensal
Query: ?retiroId=1 (opcional)

Função: RelatorioController.gerarRelatorioMensal(req, res)
├─ Agrupa dados deste mês
└─ Consolidado

Resposta 200: [ relatório mensal ]
```

---

## ROTA 7: SINCRONIZAÇÃO

```
Base: /sincronizacao
arquivo: sincronizacao.route.ts
Controller: SincronizacaoController
Autenticação: ❌ NÃO exigida (acesso offline)
```

### Endpoint 7.1
```
GET /sincronizacao/conexao
Query: Nenhum

Função: SincronizacaoController.detectarConexao(req, res)
├─ Tenta conectar ao servidor
└─ Verifica disponibilidade

Resposta 200: { online: true }
Resposta 200: { online: false }
```

### Endpoint 7.2
```
POST /sincronizacao
Corpo: Nenhum

Função: SincronizacaoController.sincronizar(req, res)
├─ Sincroniza: movimentacoes pendentes
├─ Sincroniza: tarefas pendentes
├─ Sincroniza: tickets pendentes
└─ Retorna: resultado da sincronização

Resposta 200:
{
  sucesso: true,
  registrosSincronizados: 15,
  erros: []
}
```

### Endpoint 7.3
```
GET /sincronizacao/status
Query: Nenhum

Função: SincronizacaoController.obterStatusSincronizacao(req, res)

Resposta 200:
{
  sincronizado: true,
  pendentes: 0,
  erros: []
}
```

### Endpoint 7.4
```
GET /sincronizacao/mensagem
Query: Nenhum

Função: SincronizacaoController.obterMensagemSincronizacao(req, res)

Resposta 200:
{
  mensagem: "Sincronizado com sucesso!"
}
```

### Endpoint 7.5
```
GET /sincronizacao/relatorios/movimentacoes
Query: ?retiroId=1 (opcional)

Função: SincronizacaoController.buscarMovimentacoesParaRelatrio(req, res)

Resposta 200: [ movimentacoes para relatório ]
```

### Endpoint 7.6
```
GET /sincronizacao/relatorios/tarefas
Query: ?retiroId=1 (opcional)

Função: SincronizacaoController.buscarTarefasParaRelatrio(req, res)

Resposta 200: [ tarefas para relatório ]
```

### Endpoint 7.7
```
GET /sincronizacao/dashboard/tickets
Query: ?retiroId=1 (opcional)

Função: SincronizacaoController.buscarTicketsParaDashboard(req, res)

Resposta 200: [ tickets para dashboard ]
```

---

## ROTA 8: VALIDAÇÕES

```
Base: /validacoes
arquivo: validacao.route.ts
Controller: ValidacaoController
Autenticação: ✅ SIM (Bearer token)
Autorização: ✅ Cargo = 'supervisor'
Middlewares (em toda rota):
  ├─ autenticarUsuario
  └─ exigirCargo('supervisor')
```

### Endpoint 8.1
```
POST /validacoes/permissao
Corpo (Body):
  Vazio ou usuário no req.usuario

Função: ValidacaoController.podeValidar(req, res)
├─ Verifica se usuário autenticado pode validar
└─ Valida: cargo = 'supervisor'

Resposta 200:
{
  pode: true
}
```

### Endpoint 8.2
```
PATCH /validacoes/movimentacoes/:id/validar
Parâmetro: :id = number
Corpo (Body):
  ? validado_por: UUID

Função: ValidacaoController.validarMovimentacao(req, res)
├─ Valida: status = 'pendente'
├─ Atualiza: status = 'validado'
└─ Preenche: validado_por

Resposta 200: { id, status: 'validado', ... }
```

### Endpoint 8.3
```
PATCH /validacoes/tickets/:id/aprovar
Parâmetro: :id = number
Corpo (Body):
  Vazio

Função: ValidacaoController.aprovarTicket(req, res)
├─ Valida: status = 'pendente'
└─ Atualiza: status = 'aprovado'

Resposta 200: { id, status: 'aprovado', ... }
```

### Endpoint 8.4
```
PATCH /validacoes/tarefas/:id/aprovar
Parâmetro: :id = number
Corpo (Body):
  Vazio

Função: ValidacaoController.aprovarTarefa(req, res)
├─ Valida: status = 'pendente'
└─ Atualiza: status = 'aprovado'

Resposta 200: { id, status: 'aprovado', ... }
```

---

## 📊 RESUMO ROTAS

| Base | Total | Método | Auth | Cargo |
|------|:-----:|:------:|:----:|:-----:|
| /usuarios | 7 | M POST + GET + DELETE | 6/7 ✅ | gerente |
| /tarefas | 12 | 1 POST + 9 GET + 2 PATCH | ❌ | - |
| /tickets | 11 | 1 POST + 6 GET + 3 PATCH | ❌ | - |
| /movimentacoes | 11 | 2 POST + 5 GET + 2 PATCH + 1 DELETE | ❌ | - |
| /evidencias | 5 | 3 POST + 2 GET | ❌ | - |
| /relatorios | 5 | 5 GET | ✅ | gerente/sup |
| /sincronizacao | 7 | 1 POST + 6 GET | ❌ | - |
| /validacoes | 4 | 1 POST + 3 PATCH | ✅ | supervisor |
| **TOTAL** | **62** | **11 POST + 32 GET + 9 PATCH + 2 DELETE** | | |

---

## 🔐 AUTENTICAÇÃO RESUMO

```
Públicas (sem auth):         /usuarios/login, /tarefas/*, /tickets/*,
                            /movimentacoes/*, /evidencias/*, /sincronizacao/*

Requerem Auth + Gerente:    /usuarios/* (CRUD)

Requerem Auth + Ger/Sup:    /relatorios/*

Requerem Auth + Supervisor: /validacoes/*
```

---

## 💾 TOTAIS

| Tipo | Quantidade |
|------|:----------:|
| Rotas Base | 8 |
| Endpoints Totais | 62 |
| POST | 11 |
| GET | 32 |
| PATCH | 9 |
| DELETE | 2 |
| Endpoints Autenticados | 16 |
| Endpoints com Cargo | 16 |

---

