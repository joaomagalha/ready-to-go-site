// Anima elementos .reveal ao entrarem na tela (fade + blur + sobe). Mesma
// ideia do design system de referência do João, sem framework nenhum.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    // 29/09/2026: era { threshold: 0.15 } (15% da ALTURA do elemento na tela).
    // Com 4 festas a seção "Próximas Festas" passou de 1.600px e precisava de
    // ~250px visíveis, mais do que cabe abaixo do botão do grupo num celular
    // de tela baixa: o primeiro card ficava invisível até rolar. Agora dispara
    // quando o TOPO do elemento entra 60px na tela, qualquer que seja a altura.
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
