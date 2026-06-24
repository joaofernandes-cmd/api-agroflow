(function (global) {
  var sidebar = document.querySelector('.sidebar');
  var menuButton = document.querySelector('.sidebar__menu-btn');
  var logoutButton = document.querySelector('[data-logout]');

  if (!sidebar) {
    return;
  }

  if (localStorage.getItem('sidebar-collapsed') === '1') {
    sidebar.classList.add('sidebar--collapsed');
  }

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      sidebar.classList.toggle('sidebar--collapsed');
      localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('sidebar--collapsed') ? '1' : '0');
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', function () {
      var token = localStorage.getItem('agroflow.token');

      fetch('/usuarios/logout', {
        method: 'POST',
        headers: token ? { Authorization: 'Bearer ' + token } : {},
        keepalive: true,
      }).catch(function () {});

      if (global.AgroFlowSession && typeof global.AgroFlowSession.limparSessaoLocal === 'function') {
        global.AgroFlowSession.limparSessaoLocal();
      } else {
        localStorage.removeItem('agroflow.token');
        localStorage.removeItem('agroflow.usuario');
      }

      global.location.assign('/auth/perfil');
    });
  }
})(window);
