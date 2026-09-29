// Formulário "Lista de Desconto" de cada página de evento (eventos/{slug}.html).
// Externo (não inline) de propósito: alguns ambientes de preview local (ex.
// Live Server com CSP) bloqueiam <script> inline e deixam passar só arquivo
// externo — se isso acontecer aqui, o form cai no submit nativo do navegador
// (sem action definida) e o Live Server volta pro index.html, parecendo um
// bug de navegação quando na verdade é o JS que nunca rodou.
// Evento e número da promoter vêm de data-attributes no próprio <form>, pra
// manter o padrão de "copiar a página e trocar os dados" sem precisar tocar
// em JS por evento.
(function () {
  var form = document.getElementById('lista-form');
  if (!form) return;

  // Globinho comemorando depois do clique (29/09/2026): aparece ABAIXO do
  // botão, no fluxo da página (por cima ele cobria nome, preço e campos), com
  // o lembrete de apertar enviar no WhatsApp. Fica uns segundos e fecha.
  var festa = null, timer = null;
  function comemorar() {
    if (!festa) {
      festa = document.createElement('div');
      festa.className = 'globinho-festa-lista';
      festa.setAttribute('role', 'status');
      festa.innerHTML = '<img src="../assets/mascote/globinho-comemora.svg?v=44" alt="" width="84" height="94">' +
        '<p>Agora é só tocar em <strong>enviar</strong> lá no WhatsApp!</p>';
      var btn = form.querySelector('button[type="submit"]');
      btn.parentNode.insertBefore(festa, btn.nextSibling);
    }
    // reflow pra reiniciar a transição se clicar de novo
    festa.classList.remove('is-visivel'); void festa.offsetWidth; festa.classList.add('is-visivel');
    clearTimeout(timer);
    timer = setTimeout(function () { festa.classList.remove('is-visivel'); }, 6000);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Obs: se a lista já fechou, event-schedule.js já mandou a página de
    // volta pra home antes disso rodar — não precisa de guarda aqui.
    var numeroPromoter = form.dataset.numero;
    var nomeEvento = form.dataset.evento;
    var nome = document.getElementById('f-nome').value.trim();
    var telefone = document.getElementById('f-telefone').value.trim();

    var texto = 'Oi! Quero entrar na Lista de Desconto:\n' +
      'Evento: ' + nomeEvento + '\n' +
      'Nome: ' + nome + '\n' +
      'Telefone: ' + telefone;

    var url = 'https://wa.me/' + numeroPromoter + '?text=' + encodeURIComponent(texto);
    window.open(url, '_blank');
    comemorar();
  });
})();
