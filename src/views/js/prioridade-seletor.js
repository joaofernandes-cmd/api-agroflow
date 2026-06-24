/* Seletor visual de prioridade: botões coloridos (Alta/Média/Baixa/Crítica)
   no lugar do <select>. Guarda o valor escolhido num input hidden, então o
   resto do código continua lendo o valor normalmente.
   Marcação: cada .prio-seletor tem botões .prio-opcao[data-valor] e um
   <input type="hidden"> que recebe o valor. */
(function () {
  function init(seletor) {
    var hidden = seletor.querySelector('input[type="hidden"]');
    var botoes = Array.prototype.slice.call(seletor.querySelectorAll('.prio-opcao'));

    botoes.forEach(function (botao) {
      botao.addEventListener('click', function () {
        botoes.forEach(function (b) { b.classList.remove('prio-opcao--ativo'); });
        botao.classList.add('prio-opcao--ativo');
        if (hidden) {
          hidden.value = botao.getAttribute('data-valor');
          hidden.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    seletor.resetar = function () {
      botoes.forEach(function (b) { b.classList.remove('prio-opcao--ativo'); });
      if (hidden) hidden.value = '';
    };
  }

  var seletores = Array.prototype.slice.call(document.querySelectorAll('.prio-seletor'));
  seletores.forEach(init);

  window.PrioSeletor = {
    resetarTodos: function () {
      seletores.forEach(function (s) { if (s.resetar) s.resetar(); });
    }
  };
})();
