// Tela de carregamento (globo de espelho girando) antes do site aparecer.
// Este script fica logo no INÍCIO do <body> e roda de forma síncrona —
// se a sessionStorage já indica que a pessoa viu o loader nesta aba, marca
// <html class="no-loader"> ANTES do .page-loader ser sequer pintado, pra
// não piscar tela preta ao navegar entre páginas do site. Se ainda não viu,
// deixa o loader aparecer normalmente e agenda o sumiço mais abaixo.
(function () {
  var SESSION_KEY = 'r2gLoaderShown';
  // 29/09/2026: era 450/1400 ms. O João quer ver o Globinho girando e
  // ficando tonto antes do site abrir: um giro completo leva 1,6 s, então
  // ele fica no mínimo 2,6 s (e no máximo 3,4 s, mesmo com internet lenta).
  // Continua aparecendo só uma vez por aba.
  var MIN_MS = 2600;
  var MAX_MS = 3400;
  // Quem pediu menos movimento no aparelho vê o Globinho parado: segurar a
  // tela 2,6 s viraria só espera. Volta pro tempo curto de antes.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    MIN_MS = 450;
    MAX_MS = 1400;
  }

  var alreadyShown = false;
  try {
    alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch (e) {
    // Modo privado/sessionStorage bloqueado: melhor mostrar o loader do
    // que quebrar a página tentando ler o storage.
  }

  if (alreadyShown) {
    document.documentElement.classList.add('no-loader');
    return;
  }

  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch (e) {}

  var start = Date.now();

  function hide() {
    var loader = document.getElementById('page-loader');
    if (!loader || loader.classList.contains('is-hidden')) return;
    loader.classList.add('is-hidden');
    setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 550);
  }

  function hideRespectingMinimum() {
    var elapsed = Date.now() - start;
    var wait = Math.max(MIN_MS - elapsed, 0);
    setTimeout(hide, wait);
  }

  window.addEventListener('load', hideRespectingMinimum);
  // Teto de segurança: numa conexão lenta o `load` pode demorar (o vídeo
  // do hero, por exemplo) — o loader não pode travar a entrada no site.
  setTimeout(hide, MAX_MS);
})();
