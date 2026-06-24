(function (global) {
  function limparSessaoLocal() {
    try {
      localStorage.removeItem('agroflow.token');
      localStorage.removeItem('agroflow.usuario');
    } catch (_) {}
  }

  function redirecionarParaPerfil() {
    if (global.location.pathname !== '/auth/perfil') {
      global.location.assign('/auth/perfil');
    }
  }

  function carregarUsuario() {
    try {
      var usuarioRaw = localStorage.getItem('agroflow.usuario');
      return usuarioRaw ? JSON.parse(usuarioRaw) : null;
    } catch (_) {
      return null;
    }
  }

  function tratarResposta(response) {
    if (response && response.status === 401) {
      limparSessaoLocal();
      redirecionarParaPerfil();
      return true;
    }

    return false;
  }

  global.AgroFlowSession = {
    carregarUsuario: carregarUsuario,
    limparSessaoLocal: limparSessaoLocal,
    tratarResposta: tratarResposta,
  };
})(window);
