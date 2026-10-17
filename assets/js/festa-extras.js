// Extras da festa (16/10/2026): medir cliques no Clarity, "Mandar pros
// amigos", "Salvar na agenda" e "Como chegar". Roda no index (só a medição
// do clique no card) e nas páginas de evento. Tudo sai dos data-attributes
// da página, pra manter o "copia a página e troca os dados".
(function () {
  // Evento no Clarity (grátis, já instalado): no painel dá pra ver quantos
  // pediram lista, camarote etc. em cada festa. Sem Clarity, não faz nada.
  function medir(evento, festa) {
    if (typeof window.clarity !== 'function') return;
    try {
      if (festa) window.clarity('set', 'festa', festa);
      window.clarity('event', evento);
    } catch (e) { /* medição nunca quebra o site */ }
  }
  window.r2gMedir = medir;

  // ---------- index: clique no card ----------
  Array.prototype.forEach.call(document.querySelectorAll('.event-poster'), function (card) {
    card.addEventListener('click', function () {
      var t = card.querySelector('.event-poster__title');
      medir('card_festa', t ? t.textContent.trim() : '');
    });
  });

  // ---------- página da festa ----------
  var acoes = document.querySelector('.festa-acoes');
  var form = document.getElementById('lista-form');
  var festa = form ? form.dataset.evento : '';

  var camarote = document.querySelector('.camarote-card a');
  if (camarote) camarote.addEventListener('click', function () { medir('camarote', festa); });

  if (!acoes) return;

  var aviso = null, avisoTimer = null;
  function avisar(texto) {
    if (!aviso) {
      aviso = document.createElement('p');
      aviso.className = 'festa-acoes__aviso';
      aviso.setAttribute('role', 'status');
      acoes.parentNode.insertBefore(aviso, acoes.nextSibling);
    }
    aviso.textContent = texto;
    aviso.classList.add('is-visivel');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { aviso.classList.remove('is-visivel'); }, 3000);
  }

  // Mandar pros amigos: folha de compartilhar do celular; no computador (ou se
  // o navegador não tiver), copia o link. O link chega no WhatsApp com flyer e
  // título, pelo og:image da página.
  var url = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
  var titulo = (document.querySelector('.event-title') || {}).textContent || document.title;
  acoes.querySelector('[data-acao="compartilhar"]').addEventListener('click', function () {
    medir('compartilhar', festa);
    var dados = { title: titulo.trim(), text: titulo.trim() + ': bora? Lista de desconto aqui', url: url };
    if (navigator.share) {
      navigator.share(dados).catch(function () { /* cancelou: tudo bem */ });
      return;
    }
    copiar(url);
  });
  function copiar(texto) {
    var ok = function () { avisar('Link copiado! Cola no grupo dos amigos.'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(ok, function () { avisar(texto); });
    } else {
      avisar(texto);
    }
  }

  // Salvar na agenda. Android: abre o Google Agenda já preenchido (o app do
  // Google não abre .ics baixado; a pessoa ficava com um arquivo solto).
  // iPhone, computador e o resto: .ics gerado na hora, que abre no calendário
  // do aparelho. Com data-hora vira evento das HH:mm até 4h depois; sem hora,
  // dia inteiro. Horário sempre de Cuiabá (-04:00 fixo, sem horário de verão
  // desde 2019), não do fuso do aparelho de quem toca.
  var FUSO = '-04:00';
  function dadosDoEvento() {
    var dia = (form && form.dataset.eventDate) || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return null;
    var hora = acoes.dataset.hora;
    var ev = { titulo: titulo.trim(), dia: dia, d: dia.replace(/-/g, ''), local: acoes.dataset.local || '',
               detalhes: 'Lista de desconto e camarote: ' + url };
    if (/^\d{2}:\d{2}$/.test(hora)) {
      ev.inicio = new Date(dia + 'T' + hora + ':00' + FUSO);
      ev.fim = new Date(ev.inicio.getTime() + 4 * 3600 * 1000);
    } else {
      var seguinte = new Date(dia + 'T12:00:00Z'); seguinte.setUTCDate(seguinte.getUTCDate() + 1);
      ev.diaSeguinte = seguinte.toISOString().slice(0, 10).replace(/-/g, '');
    }
    return ev;
  }
  // Hora local de Cuiabá em AAAAMMDDTHHMMSS (o Google lê junto com ctz).
  function horaCuiaba(dt) { return carimbo(new Date(dt.getTime() - 4 * 3600 * 1000)).replace('Z', ''); }

  acoes.querySelector('[data-acao="agenda"]').addEventListener('click', function () {
    var ev = dadosDoEvento();
    if (!ev) return;
    if (/Android/i.test(navigator.userAgent)) {
      medir('agenda_google', festa);
      var datas = ev.inicio ? horaCuiaba(ev.inicio) + '/' + horaCuiaba(ev.fim) : ev.d + '/' + ev.diaSeguinte;
      window.open('https://calendar.google.com/calendar/render?action=TEMPLATE' +
        '&text=' + encodeURIComponent(ev.titulo + ' · Ready 2 Go') +
        '&dates=' + datas +
        '&location=' + encodeURIComponent(ev.local) +
        '&details=' + encodeURIComponent(ev.detalhes) +
        '&ctz=America/Cuiaba', '_blank', 'noopener');
      return;
    }
    medir('agenda_ics', festa);
    var linhasData = ev.inicio
      ? ['DTSTART:' + carimbo(ev.inicio), 'DTEND:' + carimbo(ev.fim)]
      : ['DTSTART;VALUE=DATE:' + ev.d, 'DTEND;VALUE=DATE:' + ev.diaSeguinte];
    var alarme = ev.inicio ? 'TRIGGER:-PT6H' : 'TRIGGER:PT15H';
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ready 2 Go//Festas//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + ev.d + '-' + slug(ev.titulo) + '@ready-to-go-site.vercel.app',
      'DTSTAMP:' + carimbo(new Date()),
    ].concat(linhasData, [
      'SUMMARY:' + esc(ev.titulo + ' · Ready 2 Go'),
      'LOCATION:' + esc(ev.local),
      'DESCRIPTION:' + esc(ev.detalhes),
      'URL:' + url,
      'BEGIN:VALARM', alarme, 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Hoje tem ' + ev.titulo + '!'), 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ]).join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = slug(ev.titulo) + '-' + ev.dia + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  });
  function carimbo(dt) { return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function esc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function slug(s) {
    return String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'festa';
  }

  var mapa = acoes.querySelector('[data-acao="mapa"]');
  if (mapa) mapa.addEventListener('click', function () { medir('como_chegar', festa); });
})();
