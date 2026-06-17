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

  function tratarResposta(response) {
    if (response && response.status === 401) {
      limparSessaoLocal();
      redirecionarParaPerfil();
      return true;
    }

    return false;
  }

  global.AgroFlowSession = {
    limparSessaoLocal: limparSessaoLocal,
    tratarResposta: tratarResposta,
  };
})(window);
