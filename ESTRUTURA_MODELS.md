# 📦 Estrutura Completa dos Models

**Documento detalhado de todas as entidades (Models) do projeto**

---

## 1. USUÁRIO MODEL

```
arquivo: usuario.model.ts
```

### Types
```
✓ UsuarioStatus = 'ativo' | 'inativo'
✓ UsuarioCargo = 'capataz' | 'supervisor' | 'gerente'
```

### Interface: Usuario
```
✓ id: UUID
✓ retiro_id: number
✓ nome: string
✓ login: string (email)
✓ senha_hash: string
✓ status: UsuarioStatus
✓ data_criacao: Date
✓ cargo: UsuarioCargo
```

### Interface: UsuarioInput
```
✓ retiro_id: number
✓ nome: string
✓ login: string
✓ senha_hash: string
✓ status: UsuarioStatus
✓ cargo: UsuarioCargo
```

---

## 2. TAREFA MODEL

```
arquivo: tarefa.model.ts
```

### Types
```
✓ TarefaPrioridade = 'alta' | 'media' | 'baixa'
✓ TarefaStatus = 'pendente' | 'aprovado'
```

### Interface: Tarefa
```
✓ id: number
✓ retiro_id: number
✓ criada_por: UUID
✓ atribuida_a: UUID
✓ descricao: string
✓ categoria: string
✓ prioridade: TarefaPrioridade
✓ data_criacao: Date
✓ status: TarefaStatus
✓ aprovado_por: UUID | null
✓ sincronizado: boolean
```

### Interface: TarefaInput
```
✓ retiro_id: number
✓ criada_por: UUID
✓ atribuida_a: UUID
✓ descricao: string
✓ categoria: string
✓ prioridade: TarefaPrioridade
✓ data_criacao?: Date (opcional)
✓ status: TarefaStatus
✓ aprovado_por?: UUID | null (opcional)
✓ sincronizado?: boolean (opcional)
```

---

## 3. TICKET MODEL

```
arquivo: ticket.model.ts
```

### Types
```
✓ TicketCategoria = 'cerca' | 'hidraulica' | 'eletrica' | 'edificacao' | 'abastecimento_agua' | 'outro'
✓ TicketStatus = 'pendente' | 'aprovado'
✓ TicketPrioridade = 'alta' | 'media' | 'baixa'
```

### Interface: Ticket
```
✓ id: number
✓ retiro_id: number
✓ aberto_por: UUID
✓ categoria: TicketCategoria
✓ localizacao: string
✓ status: TicketStatus
✓ atribuido_a: UUID | null
✓ aprovado_por: UUID | null
✓ descricao: string
✓ prioridade: TicketPrioridade
✓ data_criacao: Date
✓ data_realizado: Date
✓ sincronizado: boolean
```

### Interface: TicketInput
```
✓ retiro_id: number
✓ aberto_por: UUID
✓ categoria: TicketCategoria
✓ localizacao: string
✓ status: TicketStatus
✓ atribuido_a: UUID | null
✓ aprovado_por?: UUID | null (opcional)
✓ descricao: string
✓ prioridade: TicketPrioridade
✓ data_criacao?: Date (opcional)
✓ data_realizado?: Date (opcional)
✓ sincronizado?: boolean (opcional)
```

---

## 4. MOVIMENTAÇÃO MODEL

```
arquivo: movimentacao.model.ts
```

### Types
```
✓ MovimentacaoTipo = 'nascimento' | 'morte' | 'transferencia' | 'compra' | 'venda' | 'outros'
✓ MovimentacaoStatus = 'pendente' | 'validado'
✓ RetiroNome = 'Acurizal' | 'Aroeira' | 'Baia Bonita' | 'Bodoquena 1' | 'Bonoquena 2' | 'Boqueirão' | 'Caieira' | 'CMB' | 'Confinamento' | 'Cristo' | 'Morada Nova' | 'Morro Azul' | 'Puga' | 'São Miguel' | 'Vista Alegre'
✓ EstagioVida = 
  'BEZERRO 0 A 7 MESES' |
  'GARROTE 8 A 12 MESES' |
  'NOVILHA 8 A 12 MESES' |
  'GARROTE 13 A 24 MESES' |
  'NOVILHA 13 A 24 MESES' |
  'BOI 25 A 36 MESES' |
  'NOVILHA 25 A 36 MESES' |
  'TOURO 25 A 36 MESES' |
  'VACA ACIMA 36 MESES' |
  'BOI ACIMA 36 MESES' |
  'TOURO ACIMA 36 MESES'
```

### Interface: Movimentacao
```
✓ id: number
✓ retiro_id: number
✓ capataz_id: UUID
✓ validado_por: UUID | null
✓ tipo: MovimentacaoTipo
✓ origem: RetiroNome | null
✓ destino: RetiroNome | null
✓ quantidade: number | null
✓ status: MovimentacaoStatus
✓ sincronizado: boolean
✓ data_criacao: Date
✓ data_validacao: Date | null
✓ causa_obito: string | null (para tipo 'morte')
✓ estagio_vida: EstagioVida
```

### Interface: MovimentacaoInput
```
✓ retiro_id: number
✓ capataz_id: UUID
✓ validado_por: UUID | null
✓ tipo: MovimentacaoTipo
✓ origem?: RetiroNome | null (opcional)
✓ destino?: RetiroNome | null (opcional)
✓ quantidade?: number | null (opcional)
✓ status: MovimentacaoStatus
✓ sincronizado?: boolean (opcional)
✓ data_criacao?: Date (opcional)
✓ data_validacao?: Date | null (opcional)
✓ causa_obito?: string | null (opcional)
✓ estagio_vida: EstagioVida
```

---

## 5. EVIDÊNCIA MODEL

```
arquivo: evidencia.model.ts
```

### Types
```
✓ TipoEvidencia = 'foto' | 'audio' | 'mensagem'
```

### Interface: Evidencia
```
✓ id: number
✓ usuario_id: UUID
✓ tipo: TipoEvidencia
✓ data_criacao: Date
```

### Interface: EvidenciaInput
```
✓ usuario_id: UUID
✓ tipo: TipoEvidencia
✓ data_criacao?: Date (opcional)
```

---

## 6. EVIDÊNCIA FOTO MODEL

```
arquivo: evidencia-foto.model.ts
```

### Interface: EvidenciaFoto
```
✓ evidencia_id: number
✓ url_arquivo: string
✓ latitude: number
✓ longitude: number
```

### Interface: EvidenciaFotoInput
```
✓ evidencia_id: number
✓ url_arquivo: string
✓ latitude: number
✓ longitude: number
```

---

## 7. EVIDÊNCIA AUDIO MODEL

```
arquivo: evidencia-audio.model.ts
```

### Interface: EvidenciaAudio
```
✓ evidencia_id: number
✓ url_arquivo: string
```

### Interface: EvidenciaAudioInput
```
✓ evidencia_id: number
✓ url_arquivo: string
```

---

## 8. EVIDÊNCIA MENSAGEM MODEL

```
arquivo: evidencia-mensagem.model.ts
```

### Interface: EvidenciaMensagem
```
✓ evidencia_id: number
✓ conteudo: string
```

### Interface: EvidenciaMensagemInput
```
✓ evidencia_id: number
✓ conteudo: string
```

---

## 9. EVIDÊNCIA MOVIMENTAÇÃO MODEL

```
arquivo: evidencia-movimentacao.model.ts
```

### Interface: EvidenciaMovimentacao
```
✓ evidencia_id: number
✓ movimentacao_id: number
```

### Interface: EvidenciaMovimentacaoInput
```
✓ evidencia_id: number
✓ movimentacao_id: number
```

**Função:** Link entre evidências e movimentações

---

## 10. EVIDÊNCIA TAREFA MODEL

```
arquivo: evidencia-tarefa.model.ts
```

### Interface: EvidenciaTarefa
```
✓ evidencia_id: number
✓ tarefa_id: number
```

### Interface: EvidenciaTarefaInput
```
✓ evidencia_id: number
✓ tarefa_id: number
```

**Função:** Link entre evidências e tarefas

---

## 11. EVIDÊNCIA TICKET MODEL

```
arquivo: evidencia-ticket.model.ts
```

### Interface: EvidenciaTicket
```
✓ evidencia_id: number
✓ ticket_id: number
```

### Interface: EvidenciaTicketInput
```
✓ evidencia_id: number
✓ ticket_id: number
```

**Função:** Link entre evidências e tickets

---

## 12. RELATÓRIO MODEL

```
arquivo: relatorio.model.ts
```

### Types
```
✓ TipoRelatorio = 'movimentacao' | 'tarefas' | 'tickets' | 'consolidado'
```

### Interface: Relatorio
```
✓ id: number
✓ gerado_por: UUID
✓ retiro_id: number
✓ tipo: TipoRelatorio
✓ data_inicio: Date
✓ data_fim: Date
✓ data_gerado: Date
✓ url_arquivo: string
```

### Interface: RelatorioInput
```
✓ gerado_por: UUID
✓ retiro_id: number
✓ tipo: TipoRelatorio
✓ data_inicio: Date
✓ data_fim: Date
✓ data_gerado?: Date (opcional)
✓ url_arquivo: string
```

---

## 13. RETIRO MODEL

```
arquivo: retiro.model.ts
```

### Interface: Retiro
```
✓ id: number
✓ nome: string
```

### Interface: RetiroInput
```
✓ nome: string
```

**Função:** Representa um retiro (fazenda/localidade)

---

## 14. UUID TYPE

```
arquivo: uuid.ts
```

### Type
```
✓ UUID = string
```

**Função:** Alias para identificadores únicos (string format)

---

## 📊 RESUMO POR CATEGORIA

### Entidades Principais (7)
```
1. Usuario
   ├─ Tipos: UsuarioStatus, UsuarioCargo
   └─ Campos: 8

2. Tarefa
   ├─ Tipos: TarefaPrioridade, TarefaStatus
   └─ Campos: 11

3. Ticket
   ├─ Tipos: TicketCategoria, TicketStatus, TicketPrioridade
   └─ Campos: 12

4. Movimentacao
   ├─ Tipos: MovimentacaoTipo, MovimentacaoStatus, RetiroNome, EstagioVida
   └─ Campos: 13

5. Evidencia
   ├─ Tipos: TipoEvidencia
   └─ Campos: 4

6. Relatorio
   ├─ Tipos: TipoRelatorio
   └─ Campos: 8

7. Retiro
   ├─ Tipos: -
   └─ Campos: 2
```

### Entidades de Relacionamento (5)
```
1. EvidenciaFoto
   └─ Campos: 4

2. EvidenciaAudio
   └─ Campos: 2

3. EvidenciaMensagem
   └─ Campos: 2

4. EvidenciaMovimentacao
   └─ Campos: 2 (Link)

5. EvidenciaTarefa
   └─ Campos: 2 (Link)

6. EvidenciaTicket
   └─ Campos: 2 (Link)
```

### Type Definitions (1)
```
1. UUID
   └─ Tipo: string
```

---

## 🔗 RELACIONAMENTOS

```
USUÁRIO
├─ 1:N → Tarefa (criada_por, atribuida_a)
├─ 1:N → Ticket (aberto_por, atribuido_a, aprovado_por)
├─ 1:N → Movimentacao (capataz_id, validado_por)
├─ 1:N → Evidencia (usuario_id)
└─ 1:N → Relatorio (gerado_por)

TAREFA
├─ N:1 → Retiro (retiro_id)
├─ 1:N → Evidencia (via EvidenciaTarefa)
└─ Status: pendente → aprovado

TICKET
├─ N:1 → Retiro (retiro_id)
├─ 1:N → Evidencia (via EvidenciaTicket)
└─ Status: pendente → aprovado

MOVIMENTAÇÃO
├─ N:1 → Retiro (retiro_id)
├─ 1:N → Evidencia (via EvidenciaMovimentacao)
├─ Tipos: nascimento, morte, transferencia, compra, venda
└─ Status: pendente → validado

EVIDÊNCIA
├─ 1:1 → EvidenciaFoto | EvidenciaAudio | EvidenciaMensagem
├─ 0:N → Tarefas (via EvidenciaTarefa)
├─ 0:N → Tickets (via EvidenciaTicket)
└─ 0:N → Movimentacoes (via EvidenciaMovimentacao)

RETIRO
├─ 1:N → Usuarios
├─ 1:N → Tarefas
├─ 1:N → Tickets
├─ 1:N → Movimentacoes
└─ 1:N → Relatorios
```

---

## 📋 TIPOS DE DADOS

### Tipos de Status
```
UsuarioStatus:       'ativo' | 'inativo'
TarefaStatus:        'pendente' | 'aprovado'
TicketStatus:        'pendente' | 'aprovado'
MovimentacaoStatus:  'pendente' | 'validado'
TipoRelatorio:       'movimentacao' | 'tarefas' | 'tickets' | 'consolidado'
```

### Tipos de Prioridade
```
TarefaPrioridade:    'alta' | 'media' | 'baixa'
TicketPrioridade:    'alta' | 'media' | 'baixa'
```

### Tipos de Cargo
```
UsuarioCargo:        'capataz' | 'supervisor' | 'gerente'
```

### Tipos de Categoria
```
TicketCategoria:     'cerca' | 'hidraulica' | 'eletrica' | 'edificacao' | 'abastecimento_agua' | 'outro'
```

### Tipos de Movimentação
```
MovimentacaoTipo:    'nascimento' | 'morte' | 'transferencia' | 'compra' | 'venda' | 'outros'
EstagioVida:         11 opções de BEZERRO até TOURO (por faixa etária)
RetiroNome:          15 retiros disponíveis
```

### Tipo de Evidência
```
TipoEvidencia:       'foto' | 'audio' | 'mensagem'
```

---

## 🎯 PADRÕES IDENTIFICADOS

### 1. Interface + Input Pattern
```
Cada modelo tem:
├─ Interface Principal (Entidade completa com todos campos)
└─ Interface Input (Alguns campos opcionais, sem ID auto-gerado)

Exemplo:
interface Tarefa {
  id: number          ← Auto-gerado, não vem no input
  sincronizado: boolean
  ...
}

interface TarefaInput {
  // Sem id
  sincronizado?: boolean  ← Opcional no input
  ...
}
```

### 2. Tipos Enumerados
```
Valores permitidos são definidos como types:
type TarefaPrioridade = 'alta' | 'media' | 'baixa'

Vantagem:
- TypeScript valida tipos em compile time
- IDE oferece autocomplete
- Evita strings inválidas no runtime
```

### 3. IDs Diferentes
```
Algumas entidades usam:
├─ id: number        (Tarefa, Ticket, Movimentacao, Evidencia, Relatorio, Retiro)
├─ id: UUID          (Usuario)
└─ Sem id primário   (Relacionamentos: EvidenciaFoto, EvidenciaTarefa, etc)
```

### 4. Campos Null-friendly
```
Alguns campos são opcionais ou podem ser null:
├─ aprovado_por: UUID | null
├─ atribuido_a: UUID | null
└─ origem: RetiroNome | null
```

### 5. Sincronização
```
Entidades principais têm:
✓ sincronizado: boolean (para offline-first)
```

---

## 💾 TOTAIS

| Tipo | Quantidade |
|------|:----------:|
| Interfaces Principais | 7 |
| Interfaces de Tipo Específico | 7 |
| Interfaces de Relacionamento | 6 |
| Interfaces Input | 14 |
| Types Enumerados | 20+ |
| **Total Interfaces** | **34** |

---

