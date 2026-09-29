// Globinho espiando (29/09/2026, pedidos do João).
// Só na home e só quando tem festa aberta: com a pessoa parada ele aparece
// por uma borda da tela, faz uma reação e se esconde. Cada aparição sorteia
// uma reação e um lado diferentes da anterior (nunca repete a última).
// Regras pra não atrapalhar:
//  - nunca clicável (pointer-events: none), não rouba toque de card;
//  - aparece 1,5 s depois da pessoa parar de rolar; some quando ela rola;
//  - escolhe uma posição que não cubra botão, preço, título nem chamada; se
//    não achar nenhuma, tenta de novo na próxima;
//  - prefers-reduced-motion: não aparece.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.event-grid')) return;

  var BASE = 'assets/mascote/globinho-';
  var REACOES = [
    { img: 'espiando', lados: ['direita', 'esquerda'] },
    { img: 'espiando-piscadinha', lados: ['direita', 'esquerda'] },
    { img: 'espiando-surpreso', lados: ['direita', 'esquerda'] },
    { img: 'espiando-risada', lados: ['direita', 'esquerda'] },
    { img: 'espiando-coracao', lados: ['direita', 'esquerda'] },
    { img: 'espiando-pendurado', lados: ['cima'] }
  ];
  // pré-carrega todas, pra ele não aparecer "vazio" na primeira vez de cada
  REACOES.forEach(function (r) { var i = new Image(); i.src = BASE + r.img + '.svg?v=43'; });

  var el = document.createElement('img');
  el.className = 'globinho-espia';
  el.alt = '';
  el.setAttribute('aria-hidden', 'true');
  el.width = 84; el.height = 94;
  document.body.appendChild(el);

  var ultimaRolagem = Date.now(), ultima = '', escondeTimer = null;
  window.addEventListener('scroll', function () {
    ultimaRolagem = Date.now();
    if (el.classList.contains('is-visivel')) esconder();
  }, { passive: true });

  function temFestaAberta() {
    return [].some.call(document.querySelectorAll('.event-poster'), function (c) {
      return c.offsetParent && !c.classList.contains('is-closed');
    });
  }

  var PROIBIDO = '.btn, button, a:not(.event-poster), .event-poster__foot, .event-poster__pills, .event-poster__title, .event-poster__meta, .cta-note, .section-title, .brand-mark, .hero-tagline';
  function sobrepoe(a, b) { return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom); }
  function livre(caixa) {
    return ![].some.call(document.querySelectorAll(PROIBIDO), function (n) {
      var r = n.getBoundingClientRect();
      return r.width && r.height && r.bottom > 0 && r.top < innerHeight && sobrepoe(caixa, r);
    });
  }

  // Devolve a posição (estilo) pra um lado, ou null se nenhuma estiver livre.
  function posicao(lado, w, h) {
    var i, top, left, fr;
    if (lado === 'cima') {
      fr = [0.78, 0.22, 0.6, 0.4];
      for (i = 0; i < fr.length; i++) {
        left = Math.round(innerWidth * fr[i] - w / 2);
        if (livre({ left: left, right: left + w, top: 0, bottom: h * 0.9 })) return { left: left + 'px', top: '0px' };
      }
      return null;
    }
    fr = [0.62, 0.45, 0.78, 0.3];
    for (i = 0; i < fr.length; i++) {
      top = Math.round(innerHeight * fr[i] - h / 2);
      var caixa = lado === 'direita'
        ? { left: innerWidth - w * 0.62, right: innerWidth, top: top, bottom: top + h }
        : { left: 0, right: w * 0.62, top: top, bottom: top + h };
      if (livre(caixa)) return { top: top + 'px' };
    }
    return null;
  }

  function sortear() {
    var opcoes = [];
    REACOES.forEach(function (r) { r.lados.forEach(function (l) { if (r.img + l !== ultima) opcoes.push({ img: r.img, lado: l }); }); });
    // embaralha pra tentar outras se a sorteada não couber na tela agora
    for (var i = opcoes.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = opcoes[i]; opcoes[i] = opcoes[j]; opcoes[j] = t; }
    return opcoes;
  }

  function mostrar() {
    if (document.hidden || !temFestaAberta() || el.classList.contains('is-visivel')) return;
    if (Date.now() - ultimaRolagem < 1500) return;
    var w = innerWidth >= 1024 ? 96 : 76, h = w * 1.12;
    var opcoes = sortear();
    for (var k = 0; k < opcoes.length; k++) {
      var pos = posicao(opcoes[k].lado, w, h);
      if (!pos) continue;
      var o = opcoes[k];
      // Posiciona no lado novo SEM animação e só depois liga a transição de
      // entrada; senão ele atravessava a tela vindo do lado anterior.
      el.className = 'globinho-espia sem-transicao entra-' + o.lado;
      el.style.top = pos.top || ''; el.style.left = pos.left || '';
      el.src = BASE + o.img + '.svg?v=43';
      void el.offsetWidth;
      el.classList.remove('sem-transicao');
      ultima = o.img + o.lado;
      // um quadro depois pra transição de entrada acontecer
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-visivel'); }); });
      clearTimeout(escondeTimer);
      escondeTimer = setTimeout(esconder, 3400);
      return;
    }
  }

  function esconder() { el.classList.remove('is-visivel'); }

  function ciclo() {
    mostrar();
    setTimeout(ciclo, 4500 + Math.random() * 3500);
  }
  setTimeout(ciclo, 2000);
  // parou de rolar: tenta aparecer logo (sem esperar o próximo ciclo)
  setInterval(function () {
    if (!el.classList.contains('is-visivel') && Date.now() - ultimaRolagem > 1500 && Date.now() - ultimaRolagem < 2200) mostrar();
  }, 400);
})();
