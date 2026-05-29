# ⚡ RESUMO REFERÊNCIA RÁPIDA - G02

**One Page Reference do Projeto**

---

## 🎯 O QUE É?
Backend Node.js + TypeScript com padrão **BRPEC** (Banco, Repositories, Controllers, Services, Models).  
Sistema de gerenciamento de retiros (fazendas) com rastreamento de animais, tarefas e tickets de manutenção.

---

## 📊 NÚMEROS

| Item | Qtd |
|------|-----|
| Controllers | 8 |
| Services | 8 |
| Repositories | 13 |
| Models | 14 |
| Routes Totais | 54 |
| Middlewares | 5 |
| Tabelas DB | 20+ |

---

## 🛣️ ROTAS RÁPIDO

```
POST   /usuarios/login                          ✓ Sem Auth
GET    /usuarios / /usuarios/:id                ✓ Gerente
POST   /tarefas / GET /tarefas                  ✓ Aberto
GET    /tickets / POST /tickets                 ✓ Aberto
GET    /movimentacoes                           ✓ Aberto
GET    /evidencias                              ✓ Aberto
GET    /relatorios/**                           ✓ Gerente/Supervisor
GET    /sincronizacao/**                        ✓ Aberto
PATCH  /validacoes/**                           ✓ Supervisor
```

---

## 🔐 MIDDLEWARES EM SEQUÊNCIA

```
1. express.json()              ← Parse JSON
2. loggerMiddleware()          ← Log requisição
3. [Router Match]              ← Encontra rota
4. autenticarUsuario() [OPT]   ← Valida JWT
5. exigirCargo() [OPT]         ← Valida cargo
6. validateRequest() [OPT]     ← Valida payload
7. CONTROLLER.funcao()         ← Executa lógica
8. errorHandler()              ← Captura erros
```

---

## 🔄 FLUXO PADRÃO

```
REQUEST → CONTROLLER → SERVICE → REPOSITORY → DATABASE
  │                                              │
  └──────────────────────── RESPONSE ◄──────────┘
```

---

## 🔑 AUTENTICAÇÃO

```javascript
// Login
POST /usuarios/login { login, senha }
→ Response: { token: "Bearer eyJ...", usuario: {...} }

// Próximas requisições
Header: Authorization: Bearer eyJ...
↓
autenticarUsuario() ← Valida JWT, preenche req.usuario
↓
exigirCargo('supervisor') ← Valida cargo
↓
next() ← Continua
```

---

## 📦 ENTIDADES PRINCIPAIS

```
USUÁRIO
├─ Cargo: 'capataz' | 'supervisor' | 'gerente'
└─ Status: 'ativo' | 'inativo'

TAREFA
├─ Status: 'pendente' | 'aprovado'
├─ Prioridade: 'alta' | 'media' | 'baixa'
└─ Precisa aprovação de supervisor

TICKET (Manutenção)
├─ Status: 'pendente' | 'aprovado'
├─ Categoria: 'cerca' | 'hidraulica' | 'eletrica' | ...
└─ Prioridade: 'alta' | 'media' | 'baixa'

MOVIMENTAÇÃO (Rastreamento de Animais)
├─ Tipo: 'nascimento' | 'morte' | 'compra' | 'venda' | 'transferencia'
├─ Status: 'pendente' | 'validado'
├─ Tem detalhes em tabelas específicas (movimentacao_compras, etc)
└─ Cada tipo tem validações diferentes

EVIDÊNCIA
├─ Tipo: 'foto' | 'audio' | 'mensagem'
├─ Foto: inclui latitude/longitude (georreferenciamento)
└─ Pode ser anexada a tarefas/tickets/movimentações
```

---

## 🎯 CASOS DE USO COMUNS

### ✅ Criar Tarefa
```
POST /tarefas
{ retiro_id, atribuida_a, descricao, categoria, prioridade }
↓
TarefaService.criar() → valida supervisor → TarefaRepository.create()
↓
Response 201: tarefa criada com status='pendente'
```

### ✅ Listar Tarefas por Status
```
GET /tarefas/status/pendente?retiroId=1
↓
TarefaService.listarPorStatus() → Filtra na memória
↓
Response 200: [ tarefas ]
```

### ✅ Criar Movimentação com Tipo
```
POST /movimentacoes
{ retiro_id, capataz_id, tipo: 'compra', estagio_vida, quantidade }
↓
MovimentacaoService.criar() → valida campos
↓
MovimentacaoRepository.create() → BEGIN TX
├─ INSERT INTO movimentacoes
├─ INSERT INTO movimentacao_compras (tipo específico)
└─ COMMIT TX
↓
Response 201: movimentação criada
```

### ✅ Validar Movimentação (Supervisor)
```
Auth: Bearer <token>
Cargo: supervisor
↓
PATCH /validacoes/movimentacoes/42/validar
{ validado_por: uuid }
↓
ValidacaoService.validarMovimentacao()
├─ Verifica se está pendente
├─ Atualiza status → 'validado'
└─ Preenche validado_por
↓
Response 200: movimentação validada
```

### ✅ Gerar Relatório Semanal
```
Auth: Bearer <token>
Cargo: gerente | supervisor
↓
GET /relatorios/semanal?retiroId=1
↓
RelatorioService.gerarRelatorioSemanal()
├─ Busca movimentações da semana
├─ Busca tarefas da semana
├─ Agrupa por dia/tipo
└─ Formata para exportação
↓
Response 200: [ { data, tipo, quantidade, ... } ]
```

---

## 🌐 SINCRONIZAÇÃO (Offline First)

```
Cliente Offline
├─ Cria movimentações LOCALMENTE
└─ Armazena em storage local

Volta Online
├─ GET /sincronizacao/conexao ← Verifica servidor
├─ POST /sincronizacao ← Sincroniza dados
├─ GET /sincronizacao/status ← Obtém status
└─ Response: { sincronizado: true, erros: [] }
```

---

## 🚀 EXEMPLO COMPLETO - POST /tarefas

```bash
curl -X POST http://localhost:3000/tarefas \
  -H "Content-Type: application/json" \
  -d '{
    "retiro_id": 1,
    "atribuida_a": "uuid-usuario-1",
    "prioridade": "alta",
    "categoria": "vedacao",
    "descricao": "Consertar cerca da cocheira norte"
  }'
```

**Fluxo:**
1. express.json() → Parse body
2. loggerMiddleware → Log inicia
3. Router: POST /tarefas
4. TarefaController.criar()
   - Valida: retiro_id, atribuida_a, etc
5. TarefaService.criar()
   - validarCamposObrigatorios()
   - TarefaRepository.create()
6. Database: INSERT INTO tarefas ...
7. Response 201: { id, retiro_id, status: 'pendente', ... }
8. loggerMiddleware → Log: [HTTP] POST /tarefas → 201 | 25ms

---

## ⚠️ STATUS CODES COMUNS

```
200 OK              ← Sucesso GET
201 Created         ← Sucesso POST
400 Bad Request     ← Validação falhou
401 Unauthorized    ← Sem token
403 Forbidden       ← Cargo insuficiente
404 Not Found       ← Rota/recurso não existe
500 Server Error    ← Erro interno
```

---

## 📋 CHECKLIST PARA ADICIONAR NOVO ENDPOINT

- [ ] 1. Criar função em `NomeController`
- [ ] 2. Criar função em `NomeService` (lógica)
- [ ] 3. Criar função em `NomeRepository` (CRUD)
- [ ] 4. Garantir tipos em `NomeModel.ts`
- [ ] 5. Adicionar rota em `nome.route.ts`
- [ ] 6. Registrar rota em `app.ts`
- [ ] 7. Testar com curl/Postman
- [ ] 8. Testar com autenticação se necessário

---

## 🔗 FLUXO VISUAL SIMPLES

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ HTTP + JWT
       │
┌──────▼──────────────────┐
│  Controllers (8)        │
│  ├─ Recebe req          │
│  └─ Chama service       │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│  Services (8)           │
│  ├─ Lógica negócio      │
│  └─ Chama repository    │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│  Repositories (13)      │
│  ├─ CRUD SQL            │
│  └─ Transações          │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│  Database               │
│  └─ Persiste dados      │
└─────────────────────────┘
```

---

## 📚 DOCUMENTOS GERADOS

- `ANALISE_ARQUITETURA_MVC.md` ← Análise completa
- `MAPEAMENTO_DIAGRAMA_MVC.md` ← Por módulo (Controllers → Services → Repositories → Models)
- `GUIA_ROTAS_E_MIDDLEWARES.md` ← Todas as rotas + middlewares detalhados
- `DIAGRAMA_RELACOES_PROJETO.md` ← Diagramas visuais de fluxos
- `RESUMO_COERENCIA_ATUALIZADO.txt` ← Listagem compacta de funções
- `RESUMO_REFERENCIA_RAPIDA.md` ← **ESTE ARQUIVO** (uma página)

---

## 🎓 PADRÃO BRPEC

```
B → Banco de Dados        (SQL/Database)
R → Repositories          (Acesso a dados)
P → Controllers           (Entrada HTTP)
E → Express               (Framework)
C → Controllers           (Lógica HTTP)

Services                  (Lógica negócio)
Models                    (Tipos TypeScript)

O padrão segue: Request → Controller → Service → Repository → Database
```

---

**✨ Projeto completo e bem documentado!**

