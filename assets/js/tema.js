// Tema sazonal do site (17/10/2026). Carregado no <head> de todas as páginas:
// põe a classe no <html> antes de pintar (sem piscar) e, com a página pronta,
// injeta a decoração. Todo o visual do tema mora em css/tema-halloween.css,
// só com seletores .tema-halloween; desligado, o site volta ao de sempre.
//
// DESLIGAR O TEMA: trocar a linha abaixo por  var TEMA = '';
var TEMA = 'halloween';

(function () {
  if (!TEMA) return;
  document.documentElement.classList.add('tema-' + TEMA);
  if (TEMA !== 'halloween') return;

  // ---------- desenhos (SVG em código, nada de imagem) ----------
  // Teia de canto: raios saindo do canto (0,0) e fios ligando os raios, com
  // uma leve barriga pro canto, como teia de verdade.
  function teia(tam) {
    var R = 100, raios = 7, aneis = [18, 34, 50, 66, 82, 98], d = '';
    var ang = [];
    for (var i = 0; i < raios; i++) ang.push((Math.PI / 2) * (i / (raios - 1)));
    ang.forEach(function (a) { d += 'M0 0L' + (R * Math.cos(a)).toFixed(1) + ' ' + (R * Math.sin(a)).toFixed(1); });
    aneis.forEach(function (r, k) {
      var j = 0.85 + (k % 2) * 0.08; // fios alternados, menos certinhos
      for (var i = 0; i < raios - 1; i++) {
        var a1 = ang[i], a2 = ang[i + 1], am = (a1 + a2) / 2;
        var x1 = r * Math.cos(a1), y1 = r * Math.sin(a1), x2 = r * Math.cos(a2), y2 = r * Math.sin(a2);
        var cx = r * j * Math.cos(am), cy = r * j * Math.sin(am);
        d += (i === 0 ? 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) : '') +
          'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
      }
    });
    return '<svg viewBox="0 0 100 100" width="' + tam + '" height="' + tam + '" aria-hidden="true">' +
      '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width=".7" stroke-linecap="round"/></svg>';
  }

  var ARANHA = '<svg viewBox="0 0 40 36" aria-hidden="true"><g stroke="#0d0a0f" stroke-width="2.2" stroke-linecap="round" fill="none">' +
    '<path d="M16 16 Q8 8 3 12"/><path d="M16 19 Q7 16 2 21"/><path d="M16 22 Q8 24 4 31"/><path d="M17 24 Q12 30 10 35"/>' +
    '<path d="M24 16 Q32 8 37 12"/><path d="M24 19 Q33 16 38 21"/><path d="M24 22 Q32 24 36 31"/><path d="M23 24 Q28 30 30 35"/></g>' +
    '<ellipse cx="20" cy="22" rx="7" ry="8" fill="#140f18"/><circle cx="20" cy="13" r="5" fill="#1d1622"/>' +
    '<circle cx="18" cy="12.5" r="1.4" fill="#ff5a3c"/><circle cx="22" cy="12.5" r="1.4" fill="#ff5a3c"/>' +
    '<path d="M17 20 Q20 18 23 20" stroke="#5b2a7a" stroke-width="1.2" fill="none"/></svg>';

  var MORCEGO = '<svg viewBox="0 0 64 28" aria-hidden="true"><path fill="#0d0a0f" d="M32 10c1.6-3 3-4 3-4l1 4c2-1 4-1 5 0 3-4 9-6 13-5-2 2-3 4-2 7 3-1 7 0 10 3-4 0-7 2-8 5-2-2-6-3-9-1-1-3-4-4-7-3-2 1-3 4-6 7-3-3-4-6-6-7-3-1-6 0-7 3-3-2-7-1-9 1-1-3-4-5-8-5 3-3 7-4 10-3 1-3 0-5-2-7 4-1 10 1 13 5 1-1 3-1 5 0l1-4s1.4 1 3 4z"/></svg>';

  var CHAPEU = '<svg class="ht-chapeu" viewBox="0 0 60 44" aria-hidden="true">' +
    '<path d="M27 4 C33 2 37 9 38 16 L44 33 L16 33 L24 14 C25 9 24 6 27 4Z" fill="#3b2a55"/>' +
    '<path d="M27 4 C31 3 34 6 35 10 C31 8 28 7 27 4Z" fill="#523b74"/>' +
    '<rect x="18.5" y="26" width="23" height="5" rx="1" fill="#f28c28"/>' +
    '<rect x="27" y="25.5" width="6" height="6" rx="1" fill="none" stroke="#ffd166" stroke-width="1.4"/>' +
    '<ellipse cx="30" cy="35" rx="29" ry="6" fill="#3b2a55"/><ellipse cx="30" cy="34" rx="22" ry="3" fill="#523b74"/></svg>';

  var CALDEIRAO = '<svg class="ht-caldeirao" viewBox="0 0 120 110" aria-hidden="true">' +
    '<g class="ht-bolhas" fill="#8bff6b">' +
    '<circle class="b1" cx="48" cy="40" r="5"/><circle class="b2" cx="66" cy="38" r="4"/>' +
    '<circle class="b3" cx="58" cy="42" r="6"/><circle class="b4" cx="74" cy="41" r="3"/></g>' +
    '<path class="ht-fumaca" d="M60 30 C52 22 68 16 60 6" stroke="#9ef08a" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<g class="ht-fogo"><path d="M38 104 C34 96 42 92 40 86 C48 92 48 100 44 104Z" fill="#f28c28"/>' +
    '<path d="M58 106 C52 96 62 90 60 80 C70 90 70 100 64 106Z" fill="#ffb347"/>' +
    '<path d="M78 104 C74 96 82 92 80 86 C88 92 88 100 84 104Z" fill="#f28c28"/></g>' +
    '<path d="M22 52 C22 90 40 100 60 100 C80 100 98 90 98 52Z" fill="#141018"/>' +
    '<path d="M30 58 C32 82 44 92 60 93" stroke="#2e2638" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="60" cy="52" rx="40" ry="9" fill="#1f1826"/>' +
    '<ellipse cx="60" cy="51" rx="33" ry="6" fill="#5fd14a"/><ellipse cx="54" cy="50" rx="14" ry="2.4" fill="#9ef08a" opacity=".7"/>' +
    '<path d="M18 52 C14 52 14 46 20 46 L100 46 C106 46 106 52 102 52" stroke="#2a2232" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';

  var ABOBORA = '<svg viewBox="0 0 48 44" aria-hidden="true"><path d="M23 6 C23 2 27 1 28 3 C26 4 25 6 25 9Z" fill="#3d6b2a"/>' +
    '<ellipse cx="14" cy="26" rx="11" ry="15" fill="#e8741c"/><ellipse cx="34" cy="26" rx="11" ry="15" fill="#e8741c"/>' +
    '<ellipse cx="24" cy="26" rx="12" ry="16" fill="#f28c28"/>' +
    '<path d="M15 21 L19 17 L21 23Z M33 21 L29 17 L27 23Z" fill="#2a1306"/>' +
    '<path d="M14 30 Q24 38 34 30 L31 30 L29 33 L26 30 L22 30 L19 33 L17 30Z" fill="#2a1306"/></svg>';

  function el(cls, html) { var d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); d.innerHTML = html; return d; }

  function decorar() {
    // Globinho do carregamento de chapéu de bruxa.
    var tonto = document.querySelector('.page-loader__globinho');
    if (tonto) tonto.src = tonto.getAttribute('src').replace('globinho-tonto.svg', 'globinho-hw-tonto.svg?v=54');
    var hero = document.querySelector('.hero');
    var evento = document.body.classList.contains('event-page');

    if (hero) {
      // Teias nos dois cantos do topo do hero, aranha descendo da direita e
      // morcegos cruzando o céu do hero (nada disso sai do hero: overflow hidden).
      hero.appendChild(el('ht-teia ht-teia--esq', teia(150)));
      hero.appendChild(el('ht-teia ht-teia--dir', teia(150)));
      hero.appendChild(el('ht-aranha ht-aranha--hero', '<span class="ht-fio"></span>' + ARANHA));
      var morcegos = el('ht-morcegos', '');
      for (var i = 0; i < 3; i++) morcegos.appendChild(el('ht-morcego ht-morcego--' + (i + 1), MORCEGO));
      hero.appendChild(morcegos);
    }

    if (!evento) {
      // Céu de Halloween: camada que ROLA com a página (17/10, 3ª rodada). Começa
      // logo abaixo do hero e nasce do escuro dele; antes era fixo na tela e
      // deslizava por baixo dos globos na rolagem.
      // sem hero (Squad, política): o céu fica atrás de texto corrido, então entra apagado
      var ceu = el('ht-ceu' + (hero ? '' : ' ht-ceu--sem-hero'), '');
      document.body.insertBefore(ceu, document.body.firstChild);
      var posiciona = function () {
        ceu.style.top = (hero ? hero.offsetTop + hero.offsetHeight : 0) + 'px';
      };
      posiciona();
      window.addEventListener('resize', posiciona);
      window.addEventListener('load', posiciona);
      var wrap = document.querySelector('.wrap');
      if (wrap) wrap.appendChild(el('ht-nevoa-fim', ''));
    }

    if (evento) {
      // Página da festa: o canto de cima à esquerda tem o "Voltar"; a teia e a
      // aranha ficam só no canto direito.
      document.body.appendChild(el('ht-teia ht-teia--pagina', teia(130)));
      document.body.appendChild(el('ht-aranha ht-aranha--pagina', '<span class="ht-fio"></span>' + ARANHA));
    }

    // Chapéu de bruxa no título das festas e caldeirão nas Perguntas Rápidas.
    Array.prototype.forEach.call(document.querySelectorAll('.section-title'), function (t) {
      var txt = t.textContent.trim().toLowerCase();
      if (txt === 'próximas festas') t.insertAdjacentHTML('afterbegin', CHAPEU);
      if (txt === 'perguntas rápidas') t.parentNode.insertBefore(el('ht-caldeirao-wrap', CALDEIRAO), t);
    });

    // Abóboras no rodapé.
    var footer = document.querySelector('footer');
    if (footer) footer.parentNode.insertBefore(el('ht-aboboras', ABOBORA + ABOBORA.replace('<svg ', '<svg class="ht-abobora--meio" ') + ABOBORA), footer);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorar);
  else decorar();
})();
