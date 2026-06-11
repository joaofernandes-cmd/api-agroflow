# Alow / BrPec — App do Capataz

Projeto front-end (React + Vite) do perfil **Capataz**, com 7 telas fiéis aos
protótipos de alta fidelidade e alinhado ao Guia de Estilos BrPec.

## Como rodar

```bash
npm install
npm run dev
```

Depois abra o endereço que aparecer no terminal (geralmente
http://localhost:5173). O app abre direto na tela de confirmação de perfil.

Outros comandos:

```bash
npm run build     # gera a versão de produção em dist/
npm run preview   # serve a versão de produção localmente
```

## Estrutura

```
capataz-app/
├── index.html              Ponto de entrada do Vite
├── package.json            Dependências e scripts
├── vite.config.js          Configuração do Vite
└── src/
    ├── main.jsx            Monta o React na página
    ├── CapatazApp.jsx      Todo o app (humanizado e comentado)
    └── assets/
        └── alow-logo.png   Logo Alow (fundo transparente)
```

## Telas

1. Confirmação de perfil (Daniel Carvalho)
2. Início (Home)
3. Nova Movimentação
4. Movimentação de Morte (campo "Causa do óbito" obrigatório, com validação)
5. Abrir Chamado / Ticket de Infraestrutura
6. Minhas Tarefas
7. Detalhe da Tarefa

## Funcionalidades

- Navegação em pilha: o botão de voltar leva sempre à tela anterior real.
- Dropdowns com lista de seleção: Tipo de movimentação, Estágio da vida,
  Causa do óbito, Retiro (os 15 retiros da fazenda), Categoria e Prioridade.
- Validação visual do campo obrigatório na movimentação de Morte.
- "Marcar como concluída" atualiza o status no detalhe da tarefa.

## Notas

- O código de `CapatazApp.jsx` está em português, com comentários por seção
  e nomes de variáveis descritivos, para facilitar a manutenção.
- As cores ficam centralizadas no objeto `cores` (tokens do Guia de Estilos).
- As listas de opções (retiros, categorias, etc.) ficam no topo do arquivo,
  prontas para serem trocadas por dados vindos do back-end.
- A fonte Poppins é carregada via Google Fonts dentro do componente.
