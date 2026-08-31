// Ciclo de vida das festas no site, 100% no cliente (sem backend, sem
// rebuild). Cada festa carrega duas marcações:
//   data-event-date="AAAA-MM-DD"      -> dia da festa
//   data-list-close="AAAA-MM-DDTHH:mm" -> quando a lista fecha (opcional;
//                                         sem isso, fecha às 23:59 do dia)
// No index: ficam no <a class="event-poster">. Na página do evento: ficam
// no <form id="lista-form">.
//
// Duas fases:
//   1. passou o horário limite da lista  -> card fica cinza, sem clique, e
//      desce pro fim da lista; a página do evento troca o form por um aviso.
//   2. passou o dia da festa (dia seguinte, 00:00) -> o card some do DOM;
//      a página do evento mostra "essa festa já rolou".
//
// Sem JS nada disso acontece (todos os cards e o form continuam visíveis) —
// é conveniência de exibição, não trava de segurança. A promoter confirma
// cada nome na mão de qualquer forma.

(function () {
  'use strict';

  // Mesmo grupo usado nos botões "Entrar no Grupo" do index.
  var GRUPO_URL = 'https://chat.whatsapp.com/BZMm1JILP1AH6zoZYNUq5I?mode=gi_t';

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

  // Estado de uma festa: 'open' | 'closed' | 'gone'
  function stateFor(eventDateStr, listCloseStr, now) {
    var eventDate = parseLocalDate(eventDateStr);
    if (!eventDate) return 'open'; // sem data não dá pra julgar — mantém

    // fechamento da lista: explícito, ou 23:59:59 do dia da festa
    var closeAt = parseLocalDateTime(listCloseStr);
    if (!closeAt) {
      closeAt = new Date(eventDate.getTime());
      closeAt.setHours(23, 59, 59, 999);
    }

    // "sumiu de vez" = já passou o dia da festa (dia seguinte, 00:00) E a
    // lista já fechou. O "E a lista já fechou" cobre horário limite depois da
    // meia-noite (ex. lista até 1h da manhã de sábado numa festa de sexta) —
    // sem isso o card sumiria antes de a lista fechar de verdade.
    var dayAfter = new Date(eventDate.getTime());
    dayAfter.setDate(dayAfter.getDate() + 1);
    dayAfter.setHours(0, 0, 0, 0);
    if (now >= dayAfter && now >= closeAt) return 'gone';

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
        // Fica cinza e desce pro fim, mas continua clicável de propósito:
        // leva pra página da festa, que mostra o flyer + "lista encerrada" +
        // botão do grupo. Página útil, não card morto.
        card.classList.add('is-closed');
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

  // ---------- PÁGINA DO EVENTO: formulário da lista ----------
  var form = document.getElementById('lista-form');
  if (form) {
    var stForm = stateFor(form.dataset.eventDate, form.dataset.listClose, now);

    if (stForm === 'closed' || stForm === 'gone') {
      form.dataset.listClosed = '1';
      form.hidden = true;

      var cover = document.querySelector('.event-cover');
      if (cover) cover.classList.add('is-dimmed');

      var gone = stForm === 'gone';
      var box = document.createElement('div');
      box.className = 'list-closed';
      box.innerHTML =
        '<p class="list-closed__title">' +
          (gone ? 'Essa festa já rolou' : 'Lista encerrada') +
        '</p>' +
        '<p class="list-closed__text">' +
          (gone
            ? 'A próxima cai no grupo primeiro.'
            : 'A lista dessa festa já fechou.') +
        '</p>' +
        '<a class="btn btn-primary" href="' + GRUPO_URL + '" target="_blank" rel="noopener">' +
          '<svg class="icon" aria-hidden="true"><use href="#i-whatsapp"></use></svg>' +
          'Entrar no Grupo' +
        '</a>' +
        '<p class="list-closed__back"><a href="../index.html">Ver as próximas festas</a></p>';

      form.parentNode.insertBefore(box, form);
    }
  }
})();
