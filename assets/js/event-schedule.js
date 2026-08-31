// Ciclo de vida das festas no site, 100% no cliente (sem backend, sem
// rebuild). Cada festa carrega duas marcações:
//   data-event-date="AAAA-MM-DD"      -> dia da festa (usado pra ordenar e
//                                        como fallback do horário de fecho)
//   data-list-close="AAAA-MM-DDTHH:mm" -> quando a lista fecha (opcional;
//                                        sem isso, fecha às 23:59 do dia)
// No index: ficam no <a class="event-poster">. Na página do evento: ficam
// no <form id="lista-form">.
//
// Duas fases, contadas a partir do FECHO DA LISTA:
//   1. lista fechou -> no index o card fica cinza, sem clique, e desce pro
//      fim da lista. Quem abrir o link direto da página da festa é mandado
//      de volta pra home.
//   2. 24h depois da lista fechar -> o card some do index de vez.
//
// Sem JS nada disso acontece (todos os cards e o form continuam visíveis) —
// é conveniência de exibição, não trava de segurança. A promoter confirma
// cada nome na mão de qualquer forma.

(function () {
  'use strict';

  // "AAAA-MM-DD" -> Date no fuso local (new Date("2026-08-28") seria UTC).
  function parseLocalDate(str) {
    if (!str) return null;
    var p = str.split('-');
    if (p.length !== 3) return null;
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  // "AAAA-MM-DDTHH:mm" -> Date local. Também aceita string vazia/ausente.
  function parseLocalDateTime(str) {
    if (!str) return null;
    var m = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  }

  var UM_DIA_MS = 24 * 60 * 60 * 1000;

  // Estado de uma festa: 'open' | 'closed' | 'gone'
  function stateFor(eventDateStr, listCloseStr, now) {
    // fechamento da lista: explícito (data-list-close), ou 23:59:59 do
    // dia da festa (data-event-date) se não houver horário.
    var closeAt = parseLocalDateTime(listCloseStr);
    if (!closeAt) {
      var eventDate = parseLocalDate(eventDateStr);
      if (!eventDate) return 'open'; // sem nenhuma data não dá pra julgar
      closeAt = new Date(eventDate.getTime());
      closeAt.setHours(23, 59, 59, 999);
    }

    // some de vez 24h DEPOIS de a lista fechar (pedido do João, 31/08).
    if (now.getTime() >= closeAt.getTime() + UM_DIA_MS) return 'gone';

    if (now >= closeAt) return 'closed';

    return 'open';
  }

  function byEventDateAsc(a, b) {
    var da = a.dataset.eventDate || '';
    var db = b.dataset.eventDate || '';
    return da < db ? -1 : da > db ? 1 : 0;
  }

  var now = new Date();

  // ---------- INDEX: grade de cards ----------
  var grid = document.querySelector('.event-grid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.event-poster'));
    var open = [];
    var closed = [];

    cards.forEach(function (card) {
      var st = stateFor(card.dataset.eventDate, card.dataset.listClose, now);

      if (st === 'gone') {
        if (card.parentNode) card.parentNode.removeChild(card);
        return;
      }

      if (st === 'closed') {
        // Lista fechada: o card fica cinza, desce pro fim da lista e vira só
        // um flyer DESATIVADO — não é mais clicável, não leva pra página do
        // evento (decisão do João + namorada, 31/08). Some de vez quando a
        // festa passa (ver o ramo 'gone' acima).
        card.classList.add('is-closed');
        card.removeAttribute('href');
        card.setAttribute('aria-disabled', 'true');
        var cta = card.querySelector('.event-poster__cta');
        if (cta) {
          // troca o texto "Garantir Meu Desconto" por "Lista encerrada"
          // (a seta ao lado é escondida via CSS em .is-closed)
          for (var i = 0; i < cta.childNodes.length; i++) {
            if (cta.childNodes[i].nodeType === 3 && cta.childNodes[i].nodeValue.trim()) {
              cta.childNodes[i].nodeValue = 'Lista encerrada';
              break;
            }
          }
        }
        closed.push(card);
        return;
      }

      open.push(card);
    });

    open.sort(byEventDateAsc);
    closed.sort(byEventDateAsc);

    // Reordena mantendo os cards entre os marcadores <!-- FESTAS:FIM --> /
    // ...:INÍCIO (se existirem no HTML), pra não jogar os cards pra depois do
    // comentário no DOM. Sem marcador, cai no fim da grade mesmo.
    var anchor = null;
    for (var n = 0; n < grid.childNodes.length; n++) {
      if (grid.childNodes[n].nodeType === 8 &&
          /FESTAS:FIM/.test(grid.childNodes[n].nodeValue)) {
        anchor = grid.childNodes[n];
        break;
      }
    }
    open.concat(closed).forEach(function (c) { grid.insertBefore(c, anchor); });

    if (open.length === 0 && closed.length === 0) {
      // Estado vazio: some o título "Próximas Festas" (fica órfão sem card) e
      // entra só uma frase que empurra pro grupo — o botão "Entrar no Grupo"
      // já está logo acima, não repete.
      var section = grid.parentNode;
      var title = section.querySelector('.section-title');
      if (title) title.hidden = true;

      var empty = document.createElement('p');
      empty.className = 'event-empty';
      empty.textContent = 'Nenhuma festa na agenda essa semana. A próxima é anunciada no grupo primeiro.';
      section.replaceChild(empty, grid);
    }
  }

  // ---------- PÁGINA DO EVENTO ----------
  // Se a lista dessa festa já fechou (ou já sumiu), a página não serve pra
  // mais nada — manda de volta pra home. `.replace()` não deixa a página
  // morta no histórico (o botão voltar não volta pra cá). O loader de tela
  // cheia ainda está por cima quando isto roda, então não pisca conteúdo.
  var form = document.getElementById('lista-form');
  if (form) {
    var stForm = stateFor(form.dataset.eventDate, form.dataset.listClose, now);
    if (stForm === 'closed' || stForm === 'gone') {
      window.location.replace('../index.html');
    }
  }
})();
