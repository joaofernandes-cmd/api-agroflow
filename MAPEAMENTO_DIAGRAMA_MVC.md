# 🗺️ Mapeamento Direto para Diagrama MVC

## 📋 Tabela de Mapeamento por Módulo

---

## 👤 **MÓDULO: USUÁRIO**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | UsuarioController | autenticar() • listarTodos() • buscarPorId() • listarPorRetiro() • criar() • atualizar() • remover() |
| **Service** | UsuarioService | autenticar() • buscarPorId() • listarPorRetiro() • criar() • atualizar() • remover() • listarTodos() • podeValidar() • temPermissao() • estaAtivo() |
| **Repository** | UsuarioRepository | findAll() • findById() • findByLogin() • create() • update() • delete() |
| **Model** | Usuario | UsuarioStatus • UsuarioCargo • interface Usuario • interface UsuarioInput |

---

## 📝 **MÓDULO: TAREFA**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | TarefaController | criar() • listarTodas() • buscarPorId() • buscarParaDashboard() • listarPorStatus() • listarPorUsuario() • listarPorPrioridade() • listarPorCategoria() • atualizarStatus() |
| **Service** | TarefaService | validarCamposObrigatorios() • criar() • buscarParaDashboard() • listarPorStatus() • listarPorUsuario() • listarPorPrioridade() • listarPorCategoria() • buscarPorId() • atualizar() • atualizarStatus() • remover() • listarTodas() |
| **Repository** | TarefaRepository | findAll() • findById() • create() • update() • delete() |
| **Model** | Tarefa | TarefaPrioridade • TarefaStatus • interface Tarefa • interface TarefaInput |

---

## 🎟️ **MÓDULO: TICKET**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | TicketController | listarTodos() • buscarPorId() • criar() • listarPorStatus() • listarPorPrioridade() • listarPorCategoria() • listarPendentes() • contarPorPrioridade() • contarPorStatus() • contarPorTipo() • alterarPrioridade() • atribuirA() • aprovarTicket() |
| **Service** | TicketService | validarCamposObrigatorios() • criar() • alterarPrioridade() • atribuirA() • listarPorStatus() • listarPorPrioridade() • listarPorCategoria() • listarPendentes() • contarPorPrioridade() • contarPorStatus() • contarPorTipo() • buscarParaDashboard() • buscarTicketsParaDashboard() • buscarPorId() • atualizar() • listarTodos() |
| **Repository** | TicketRepository | findAll() • findById() • create() • update() • delete() |
| **Model** | Ticket | TicketCategoria • TicketStatus • TicketPrioridade • interface Ticket • interface TicketInput |

---

## 🔄 **MÓDULO: MOVIMENTAÇÃO**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | MovimentacaoController | criar() • sincronizarRecebida() • listarTodas() • buscarPorId() • filtrar() |
| **Service** | MovimentacaoService | validarCamposObrigatorios() • validarOrigem() • validarDestino() • validarQuantidade() • criar() • sincronizarRecebida() • filtrar() • buscarParaDashboard() • buscarMovimentacoesParaRelatrio() • listarPendentes() • buscarPorId() • atualizar() • listarTodas() |
| **Repository** | MovimentacaoRepository | findAll() • findById() • create() • update() • delete() • createDetalhes() • replaceDetalhes() • deleteDetalhes() • deveAtualizarDetalhes() |
| **Model** | Movimentacao | MovimentacaoTipo • MovimentacaoStatus • RetiroNome • EstagioVida • interface Movimentacao • interface MovimentacaoInput |

---

## 📸 **MÓDULO: EVIDÊNCIA**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | EvidenciaController | listar() • buscarPorId() • criarMensagem() • criarAudio() • criarFoto() |
| **Service** | EvidenciaService | validarGeorreferenciamento() • validarEvidenciaDescritiva() • criarFoto() • criarAudio() • criarMensagem() • buscarPorId() • listarTodas() |
| **Repository** | EvidenciaRepository | findAll() • findById() • create() • update() • delete() |
| | EvidenciaAudioRepository | findAll() • findById() • create() • update() • delete() |
| | EvidenciaFotoRepository | findAll() • findById() • create() • update() • delete() |
| | EvidenciaMensagemRepository | findAll() • findById() • create() • update() • delete() |
| | EvidenciaMovimentacaoRepository | findAll() • findById() • create() |
| | EvidenciaTarefaRepository | findAll() • findById() • create() |
| | EvidenciaTicketRepository | findAll() • findById() • create() |
| **Model** | Evidencia | TipoEvidencia • interface Evidencia • interface EvidenciaInput |
| | EvidenciaAudio | interface EvidenciaAudio • interface EvidenciaAudioInput |
| | EvidenciaFoto | interface EvidenciaFoto • interface EvidenciaFotoInput |
| | EvidenciaMensagem | interface EvidenciaMensagem • interface EvidenciaMensagemInput |
| | EvidenciaMovimentacao | interface EvidenciaMovimentacao • interface EvidenciaMovimentacaoInput |
| | EvidenciaTarefa | interface EvidenciaTarefa • interface EvidenciaTarefaInput |
| | EvidenciaTicket | interface EvidenciaTicket • interface EvidenciaTicketInput |

---

## 📊 **MÓDULO: RELATÓRIO**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | RelatorioController | buscarDadosMovimentacoes() • buscarDadosTarefas() • formatarRelatorioMovimentacoes() • gerarRelatorioSemanal() • gerarRelatorioMensal() |
| **Service** | RelatorioService | buscarDadosMovimentacoes() • buscarDadosTarefas() • formatarRelatorioMovimentacoes() • gerarRelatorioSemanal() • gerarRelatorioMensal() |
| **Repository** | RelatorioRepository | findAll() • findById() • create() • update() |
| **Model** | Relatorio | TipoRelatorio • interface Relatorio • interface RelatorioInput |

---

## 🔄 **MÓDULO: SINCRONIZAÇÃO**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | SincronizacaoController | detectarConexao() • sincronizar() • buscarMovimentacoesParaRelatrio() • buscarTarefasParaRelatrio() • buscarTicketsParaDashboard() • obterStatusSincronizacao() • obterMensagemSincronizacao() |
| **Service** | SincronizacaoService | detectarConexao() • sincronizar() • buscarMovimentacoesParaRelatrio() • buscarTarefasParaRelatrio() • buscarTicketsParaDashboard() • enviarMovimentacao() • enviarTarefa() • enviarTicket() • obterStatusSincronizacao() • obterMensagemSincronizacao() |

---

## ✅ **MÓDULO: VALIDAÇÃO**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Controller** | ValidacaoController | podeValidar() • validarMovimentacao() • aprovarTicket() • aprovarTarefa() |
| **Service** | ValidacaoService | podeValidar() • validarMovimentacao() • aprovarTicket() • aprovarTarefa() |

---

## 🏞️ **MÓDULO: RETIRO**

| Camada | Classe | Funções |
|--------|--------|---------|
| **Repository** | RetiroRepository | findAll() • findById() • create() • update() |
| **Model** | Retiro | interface Retiro • interface RetiroInput |

---

## 📈 Resumo Geral

### Controllers (8)
- UsuarioController
- TarefaController
- TicketController
- MovimentacaoController
- EvidenciaController
- RelatorioController
- SincronizacaoController
- ValidacaoController

### Services (8)
- UsuarioService
- TarefaService
- TicketService
- MovimentacaoService
- EvidenciaService
- RelatorioService
- SincronizacaoService
- ValidacaoService

### Repositories (13)
1. UsuarioRepository
2. TarefaRepository
3. TicketRepository
4. MovimentacaoRepository
5. EvidenciaRepository
6. EvidenciaAudioRepository
7. EvidenciaFotoRepository
8. EvidenciaMensagemRepository
9. EvidenciaMovimentacaoRepository
10. EvidenciaTarefaRepository
11. EvidenciaTicketRepository
12. RelatorioRepository
13. RetiroRepository

### Models (14)
- Usuario, UsuarioStatus, UsuarioCargo
- Tarefa, TarefaPrioridade, TarefaStatus
- Ticket, TicketCategoria, TicketStatus, TicketPrioridade
- Movimentacao, MovimentacaoTipo, MovimentacaoStatus, RetiroNome, EstagioVida
- Evidencia, TipoEvidencia, EvidenciaAudio, EvidenciaFoto, EvidenciaMensagem
- EvidenciaMovimentacao, EvidenciaTarefa, EvidenciaTicket
- Relatorio, TipoRelatorio
- Retiro
- UUID

---

## 🎯 Fluxo de Exemplo: Criar Tarefa

```
POST /tarefas
    ↓
TarefaController.criar(req, res)
    ↓
TarefaService.criar(dados, usuarioCriador)
    ├─ validarCamposObrigatorios(dados)
    ├─ verificar permissão (supervisor)
    └─ TarefaRepository.create(input)
        └─ INSERT INTO tarefas ...
    ↓
Response: { id, retiro_id, atribuida_a, ... }
```

---

## 🎯 Fluxo de Exemplo: Criar Movimentação com Evidência

```
POST /movimentacoes
    ↓
MovimentacaoController.criar(req, res)
    ↓
MovimentacaoService.criar(dados)
    ├─ validarCamposObrigatorios(dados)
    ├─ validarOrigem(), validarDestino(), validarQuantidade()
    └─ MovimentacaoRepository.create(input)
        ├─ INSERT INTO movimentacoes ...
        └─ MovimentacaoRepository.createDetalhes()
            └─ INSERT INTO [compras|vendas|transferencias|...] ...
    ↓
POST /evidencias/foto (opcional)
    ↓
EvidenciaController.criarFoto(req, res)
    ↓
EvidenciaService.criarFoto(usuarioId, url, lat, lng)
    ├─ validarGeorreferenciamento(lat, lng)
    └─ EvidenciaRepository.create(input)
        ├─ INSERT INTO evidencias ...
        └─ EvidenciaFotoRepository.create(input)
            └─ INSERT INTO evidencia_fotos ...
    ↓
Response: { evidencia: {...}, foto: {...} }
```

