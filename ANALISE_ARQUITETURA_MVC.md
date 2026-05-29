# 📋 Análise Completa da Arquitetura MVC - Backend

Documento gerado em: **2026-05-29**

---

## 📊 Resumo Executivo

O projeto segue o padrão **BRPEC** (Padrão MVC em Camadas):
- **B**ancos de Dados
- **R**epositories (Camada de Acesso a Dados)
- **P**adrão MVC
  - **Models** (Entidades/Tipos)
  - **Controllers** (Recebem requisições)
  - **Services** (Lógica de negócio)
- **E**xpress (Framework)
- **C**lientes (Views - Frontend)

---

## 📁 Estrutura do Projeto

```
src/backend/
├── controllers/    (7 arquivos)
├── services/       (8 arquivos)
├── repositories/   (13 arquivos)
├── models/         (14 arquivos)
└── @types/         (Type definitions)
```

---

## 🎮 CONTROLLERS (7 arquivos)

Os controllers recebem requisições HTTP e delegam para services.

### 1. **usuario.controller.ts**
- `autenticar()` - POST /login
- `listarTodos()` - GET /usuarios
- `buscarPorId()` - GET /usuarios/:id
- `listarPorRetiro()` - GET /usuarios/retiro/:retiroId
- `criar()` - POST /usuarios
- `atualizar()` - PUT /usuarios/:id
- `remover()` - DELETE /usuarios/:id

### 2. **tarefa.controller.ts**
- `criar()` - POST /tarefas
- `listarTodas()` - GET /tarefas
- `buscarPorId()` - GET /tarefas/:id
- `buscarParaDashboard()` - GET /tarefas/dashboard
- `listarPorStatus()` - GET /tarefas/status/:status
- `listarPorUsuario()` - GET /tarefas/usuario/:usuarioId
- `listarPorPrioridade()` - GET /tarefas/prioridade/:prioridade
- `listarPorCategoria()` - GET /tarefas/categoria/:categoria
- `atualizarStatus()` - PUT /tarefas/:id/status

### 3. **ticket.controller.ts**
- `listarTodos()` - GET /tickets
- `buscarPorId()` - GET /tickets/:id
- `criar()` - POST /tickets
- `listarPorStatus()` - GET /tickets/status/:status
- `listarPorPrioridade()` - GET /tickets/prioridade/:prioridade
- `listarPorCategoria()` - GET /tickets/categoria/:categoria
- `listarPendentes()` - GET /tickets/pendentes
- `contarPorPrioridade()` - GET /tickets/contar/prioridade
- `contarPorStatus()` - GET /tickets/contar/status
- `contarPorTipo()` - GET /tickets/contar/tipo
- `alterarPrioridade()` - PUT /tickets/:id/prioridade
- `atribuirA()` - PUT /tickets/:id/atribuir
- `aprovarTicket()` - PUT /tickets/:id/aprovar

### 4. **movimentacao.controller.ts**
- `criar()` - POST /movimentacoes
- `sincronizarRecebida()` - POST /movimentacoes/sincronizar
- `listarTodas()` - GET /movimentacoes
- `buscarPorId()` - GET /movimentacoes/:id
- `filtrar()` - POST /movimentacoes/filtrar

### 5. **evidencia.controller.ts**
- `listar()` - GET /evidencias
- `buscarPorId()` - GET /evidencias/:id
- `criarMensagem()` - POST /evidencias/mensagem
- `criarAudio()` - POST /evidencias/audio
- `criarFoto()` - POST /evidencias/foto

### 6. **relatorio.controller.ts**
- `buscarDadosMovimentacoes()` - POST /relatorios/movimentacoes/dados
- `buscarDadosTarefas()` - POST /relatorios/tarefas/dados
- `formatarRelatorioMovimentacoes()` - POST /relatorios/movimentacoes/formatar
- `gerarRelatorioSemanal()` - GET /relatorios/semanal
- `gerarRelatorioMensal()` - GET /relatorios/mensal

### 7. **validacao.controller.ts**
- `podeValidar()` - GET /validacao/pode-validar
- `validarMovimentacao()` - PUT /movimentacoes/:id/validar
- `aprovarTicket()` - PUT /tickets/:id/aprovar
- `aprovarTarefa()` - PUT /tarefas/:id/aprovar

### 8. **sincronizacao.controller.ts**
- `detectarConexao()` - GET /sincronizacao/conexao
- `sincronizar()` - POST /sincronizacao
- `buscarMovimentacoesParaRelatrio()` - GET /sincronizacao/movimentacoes
- `buscarTarefasParaRelatrio()` - GET /sincronizacao/tarefas
- `buscarTicketsParaDashboard()` - GET /sincronizacao/tickets
- `obterStatusSincronizacao()` - GET /sincronizacao/status
- `obterMensagemSincronizacao()` - GET /sincronizacao/mensagem

---

## ⚙️ SERVICES (8 arquivos)

Camada de lógica de negócio. Valida dados, aplica regras e orquestra operações.

### 1. **usuario.service.ts**
- `autenticar(login, senha)` - Valida credenciais
- `buscarPorId(id)` - Busca usuário por ID
- `listarPorRetiro(retiroId)` - Lista usuários de um retiro
- `criar(dados)` - Cria novo usuário com validações
- `atualizar(id, dados)` - Atualiza dados do usuário
- `remover(id)` - Remove usuário
- `listarTodos()` - Lista todos os usuários
- `podeValidar(usuario)` - Verifica se usuario pode validar
- `temPermissao(usuario, cargo)` - Verifica cargo
- `estaAtivo(usuario)` - Verifica se está ativo

### 2. **tarefa.service.ts**
- `validarCamposObrigatorios(dados)` - Valida campos obrigatórios
- `criar(dados, usuarioCriador)` - Cria tarefa com validações
- `buscarParaDashboard(retiroId?)` - Busca tarefas aprovadas
- `listarPorStatus(status, retiroId?)` - Filtra por status
- `listarPorUsuario(usuarioId)` - Busca tarefas do usuário
- `listarPorPrioridade(prioridade, retiroId?)` - Filtra por prioridade
- `listarPorCategoria(categoria, retiroId?)` - Filtra por categoria
- `buscarPorId(id)` - Busca tarefa por ID
- `atualizar(id, dados)` - Atualiza tarefa
- `atualizarStatus(id, novoStatus)` - Atualiza status
- `remover(id)` - Remove tarefa
- `listarTodas()` - Lista todas as tarefas

### 3. **ticket.service.ts**
- `validarCamposObrigatorios(dados)` - Valida campos obrigatórios
- `criar(dados, usuarioAbridorTicket)` - Cria ticket com validações
- `alterarPrioridade(id, novaPrioridade)` - Altera prioridade
- `atribuirA(id, usuarioId)` - Atribui a usuário
- `listarPorStatus(status, retiroId?)` - Filtra por status
- `listarPorPrioridade(prioridade, retiroId?)` - Filtra por prioridade
- `listarPorCategoria(categoria, retiroId?)` - Filtra por categoria
- `listarPendentes(retiroId?)` - Lista tickets pendentes
- `contarPorPrioridade(retiroId?)` - Conta por prioridade
- `contarPorStatus(retiroId?)` - Conta por status
- `contarPorTipo(retiroId?)` - Conta por tipo
- `buscarParaDashboard(retiroId?)` - Busca para dashboard
- `buscarTicketsParaDashboard(retiroId?)` - Busca tickets do dashboard
- `buscarPorId(id)` - Busca ticket por ID
- `atualizar(id, dados)` - Atualiza ticket
- `listarTodos()` - Lista todos os tickets

### 4. **movimentacao.service.ts**
- `validarCamposObrigatorios(dados)` - Valida campos
- `validarOrigem(origem)` - Valida origem
- `validarDestino(destino)` - Valida destino
- `validarQuantidade(quantidade)` - Valida quantidade
- `criar(dados)` - Cria movimentação
- `sincronizarRecebida(dados)` - Sincroniza recebida
- `filtrar(retiroId, tipos, status, dataInicio, dataFim)` - Filtra movimentações
- `buscarParaDashboard(retiroId?)` - Busca para dashboard
- `buscarMovimentacoesParaRelatrio(retiroId?)` - Busca para relatório
- `listarPendentes(retiroId?)` - Lista pendentes
- `buscarPorId(id)` - Busca por ID
- `atualizar(id, dados)` - Atualiza
- `listarTodas()` - Lista todas

### 5. **evidencia.service.ts**
- `validarGeorreferenciamento(latitude, longitude)` - Valida coordenadas
- `validarEvidenciaDescritiva(tipo, dados)` - Valida evidência
- `criarFoto(usuarioId, urlArquivo, latitude, longitude)` - Cria foto
- `criarAudio(usuarioId, urlArquivo)` - Cria áudio
- `criarMensagem(usuarioId, conteudo)` - Cria mensagem
- `buscarPorId(id)` - Busca por ID
- `listarTodas()` - Lista todas

### 6. **relatorio.service.ts**
- `buscarDadosMovimentacoes(dataInicio?, dataFim?, retiroId?)` - Busca dados de movimentações
- `buscarDadosTarefas(dataInicio?, dataFim?, retiroId?)` - Busca dados de tarefas
- `formatarRelatorioMovimentacoes(dados)` - Formata relatório
- `gerarRelatorioSemanal(retiroId?)` - Gera relatório semanal
- `gerarRelatorioMensal(retiroId?)` - Gera relatório mensal

### 7. **sincronizacao.service.ts**
- `detectarConexao()` - Detecta conexão de rede
- `sincronizar()` - Sincroniza dados
- `buscarMovimentacoesParaRelatrio(retiroId?)` - Busca movimentações
- `buscarTarefasParaRelatrio(retiroId?)` - Busca tarefas
- `buscarTicketsParaDashboard(retiroId?)` - Busca tickets
- `enviarMovimentacao(movimentacao)` - Envia movimentação
- `enviarTarefa(tarefa)` - Envia tarefa
- `enviarTicket(ticket)` - Envia ticket
- `obterStatusSincronizacao()` - Obtém status
- `obterMensagemSincronizacao()` - Obtém mensagem

### 8. **validacao.service.ts**
- `podeValidar(usuario)` - Verifica permissão
- `validarMovimentacao(movimentacaoId, supervisor)` - Valida movimentação
- `aprovarTicket(ticketId, supervisor)` - Aprova ticket
- `aprovarTarefa(tarefaId, supervisor)` - Aprova tarefa

---

## 💾 REPOSITORIES (13 arquivos)

Camada de acesso a dados. CRUD básico com transações.

### 1. **usuario.repository.ts**
- `findAll()` - Retorna todos os usuários
- `findById(id)` - Busca por ID
- `findByLogin(login)` - Busca por login
- `create(input)` - Cria novo usuário
- `update(id, input)` - Atualiza usuário
- `delete(id)` - Remove usuário

### 2. **tarefa.repository.ts**
- `findAll()` - Todas as tarefas
- `findById(id)` - Busca por ID
- `create(input)` - Cria tarefa
- `update(id, input)` - Atualiza tarefa
- `delete(id)` - Remove tarefa

### 3. **ticket.repository.ts**
- `findAll()` - Todos os tickets
- `findById(id)` - Busca por ID
- `create(input)` - Cria ticket
- `update(id, input)` - Atualiza ticket
- `delete(id)` - Remove ticket

### 4. **movimentacao.repository.ts**
- `findAll()` - Todas as movimentações
- `findById(id)` - Busca por ID
- `create(input)` - Cria movimentação
- `update(id, input)` - Atualiza movimentação
- `delete(id)` - Remove movimentação
- `createDetalhes(transaction, movimentacaoId, input)` - Cria detalhes (tipo específico)
- `replaceDetalhes(transaction, movimentacaoId, input)` - Substitui detalhes
- `deleteDetalhes(transaction, movimentacaoId)` - Remove detalhes
- `deveAtualizarDetalhes(input)` - Verifica se deve atualizar

### 5. **evidencia.repository.ts**
- `findAll()` - Todas as evidências
- `findById(id)` - Busca por ID
- `create(input)` - Cria evidência
- `update(id, input)` - Atualiza evidência
- `delete(id)` - Remove evidência

### 6-8. **evidencia-audio.repository.ts** / **evidencia-foto.repository.ts** / **evidencia-mensagem.repository.ts**
- `findAll()` - Lista todas
- `findById(evidencia_id)` - Busca por ID
- `create(input)` - Cria
- `update(evidencia_id, input)` - Atualiza
- `delete(evidencia_id)` - Remove

### 9-11. **evidencia-movimentacao.repository.ts** / **evidencia-tarefa.repository.ts** / **evidencia-ticket.repository.ts**
- `findAll()` - Lista todas
- `findById(evidencia_id, [movimentacao_id|tarefa_id|ticket_id])` - Busca por IDs
- `create(input)` - Cria

### 12. **retiro.repository.ts**
- `findAll()` - Todos os retiros
- `findById(id)` - Busca por ID
- `create(input)` - Cria retiro
- `update(id, input)` - Atualiza retiro

### 13. **relatorio.repository.ts**
- `findAll()` - Todos os relatórios
- `findById(id)` - Busca por ID
- `create(input)` - Cria relatório
- `update(id, input)` - Atualiza relatório

---

## 📦 MODELS (14 arquivos)

Type definitions e interfaces para dados.

### Usuário
```typescript
type UsuarioStatus = 'ativo' | 'inativo'
type UsuarioCargo = 'capataz' | 'supervisor' | 'gerente'
interface Usuario { id, nome, login, senha_hash, status, cargo, retiro_id }
interface UsuarioInput { ... }
```

### Tarefa
```typescript
type TarefaPrioridade = 'alta' | 'media' | 'baixa'
type TarefaStatus = 'pendente' | 'aprovado'
interface Tarefa { id, retiro_id, atribuida_a, prioridade, categoria, descricao, ... }
interface TarefaInput { ... }
```

### Ticket
```typescript
type TicketCategoria = 'cerca' | 'hidraulica' | 'eletrica' | 'edificacao' | 'abastecimento_agua' | 'outro'
type TicketStatus = 'pendente' | 'aprovado'
type TicketPrioridade = 'alta' | 'media' | 'baixa'
interface Ticket { id, retiro_id, categoria, localizacao, descricao, prioridade, ... }
interface TicketInput { ... }
```

### Movimentação
```typescript
type MovimentacaoTipo = 'nascimento' | 'morte' | 'transferencia' | 'compra' | 'venda' | 'outros'
type MovimentacaoStatus = 'pendente' | 'validado'
type RetiroNome = 'Acurizal' | 'Aroeira' | ... (15 retiros)
type EstagioVida = 'BEZERRO 0 A 7 MESES' | ... (11 estágios)
interface Movimentacao { id, retiro_id, capataz_id, tipo, estagio_vida, ... }
interface MovimentacaoInput { ... }
```

### Evidência
```typescript
type TipoEvidencia = 'foto' | 'audio' | 'mensagem'
interface Evidencia { id, usuario_id, tipo, data_criacao }
interface EvidenciaInput { ... }
```

### Outras Entidades
- **Retiro**: `{ id, nome }`
- **Relatorio**: `{ id, tipo, conteudo, data_criacao }`
- **EvidenciaAudio**: `{ evidencia_id, url_arquivo }`
- **EvidenciaFoto**: `{ evidencia_id, url_arquivo, latitude, longitude }`
- **EvidenciaMensagem**: `{ evidencia_id, conteudo }`
- **EvidenciaMovimentacao**: `{ evidencia_id, movimentacao_id }`
- **EvidenciaTarefa**: `{ evidencia_id, tarefa_id }`
- **EvidenciaTicket**: `{ evidencia_id, ticket_id }`

---

## 🔀 Fluxo de Dados

```
Cliente (HTTP Request)
    ↓
Controllers
    ├─ Validam parametros
    ├─ Extraem dados de req/res
    └─ Chamam Services
    
Services
    ├─ Aplicam lógica de negócio
    ├─ Validam regras
    └─ Chamam Repositories
    
Repositories
    ├─ Executam queries SQL
    ├─ Gerenciam transações
    └─ Retornam dados
    
Banco de Dados
    └─ Persiste dados
```

---

## 📊 Contagem de Funções

| Camada | Arquivos | Funções |
|--------|----------|---------|
| Controllers | 8 | ~65 |
| Services | 8 | ~90 |
| Repositories | 13 | ~60 |
| **Total** | **29** | **~215** |

---

## 🎯 Principais Entidades

1. **Usuário** - Gerenciamento de acesso (capataz, supervisor, gerente)
2. **Tarefa** - Tarefas do retiro com prioridades
3. **Ticket** - Solicitações de manutenção/infraestrutura
4. **Movimentação** - Rastreamento de animais (nascimento, morte, transferência, compra, venda)
5. **Evidência** - Fotos, áudios, mensagens associadas a tarefas/tickets/movimentações
6. **Relatório** - Consolidação de dados para análise
7. **Retiro** - Localidades/fazendas onde ocorrem as operações

---

## 🔐 Padrões de Segurança Identificados

- ✅ Validação de campos obrigatórios em Services
- ✅ Verificação de permissões por cargo (capataz, supervisor, gerente)
- ✅ Validação de georreferenciamento
- ✅ Transações para operações críticas
- ✅ Validação de estados (pendente → aprovado)

---

## 📝 Notas Importantes

1. **Não há Views** - Este é um backend puro (API REST)
2. **Padrão BRPEC** - Bem implementado com separação clara de responsabilidades
3. **Tratamento de Detalhes** - MovimentacaoRepository gerencia tipos específicos em tabelas separadas
4. **Sincronização** - Sistema preparado para trabalho offline com sincronização posterior
5. **Filtros Complexos** - Services implementam filtros multi-critério
6. **Validações em Cascata** - Controllers → Services → Repositories

