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

  var TarefasStore = {
    obter: function (id) { return ler()[String(id)] || null; },
    estaConcluida: function (id) { return !!ler()[String(id)]; },
    listar: function () {
      var m = ler();
      return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) {
        return String(b.dataConclusao || '').localeCompare(String(a.dataConclusao || ''));
      });
    },
    concluir: function (id, dados) {
      var m = ler();
      m[String(id)] = Object.assign({ id: String(id) }, dados);
      return gravar(m);
    },

    // Renderiza as evidências (read-only) dentro de um container.
    renderEvidencias: function (evidencias, container) {
      container.innerHTML = '';
      (evidencias || []).forEach(function (ev) {
        var bloco = document.createElement('div');
        bloco.style.margin = '8px 0';
        var rotulo = { foto: 'Foto', audio: 'Áudio', texto: 'Texto' }[ev.tipo] || 'Evidência';
        var titulo = '<div style="font-size:12px;font-weight:600;color:#7c847c;margin-bottom:4px;">' + rotulo + '</div>';
        if (ev.tipo === 'foto' && ev.dataUrl) {
          bloco.innerHTML = titulo +
            '<img src="' + ev.dataUrl + '" alt="Foto da evidência" ' +
            'style="max-width:100%;max-height:220px;border-radius:10px;display:block;" />';
        } else if (ev.tipo === 'audio' && ev.dataUrl) {
          bloco.innerHTML = titulo +
            '<audio controls src="' + ev.dataUrl + '" style="width:100%;"></audio>';
        } else if (ev.tipo === 'texto') {
          bloco.innerHTML = titulo +
            '<p style="margin:0;font-size:14px;color:#1f1f1f;">' + escapar(ev.conteudo) + '</p>';
        }
        container.appendChild(bloco);
      });
    },

    // Lista as tarefas concluídas com evidência (para supervisor e gerente).
    renderListaConcluidas: function (container) {
      var itens = this.listar();
      container.innerHTML = '';
      if (!itens.length) {
        container.innerHTML =
          '<p style="color:#7c847c;font-size:14px;margin:0;">Nenhuma tarefa concluída pelo capataz ainda.</p>';
        return;
      }
      var self = this;
      itens.forEach(function (t) {
        var card = document.createElement('article');
        card.style.cssText =
          'background:#fff;border:1px solid #d9ded8;border-radius:14px;padding:14px;margin-bottom:12px;';
        var titulo = escapar(t.titulo || 'Tarefa') + (t.retiro ? ' — ' + escapar(t.retiro) : '');
        card.innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
            '<strong style="font-size:15px;color:#1f1f1f;">' + titulo + '</strong>' +
            '<span style="background:#22a855;color:#fff;font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;white-space:nowrap;">Concluída</span>' +
          '</div>' +
          '<p style="margin:4px 0 0;font-size:13px;color:#7c847c;">' +
            (t.supervisor ? 'Supervisor ' + escapar(t.supervisor) + ' • ' : '') +
            'Concluída em ' + escapar(t.dataConclusao || '-') + '</p>' +
          '<div class="js-evidencias"></div>';
        self.renderEvidencias(t.evidencias, card.querySelector('.js-evidencias'));
        container.appendChild(card);
      });
    }
  };

  global.TarefasStore = TarefasStore;
})(window);
