/* Troca o vídeo do hero pela versão horizontal (16:9) em tela larga
   (28/09/2026). O vídeo de sempre é vertical (720x1280): esticado num
   monitor ele borra. Roda logo depois do <video> no HTML, antes de o
   navegador escolher a fonte, então o celular nunca baixa o arquivo
   horizontal. Sem JS, ou sem data-src-wide no <video>, fica o vertical. */
(function () {
  var video = document.querySelector('.hero-video');
  if (!video || !video.dataset.srcWide) return;
  if (!window.matchMedia('(min-width: 768px) and (min-aspect-ratio: 1/1)').matches) return;

  if (video.dataset.posterWide) video.poster = video.dataset.posterWide;
  video.src = video.dataset.srcWide;
  video.classList.add('is-wide');
})();
