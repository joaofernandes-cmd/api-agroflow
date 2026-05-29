# 🔐 Estrutura Completa dos Middlewares

**Documento detalhado de todos os middlewares do projeto**

---

## 1. AUTH MIDDLEWARE

```
arquivo: auth.middleware.ts
```

### Tipo: JwtPayloadUsuario
```
✓ id: string (sub - subject do JWT)
✓ login: string
✓ cargo: UsuarioCargo
✓ retiro_id: number
```

### Interface: UsuarioAutenticado
```
✓ id: string
✓ login: string
✓ cargo: UsuarioCargo
✓ retiro_id: number
```

### Constantes
```
✓ JWT_SECRET: string (from process.env.JWT_SECRET or padrão)
✓ JWT_EXPIRES_IN: '1d' (1 dia)
```

### Função: gerarToken(usuario: UsuarioAutenticado) → string
```
Descrição: Gera JWT token após login bem-sucedido
Entrada: UsuarioAutenticado
├─ id
├─ login
├─ cargo
└─ retiro_id

Saída: Token JWT assinado
├─ Algoritmo: HS256
├─ Expiração: 1 dia
└─ Subject: usuario.id

Uso: POST /usuarios/login
```

### Middleware: autenticarUsuario(req, res, next)
```
Descrição: Valida JWT e preenche req.usuario
Entrada: Header Authorization: "Bearer <token>"

Fluxo:
1. Lê header Authorization
2. Valida formato "Bearer <token>"
3. Extrai token após "Bearer "
4. Valida JWT com JWT_SECRET
5. Decodifica payload
6. Valida campos obrigatórios (sub, login, cargo)
7. Preenche req.usuario com dados decodificados

Saída: next() ou 401 Unauthorized
├─ 401: Token não informado
├─ 401: Token inválido
└─ 401: Token expirado

Retorno em req.usuario:
{
  id: string (do sub)
  login: string
  cargo: UsuarioCargo
  retiro_id: number
}

Aplicação: Em rotas que exigem autenticação
usuarioRoutes.use(autenticarUsuario)
```

---

## 2. ROLE MIDDLEWARE

```
arquivo: role.middleware.ts
```

### Função: exigirCargo(...cargosPermitidos: UsuarioCargo[]) → Middleware
```
Descrição: Factory que retorna middleware de autorização por cargo
Entrada: UsuarioCargo[] (um ou mais cargos permitidos)
├─ 'capataz'
├─ 'supervisor'
└─ 'gerente'

Retorna: Middleware(req, res, next)

Fluxo:
1. Verifica se req.usuario existe (requer autenticar antes)
2. Valida se req.usuario.cargo ∈ cargosPermitidos
3. Permite acesso ou rejeita

Saída:
├─ 401: Usuário não autenticado
├─ 403: Cargo insuficiente
└─ next(): Cargo válido, continua

Exemplos:
exigirCargo('gerente')                          ← Só gerente
exigirCargo('gerente', 'supervisor')            ← Gerente ou supervisor
exigirCargo('supervisor')                       ← Só supervisor

Aplicação: Em rotas protegidas
usuarioRoutes.use(exigirCargo('gerente'))
```

---

## 3. LOGGER MIDDLEWARE

```
arquivo: logger.middleware.ts
```

### Função Auxiliar: formatDurationMs(startedAt: bigint) → string
```
Descrição: Formata duração em ms com 2 casas decimais
Entrada: startedAt = process.hrtime.bigint()
Saída: "45.23ms" (string)
```

### Função Auxiliar: getRouteLabel(req: Request) → string
```
Descrição: Obtém URL da requisição
Entrada: Request object
Saída: req.originalUrl ou req.url
Exemplo: "/usuarios/123?filter=ativo"
```

### Middleware: loggerMiddleware(req, res, next)
```
Descrição: Registra informações de cada requisição HTTP
Aplicação: Global, logo após express.json()

Fluxo:
1. Captura timestamp início: startedAt = process.hrtime.bigint()
2. Aguarda: res.on('finish') ← response completa
3. Calcula duração
4. Coleta informações:
   ├─ Método: req.method
   ├─ URL: req.originalUrl
   ├─ Status: res.statusCode
   ├─ Duração: formatDurationMs(elapsed)
   ├─ User ID: req.usuario?.id ?? 'anonimo'
   └─ Cargo: req.usuario?.cargo ?? 'sem-cargo'
5. Loga no console

Formato de Saída:
[HTTP] METHOD URL → STATUS_CODE | DURATION | user=ID | cargo=CARGO

Exemplos:
[HTTP] POST /usuarios/login → 200 | 45.23ms | user=anonimo | cargo=sem-cargo
[HTTP] GET /tarefas → 200 | 12.45ms | user=uuid-123 | cargo=supervisor
[HTTP] POST /usuarios → 403 | 5.67ms | user=uuid-456 | cargo=capataz
[HTTP] GET /relatorios/semanal → 401 | 2.34ms | user=anonimo | cargo=sem-cargo

Retorno: next()
```

---

## 4. ERROR HANDLER MIDDLEWARE

```
arquivo: errorHandler.middleware.ts
```

### Classe: AppError extends Error
```
Propriedades:
├─ name: 'AppError'
├─ message: string
├─ statusCode: number (padrão 500)
└─ details?: unknown (dados extras)

Construtor: AppError(message, statusCode = 500, details?)

Uso:
throw new AppError('Usuário não encontrado', 404)
throw new AppError('Acesso negado', 403, { motivo: 'Cargo insuficiente' })
throw new AppError('Erro interno', 500)
```

### Função Auxiliar: isAppError(error: unknown) → boolean
```
Descrição: Type guard para verificar se é AppError
Entrada: qualquer valor
Saída: boolean (true se é AppError)
```

### Middleware: errorHandler(error, req, res, next)
```
Descrição: Handler global de erros - deve ser último middleware
Aplicação: app.use(errorHandler)

Fluxo:
1. Verifica se resposta já foi iniciada
   └─ Se res.headersSent = true, ignora (resposta já saiu)

2. Se erro é AppError:
   └─ res.status(error.statusCode).json({
      error: error.message,
      details: error.details (se houver)
   })

3. Se erro é Error (JavaScript):
   └─ res.status(500).json({
      error: error.message || 'Erro interno no servidor'
   })

4. Else (erro desconhecido):
   └─ res.status(500).json({
      error: 'Erro interno no servidor'
   })

Saída: Response JSON com erro formatado

Exemplos:
AppError('Não encontrado', 404)
→ 404: { error: 'Não encontrado' }

AppError('Inválido', 400, { field: 'email' })
→ 400: { error: 'Inválido', details: { field: 'email' } }

Error('Conexão DB falhou')
→ 500: { error: 'Conexão DB falhou' }
```

---

## 5. VALIDATE REQUEST MIDDLEWARE

```
arquivo: validateRequest.middleware.ts
```

### Tipo: ValidationError
```
✓ field: string (nome do campo)
✓ message: string (mensagem de erro)
```

### Tipo: ValidationResult
```
✓ valid: boolean (passou na validação?)
✓ errors: ValidationError[] (lista de erros)
```

### Tipo: RequestValidator
```
✓ (req: Request) => ValidationResult | Promise<ValidationResult>
Função que retorna resultado de validação
```

### Função: validateRequest(validator: RequestValidator) → Middleware
```
Descrição: Factory que cria middleware de validação
Entrada: Função validadora

Retorna: Middleware(req, res, next)

Fluxo:
1. Executa validator(req)
2. Se validation.valid = false:
   └─ res.status(400).json({
      error: 'Dados inválidos',
      details: validation.errors
   })

3. Se valid = true:
   └─ next() (continua)

4. Se erro na validação:
   └─ res.status(400).json({
      error: 'Falha na validação da requisição'
   })

Exemplo de uso:
const validador = (req: Request) => {
  const errors: ValidationError[] = []
  
  const nomeError = requiredString(req.body.nome, 'nome')
  if (nomeError) errors.push(nomeError)
  
  const idadeError = requiredNumber(req.body.idade, 'idade')
  if (idadeError) errors.push(idadeError)
  
  return {
    valid: errors.length === 0,
    errors
  }
}

rotas.post('/', validateRequest(validador), Controller.criar)
```

### Helper: requiredString(value, field, message?) → ValidationError | null
```
Descrição: Valida se campo é string não-vazia
Entrada:
├─ value: valor a validar
├─ field: nome do campo (para mensagem)
└─ message: mensagem customizada (opcional)

Saída:
├─ ValidationError: se inválido
└─ null: se válido

Exemplo:
requiredString(req.body.email, 'email')
→ null (se email é string não-vazia)
→ ValidationError se vazio ou não-string
```

### Helper: requiredNumber(value, field, message?) → ValidationError | null
```
Descrição: Valida se campo é número válido
Entrada:
├─ value: valor a validar
├─ field: nome do campo
└─ message: mensagem customizada

Saída:
├─ ValidationError: se inválido ou NaN
└─ null: se válido

Exemplo:
requiredNumber(req.body.idade, 'idade')
→ null (se é número válido)
→ ValidationError se não-número ou undefined
```

### Helper: requiredDate(value, field, message?) → ValidationError | null
```
Descrição: Valida se campo é data válida
Entrada:
├─ value: valor a validar
├─ field: nome do campo
└─ message: mensagem customizada

Saída:
├─ ValidationError: se não é data válida
└─ null: se válido

Validação: 
├─ Não pode ser undefined/null/vazio
├─ new Date(value) deve ser válida
└─ Date.getTime() não pode ser NaN

Exemplo:
requiredDate(req.body.data_criacao, 'data_criacao')
→ null (se "2026-05-29" é data válida)
→ ValidationError se "abc" ou inválida
```

### Helper: oneOf<T>(value, field, allowedValues[], message?) → ValidationError | null
```
Descrição: Valida se valor está na lista permitida
Entrada:
├─ value: valor a validar
├─ field: nome do campo
├─ allowedValues: array de valores permitidos
└─ message: mensagem customizada

Saída:
├─ ValidationError: se não está em allowedValues
└─ null: se válido

Exemplo:
oneOf(req.body.status, 'status', ['pendente', 'aprovado'])
→ null (se status = 'pendente')
→ ValidationError (se status = 'cancelado')

oneOf(req.body.cargo, 'cargo', ['capataz', 'supervisor', 'gerente'])
→ null (se cargo é válido)
→ ValidationError (se cargo inválido)
```

---

## 📊 RESUMO MIDDLEWARES

| # | Middleware | Tipo | Função | Uso |
|---|-----------|------|--------|-----|
| 1 | auth | Segurança | Valida JWT | autenticarUsuario() |
| 2 | role | Autorização | Verifica cargo | exigirCargo() |
| 3 | logger | Logging | Registra requisições | loggerMiddleware() |
| 4 | errorHandler | Tratamento | Captura erros | errorHandler() |
| 5 | validateRequest | Validação | Valida payload | validateRequest() |

---

## 🔄 ORDEM DE EXECUÇÃO

```
Request HTTP
    ↓
1. express.json()                    ← Parse JSON body
    ↓
2. loggerMiddleware()                ← Log inicia
    ↓
3. Router Match                      ← Encontra rota
    ↓
4. autenticarUsuario() [OPCIONAL]    ← JWT validation
    ├─ Header: Authorization: Bearer <token>
    ├─ Valida JWT
    └─ Preenche req.usuario
    ↓
5. exigirCargo() [OPCIONAL]          ← Role check
    ├─ Verifica req.usuario
    └─ Valida req.usuario.cargo
    ↓
6. validateRequest() [OPCIONAL]      ← Body validation
    ├─ Valida req.body
    └─ Valida req.params, req.query
    ↓
7. CONTROLLER.funcao()               ← Executa lógica
    │
    ├─ SERVICE
    │   └─ REPOSITORY
    │       └─ DATABASE
    │
    └─ res.status().json()
    ↓
8. loggerMiddleware finish           ← Log finaliza
    ↓
9. errorHandler() [SE ERROR]         ← Captura erro
    ├─ AppError?
    ├─ Error?
    └─ Unknown?
    ↓
Response HTTP
```

---

## 🎯 PADRÕES APLICADOS

### 1. Middleware Factory Pattern
```
exigirCargo('supervisor') retorna um middleware
└─ Permite reutilização com diferentes parâmetros

Exemplo:
const middleware = exigirCargo('supervisor')
rotas.use(middleware)
```

### 2. Type Guards
```
isAppError(error) → boolean
└─ Permite tratamento específico por tipo de erro
```

### 3. Helper Functions
```
requiredString, requiredNumber, requiredDate, oneOf
└─ Composição de validações
```

### 4. Error Class Hierarchy
```
AppError extends Error
└─ Diferencia erros de aplicação de erros do JS
```

### 5. High Resolution Timer
```
process.hrtime.bigint()
└─ Precisão de nanosegundos para logs
```

---

## 📝 CASOS DE USO

### Caso 1: Rota Pública (Sem Autenticação)
```
GET /health
├─ express.json()
├─ loggerMiddleware
└─ CONTROLLER
```

### Caso 2: Rota Autenticada (Só Autenticação)
```
GET /tarefas
├─ express.json()
├─ loggerMiddleware
├─ autenticarUsuario() ✓ Exigido
└─ CONTROLLER
```

### Caso 3: Rota Restrita (Autenticação + Cargo)
```
PATCH /validacoes/tickets/:id/aprovar
├─ express.json()
├─ loggerMiddleware
├─ autenticarUsuario() ✓ Exigido
├─ exigirCargo('supervisor') ✓ Exigido
└─ CONTROLLER
```

### Caso 4: Rota com Validação
```
POST /usuarios
├─ express.json()
├─ loggerMiddleware
├─ validateRequest(validator) ✓ Valida body
├─ autenticarUsuario()
├─ exigirCargo('gerente')
└─ CONTROLLER
```

### Caso 5: Erro Capturado
```
Service.criar() lança AppError('Inválido', 400)
    ↓
Controller catch passa para errorHandler
    ↓
errorHandler(error) captura
    ├─ isAppError? SIM
    └─ res.status(400).json({ error: 'Inválido' })
```

---

## 💾 TOTAIS

| Tipo | Quantidade |
|------|:----------:|
| Middlewares Principais | 5 |
| Funções Helper | 4 |
| Classes | 1 (AppError) |
| Type Guards | 1 |
| Factories | 2 |
| **Total de Funções** | **13** |

---

