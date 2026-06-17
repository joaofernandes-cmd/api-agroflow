/* Persistência (no navegador) das tarefas recém-delegadas pelo supervisor.
   Usada SÓ no modo demo (sem login): a tela de Delegar grava aqui e a tela de
   Tarefas lê para mostrar a nova tarefa em "Não realizadas" na hora. Com login,
   a delegação vai para o backend (POST /tarefas) e esta camada não é usada.
   Demo: vale no mesmo navegador. */
(function (global) {
  var CHAVE = 'alow:tarefasDelegadas';

  function ler() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || '[]'); }
    catch (e) { return []; }
  }
  function gravar(lista) {
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); return true; }
    catch (e) { return false; }
  }

  function agoraFormatado() {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  var DelegadasStore = {
    // Lista as delegadas guardadas, mais recente primeiro.
    listar: function () {
      return ler().slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    },
    // Guarda uma tarefa recém-delegada (status "não realizada").
    adicionar: function (dados) {
      var lista = ler();
      var ts = Date.now();
      lista.push(Object.assign({
        titulo: 'Tarefa',
        retiro: '',
        capataz: '',
        prioridade: '',
        descricao: '',
        dataDelegacao: agoraFormatado(),
      }, dados, { id: 'del-' + ts, ts: ts }));
      return gravar(lista);
    },
  };

  global.DelegadasStore = DelegadasStore;
})(window);
