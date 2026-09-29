// Globinho espiando do cantinho da tela (29/09/2026, pedido do João).
// Só na home e só quando tem festa aberta: de tempos em tempos ele aparece
// pela borda direita, olha pra página, pisca e se esconde de novo.
// Regras pra não atrapalhar:
//  - nunca clicável (pointer-events: none), então não rouba toque de card;
//  - só aparece com a pessoa parada (3s sem rolar) e com a aba à vista;
//  - escolhe uma altura em que não cubra botão, preço nem chamada de card;
//    se não achar, pula essa vez;
//  - prefers-reduced-motion: não aparece.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var grid = document.querySelector('.event-grid');
  if (!grid) return;

  var img = document.createElement('img');
  img.className = 'globinho-espia';
  img.src = 'assets/mascote/globinho-espiando.svg?v=41';
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.width = 84; img.height = 94;
  document.body.appendChild(img);

  var ultimaRolagem = Date.now();
  window.addEventListener('scroll', function () {
    ultimaRolagem = Date.now();
    if (img.classList.contains('is-visivel')) esconder();
  }, { passive: true });

  function temFestaAberta() {
    return [].some.call(document.querySelectorAll('.event-poster'), function (c) {
      return c.offsetParent && !c.classList.contains('is-closed');
    });
  }

  // O que ele não pode cobrir: botões, links que não são o card inteiro, e o
  // rodapé/pílulas dos cards (preço, chamada, contagem).
  var PROIBIDO = '.btn, button, a:not(.event-poster), .event-poster__foot, .event-poster__pills, .event-poster__title, .event-poster__meta, .cta-note, .section-title';

  function sobrepoe(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function escolherAltura() {
    var h = img.getBoundingClientRect().height || 94;
    var w = img.getBoundingClientRect().width || 84;
    var alvos = [0.62, 0.45, 0.78, 0.3];
    var proibidos = [].map.call(document.querySelectorAll(PROIBIDO), function (el) { return el.getBoundingClientRect(); })
      .filter(function (r) { return r.width && r.height && r.bottom > 0 && r.top < innerHeight; });
    for (var i = 0; i < alvos.length; i++) {
      var top = Math.round(innerHeight * alvos[i] - h / 2);
      // área que ele ocupa quando está à mostra (metade pra dentro da tela)
      var caixa = { left: innerWidth - w * 0.62, right: innerWidth, top: top, bottom: top + h };
      if (!proibidos.some(function (r) { return sobrepoe(caixa, r); })) return top;
    }
    return null;
  }

  function mostrar() {
    if (document.hidden || !temFestaAberta()) return;
    if (Date.now() - ultimaRolagem < 3000) return;
    var top = escolherAltura();
    if (top === null) return;
    img.style.top = top + 'px';
    img.classList.add('is-visivel');
    setTimeout(esconder, 3600);
  }

  function esconder() { img.classList.remove('is-visivel'); }

  function ciclo() {
    mostrar();
    setTimeout(ciclo, 9000 + Math.random() * 9000);
  }
  setTimeout(ciclo, 5000);
})();
