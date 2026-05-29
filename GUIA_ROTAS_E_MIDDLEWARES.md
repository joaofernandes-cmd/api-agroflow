# 🛣️ Guia Completo de Rotas e Middlewares

**Projeto:** G02 Backend | **Data:** 2026-05-29

---

## 📍 Estrutura de Rotas

```
app.ts (Express Setup)
├── middleware: express.json()
├── middleware: loggerMiddleware
├── GET /health ✓ (sem autenticação)
│
└── Routes:
    ├── /usuarios → usuarioRoutes
    ├── /tarefas → tarefaRoutes
    ├── /tickets → ticketRoutes
    ├── /movimentacoes → movimentacaoRoutes
    ├── /evidencias → evidenciaRoutes
    ├── /relatorios → relatorioRoutes
    ├── /sincronizacao → sincronizacaoRoutes
    └── /validacoes → validacaoRoutes
```

---

## 🔐 MIDDLEWARES (5 arquivos)

### 1. **auth.middleware.ts** - Autenticação JWT
```
Função: gerarToken(usuario) → string JWT
Middleware: autenticarUsuario(req, res, next)
├── Lê Authorization header: "Bearer <token>"
├── Valida JWT usando JWT_SECRET
├── Extrai: id, login, cargo, retiro_id
├── Preenche: req.usuario
└── Status 401 se falhar

Expiração: 1 dia
Segredo: Process.env.JWT_SECRET
```

**Uso:**
```typescript
usuarioRoutes.use(autenticarUsuario)  // Depois, todos precisam de token
```

---

### 2. **role.middleware.ts** - Autorização por Cargo
```
Função: exigirCargo(...cargosPermitidos: UsuarioCargo[]) → Middleware
├── Verifica se req.usuario existe (requer autenticação antes)
├── Valida se usuario.cargo ∈ cargosPermitidos
├── Status 403 se cargo insuficiente
└── Permite: 'capataz' | 'supervisor' | 'gerente'

Exemplo: exigirCargo('gerente', 'supervisor')
```

**Uso:**
```typescript
usuarioRoutes.use(exigirCargo('gerente'))  // Só gerentes aqui
relatorioRoutes.use(exigirCargo('gerente', 'supervisor'))
```

---

### 3. **logger.middleware.ts** - Logging de Requisições
```
Função: loggerMiddleware(req, res, next)
├── Captura: timestamp inicio
├── Aguarda: res.on('finish')
├── Log Output: [HTTP] METHOD URL → STATUS_CODE | DURATION | user=ID | cargo=CARGO
├── Duração em: ms
└── Usuário: req.usuario?.id ou 'anonimo'

Exemplo: [HTTP] POST /usuarios/login → 200 | 45.23ms | user=anonimo | cargo=sem-cargo
```

**Aplicado globalmente em app.ts**

---

### 4. **errorHandler.middleware.ts** - Tratamento de Erros
```
Classe: AppError extends Error
├── statusCode: number (padrão 500)
├── details?: unknown (dados extras)
└── Constructor: (message, statusCode, details?)

Middleware: errorHandler(error, req, res, next)
├── Se AppError → res.status(error.statusCode).json({...})
├── Se Error → res.status(500).json({...})
├── Else → res.status(500).json({ error: 'Erro interno no servidor' })
└── Evita responder se res.headersSent = true
```

**Aplicado globalmente como último middleware em app.ts**

---

### 5. **validateRequest.middleware.ts** - Validação de Dados
```
Type: RequestValidator = (req: Request) => ValidationResult | Promise<ValidationResult>

Função: validateRequest(validator) → Middleware
├── Executa validação específica
├── Se invalid → res.status(400).json({ error, details })
└── Se valid → next()

Helpers Disponíveis:
├── requiredString(value, field, message?) → ValidationError | null
├── requiredNumber(value, field, message?) → ValidationError | null
├── requiredDate(value, field, message?) → ValidationError | null
└── oneOf<T>(value, field, allowedValues[], message?) → ValidationError | null

Tipos:
├── ValidationError = { field: string, message: string }
└── ValidationResult = { valid: boolean, errors: ValidationError[] }
```

---

## 🛣️ ROTAS DETALHADAS

### 📋 USUÁRIO ROUTES

```
Base: /usuarios

Sem Autenticação:
┌─────────────────────────────────────────────────┐
│ POST   /login                                    │
│ Auth: UsuarioController.autenticar()            │
│ Retorna: { token: "...", usuario: {...} }      │
└─────────────────────────────────────────────────┘

Com Autenticação (Bearer Token) + Cargo = GERENTE:
┌─────────────────────────────────────────────────┐
│ POST   /                                         │
│ Auth: UsuarioController.criar()                 │
│ Body: { nome, login, senha_hash, status, cargo, retiro_id }
│                                                  │
│ GET    /                                         │
│ Auth: UsuarioController.listarTodos()           │
│                                                  │
│ GET    /retiro/:retiroId                        │
│ Auth: UsuarioController.listarPorRetiro()       │
│                                                  │
│ GET    /:id                                      │
│ Auth: UsuarioController.buscarPorId()           │
│                                                  │
│ PATCH  /:id                                      │
│ Auth: UsuarioController.atualizar()             │
│                                                  │
│ DELETE /:id                                      │
│ Auth: UsuarioController.remover()               │
└─────────────────────────────────────────────────┘
```

---

### 📝 TAREFA ROUTES

```
Base: /tarefas
Autenticação: Não exigida (mas recomendada)

Sem autenticação:
┌─────────────────────────────────────────────────┐
│ POST   /                                         │
│ Auth: TarefaController.criar()                  │
│ Body: { retiro_id, atribuida_a, descricao,     │
│         categoria, prioridade }                 │
│                                                  │
│ GET    /                                         │
│ Auth: TarefaController.listarTodas()            │
└─────────────────────────────────────────────────┘

Consultas Específicas (Dashboard/Filtros):
┌─────────────────────────────────────────────────┐
│ GET    /dashboard                               │
│ Auth: TarefaController.buscarParaDashboard()    │
│                                                  │
│ GET    /status/:status                          │
│ Auth: TarefaController.listarPorStatus()        │
│ Param: status = 'pendente' | 'aprovado'        │
│                                                  │
│ GET    /usuario/:usuarioId                      │
│ Auth: TarefaController.listarPorUsuario()       │
│                                                  │
│ GET    /prioridade/:prioridade                  │
│ Auth: TarefaController.listarPorPrioridade()    │
│ Param: prioridade = 'alta' | 'media' | 'baixa' │
│                                                  │
│ GET    /categoria/:categoria                    │
│ Auth: TarefaController.listarPorCategoria()     │
│                                                  │
│ GET    /contagem/status                         │
│ Auth: TarefaController.contarPorStatus()        │
└─────────────────────────────────────────────────┘

Por ID (sempre por último):
┌─────────────────────────────────────────────────┐
│ GET    /:id                                      │
│ Auth: TarefaController.buscarPorId()            │
│                                                  │
│ PATCH  /:id                                      │
│ Auth: TarefaController.atualizar()              │
│                                                  │
│ PATCH  /:id/status                              │
│ Auth: TarefaController.atualizarStatus()        │
│ Body: { status: 'pendente' | 'aprovado' }      │
│                                                  │
│ DELETE /:id                                      │
│ Auth: TarefaController.remover()                │
└─────────────────────────────────────────────────┘
```

---

### 🎟️ TICKET ROUTES

```
Base: /tickets

Criação e Listagem:
┌─────────────────────────────────────────────────┐
│ POST   /                                         │
│ Auth: TicketController.criar()                  │
│ Body: { retiro_id, categoria, localizacao,      │
│         descricao, prioridade }                 │
│                                                  │
│ GET    /                                         │
│ Auth: TicketController.listarTodos()            │
└─────────────────────────────────────────────────┘

Filtros (Dashboard/Acompanhamento):
┌─────────────────────────────────────────────────┐
│ GET    /pendentes                               │
│ Auth: TicketController.listarPendentes()        │
│                                                  │
│ GET    /status                                  │
│ Auth: TicketController.listarPorStatus()        │
│ Query: ?status=pendente|aprovado&retiroId=...  │
│                                                  │
│ GET    /prioridade                              │
│ Auth: TicketController.listarPorPrioridade()    │
│ Query: ?prioridade=alta|media|baixa             │
│                                                  │
│ GET    /categoria                               │
│ Auth: TicketController.listarPorCategoria()     │
│ Query: ?categoria=cerca|hidraulica|...          │
│                                                  │
│ GET    /contagem/prioridade                     │
│ Auth: TicketController.contarPorPrioridade()    │
└─────────────────────────────────────────────────┘

Por ID:
┌─────────────────────────────────────────────────┐
│ GET    /:id                                      │
│ Auth: TicketController.buscarPorId()            │
│                                                  │
│ PATCH  /:id/status                              │
│ Auth: TicketController.atualizarStatus()        │
│ Body: { status: 'pendente' | 'aprovado' }      │
│                                                  │
│ PATCH  /:id/prioridade                          │
│ Auth: TicketController.alterarPrioridade()      │
│ Body: { prioridade: 'alta' | 'media' | 'baixa' }
│                                                  │
│ PATCH  /:id/atribuicao                          │
│ Auth: TicketController.atribuirA()              │
│ Body: { usuarioId: UUID }                       │
└─────────────────────────────────────────────────┘
```

---

### 🔄 MOVIMENTAÇÃO ROUTES

```
Base: /movimentacoes

Criar e Listar:
┌─────────────────────────────────────────────────┐
│ POST   /                                         │
│ Auth: MovimentacaoController.criar()            │
│ Body: { retiro_id, capataz_id, tipo,            │
│         estagio_vida, ... }                     │
│                                                  │
│ GET    /                                         │
│ Logic: Se tem filtros → filtrar(); Else → listarTodas()
│ Query: ?retiro=...&tipo=...&status=...&data... │
│                                                  │
│ GET    /filtrar                                 │
│ Auth: MovimentacaoController.filtrar()          │
│ Query: ?retiro&tipo&status&dataInicio&dataFim  │
└─────────────────────────────────────────────────┘

Sincronização:
┌─────────────────────────────────────────────────┐
│ POST   /sincronizar                             │
│ Auth: MovimentacaoController.sincronizarRecebida()
│ Desc: Recebe movimentações vindas do cliente   │
│       offline, sincroniza com servidor          │
└─────────────────────────────────────────────────┘

Dashboard e Dados:
┌─────────────────────────────────────────────────┐
│ GET    /pendentes                               │
│ Auth: MovimentacaoController.listarPendentes()  │
│                                                  │
│ GET    /dashboard                               │
│ Auth: MovimentacaoController.buscarParaDashboard()
│                                                  │
│ GET    /contagem/tipo                           │
│ Auth: MovimentacaoController.contarPorTipo()    │
└─────────────────────────────────────────────────┘

Por ID:
┌─────────────────────────────────────────────────┐
│ GET    /:id                                      │
│ Auth: MovimentacaoController.buscarPorId()      │
│                                                  │
│ PATCH  /:id                                      │
│ Auth: MovimentacaoController.atualizar()        │
│                                                  │
│ PATCH  /:id/sincronizar                         │
│ Auth: MovimentacaoController.sincronizar()      │
│                                                  │
│ DELETE /:id                                      │
│ Auth: MovimentacaoController.remover()          │
└─────────────────────────────────────────────────┘
```

---

### 📸 EVIDÊNCIA ROUTES

```
Base: /evidencias
Autenticação: Não exigida

Listagem:
┌─────────────────────────────────────────────────┐
│ GET    /                                         │
│ Auth: EvidenciaController.listar()              │
│                                                  │
│ GET    /:id                                      │
│ Auth: EvidenciaController.buscarPorId()         │
└─────────────────────────────────────────────────┘

Criação por Tipo:
┌─────────────────────────────────────────────────┐
│ POST   /mensagens                               │
│ Auth: EvidenciaController.criarMensagem()       │
│ Body: { usuarioId, conteudo }                  │
│                                                  │
│ POST   /audios                                  │
│ Auth: EvidenciaController.criarAudio()          │
│ Body: { usuarioId, urlArquivo }                │
│                                                  │
│ POST   /fotos                                   │
│ Auth: EvidenciaController.criarFoto()           │
│ Body: { usuarioId, urlArquivo,                 │
│         latitude, longitude }                  │
└─────────────────────────────────────────────────┘
```

---

### 📊 RELATÓRIO ROUTES

```
Base: /relatorios
Autenticação: SIM (Bearer Token)
Autorização: GERENTE ou SUPERVISOR

Dados Brutos:
┌─────────────────────────────────────────────────┐
│ GET    /movimentacoes/dados                     │
│ Auth: RelatorioController.buscarDadosMovimentacoes()
│ Query: ?dataInicio=...&dataFim=...&retiroId=...│
│                                                  │
│ GET    /tarefas/dados                           │
│ Auth: RelatorioController.buscarDadosTarefas()  │
│ Query: ?dataInicio=...&dataFim=...&retiroId=...│
└─────────────────────────────────────────────────┘

Relatórios Formatados:
┌─────────────────────────────────────────────────┐
│ GET    /movimentacoes                           │
│ Auth: RelatorioController.formatarRelatorioMovimentacoes()
│ Desc: Movimentações formatadas para exportação │
│       em planilha (Excel/CSV)                   │
│                                                  │
│ GET    /semanal                                 │
│ Auth: RelatorioController.gerarRelatorioSemanal()
│ Query: ?retiroId=... (opcional)                │
│                                                  │
│ GET    /mensal                                  │
│ Auth: RelatorioController.gerarRelatorioMensal()
│ Query: ?retiroId=... (opcional)                │
└─────────────────────────────────────────────────┘
```

---

### 🔄 SINCRONIZAÇÃO ROUTES

```
Base: /sincronizacao

Status de Conexão:
┌─────────────────────────────────────────────────┐
│ GET    /conexao                                 │
│ Auth: SincronizacaoController.detectarConexao() │
│ Retorna: { online: boolean }                    │
└─────────────────────────────────────────────────┘

Sincronizar:
┌─────────────────────────────────────────────────┐
│ POST   /                                         │
│ Auth: SincronizacaoController.sincronizar()     │
│ Desc: Sincroniza todos os registros pendentes  │
│       (movimentacoes, tarefas, tickets)         │
└─────────────────────────────────────────────────┘

Status da Sincronização:
┌─────────────────────────────────────────────────┐
│ GET    /status                                  │
│ Auth: SincronizacaoController.obterStatusSincronizacao()
│ Retorna: { sincronizado, pendentes, erros }   │
│                                                  │
│ GET    /mensagem                                │
│ Auth: SincronizacaoController.obterMensagemSincronizacao()
│ Retorna: { mensagem: string (amigável) }      │
└─────────────────────────────────────────────────┘

Dados para Relatórios e Dashboard:
┌─────────────────────────────────────────────────┐
│ GET    /relatorios/movimentacoes                │
│ Auth: SincronizacaoController.buscarMovimentacoesParaRelatrio()
│                                                  │
│ GET    /relatorios/tarefas                      │
│ Auth: SincronizacaoController.buscarTarefasParaRelatrio()
│                                                  │
│ GET    /dashboard/tickets                       │
│ Auth: SincronizacaoController.buscarTicketsParaDashboard()
└─────────────────────────────────────────────────┘
```

---

### ✅ VALIDAÇÃO ROUTES

```
Base: /validacoes
Autenticação: SIM (Bearer Token)
Autorização: SUPERVISOR (apenas)

Permissões:
┌─────────────────────────────────────────────────┐
│ POST   /permissao                               │
│ Auth: ValidacaoController.podeValidar()         │
│ Desc: Verifica se usuário tem permissão para   │
│       validar registros                         │
└─────────────────────────────────────────────────┘

Validação de Movimentações:
┌─────────────────────────────────────────────────┐
│ PATCH  /movimentacoes/:id/validar               │
│ Auth: ValidacaoController.validarMovimentacao() │
│ Body: { validado_por: UUID }                   │
└─────────────────────────────────────────────────┘

Aprovação de Tickets e Tarefas:
┌─────────────────────────────────────────────────┐
│ PATCH  /tickets/:id/aprovar                     │
│ Auth: ValidacaoController.aprovarTicket()       │
│                                                  │
│ PATCH  /tarefas/:id/aprovar                     │
│ Auth: ValidacaoController.aprovarTarefa()       │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Matriz de Autenticação e Autorização

| Módulo | Autenticado | Cargo | Nivel |
|--------|:-----------:|:-----:|:-----:|
| **Usuario** |
| POST /login | ❌ | - | 🟢 Público |
| POST / | ✅ | gerente | 🔴 Restrito |
| GET / | ✅ | gerente | 🔴 Restrito |
| GET /retiro/:id | ✅ | gerente | 🔴 Restrito |
| **Tarefa** |
| Todas as rotas | ❌ | - | 🟡 Aberto |
| **Ticket** |
| Todas as rotas | ❌ | - | 🟡 Aberto |
| **Movimentação** |
| Todas as rotas | ❌ | - | 🟡 Aberto |
| **Evidencia** |
| Todas as rotas | ❌ | - | 🟡 Aberto |
| **Relatorio** |
| Todas as rotas | ✅ | gerente, supervisor | 🔴 Restrito |
| **Sincronizacao** |
| Todas as rotas | ❌ | - | 🟡 Aberto |
| **Validacao** |
| Todas as rotas | ✅ | supervisor | 🔴 Restrito |

**Legenda:**
- 🟢 Público (sem autenticação)
- 🟡 Aberto (recomenda autenticação, não exigida)
- 🔴 Restrito (exige autenticação + cargo específico)

---

## 📤 Fluxo Completo de Autenticação

```
1. Cliente → POST /usuarios/login
            { login, senha }
                ↓
2. UsuarioController.autenticar()
                ↓
3. UsuarioService.autenticar()
                ↓
4. UsuarioRepository.findByLogin()
                ↓
5. Database → SELECT * FROM usuarios WHERE login = ?
                ↓
6. Valida senha_hash
                ↓
7. gerarToken(usuario) → JWT
                ↓
8. Resposta: { token: "eyJhbGc...", usuario: {...} }
                ↓
9. Cliente salva token
                ↓
10. Próximas requisições:
    Header: Authorization: Bearer eyJhbGc...
                ↓
11. autenticarUsuario(req, res, next)
    ├── Lê Authorization header
    ├── Valida JWT
    ├── Preenche req.usuario
    └── next() continua
                ↓
12. Se rota exige cargo:
    exigirCargo(...)(req, res, next)
    ├── Valida req.usuario.cargo
    └── next() ou 403 Forbidden
                ↓
13. Controller processa
```

---

## 🚀 Exemplo de Requisição Completa

### Criar Tarefa (Autenticado)

```bash
curl -X POST http://localhost:3000/tarefas \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "retiro_id": 1,
    "atribuida_a": "uuid-usuario",
    "prioridade": "alta",
    "categoria": "cerca",
    "descricao": "Consertar cerca da cocheira"
  }'
```

**Fluxo:**
```
1. Express: app.use(express.json())
2. Express: app.use(loggerMiddleware) → log inicia
3. Router: Bate em /tarefas → tarefaRoutes
4. Router: POST / → TarefaController.criar()
5. Controller: Valida req.body, chama TarefaService.criar()
6. Service: Valida regras (supervisor?), chama TarefaRepository.create()
7. Repository: INSERT INTO tarefas ... → Database
8. Repository: Retorna tarefa criada
9. Service: Retorna tarefa
10. Controller: res.status(201).json(tarefa)
11. loggerMiddleware: res.on('finish') → log completo
    Output: [HTTP] POST /tarefas → 201 | 34.56ms | user=uuid | cargo=supervisor
```

---

## 🎯 Resumo do Fluxo de Requisição

```
REQUEST ENTRADA
    ↓
express.json() ← Middleware 1
    ↓
loggerMiddleware() ← Middleware 2 (inicia log)
    ↓
Router Match ← Encontra rota
    ↓
autenticarUsuario() [SE EXIGIDO] ← Middleware 3
    ├─ Valida JWT
    └─ Preenche req.usuario
    ↓
exigirCargo(...) [SE EXIGIDO] ← Middleware 4
    ├─ Valida cargo
    └─ next()
    ↓
validateRequest(...) [SE EXIGIDO] ← Middleware 5
    ├─ Valida payload
    └─ next() ou 400
    ↓
CONTROLLER.funcao(req, res)
    ├─ Extrai dados de req
    └─ Chama SERVICE
    ↓
SERVICE.funcao(dados)
    ├─ Valida lógica
    └─ Chama REPOSITORY
    ↓
REPOSITORY.funcao(...)
    ├─ Transação com banco
    └─ Retorna entidade
    ↓
SERVICE retorna resultado
    ↓
CONTROLLER.res.status(...).json(resultado)
    ↓
errorHandler() [SE ERROR] ← Middleware Final
    ├─ Captura erros
    └─ Retorna erro formatado
    ↓
RESPONSE SAÍDA + loggerMiddleware finaliza log
```

