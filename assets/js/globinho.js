// Globinho espiando e atravessando o site (29/09/2026, pedidos do João).
// Só na home e só quando tem festa aberta. Com a pessoa parada (1,5 s sem
// rolar), a cada ~5-8 s ele faz UMA coisa, sorteada e diferente da anterior:
//  - espia por uma borda (direita, esquerda espelhado, de baixo) com uma
//    reação: tchau, apaixonado, assustado, piscadinha, gargalhada;
//  - desce pendurado pela corrente, do topo;
//  - "teia": atravessa a tela de um lado ao outro balançando na corrente.
// Posição sorteada a cada vez, sempre num lugar que não cubra botão, preço,
// título nem chamada (a teia só passa, não para em cima de nada).
// Nunca clicável; some quando a pessoa rola; não aparece com reduced-motion.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('.event-grid')) return;

  var V = '?v=44';
  var BASE = 'assets/mascote/globinho-';
  var LADOS = ['direita', 'esquerda', 'baixo'];
  var REACOES = [
    { img: 'espiando', lados: LADOS },
    { img: 'espiando-coracao', lados: LADOS },
    { img: 'espiando-surpreso', lados: LADOS },
    { img: 'espiando-piscadinha', lados: LADOS },
    { img: 'espiando-risada', lados: LADOS },
    { img: 'espiando-pendurado', lados: ['cima'] }
    // a teia é sorteada à parte (chance de 1 em 5), ver mostrar()
  ];
  REACOES.forEach(function (r) { var i = new Image(); i.src = BASE + r.img + '.svg' + V; });

  var el = document.createElement('img');
  el.className = 'globinho-espia';
  el.alt = ''; el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);

  // Teia: um "pêndulo" preso acima da tela; o fio é uma div, o Globinho vai na ponta.
  var teia = document.createElement('div');
  teia.className = 'globinho-teia';
  teia.setAttribute('aria-hidden', 'true');
  teia.innerHTML = '<span class="globinho-teia__fio"></span><img alt="" src="' + BASE + 'espiando-teia.svg' + V + '">';
  document.body.appendChild(teia);

  var ultimaRolagem = Date.now(), ultima = '', ocupado = false, timer = null;
  window.addEventListener('scroll', function () {
    ultimaRolagem = Date.now();
    if (el.classList.contains('is-visivel')) esconder();
  }, { passive: true });

  function temFestaAberta() {
    return [].some.call(document.querySelectorAll('.event-poster'), function (c) {
      return c.offsetParent && !c.classList.contains('is-closed');
    });
  }

  var PROIBIDO = '.btn, button, a:not(.event-poster), .event-poster__foot, .event-poster__pills, .event-poster__title, .event-poster__meta, .cta-note, .section-title, .brand-mark, .brand-sub, .hero-tagline';
  function sobrepoe(a, b) { return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom); }
  function livre(caixa) {
    // folga: inclinado (-12°) ele ocupa um pouco mais que a caixa reta
    var f = 14;
    caixa = { left: caixa.left - f, right: caixa.right + f, top: caixa.top - f, bottom: caixa.bottom + f };
    return ![].some.call(document.querySelectorAll(PROIBIDO), function (n) {
      var r = n.getBoundingClientRect();
      return r.width && r.height && r.bottom > 0 && r.top < innerHeight && sobrepoe(caixa, r);
    });
  }
  function embaralha(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // Posição sorteada pra um lado, ou null se nada estiver livre agora.
  function posicao(lado, w, h) {
    var fr, i, v;
    if (lado === 'cima' || lado === 'baixo') {
      fr = embaralha([0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86]);
      for (i = 0; i < fr.length; i++) {
        var left = Math.round(Math.min(Math.max(innerWidth * fr[i] - w / 2, 4), innerWidth - w - 4));
        var c = lado === 'cima'
          ? { left: left, right: left + w, top: 0, bottom: h * 0.9 }
          : { left: left, right: left + w, top: innerHeight - h * 0.72, bottom: innerHeight };
        if (livre(c)) return lado === 'cima' ? { left: left + 'px', top: '0px' } : { left: left + 'px' };
      }
      return null;
    }
    fr = embaralha([0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.82]);
    for (i = 0; i < fr.length; i++) {
      var top = Math.round(innerHeight * fr[i] - h / 2);
      v = lado === 'direita'
        ? { left: innerWidth - w * 0.78, right: innerWidth, top: top, bottom: top + h }
        : { left: 0, right: w * 0.78, top: top, bottom: top + h };
      if (livre(v)) return { top: top + 'px' };
    }
    return null;
  }

  function atravessar() {
    ocupado = true;
    var w = innerWidth >= 1024 ? 120 : 96;
    var ang = 62 * Math.PI / 180;
    var L = Math.round((innerWidth / 2 + w) / Math.sin(ang));         // fio longo o bastante pra sair dos dois lados
    var topo = Math.round(innerHeight * (0.58 + Math.random() * 0.18) - L); // ponto mais baixo entre 58% e 76% da tela
    var ida = Math.random() < 0.5 ? 1 : -1;
    teia.style.setProperty('--w', w + 'px');
    teia.style.height = L + 'px';
    teia.style.top = topo + 'px';
    teia.classList.add('is-ativa');
    var anim = teia.animate(
      [{ transform: 'translateX(-50%) rotate(' + (-62 * ida) + 'deg)' }, { transform: 'translateX(-50%) rotate(' + (62 * ida) + 'deg)' }],
      { duration: 3400, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = anim.oncancel = function () { teia.classList.remove('is-ativa'); ocupado = false; };
  }

  function mostrar() {
    if (ocupado || document.hidden || !temFestaAberta() || el.classList.contains('is-visivel')) return;
    if (Date.now() - ultimaRolagem < 1500) return;
    // A teia tem chance fixa de 1 em 5 (no sorteio geral ela seria 1 em 16
    // e quase nunca aparecia); nunca duas seguidas.
    if (ultima.indexOf('teia') === -1 && Math.random() < 0.2) { ultima = 'espiando-teiateia'; atravessar(); return; }
    var w = innerWidth >= 1024 ? 116 : 92, h = Math.round(w * 1.12);
    var opcoes = [];
    REACOES.forEach(function (r) { r.lados.forEach(function (l) { if (r.img + l !== ultima) opcoes.push({ img: r.img, lado: l }); }); });
    embaralha(opcoes);
    for (var k = 0; k < opcoes.length; k++) {
      var o = opcoes[k];
      if (o.lado === 'teia') { ultima = o.img + o.lado; atravessar(); return; }
      var pos = posicao(o.lado, w, h);
      if (!pos) continue;
      // Posiciona no lado novo SEM animação e só depois liga a entrada;
      // senão ele atravessava a tela vindo do lado anterior.
      el.className = 'globinho-espia sem-transicao entra-' + o.lado;
      el.style.width = w + 'px';
      el.style.top = pos.top || ''; el.style.left = pos.left || '';
      el.src = BASE + o.img + '.svg' + V;
      void el.offsetWidth;
      el.classList.remove('sem-transicao');
      ultima = o.img + o.lado;
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-visivel'); }); });
      clearTimeout(timer);
      timer = setTimeout(esconder, 3600);
      return;
    }
  }

  function esconder() { el.classList.remove('is-visivel'); }

  function ciclo() { mostrar(); setTimeout(ciclo, 5000 + Math.random() * 3000); }
  setTimeout(ciclo, 2000);
  setInterval(function () {
    var parado = Date.now() - ultimaRolagem;
    if (!el.classList.contains('is-visivel') && parado > 1500 && parado < 2200) mostrar();
  }, 400);
})();
