/* ============================================================
   DEMO — tarefas concluídas de exemplo
   Popula o TarefasStore para visualizar a lista "Concluídas pelo
   capataz" (varas/acordeão) sem passar pelo fluxo do capataz.
   Idempotente: usa ids fixos (demo-*), então recarregar não duplica
   e não mexe nas tarefas concluídas de verdade.
   >> Remover este arquivo e seu <script> em produção. <<
   ============================================================ */
(function () {
  if (!window.TarefasStore) return;

  var demos = [
    {
      id: 'demo-1',
      titulo: 'Movimentação de gado',
      retiro: 'Bodoquena',
      supervisor: 'Luiz',
      prioridade: 'alta',
      descricao:
        'Mover o lote do pasto 3 para o curral de manejo e registrar a origem e o destino.',
      dataConclusao: '16/06/2026 15:48',
      evidencias: [
        { tipo: 'foto' },
      ],
    },
    {
      id: 'demo-2',
      titulo: 'Inspeção sanitária',
      retiro: 'Puga',
      supervisor: 'Luiz',
      prioridade: 'baixa',
      descricao:
        'Inspecionar a saúde dos animais e registrar sinais de doença. Avisar o supervisor se encontrar algo.',
      dataConclusao: '16/06/2026 11:05',
      evidencias: [
        { tipo: 'audio' },
      ],
    },
  ];

  // Reseta a lista de concluídas para mostrar SOMENTE os exemplos abaixo
  // (remove resquícios antigos no localStorage). Como é demo, a lista de
  // "Concluídas pelo capataz" passa a ser definida só por este arquivo.
  try { localStorage.removeItem('alow:tarefasConcluidas'); } catch (e) {}

  demos.forEach(function (d) {
    TarefasStore.concluir(d.id, d);
  });
})();
