// Tema sazonal do site (17/10/2026; Natal entrou em 10/11/2026). Carregado no
// <head> de todas as páginas: põe a classe no <html> antes de pintar (sem
// piscar) e, com a página pronta, injeta a decoração do tema escolhido. Cada
// tema tem a sua função aqui e o seu CSS (css/tema-halloween.css,
// css/tema-natal.css), só com seletores .tema-<nome>; desligado, o site volta
// ao de sempre.
//
// Temas disponíveis: 'halloween' e 'natal'.
// DESLIGAR O TEMA: trocar a linha abaixo por  var TEMA = '';
var TEMA = 'natal';

(function () {
  if (!TEMA) return;
  document.documentElement.classList.add('tema-' + TEMA);

  // ===================== HALLOWEEN (17/10/2026) =====================
  // Intacto desde 03/11 (desligado); só foi embrulhado nesta função em
  // 10/11/2026 pra conviver com o Natal. Religa com var TEMA = 'halloween'.
  function decoracaoHalloween() {
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
      if (tonto) tonto.src = tonto.getAttribute('src').replace('globinho-tonto.svg', 'globinho-hw-tonto.svg?v=59');
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
        // Degradê do fim do topo pro fundo (17/10, 4ª rodada): uma faixa só, na
        // largura da página, começando exatamente no fim do topo e rolando junto.
        if (hero) {
          var degrade = el('ht-degrade', '');
          document.body.insertBefore(degrade, hero.nextSibling);
          var posiciona = function () { degrade.style.top = (hero.offsetTop + hero.offsetHeight) + 'px'; };
          posiciona();
          window.addEventListener('resize', posiciona);
          window.addEventListener('load', posiciona);
        } else {
          document.body.classList.add('ht-sem-hero');   // Squad, política: véu mais escuro
        }
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
  }

  // ===================== NATAL (10/11/2026) =====================
  // Mesmo molde do Halloween: o visual mora em css/tema-natal.css (só
  // seletores .tema-natal) e aqui só entra a decoração, sempre aria-hidden e
  // pointer-events: none. Fundo: foto de bolas de espelho com fitas vermelhas
  // e luzinhas (assets/tema/natal-fundo-*.jpg), atrás da página.
  function decoracaoNatal() {
    function el(cls, html) { var d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); d.innerHTML = html; return d; }
    function sorteia(min, max) { return min + Math.random() * (max - min); }

    // Estrela de 5 pontas (pontos calculados, não desenhados à mão).
    function estrela(cx, cy, R, r) {
      var p = [];
      for (var i = 0; i < 10; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 5, raio = i % 2 ? r : R;
        p.push((cx + raio * Math.cos(a)).toFixed(1) + ',' + (cy + raio * Math.sin(a)).toFixed(1));
      }
      return p.join(' ');
    }

    // ---------- árvore + presentes (um SVG só, pra base ficar alinhada) ----------
    // Pinheiro em 3 camadas (a metade da direita de cada uma mais escura, dá
    // volume), festão dourado, bolinhas vermelhas e douradas, luzinhas que
    // piscam (classe nt-luz) e a estrela no topo. Presentes na frente do tronco.
    var ARVORE = '<svg viewBox="0 0 140 150" aria-hidden="true">' +
      '<rect x="54" y="124" width="12" height="16" rx="2" fill="#5a3a22"/>' +
      // camadas, de baixo pra cima
      '<path d="M60 56 L106 124 Q60 134 14 124 Z" fill="#1d6a3a"/><path d="M60 56 L106 124 Q84 130 60 131 Z" fill="#165a30"/>' +
      '<path d="M60 32 L94 90 Q60 99 26 90 Z" fill="#257f46"/><path d="M60 32 L94 90 Q78 96 60 97 Z" fill="#1d6a3a"/>' +
      '<path d="M60 12 L82 58 Q60 65 38 58 Z" fill="#2f9654"/><path d="M60 12 L82 58 Q71 62 60 63 Z" fill="#257f46"/>' +
      // festão dourado
      '<g fill="none" stroke="#f2c14e" stroke-width="1.6" stroke-linecap="round" opacity=".9">' +
      '<path d="M44 48 Q62 58 78 50"/><path d="M33 78 Q62 92 88 80"/><path d="M22 112 Q60 128 100 114"/></g>' +
      // bolinhas
      '<g><circle cx="50" cy="56" r="3.4" fill="#d62839"/><circle cx="70" cy="44" r="3" fill="#f2c14e"/>' +
      '<circle cx="40" cy="86" r="3.8" fill="#f2c14e"/><circle cx="66" cy="74" r="3.6" fill="#d62839"/><circle cx="84" cy="86" r="3.4" fill="#d62839"/>' +
      '<circle cx="30" cy="118" r="4" fill="#d62839"/><circle cx="56" cy="108" r="4" fill="#f2c14e"/><circle cx="80" cy="104" r="3.6" fill="#d62839"/><circle cx="96" cy="120" r="3.6" fill="#f2c14e"/>' +
      '<circle cx="49" cy="55" r="1" fill="#fff" opacity=".7"/><circle cx="65" cy="73" r="1.1" fill="#fff" opacity=".7"/><circle cx="29" cy="117" r="1.2" fill="#fff" opacity=".7"/></g>' +
      // luzinhas (piscam de 3 em 3 tempos diferentes)
      '<g fill="#fff3b0">' +
      '<circle class="nt-luz nt-luz--1" cx="58" cy="36" r="1.6"/><circle class="nt-luz nt-luz--2" cx="46" cy="66" r="1.6"/><circle class="nt-luz nt-luz--3" cx="76" cy="62" r="1.6"/>' +
      '<circle class="nt-luz nt-luz--1" cx="54" cy="84" r="1.6"/><circle class="nt-luz nt-luz--2" cx="74" cy="94" r="1.6"/><circle class="nt-luz nt-luz--3" cx="36" cy="100" r="1.6"/>' +
      '<circle class="nt-luz nt-luz--1" cx="88" cy="110" r="1.6"/><circle class="nt-luz nt-luz--2" cx="44" cy="118" r="1.6"/><circle class="nt-luz nt-luz--3" cx="68" cy="120" r="1.6"/></g>' +
      // estrela
      '<polygon points="' + estrela(60, 11, 10, 4.2) + '" fill="#ffd45e" stroke="#f2a93b" stroke-width=".8" stroke-linejoin="round"/>' +
      // presente vermelho (esquerda), laço dourado
      '<rect x="6" y="122" width="30" height="24" rx="1.5" fill="#c8202f"/><rect x="4" y="118" width="34" height="7" rx="1.5" fill="#e0303f"/>' +
      '<rect x="19" y="118" width="4" height="28" fill="#f2c14e"/>' +
      '<path d="M21 118 C14 108 8 114 13 118 Z M21 118 C28 108 34 114 29 118 Z" fill="#f2c14e"/>' +
      // presente branco com fita verde (meio, na frente do tronco)
      '<rect x="66" y="128" width="26" height="18" rx="1.5" fill="#f4f1ea"/><rect x="64" y="125" width="30" height="5" rx="1.2" fill="#ffffff"/>' +
      '<rect x="77" y="125" width="4" height="21" fill="#1f8a4c"/><rect x="66" y="135" width="26" height="3" fill="#1f8a4c"/>' +
      '<path d="M79 125 C73 117 68 122 72 125 Z M79 125 C85 117 90 122 86 125 Z" fill="#1f8a4c"/>' +
      // presente dourado (direita), fita vermelha
      '<rect x="98" y="114" width="36" height="32" rx="1.5" fill="#e2a93b"/><rect x="96" y="109" width="40" height="8" rx="1.5" fill="#f2c14e"/>' +
      '<rect x="114" y="109" width="5" height="37" fill="#b3122a"/><rect x="98" y="127" width="36" height="4" fill="#b3122a"/>' +
      '<path d="M116.5 109 C108 98 101 105 106 109 Z M116.5 109 C125 98 132 105 127 109 Z" fill="#b3122a"/></svg>';

    // ---------- gorro de Papai Noel (no lugar do chapéu de bruxa) ----------
    var GORRO = '<svg class="nt-gorro" viewBox="0 0 60 44" aria-hidden="true">' +
      '<path d="M12 33 C13 18 24 6 38 7 C47 8 53 15 52 25 C48 19 43 17 39 21 C38 25 40 29 42 33 Z" fill="#d62839"/>' +
      '<path d="M38 7 C47 8 53 15 52 25 C49 20 46 18 43 18 C44 13 42 9 38 7 Z" fill="#a8172a"/>' +
      '<rect x="8" y="29" width="38" height="10" rx="5" fill="#f5f2ee"/>' +
      '<circle cx="52" cy="26" r="5.5" fill="#f5f2ee"/></svg>';

    // ---------- neve na tela inteira ----------
    // Camada fixa por cima do conteúdo (z 30, abaixo do Globinho espiando e do
    // grão), sem pointer-events: nunca rouba clique. Cada floco cai só com
    // transform (o de fora desce, o de dentro balança de lado). Tamanho,
    // velocidade, deriva e atraso sorteados; atraso negativo = a tela já abre
    // com neve no meio do caminho, sem "chuva" começando lá de cima.
    // Movimento reduzido: não cria a camada (o CSS também esconde).
    function neve() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var celular = window.matchMedia && window.matchMedia('(max-width: 639px)').matches;
      var total = celular ? 22 : 40, html = '';
      for (var i = 0; i < total; i++) {
        var tam = sorteia(2, celular ? 5 : 6.5);
        var dur = sorteia(9, 18), atraso = -sorteia(0, 18);
        var cls = 'nt-floco' + (tam > 4.6 ? ' nt-floco--desfocado' : '');
        html += '<span class="' + cls + '" style="left:' + sorteia(0, 100).toFixed(1) + '%;' +
          'animation-duration:' + dur.toFixed(1) + 's;animation-delay:' + atraso.toFixed(1) + 's">' +
          '<i style="width:' + tam.toFixed(1) + 'px;height:' + tam.toFixed(1) + 'px;opacity:' + sorteia(0.35, 0.9).toFixed(2) + ';' +
          '--nt-deriva:' + sorteia(10, 32).toFixed(0) + 'px;animation-duration:' + sorteia(2.8, 5.5).toFixed(1) + 's;animation-delay:' + (-sorteia(0, 5)).toFixed(1) + 's"></i></span>';
      }
      document.body.appendChild(el('nt-neve', html));
    }

    // Troca a imagem do Globinho pela fantasia de Natal; se o arquivo novo
    // ainda não existir (ou falhar), volta pra original em vez de imagem quebrada.
    function trocaGlobinho(img, de, para) {
      if (!img) return;
      var original = img.getAttribute('src');
      if (original.indexOf(de) === -1) return;
      img.addEventListener('error', function volta() { img.removeEventListener('error', volta); img.src = original; });
      img.src = original.replace(de, para);
    }

    // ---------- vídeo de fundo, fixo atrás de tudo (10/11/2026) ----------
    // Primeiro filho do body, z-index -2 (abaixo do véu fixo body::before e do
    // .nt-degrade). Mesma media query do hero-video.js: tela larga e deitada
    // usa o 16:9, o resto o 9:16. Movimento reduzido: não cria o vídeo; o CSS
    // põe só o pôster no fundo. Se a tela vira (celular deitado), troca a fonte.
    function fundoVideo() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var largo = window.matchMedia('(min-width: 768px) and (min-aspect-ratio: 1/1)');
      var v = document.createElement('video');
      v.className = 'nt-video';
      v.setAttribute('aria-hidden', 'true');
      v.setAttribute('autoplay', '');
      v.setAttribute('muted', '');
      v.setAttribute('loop', '');
      v.setAttribute('playsinline', '');
      v.muted = true;          // a propriedade, não só o atributo: sem ela o autoplay é barrado
      v.defaultMuted = true;
      v.playsInline = true;
      // Caminho tirado do próprio tema.js (vale em qualquer pasta).
      var s = document.querySelector('script[src*="assets/js/tema.js"]');
      var base = s ? s.getAttribute('src').split('assets/js/tema.js')[0] : '';
      function fonte() {
        var f = largo.matches ? '16x9' : '9x16';
        if (v.getAttribute('data-f') === f) return;
        v.setAttribute('data-f', f);
        v.poster = base + 'assets/tema/natal-video-' + f + '.jpg';
        v.src = base + 'assets/tema/natal-video-' + f + '.mp4';
        var p = v.play();
        if (p && p.catch) p.catch(function () {});   // autoplay barrado: fica o pôster
      }
      fonte();
      if (largo.addEventListener) largo.addEventListener('change', fonte);
      document.body.insertBefore(v, document.body.firstChild);
    }

    function decorar() {
      var evento = document.body.classList.contains('event-page');
      var hero = document.querySelector('.hero');

      // Globinho do carregamento de gorro e o comemorando do Squad.
      trocaGlobinho(document.querySelector('.page-loader__globinho'), 'globinho-tonto.svg', 'globinho-xm-tonto.svg?v=66');
      trocaGlobinho(document.querySelector('.globinho-festa'), 'globinho-comemora.svg', 'globinho-xm-comemora.svg?v=66');

      // Neve em todas as páginas, inclusive as de festa (lá é só ela).
      neve();

      if (!evento) {
        // Vídeo de fundo (10/11/2026): um vídeo só, fixo atrás da página
        // inteira (cidade de Natal com neve e a árvore com o globo de espelho).
        // O dos globos do hero não baixa com o Natal (hero-video.js).
        fundoVideo();

        // Degradê do fim do topo pro fundo: começa transparente no fim do hero
        // e escurece rolando com o conteúdo (10/11/2026; antes era opaco).
        if (hero) {
          var degrade = el('nt-degrade', '');
          document.body.insertBefore(degrade, hero.nextSibling);
          var posiciona = function () { degrade.style.top = (hero.offsetTop + hero.offsetHeight) + 'px'; };
          posiciona();
          window.addEventListener('resize', posiciona);
          window.addEventListener('load', posiciona);
        } else {
          document.body.classList.add('nt-sem-hero');   // Squad, política: véu mais escuro
        }

        // Árvore com presentes: antes do rodapé. Em tela larga o CSS fixa no
        // canto de baixo à esquerda (sobra margem fora da coluna); no celular
        // e em tela média fica parada no fluxo, acima do rodapé, porque fixa
        // ela cobria cartão e botão. Nunca nas páginas de festa (botão fixo e
        // formulário).
        var arvore = el('nt-arvore', ARVORE);
        var footer = document.querySelector('footer');
        if (footer) footer.parentNode.insertBefore(arvore, footer);
        else document.body.appendChild(arvore);
      }

      // Gorro no título das festas (mesma técnica do chapéu de bruxa).
      Array.prototype.forEach.call(document.querySelectorAll('.section-title'), function (t) {
        if (t.textContent.trim().toLowerCase() === 'próximas festas') t.insertAdjacentHTML('afterbegin', GORRO);
      });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorar);
    else decorar();
  }

  // Escolhe a decoração pelo TEMA (10/11/2026).
  if (TEMA === 'halloween') decoracaoHalloween();
  else if (TEMA === 'natal') { semVideoDosGlobos(); decoracaoNatal(); }

  // Natal (10/11/2026): o vídeo dos globos do hero não pode baixar. O
  // hero-video.js sozinho chegava tarde: o parser para esperando o script e,
  // nesse meio tempo, o navegador já começava a baixar o <source> (até 786 KB
  // no teste antes de abortar). Este observador roda no <head>, antes de o
  // <video> existir, e tira fontes, pôster e autoplay assim que o parser cria
  // o elemento, antes de o navegador escolher a fonte. O hero-video.js segue
  // como segunda trava. Desliga sozinho quando a página termina de montar.
  function semVideoDosGlobos() {
    if (!window.MutationObserver) return;
    function limpa(v) {
      v.removeAttribute('autoplay');
      v.removeAttribute('poster');
      v.setAttribute('preload', 'none');
      Array.prototype.slice.call(v.querySelectorAll('source')).forEach(function (s) { s.parentNode.removeChild(s); });
    }
    var obs = new MutationObserver(function (lista) {
      lista.forEach(function (m) {
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          if (n.classList.contains('hero-video')) limpa(n);
          else if (n.tagName === 'SOURCE' && n.parentNode && n.parentNode.classList && n.parentNode.classList.contains('hero-video')) n.parentNode.removeChild(n);
        });
      });
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', function () { obs.disconnect(); });
  }
})();
