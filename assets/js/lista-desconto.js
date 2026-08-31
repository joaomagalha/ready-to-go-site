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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Guarda: se event-schedule.js já marcou a lista como fechada (passou do
    // horário limite / a festa já rolou), não abre o WhatsApp.
    if (form.hidden || form.dataset.listClosed === '1') return;
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
  });
})();
