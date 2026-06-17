/* Contadores de pendências compartilhados entre as telas de lista do
   supervisor (Tarefas, Tickets, Movimentações) e a home.
   Cada lista grava aqui o seu total de pendentes sempre que valida um item;
   a home lê para manter os blocos de "Acesso rápido" em sincronia com o
   contador ("retângulo") que cada página mostra ao lado da busca.
   Demo: vale no mesmo navegador. */
(function (global) {
  var CHAVE = 'alow:contadoresPendentes';

  function ler() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || '{}'); }
    catch (e) { return {}; }
  }
  function gravar(obj) {
    try { localStorage.setItem(CHAVE, JSON.stringify(obj)); } catch (e) {}
  }

  global.ContadoresPendentes = {
    // Lê o total salvo de uma categoria; cai no `padrao` se ainda não houver.
    obter: function (chave, padrao) {
      var v = ler()[chave];
      return (typeof v === 'number') ? v : padrao;
    },
    // Grava o total de uma categoria.
    definir: function (chave, n) {
      var m = ler();
      m[chave] = n;
      gravar(m);
    },
    // Grava o total do layout que está visível (mobile ou desktop), já que
    // cada layout mantém a sua própria lista/contador.
    definirDoLayout: function (chave, nMobile, nDesktop) {
      var mob = document.querySelector('.layout-mobile');
      var visivelMobile = mob && getComputedStyle(mob).display !== 'none';
      this.definir(chave, visivelMobile ? nMobile : nDesktop);
    }
  };
})(window);
