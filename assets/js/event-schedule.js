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

  // Quando a lista dessa festa fecha: explícito (data-list-close), ou
  // 23:59:59 do dia da festa (data-event-date) se não houver horário.
  // Extraído do stateFor em 09/09/2026 porque a pílula de urgência precisa
  // do mesmo horário — as duas coisas não podem divergir.
  function closeAtFor(eventDateStr, listCloseStr) {
    var closeAt = parseLocalDateTime(listCloseStr);
    if (closeAt) return closeAt;

    var eventDate = parseLocalDate(eventDateStr);
    if (!eventDate) return null; // sem nenhuma data não dá pra julgar
    closeAt = new Date(eventDate.getTime());
    closeAt.setHours(23, 59, 59, 999);
    return closeAt;
  }

  // Estado de uma festa: 'open' | 'closed' | 'gone'
  function stateFor(eventDateStr, listCloseStr, now) {
    var closeAt = closeAtFor(eventDateStr, listCloseStr);
    if (!closeAt) return 'open';

    // some de vez 24h DEPOIS de a lista fechar (pedido do João, 31/08).
    if (now.getTime() >= closeAt.getTime() + UM_DIA_MS) return 'gone';

    if (now >= closeAt) return 'closed';

    return 'open';
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // Texto da pílula de contagem (09/09/2026). Conta em DIAS DE CALENDÁRIO,
  // não em horas cheias: uma lista que fecha às 23:59 de hoje tem que dizer
  // "Fecha hoje", não "Faltam 0 dias".
  // 09/09, 2ª rodada: o João pediu a contagem em TODA festa aberta, não só
  // nas de 3 dias ou menos — a contagem longa também empurra pra decidir
  // agora. Sempre saída de data real; nunca inventa pressa.
  function urgencyLabel(closeAt, now) {
    if (!closeAt) return null;
    var dias = Math.round((startOfDay(closeAt) - startOfDay(now)) / UM_DIA_MS);
    if (dias < 0) return null;
    if (dias === 0) return 'Fecha hoje';
    if (dias === 1) return 'Fecha amanhã';
    return 'Faltam ' + dias + ' dias';
  }

  function byEventDateAsc(a, b) {
    var da = a.dataset.eventDate || '';
    var db = b.dataset.eventDate || '';
    return da < db ? -1 : da > db ? 1 : 0;
  }

  // ---------- INDEX: grade de cards ----------
  // Escrito pra poder rodar VÁRIAS VEZES na mesma página sem duplicar nada
  // (a pílula de urgência é atualizada, não recriada). É isso que deixa o
  // site se atualizar sozinho sem ninguém mexer: ver o agendamento no fim
  // do arquivo.
  function aplicarNoIndex() {
    var grid = document.querySelector('.event-grid');
    if (!grid) return; // sem grade (ou já trocada pelo estado vazio)

    var now = new Date();
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
        setUrgencia(card, null); // lista fechada não tem contagem
        closed.push(card);
        return;
      }

      // Festa aberta: contagem sempre visível, de "Faltam N dias" até
      // "Fecha hoje" (pedido do João, 09/09 — ele quer a contagem em toda
      // festa, não só nas próximas). Recalculada a cada passagem por aqui.
      setUrgencia(card, urgencyLabel(closeAtFor(card.dataset.eventDate, card.dataset.listClose), now));
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

  // Cria, atualiza ou remove a pílula de urgência de um card. Reaproveita a
  // pílula que já existe em vez de criar outra — sem isso, cada nova passagem
  // empilharia uma pílula a mais no mesmo card.
  function setUrgencia(card, label) {
    var pills = card.querySelector('.event-poster__pills');
    if (!pills) return;
    var chip = pills.querySelector('.event-poster__urgency');

    if (!label) {
      if (chip && chip.parentNode) chip.parentNode.removeChild(chip);
      return;
    }
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'event-poster__urgency';
      pills.appendChild(chip);
    }
    if (chip.textContent !== label) chip.textContent = label;
  }

  // ---------- PÁGINA DO EVENTO ----------
  // Se a lista dessa festa já fechou (ou já sumiu), a página não serve pra
  // mais nada — manda de volta pra home. `.replace()` não deixa a página
  // morta no histórico (o botão voltar não volta pra cá). O loader de tela
  // cheia ainda está por cima quando isto roda, então não pisca conteúdo.
  function checarPaginaDoEvento() {
    var form = document.getElementById('lista-form');
    if (!form) return;
    var stForm = stateFor(form.dataset.eventDate, form.dataset.listClose, new Date());
    if (stForm === 'closed' || stForm === 'gone') {
      window.location.replace('../index.html');
    }
  }

  // ---------- QUANDO ISTO RODA ----------
  // O site tem que se manter sozinho: ninguém edita "faltam N dias" na mão,
  // e nenhuma festa vencida fica acessível porque alguém esqueceu de tirar.
  // Por isso a checagem roda em quatro momentos, não só ao abrir a página:
  //
  //   1. agora (carregamento normal);
  //   2. `pageshow` — cobre o "voltar" do navegador. O celular guarda a
  //      página inteira em memória (bfcache) e a devolve SEM reexecutar
  //      script nenhum; sem isto, quem abrisse o site hoje e voltasse pra
  //      ele semana que vem veria a contagem congelada e um card de festa
  //      vencida ainda clicável;
  //   3. ao voltar pra aba (`visibilitychange`) — o caso do celular que fica
  //      dias com a aba aberta no bolso;
  //   4. a cada minuto com a página à vista, pra virada de dia e de horário
  //      limite acontecerem na tela de quem está olhando.
  //
  // A página de evento é checada em 1 e 2 de propósito, não em 3 e 4: se a
  // lista fechar com alguém digitando o nome no formulário, arrancar a
  // pessoa dali no meio seria pior que deixar ela terminar (a promoter
  // confirma cada nome na mão de qualquer jeito).
  function rodar() {
    aplicarNoIndex();
    checarPaginaDoEvento();
  }

  rodar();

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) rodar(); // veio do bfcache: estado pode estar velho
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) aplicarNoIndex();
  });

  setInterval(function () {
    if (!document.hidden) aplicarNoIndex();
  }, 60 * 1000);
})();
