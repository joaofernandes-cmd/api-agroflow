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

  function dataUrlPermitido(valor, tipo) {
    if (typeof valor !== 'string') return false;
    if (tipo === 'foto') return /^data:image\/(jpeg|png|webp);base64,/i.test(valor);
    if (tipo === 'audio') return /^data:audio\/(webm|mp4|ogg|mpeg|wav);base64,/i.test(valor);
    return false;
  }

  function classeSegura(valor) {
    return String(valor || '').replace(/[^a-z0-9_-]/gi, '');
  }

  function limpar(elemento) {
    if (elemento) elemento.textContent = '';
  }

  function svgBase() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    return svg;
  }

  function adicionarPath(svg, d) {
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }

  function criarIconeEvidencia(tipo) {
    var svg = svgBase();

    if (tipo === 'audio') {
      adicionarPath(svg, 'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z');
      adicionarPath(svg, 'M19 10v1a7 7 0 0 1-14 0v-1');

      var linha = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      linha.setAttribute('x1', '12');
      linha.setAttribute('x2', '12');
      linha.setAttribute('y1', '18');
      linha.setAttribute('y2', '22');
      svg.appendChild(linha);

      return svg;
    }

    adicionarPath(svg, 'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z');

    var circulo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circulo.setAttribute('cx', '12');
    circulo.setAttribute('cy', '13');
    circulo.setAttribute('r', '3.5');
    svg.appendChild(circulo);

    return svg;
  }

  function criarSeta() {
    var svg = svgBase();
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    adicionarPath(svg, 'm6 9 6 6 6-6');
    return svg;
  }

  // Card de evidência por tipo (foto/áudio) centralizado.
  function placeholderEvidencia(tipo) {
    var conf = {
      foto: { rotulo: 'Foto', cls: 'evidencia--foto' },
      audio: { rotulo: 'Áudio', cls: 'evidencia--audio' }
    };
    var c = conf[tipo] || conf.foto;
    var div = document.createElement('div');
    var rotulo = document.createElement('span');

    div.className = 'evidencia ' + c.cls;
    rotulo.className = 'evidencia__tipo';
    rotulo.textContent = c.rotulo;

    div.appendChild(criarIconeEvidencia(tipo));
    div.appendChild(rotulo);
    return div;
  }

  var TarefasStore = {
    obter: function (id) { return ler()[String(id)] || null; },
    estaConcluida: function (id) { return !!ler()[String(id)]; },
    listar: function () {
      var m = ler();
      // Mais recente (revisada por último) primeiro, mais antiga por último.
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
      limpar(container);

      var lista = evidencias || [];
      if (!lista.length) return;

      var ev = lista[0]; // apenas uma evidência por atividade
      var bloco = document.createElement('div');
      bloco.className = 'evidencia-wrap';

      if (ev.tipo === 'foto' && dataUrlPermitido(ev.dataUrl, 'foto')) {
        var img = document.createElement('img');
        img.className = 'evidencia-midia';
        img.src = ev.dataUrl;
        img.alt = 'Foto da evidência';
        bloco.appendChild(img);
      } else if (ev.tipo === 'audio' && dataUrlPermitido(ev.dataUrl, 'audio')) {
        var audio = document.createElement('audio');
        audio.className = 'evidencia-audio';
        audio.controls = true;
        audio.src = ev.dataUrl;
        bloco.appendChild(audio);
      } else if (ev.tipo === 'texto') {
        var texto = document.createElement('p');
        texto.className = 'evidencia-texto';
        texto.textContent = ev.conteudo || '';
        bloco.appendChild(texto);
      } else {
        bloco.appendChild(placeholderEvidencia(ev.tipo));
      }

      container.appendChild(bloco);
    },

    // Lista as tarefas concluídas com evidência (para supervisor e gerente).
    // Cada tarefa é uma linha que abre mostrando descrição e evidências.
    renderListaConcluidas: function (container, opts) {
      opts = opts || {};
      var SELO = opts.selo || 'Concluída';
      var VAZIO = opts.vazio || 'Nenhuma tarefa concluída pelo capataz ainda.';
      var DATA_PREFIXO = opts.dataPrefixo || 'Concluída em';

      var itens = this.listar();
      limpar(container);

      if (!itens.length) {
        var vazio = document.createElement('p');
        vazio.className = 'concl-vazio';
        vazio.textContent = VAZIO;
        container.appendChild(vazio);
        return;
      }

      var ROTULO_PRIO = { alta: 'Alta', media: 'Média', baixa: 'Baixa', critica: 'Crítica' };
      var self = this;

      itens.forEach(function (t) {
        var titulo = String(t.titulo || 'Tarefa') + (t.retiro ? ' - ' + String(t.retiro) : '');

        var item = document.createElement('div');
        item.className = 'concl-item';

        var head = document.createElement('button');
        var tituloEl = document.createElement('span');
        var badge = document.createElement('span');
        var arrow = document.createElement('span');

        head.type = 'button';
        head.className = 'concl-head';
        head.setAttribute('aria-expanded', 'false');

        tituloEl.className = 'concl-title';
        tituloEl.textContent = titulo;

        badge.className = 'concl-badge';
        badge.textContent = SELO;

        arrow.className = 'concl-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.appendChild(criarSeta());

        head.appendChild(tituloEl);
        head.appendChild(badge);
        head.appendChild(arrow);

        var panel = document.createElement('div');
        panel.className = 'concl-panel';

        var inner = document.createElement('div');
        inner.className = 'concl-panel__inner';

        if (t.prioridade) {
          var tags = document.createElement('div');
          var prioridade = document.createElement('span');
          tags.className = 'concl-tags';
          prioridade.className = 'concl-prio concl-prio--' + classeSegura(t.prioridade);
          prioridade.textContent = ROTULO_PRIO[t.prioridade] || String(t.prioridade);
          tags.appendChild(prioridade);
          inner.appendChild(tags);
        }

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
          var rotuloDesc = document.createElement('span');
          var textoDesc = document.createElement('p');

          desc.className = 'concl-bloco';
          rotuloDesc.className = 'concl-bloco__label';
          rotuloDesc.textContent = 'Descrição';
          textoDesc.className = 'concl-bloco__texto';
          textoDesc.textContent = t.descricao;

          desc.appendChild(rotuloDesc);
          desc.appendChild(textoDesc);
          inner.appendChild(desc);
        }

        if (t.evidencias && t.evidencias.length) {
          var evBloco = document.createElement('div');
          var evLabel = document.createElement('span');
          var evWrap = document.createElement('div');

          evBloco.className = 'concl-bloco';
          evLabel.className = 'concl-bloco__label';
          evLabel.textContent = 'Evidência';
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
