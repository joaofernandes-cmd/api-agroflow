(function () {
  var ids = ['data-hoje', 'data-hoje-mobile', 'data-hoje-desktop', 'data-hoje-desktop2'];
  var data = new Date()
    .toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\w/, function (char) {
      return char.toUpperCase();
    });

  ids.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = data;
    }
  });
})();
