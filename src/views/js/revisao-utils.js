(function (global) {
  function mostrarFeedback(config) {
    document.querySelectorAll(config.feedbackSelector).forEach(function (el) {
      el.remove();
    });

    var alvo = document.querySelector(config.alvoSelector) || document.querySelector(config.alvoFallbackSelector);

    if (!alvo) {
      return;
    }

    var feedback = document.createElement('p');
    feedback.className = config.feedbackClass;
    feedback.textContent = config.mensagem;
    feedback.style.color = config.tipo === 'error' ? '#b42318' : '#146c43';
    feedback.style.margin = '8px 0 0';
    alvo.insertAdjacentElement('afterend', feedback);
  }

  async function validarItem(config) {
    if (!config.id) {
      return;
    }

    if (config.botao) {
      config.botao.disabled = true;
    }

    try {
      var resp = await fetch(config.url, {
        method: config.method || 'PATCH',
      });

      if (global.AgroFlowSession && global.AgroFlowSession.tratarResposta(resp)) {
        return;
      }

      var data = await resp.json().catch(function () {
        return {};
      });

      if (!resp.ok) {
        config.mostrarFeedback(data.mensagem || data.error || config.mensagemErro, 'error');
        if (config.botao) {
          config.botao.disabled = false;
        }
        return;
      }

      global.location.reload();
    } catch (_) {
      config.mostrarFeedback('Falha de conexão. Tente novamente.', 'error');
      if (config.botao) {
        config.botao.disabled = false;
      }
    }
  }

  function vincularValidacao(config) {
    document.querySelectorAll(config.botaoSelector || '[data-action="validar"]').forEach(function (botao) {
      if (botao.disabled && config.ignorarDesabilitados) {
        return;
      }

      botao.addEventListener('click', function () {
        var host = botao.closest(config.hostSelector);
        config.validar(host && host.dataset[config.datasetKey], botao);
      });
    });
  }

  function alternarItem(item, controle, onOpen) {
    if (!item) {
      return;
    }

    var aberto = item.classList.toggle('is-open');
    controle.setAttribute('aria-expanded', aberto ? 'true' : 'false');

    if (aberto && onOpen) {
      onOpen(item);
    }
  }

  function vincularAcordeao(seletorControle, seletorItem, onOpen) {
    document.querySelectorAll(seletorControle).forEach(function (controle) {
      controle.addEventListener('click', function () {
        alternarItem(controle.closest(seletorItem), controle, onOpen);
      });
    });
  }

  function vincularDetalheTabela(seletorControle, classeDetalhe, onOpen) {
    document.querySelectorAll(seletorControle).forEach(function (controle) {
      controle.addEventListener('click', function () {
        var linha = controle.closest('tr');
        var detalhe = linha && linha.nextElementSibling;

        if (!detalhe || !detalhe.classList.contains(classeDetalhe)) {
          return;
        }

        var abrindo = detalhe.hasAttribute('hidden');
        detalhe.toggleAttribute('hidden');
        controle.setAttribute('aria-expanded', abrindo ? 'true' : 'false');

        if (abrindo && onOpen) {
          onOpen(linha);
        }
      });
    });
  }

  global.AgroFlowRevisao = {
    mostrarFeedback: mostrarFeedback,
    validarItem: validarItem,
    vincularValidacao: vincularValidacao,
    vincularAcordeao: vincularAcordeao,
    vincularDetalheTabela: vincularDetalheTabela,
  };
})(window);
