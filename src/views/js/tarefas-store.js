/* Persistência (no navegador) das tarefas concluídas pelo capataz.
   Fonte única lida por: detalhe da tarefa, lista de tarefas, supervisor e gerente.
   Guarda também as evidências (foto/áudio como dataURL, texto como string)
   para que possam ser revistas depois. Demo: vale no mesmo navegador. */
(function (global) {
  var CHAVE = 'alow:tarefasConcluidas';

  function ler() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || '{}'); }
    catch (e) { return {}; }
  }
  function gravar(obj) {
    try { localStorage.setItem(CHAVE, JSON.stringify(obj)); return true; }
    catch (e) { return false; }
  }
  function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Card de evidência por tipo (foto/áudio) — centralizado.
  function placeholderEvidencia(tipo) {
    var conf = {
      foto:  { rotulo: 'Foto',  cls: 'evidencia--foto',  icone: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.5"/>' },
      audio: { rotulo: 'Áudio', cls: 'evidencia--audio', icone: '<path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="18" y2="22"/>' }
    };
    var c = conf[tipo] || conf.foto;
    return '<div class="evidencia ' + c.cls + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + c.icone + '</svg>' +
      '<span class="evidencia__tipo">' + c.rotulo + '</span>' +
    '</div>';
  }

  var TarefasStore = {
    obter: function (id) { return ler()[String(id)] || null; },
    estaConcluida: function (id) { return !!ler()[String(id)]; },
    listar: function () {
      var m = ler();
      // Mais recente (revisada por último) primeiro → mais antiga por último.
      return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) {
        return (b.ts || 0) - (a.ts || 0);
      });
    },
    concluir: function (id, dados) {
      var m = ler();
      // ts = momento da conclusão/validação, usado para ordenar a lista.
      m[String(id)] = Object.assign({}, dados, { id: String(id), ts: Date.now() });
      return gravar(m);
    },

    // Renderiza a evidência (read-only, uma por atividade) centralizada.
    renderEvidencias: function (evidencias, container) {
      container.innerHTML = '';
      var lista = evidencias || [];
      if (!lista.length) return;
      var ev = lista[0]; // apenas uma evidência por atividade
      var bloco = document.createElement('div');
      bloco.className = 'evidencia-wrap';
      if (ev.tipo === 'foto' && ev.dataUrl) {
        bloco.innerHTML = '<img class="evidencia-midia" src="' + ev.dataUrl + '" alt="Foto da evidência" />';
      } else if (ev.tipo === 'audio' && ev.dataUrl) {
        bloco.innerHTML = '<audio class="evidencia-audio" controls src="' + ev.dataUrl + '"></audio>';
      } else if (ev.tipo === 'texto') {
        bloco.innerHTML = '<p class="evidencia-texto">' + escapar(ev.conteudo) + '</p>';
      } else {
        bloco.innerHTML = placeholderEvidencia(ev.tipo);
      }
      container.appendChild(bloco);
    },

    // Lista as tarefas concluídas com evidência (para supervisor e gerente).
    // Cada tarefa é uma "vara" (linha) que abre numa setinha mostrando
    // descrição e evidências (acordeão).
    renderListaConcluidas: function (container, opts) {
      opts = opts || {};
      var SELO = opts.selo || 'Concluída';
      var VAZIO = opts.vazio || 'Nenhuma tarefa concluída pelo capataz ainda.';
      var DATA_PREFIXO = opts.dataPrefixo || 'Concluída em';

      var itens = this.listar();
      container.innerHTML = '';
      if (!itens.length) {
        container.innerHTML = '<p class="concl-vazio">' + VAZIO + '</p>';
        return;
      }

      var ROTULO_PRIO = { alta: 'Alta', media: 'Média', baixa: 'Baixa', critica: 'Crítica' };
      var self = this;

      itens.forEach(function (t) {
        var titulo = escapar(t.titulo || 'Tarefa') + (t.retiro ? ' — ' + escapar(t.retiro) : '');

        var item = document.createElement('div');
        item.className = 'concl-item';

        // Vara: barra fina clicável (só nome + setinha)
        var head = document.createElement('button');
        head.type = 'button';
        head.className = 'concl-head';
        head.setAttribute('aria-expanded', 'false');
        head.innerHTML =
          '<span class="concl-title">' + titulo + '</span>' +
          '<span class="concl-badge">' + SELO + '</span>' +
          '<span class="concl-arrow" aria-hidden="true">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
          '</span>';

        // Painel que abre
        var panel = document.createElement('div');
        panel.className = 'concl-panel';
        var inner = document.createElement('div');
        inner.className = 'concl-panel__inner';

        // Prioridade em destaque (retângulo colorido)
        if (t.prioridade) {
          var tags = document.createElement('div');
          tags.className = 'concl-tags';
          tags.innerHTML = '<span class="concl-prio concl-prio--' + escapar(t.prioridade) + '">' +
            (ROTULO_PRIO[t.prioridade] || escapar(t.prioridade)) + '</span>';
          inner.appendChild(tags);
        }

        // Linha de contexto (data + supervisor)
        var metaParts = [];
        if (t.dataConclusao) metaParts.push(DATA_PREFIXO + ' ' + t.dataConclusao);
        if (t.supervisor) metaParts.push('Supervisor ' + t.supervisor);
        if (metaParts.length) {
          var meta = document.createElement('p');
          meta.className = 'concl-meta';
          meta.textContent = metaParts.join(' • ');
          inner.appendChild(meta);
        }

        if (t.descricao) {
          var desc = document.createElement('div');
          desc.className = 'concl-bloco';
          desc.innerHTML =
            '<span class="concl-bloco__label">Descrição</span>' +
            '<p class="concl-bloco__texto">' + escapar(t.descricao) + '</p>';
          inner.appendChild(desc);
        }

        if (t.evidencias && t.evidencias.length) {
          var evBloco = document.createElement('div');
          evBloco.className = 'concl-bloco';
          var evLabel = document.createElement('span');
          evLabel.className = 'concl-bloco__label';
          evLabel.textContent = 'Evidência';
          var evWrap = document.createElement('div');
          evWrap.className = 'js-evidencias';
          evBloco.appendChild(evLabel);
          evBloco.appendChild(evWrap);
          inner.appendChild(evBloco);
          self.renderEvidencias(t.evidencias, evWrap);
        }

        panel.appendChild(inner);
        item.appendChild(head);
        item.appendChild(panel);
        container.appendChild(item);

        head.addEventListener('click', function () {
          var aberto = item.classList.toggle('is-open');
          head.setAttribute('aria-expanded', aberto ? 'true' : 'false');
        });
      });
    }
  };

  global.TarefasStore = TarefasStore;
})(window);
