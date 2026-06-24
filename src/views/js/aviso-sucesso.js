// Controla a tela cheia de confirmação (sucesso) usada pelas telas do capataz.
// Uso: window.AvisoSucesso.mostrar('mensagem', { titulo, botaoTexto, aoFechar }).
(function () {
  var tela = document.getElementById('telaAviso');
  var tituloEl = document.getElementById('telaAvisoTitulo');
  var mensagemEl = document.getElementById('telaAvisoMensagem');
  var botaoEl = document.getElementById('telaAvisoBotao');
  if (!tela || !botaoEl) return;

  var aoFecharAtual = null;

  function fechar() {
    tela.hidden = true;
    var cb = aoFecharAtual;
    aoFecharAtual = null;
    if (typeof cb === 'function') cb();
  }

  botaoEl.addEventListener('click', fechar);

  window.AvisoSucesso = {
    mostrar: function (mensagem, opcoes) {
      opcoes = opcoes || {};
      if (tituloEl) tituloEl.textContent = opcoes.titulo || 'Enviado com sucesso!';
      if (mensagemEl) mensagemEl.textContent = mensagem || '';
      botaoEl.textContent = opcoes.botaoTexto || 'Voltar ao início';
      aoFecharAtual = typeof opcoes.aoFechar === 'function' ? opcoes.aoFechar : null;
      tela.hidden = false;
      try { botaoEl.focus(); } catch (e) {}
    },
    fechar: fechar,
  };
})();
