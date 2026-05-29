# 🎯 Diagrama de Relações - Projeto G02

**Resumo Visual Completo do Projeto**

---

## 1️⃣ ARQUITETURA GERAL

```
┌────────────────────────────────────────────────────────────────┐
│                     CLIENTE (Frontend/Mobile)                   │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ HTTP Requests + JWT Token (Bearer)
             │
┌────────────▼──────────────────────────────────────────────────┐
│                        EXPRESS APP (app.ts)                   │
├────────────────────────────────────────────────────────────────┤
│ 1. express.json() ────────┐                                    │
│ 2. loggerMiddleware ──────┼──→ Log: [HTTP] METHOD URL → CODE  │
│ 3. GET /health ───────────┤                                    │
│ 4. 7 Routes (abaixo) ─────┤                                    │
│ 5. 404 Handler ───────────┤                                    │
│ 6. errorHandler ──────────┘                                    │
└────────────────────────────────────────────────────────────────┘
             │
             ├─→ /usuarios ─────────→ usuarioRoutes
             ├─→ /tarefas ──────────→ tarefaRoutes
             ├─→ /tickets ──────────→ ticketRoutes
             ├─→ /movimentacoes ────→ movimentacaoRoutes
             ├─→ /evidencias ───────→ evidenciaRoutes
             ├─→ /relatorios ───────→ relatorioRoutes
             ├─→ /sincronizacao ────→ sincronizacaoRoutes
             └─→ /validacoes ───────→ validacaoRoutes
```

---

## 2️⃣ CAMADAS (BRPEC)

```
┌──────────────────────────────────────────────────────────────┐
│                     CONTROLLERS (8)                           │
│  ┌─────────────┬──────────┬─────────┬────────────────────┐  │
│  │ Usuario     │ Tarefa   │ Ticket  │ Movimentacao       │  │
│  │ Relatorio   │ Evidencia│ Sinc.   │ Validacao          │  │
│  └─────────────┴──────────┴─────────┴────────────────────┘  │
│                     Recebe & Responde HTTP                   │
└───────────────┬────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────┐
│                     SERVICES (8)                            │
│  ┌─────────────┬──────────┬─────────┬────────────────────┐ │
│  │ Usuario     │ Tarefa   │ Ticket  │ Movimentacao       │ │
│  │ Relatorio   │ Evidencia│ Sinc.   │ Validacao          │ │
│  └─────────────┴──────────┴─────────┴────────────────────┘ │
│                  Lógica de Negócio & Validações             │
└───────────────┬────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────┐
│                   REPOSITORIES (13)                         │
│  ┌──────┬──────────┬──────────┬────┬────┬────┬────────┐   │
│  │Usua. │ Tarefa   │ Ticket   │Mov.│Evi.│Rel.│Retiro │   │
│  │      │          │          │    │ +7 │    │        │   │
│  └──────┴──────────┴──────────┴────┴────┴────┴────────┘   │
│         CRUD + Transações com Banco de Dados                │
└───────────────┬────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────┐
│                    MODELS (14)                              │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐ │
│  │ Usuario  │ Tarefa   │ Ticket   │ Movimentacao         │ │
│  │ Evidencia│ Relatorio│ Retiro   │ UUID Type            │ │
│  │ + Types  │ + Status │ + Status │ + 6 enums/types      │ │
│  └──────────┴──────────┴──────────┴──────────────────────┘ │
│           Type Definitions e Interfaces TypeScript          │
└───────────────┬────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────┐
│                   BANCO DE DADOS (SQL)                      │
│  ┌──────┬──────────┬────────┬─────────────┬──────────┐    │
│  │usuarios│ tarefas  │tickets │ movimentacoes│evidencias│   │
│  │        │          │        │ + 5 detalhes│ + 7 tipos│   │
│  └──────┴──────────┴────────┴─────────────┴──────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ MIDDLEWARES & FLUXO

```
REQUEST CHEGA
    │
    ├─→ express.json() ─────────────────────────┐
    │                                            │
    ├─→ loggerMiddleware() ◄────────────────────┤─── Log início
    │                                            │
    ├─→ Router Match (encontra rota)
    │                    │
    │    ┌───────────────┴───────────────┐
    │    │ Rota pública? │ Rota privada? │
    │    │ (sem auth)    │ (exige auth)  │
    │    │               │               │
    │    ▼               ▼               │
    │    ↓           autenticarUsuario() │
    │    ↓           ├─ JWT valido?     │
    │    ↓           ├─ Token não expirado? │
    │    ↓           └─ req.usuario ← preenche │
    │    │               │               │
    │    │               ├─ Exige cargo? │
    │    │               │ exigirCargo() │
    │    │               │ ├─ usuario.cargo ∈ permitidos? │
    │    │               │ └─ 403 se falhar    │
    │    │               │
    │    └───────────────┴────────────────
    │                    │
    │    ┌───────────────┴──────────────┐
    │    │ Exige validação? │           │
    │    │ validateRequest()            │
    │    │ ├─ req.body valido?         │
    │    │ └─ 400 se falhar            │
    │    └───────────────┬──────────────┘
    │                    │
    ├─→ CONTROLLER ◄─────┘
    │    │
    │    ├─→ SERVICE
    │    │    │
    │    │    └─→ REPOSITORY
    │    │         │
    │    │         └─→ DATABASE
    │    │
    │    └─→ res.json()
    │
    ├─→ loggerMiddleware ◄────────────────── Log fim: [HTTP] METHOD URL → STATUS | DURATION
    │
    └─→ RESPONSE SAÍDA


Se ERRO em qualquer ponto:
    │
    └─→ errorHandler(error, req, res, next)
        ├─ AppError? ─→ res.status(statusCode).json({error})
        ├─ Error? ──→ res.status(500).json({error})
        └─ Else? ──→ res.status(500).json({ error: 'Erro interno' })
```

---

## 4️⃣ FLUXOS POR MÓDULO

### 📋 USUÁRIO - Login

```
POST /usuarios/login
    │
    ├─→ UsuarioController.autenticar()
    │    │
    │    ├─ Valida req.body: { login, senha }
    │    │
    │    └─→ UsuarioService.autenticar(login, senha)
    │         │
    │         ├─→ UsuarioRepository.findByLogin(login)
    │         │    └─→ Database: SELECT * FROM usuarios WHERE login = ?
    │         │
    │         └─ Valida: senha === usuario.senha_hash
    │            ├─ SIM → gerarToken(usuario)
    │            │         └─ JWT: { id, login, cargo, retiro_id }
    │            │         └─ Expira em: 1 dia
    │            └─ NÃO → AppError('Senha incorreta', 401)
    │
    └─→ Response: { token: "eyJ...", usuario: {...} }
```

### 📝 TAREFA - Criar

```
POST /tarefas + Body { retiro_id, atribuida_a, prioridade, categoria, descricao }
    │
    ├─→ TarefaController.criar(req, res)
    │    │
    │    └─→ TarefaService.criar(dados, usuarioCriador?)
    │         │
    │         ├─ validarCamposObrigatorios(dados)
    │         │  └─ Verifica: atribuida_a, prioridade, categoria, descricao
    │         │
    │         ├─ Valida: usuarioCriador.cargo === 'supervisor'?
    │         │  └─ NÃO → AppError('Apenas supervisores podem criar', 403)
    │         │
    │         └─→ TarefaRepository.create(input)
    │              │
    │              └─→ Database: INSERT INTO tarefas ...
    │                  ├─ Campos: retiro_id, atribuida_a, prioridade,
    │                  │           categoria, descricao, data_criacao,
    │                  │           criada_por, status = 'pendente'
    │                  │
    │                  └─ Retorna: tarefa criada com id gerado
    │
    └─→ Response 201: { id, retiro_id, atribuida_a, ... }
```

### 🎟️ TICKET - Filtrar por Status

```
GET /tickets/status?status=pendente&retiroId=1
    │
    ├─→ TicketController.listarPorStatus(req, res)
    │    │
    │    └─→ TicketService.listarPorStatus(status, retiroId)
    │         │
    │         ├─→ TicketRepository.findAll()
    │         │    └─→ Database: SELECT * FROM tickets
    │         │
    │         └─ JavaScript Filter:
    │            ├─ Filtra por: status === 'pendente'
    │            ├─ Filtra por: retiroId === 1 (se fornecido)
    │            └─ Retorna: array de tickets filtrados
    │
    └─→ Response 200: [ { id, status, retiroId, ... }, ... ]
```

### 🔄 MOVIMENTAÇÃO - Criar + Tipo Específico

```
POST /movimentacoes + Body { retiro_id, tipo: 'compra', quantidade, ... }
    │
    ├─→ MovimentacaoController.criar(req, res)
    │    │
    │    └─→ MovimentacaoService.criar(dados)
    │         │
    │         ├─ validarCamposObrigatorios(dados)
    │         ├─ validarOrigem(dados.origem)
    │         ├─ validarDestino(dados.destino)
    │         ├─ validarQuantidade(dados.quantidade)
    │         │
    │         └─→ MovimentacaoRepository.create(input)
    │              │
    │              ├─→ Database BEGIN TRANSACTION
    │              │
    │              ├─→ INSERT INTO movimentacoes
    │              │   (retiro_id, capataz_id, tipo, estagio_vida, ...)
    │              │
    │              ├─→ MovimentacaoRepository.createDetalhes(tx, movId, input)
    │              │   └─ Se tipo === 'compra':
    │              │      INSERT INTO movimentacao_compras (movimentacao_id, quantidade)
    │              │   └─ Se tipo === 'transferencia':
    │              │      INSERT INTO movimentacao_transferencias (movimentacao_id, origem, destino, quantidade)
    │              │   └─ etc para cada tipo
    │              │
    │              └─→ Database COMMIT TRANSACTION
    │
    └─→ Response 201: { id, tipo, detalhes, ... }
```

### 📸 EVIDÊNCIA - Criar Foto com Geolocalização

```
POST /evidencias/fotos + Body { usuarioId, urlArquivo, latitude, longitude }
    │
    ├─→ EvidenciaController.criarFoto(req, res)
    │    │
    │    └─→ EvidenciaService.criarFoto(usuarioId, url, lat, lng)
    │         │
    │         ├─ validarGeorreferenciamento(latitude, longitude)
    │         │  ├─ Valida: -90 <= lat <= 90
    │         │  ├─ Valida: -180 <= lng <= 180
    │         │  └─ AppError se falhar
    │         │
    │         ├─→ EvidenciaRepository.create({ usuario_id, tipo: 'foto' })
    │         │    └─→ Database: INSERT INTO evidencias ...
    │         │        └─ Retorna: evidencia com id gerado
    │         │
    │         └─→ EvidenciaFotoRepository.create({ evidencia_id, url, lat, lng })
    │              └─→ Database: INSERT INTO evidencia_fotos ...
    │
    └─→ Response 201: { evidencia: {...}, foto: {...} }
```

### 📊 RELATÓRIO - Gerar Semanal

```
GET /relatorios/semanal?retiroId=1
    │
    ├─→ RelatorioController.gerarRelatorioSemanal(req, res)
    │    │
    │    └─→ RelatorioService.gerarRelatorioSemanal(retiroId)
    │         │
    │         ├─ Detecta: semana atual
    │         │
    │         ├─→ SincronizacaoService.buscarMovimentacoesParaRelatrio(retiroId)
    │         │    ├─ Filtra: data_criacao da última semana
    │         │    └─ Retorna: [ { id, tipo, quantidade, ... }, ... ]
    │         │
    │         ├─→ SincronizacaoService.buscarTarefasParaRelatrio(retiroId)
    │         │    ├─ Filtra: data_criacao da última semana
    │         │    └─ Retorna: [ { id, status, categoria, ... }, ... ]
    │         │
    │         └─ Agrupa & Formata dados
    │            └─ Retorna: [ { data, tipo, qtd, status }, ... ]
    │
    └─→ Response 200: Array de registros agregados por dia/semana
```

### ✅ VALIDAÇÃO - Aprovar Ticket

```
PATCH /validacoes/tickets/42/aprovar
    │
    ├─ Middleware: autenticarUsuario
    │  └─ req.usuario preenchido
    │
    ├─ Middleware: exigirCargo('supervisor')
    │  └─ Valida: req.usuario.cargo === 'supervisor'
    │
    ├─→ ValidacaoController.aprovarTicket(req, res)
    │    │
    │    └─→ ValidacaoService.aprovarTicket(ticketId, supervisor)
    │         │
    │         ├─ Valida: supervisor.cargo === 'supervisor'
    │         │
    │         ├─→ TicketRepository.findById(ticketId)
    │         │    └─ Valida: ticket.status === 'pendente'
    │         │
    │         ├─→ TicketRepository.update(ticketId, { status: 'aprovado' })
    │         │    └─→ Database: UPDATE tickets SET status = 'aprovado' WHERE id = ?
    │         │
    │         └─ Retorna: ticket atualizado
    │
    └─→ Response 200: { id, status: 'aprovado', ... }
```

---

## 5️⃣ MATRIZ DE RESPONSABILIDADES

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  CONTROLLER              SERVICE                 REPOSITORY │
│  ───────────             ───────────             ──────────  │
│  ✓ Recebe req            ✓ Lógica negócio       ✓ CRUD      │
│  ✓ Valida params         ✓ Validações regras    ✓ SQL       │
│  ✓ Chama service         ✓ Orquestração         ✓ Transação │
│  ✓ Responde res          ✓ Chama repository     ✓ Conversão │
│  ✓ Status HTTP           ✓ Lança AppError       ✓ Retorna   │
│                                                   entidade   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6️⃣ TIPOS DE DADOS PRINCIPAIS

```
USUÁRIO
├─ id: UUID
├─ nome: string
├─ login: email
├─ senha_hash: string
├─ status: 'ativo' | 'inativo'
├─ cargo: 'capataz' | 'supervisor' | 'gerente'
└─ retiro_id: number

TAREFA
├─ id: number
├─ retiro_id: number
├─ atribuida_a: UUID (usuário)
├─ prioridade: 'alta' | 'media' | 'baixa'
├─ categoria: string
├─ descricao: string
├─ status: 'pendente' | 'aprovado'
├─ criada_por: UUID
└─ data_criacao: date

TICKET
├─ id: number
├─ retiro_id: number
├─ categoria: 'cerca' | 'hidraulica' | 'eletrica' | ...
├─ localizacao: string
├─ descricao: string
├─ prioridade: 'alta' | 'media' | 'baixa'
├─ status: 'pendente' | 'aprovado'
├─ aberto_por: UUID
└─ data_abertura: date

MOVIMENTAÇÃO
├─ id: number
├─ retiro_id: number
├─ capataz_id: UUID
├─ tipo: 'nascimento' | 'morte' | 'compra' | 'venda' | 'transferencia'
├─ estagio_vida: enum (11 opções)
├─ status: 'pendente' | 'validado'
├─ validado_por: UUID
├─ sincronizado: boolean
└─ Detalhes (depende do tipo):
   ├─ compra/venda: quantidade
   ├─ transferencia: origem, destino, quantidade
   ├─ nascimento: origem, quantidade
   └─ morte: origem, causa_obito

EVIDÊNCIA
├─ id: number
├─ usuario_id: UUID
├─ tipo: 'foto' | 'audio' | 'mensagem'
├─ data_criacao: date
└─ Detalhes específicos:
   ├─ Foto: url_arquivo, latitude, longitude
   ├─ Audio: url_arquivo
   └─ Mensagem: conteudo
```

---

## 7️⃣ CICLO DE VIDA DE UMA REQUISIÇÃO

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│ 1. ENTRADA                                                    │
│    └─ Cliente envia HTTP request com body/params/headers      │
│                                                                │
│ 2. EXPRESS                                                    │
│    ├─ Parse JSON (express.json)                              │
│    └─ Log início (loggerMiddleware)                           │
│                                                                │
│ 3. ROTEAMENTO                                                 │
│    └─ Encontra rota matching                                  │
│                                                                │
│ 4. MIDDLEWARES ESPECÍFICOS (conforme necessário)             │
│    ├─ autenticarUsuario (JWT)                                │
│    ├─ exigirCargo (Autorização)                              │
│    └─ validateRequest (Validação de dados)                   │
│                                                                │
│ 5. CONTROLLER                                                 │
│    ├─ Extrai dados: req.body, req.params, req.query          │
│    ├─ Converte tipos se necessário                           │
│    └─ Chama Service                                           │
│                                                                │
│ 6. SERVICE                                                    │
│    ├─ Aplica lógica de negócio                               │
│    ├─ Valida regras                                          │
│    └─ Chama Repository                                        │
│                                                                │
│ 7. REPOSITORY                                                 │
│    ├─ Monta query SQL                                        │
│    ├─ Gerencia transação (se necessário)                     │
│    ├─ Executa contra DB                                      │
│    └─ Retorna entidade/array                                 │
│                                                                │
│ 8. BANCO DE DADOS                                            │
│    ├─ Executa INSERT/SELECT/UPDATE/DELETE                    │
│    └─ Retorna linhas afetadas                                │
│                                                                │
│ 9. RETORNO Repository → Service → Controller                │
│    └─ Cada camada retorna resultado                          │
│                                                                │
│ 10. SAÍDA                                                     │
│     ├─ Controller: res.status(code).json(data)               │
│     ├─ loggerMiddleware finaliza log                         │
│     └─ Response enviado ao cliente                           │
│                                                                │
│ 11. ERRO (se acontecer em qualquer ponto)                   │
│     ├─ Lança AppError(message, statusCode)                   │
│     ├─ errorHandler captura                                  │
│     └─ res.status(statusCode).json({ error })               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 8️⃣ SUMÁRIO DE ENDPOINTS

| Módulo | Total | POST | GET | PATCH | DELETE |
|--------|:-----:|:----:|:---:|:-----:|:------:|
| Usuario | 7 | 2 | 3 | 1 | 1 |
| Tarefa | 9 | 1 | 6 | 2 | 0 |
| Ticket | 10 | 1 | 6 | 3 | 0 |
| Movimentacao | 8 | 2 | 4 | 1 | 1 |
| Evidencia | 5 | 3 | 2 | 0 | 0 |
| Relatorio | 5 | 0 | 5 | 0 | 0 |
| Sincronizacao | 6 | 1 | 5 | 0 | 0 |
| Validacao | 4 | 1 | 1 | 2 | 0 |
| **TOTAL** | **54** | **11** | **32** | **9** | **2** |

---

## 9️⃣ FLUXO DE SINCRONIZAÇÃO (Offline First)

```
Cliente Offline
    │
    ├─→ Cria movimentacoes/tarefas/tickets LOCALMENTE
    │    └─ Status: 'pendente'
    │    └─ Armazena em storage local (SQLite/IndexedDB)
    │
    ├─ Detecta reconexão
    │
    ├─→ GET /sincronizacao/conexao
    │    └─ Verifica se servidor está acessível
    │
    ├─→ POST /sincronizacao
    │    │
    │    └─→ SincronizacaoService.sincronizar()
    │         │
    │         ├─ Loop: Movimentações Pendentes
    │         │  ├─→ POST /movimentacoes/sincronizar (envia)
    │         │  │
    │         │  └─→ MovimentacaoController.sincronizarRecebida()
    │         │       └─ Salva no servidor
    │         │
    │         ├─ Loop: Tarefas Pendentes
    │         │
    │         └─ Loop: Tickets Pendentes
    │
    ├─→ GET /sincronizacao/status
    │    └─ Retorna: { sincronizado, pendentes, erros }
    │
    └─ Cliente atualiza UI com status
```

---

## 🔟 MATRIZ DE AUTENTICAÇÃO & AUTORIZAÇÃO

```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Módulo      │ Sem Auth     │ Com Auth*    │ Cargo        │
├─────────────┼──────────────┼──────────────┼──────────────┤
│ USUARIO     │ /login (POST)│ Resto CRUD   │ GERENTE      │
│ TAREFA      │ Todos        │ -            │ -            │
│ TICKET      │ Todos        │ -            │ -            │
│ MOVIMENTACAO│ Todos        │ -            │ -            │
│ EVIDENCIA   │ Todos        │ -            │ -            │
│ RELATORIO   │ ❌ NÃO       │ Todos        │ GERENTE/SUP. │
│ SINCRONIZACAO│ Todos       │ -            │ -            │
│ VALIDACAO   │ ❌ NÃO       │ Todos        │ SUPERVISOR   │
└─────────────┴──────────────┴──────────────┴──────────────┘

*Com Auth = Requer Header: Authorization: Bearer <token>
```

---

**FIM DO DIAGRAMA**

