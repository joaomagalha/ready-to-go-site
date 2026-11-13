// Formulário "Lista de Desconto" de cada página de evento (eventos/{slug}.html).
// Externo (não inline) de propósito: alguns ambientes de preview local (ex.
// Live Server com CSP) bloqueiam <script> inline e deixam passar só arquivo
// externo — se isso acontecer aqui, o form cai no submit nativo do navegador
// (sem action definida) e o Live Server volta pro index.html, parecendo um
// bug de navegação quando na verdade é o JS que nunca rodou.
// Evento e número da promoter vêm de data-attributes no próprio <form>, pra
// manter o padrão de "copiar a página e trocar os dados" sem precisar tocar
// em JS por evento.
//
// Dois jeitos de entrar na lista (11/11/2026):
// 1) Festa com lista no VipMe (o <form> tem data-vipme-endpoint, -evento e
//    -lista): o nome e os amigos vão direto pro VipMe por um Apps Script
//    (vipme-apps-script.gs). A pessoa não sai do site e a promoter não digita
//    nada. Se o envio falhar, aparece o plano B: botão que abre o WhatsApp da
//    promoter com os nomes.
// 2) Festa sem VipMe: o jeito antigo, abre o WhatsApp com a mensagem pronta.
// O telefone deixou de ser coletado em 11/11/2026 (decisão do João).
(function () {
  var form = document.getElementById('lista-form');
  if (!form) return;

  // Endereço /exec do Apps Script (vipme-apps-script.gs), o mesmo pra toda
  // festa. Vazio = nenhuma festa usa o VipMe ainda e todas caem no WhatsApp.
  // Uma página pode trocar com data-vipme-endpoint no <form>.
  var ENDPOINT_PADRAO = 'https://script.google.com/macros/s/AKfycbw3phDIKzGOh88mZz1ufymIPVcUGKipbwrTcCQsMdMYAaW_lHpxapaI8OG7pToM8mmkNw/exec';
  var endpoint = form.dataset.vipmeEndpoint || ENDPOINT_PADRAO;
  var idEvento = form.dataset.vipmeEvento || '';
  var idLista = form.dataset.vipmeLista || '';
  var usaVipme = !!(endpoint && idEvento && idLista);

  var botao = form.querySelector('button[type="submit"]');
  // No modo VipMe o aviso e o botão não falam mais de WhatsApp.
  if (usaVipme) {
    var nota = form.querySelector('.form-note');
    if (nota) nota.innerHTML = 'Seu nome entra direto na lista, sem sair do site.<br>Coloque <strong>nome e sobrenome</strong>.<br>O nome na lista vale até <strong>meia-noite</strong>.';
    var icone = botao.querySelector('svg');
    if (icone) icone.remove();
  }
  var rotuloBotao = botao.innerHTML;

  // Globinho comemorando depois do envio (29/09/2026): aparece ABAIXO do
  // botão, no fluxo da página (por cima ele cobria nome, preço e campos).
  // Fica uns segundos e fecha. O texto muda conforme o jeito de entrar.
  var festa = null, timer = null;
  // ATENÇÃO: htmlTexto vai em innerHTML. Só texto fixo do código; nunca nome ou
  // resposta do servidor (isso entra por avisar(), que usa textContent).
  function comemorar(htmlTexto) {
    if (!festa) {
      festa = document.createElement('div');
      festa.className = 'globinho-festa-lista';
      festa.setAttribute('role', 'status');
      // Tema Halloween (17/10/2026): comemora de chapéu de bruxa.
      var pose = document.documentElement.classList.contains('tema-halloween') ? 'hw-comemora' : 'comemora';
      festa.innerHTML = '<img src="../assets/mascote/globinho-' + pose + '.svg?v=59" alt="" width="84" height="94"><p></p>';
      botao.parentNode.insertBefore(festa, botao.nextSibling);
    }
    festa.querySelector('p').innerHTML = htmlTexto;
    // reflow pra reiniciar a transição se clicar de novo
    festa.classList.remove('is-visivel'); void festa.offsetWidth; festa.classList.add('is-visivel');
    clearTimeout(timer);
    timer = setTimeout(function () { festa.classList.remove('is-visivel'); }, 6000);
  }

  // Mensagem de estado (erro, repetido, plano B) logo abaixo do botão.
  var aviso = null;
  function avisar(texto, erro) {
    if (!aviso) {
      aviso = document.createElement('p');
      aviso.className = 'form-note form-status';
      aviso.setAttribute('role', 'status');
      aviso.setAttribute('data-clarity-mask', 'true'); // nomes que voltam do VipMe não vão pro Clarity
      botao.parentNode.insertBefore(aviso, botao.nextSibling);
    }
    aviso.className = 'form-note form-status' + (erro ? ' form-status--erro' : '');
    aviso.textContent = texto;
    return aviso;
  }
  function limparAviso() { if (aviso) { aviso.remove(); aviso = null; } }

  // Lembrar o nome (16/10/2026; só o nome desde 11/11/2026): quem volta toda
  // semana entra na lista em 1 toque. Fica só no navegador da pessoa (citado
  // na política de privacidade). Navegador que bloqueia storage: o formulário
  // segue normal. Um telefone guardado por versões antigas é apagado.
  var CHAVE = 'r2g-contato';
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (salvo) {
      var fNome = document.getElementById('f-nome');
      if (salvo.nome && !fNome.value) fNome.value = salvo.nome;
      if (salvo.telefone) localStorage.setItem(CHAVE, JSON.stringify({ nome: salvo.nome || '' }));
    }
  } catch (e) { /* sem storage */ }

  // Amigos (16/10/2026): a promoter aceita os nomes juntos, sem limite. Cada
  // toque em "+ Adicionar amigo" cria um campo com botão de tirar; os nomes vão
  // juntos no mesmo envio. Campo vazio é ignorado. O VipMe aceita até 50 por vez.
  var caixaAmigos = document.getElementById('amigos');
  var addAmigo = document.getElementById('add-amigo');
  var nAmigo = 0;
  if (caixaAmigos && addAmigo) {
    addAmigo.addEventListener('click', function () {
      nAmigo++;
      var linha = document.createElement('div');
      linha.className = 'amigo';
      var id = 'f-amigo-' + nAmigo;
      linha.innerHTML = '<label class="visually-hidden" for="' + id + '">Nome do amigo</label>' +
        '<input type="text" id="' + id + '" class="amigo__nome" placeholder="Nome e sobrenome do amigo" autocomplete="off" maxlength="80">' +
        '<button type="button" class="amigo__tirar" aria-label="Tirar este amigo">&times;</button>';
      linha.querySelector('.amigo__tirar').addEventListener('click', function () { linha.remove(); addAmigo.focus(); });
      caixaAmigos.appendChild(linha);
      linha.querySelector('input').focus();
    });
  }

  function textoWhatsApp(nomeEvento, nome, amigos) {
    var texto = 'Oi! Quero entrar na Lista de Desconto:\n' +
      'Evento: ' + nomeEvento + '\n' +
      'Nome: ' + nome;
    if (amigos.length) {
      texto += '\n\nAmigos (' + amigos.length + '):\n' + amigos.map(function (a) { return '- ' + a; }).join('\n');
    }
    return texto;
  }

  // Jeito antigo (e plano B): link do WhatsApp da promoter com a mensagem pronta.
  function urlWhatsApp(nomeEvento, nome, amigos) {
    return 'https://wa.me/' + form.dataset.numero + '?text=' +
      encodeURIComponent(textoWhatsApp(nomeEvento, nome, amigos));
  }

  // O VipMe pede nome e sobrenome, e o Apps Script só aceita letras, espaço,
  // apóstrofo, hífen e ponto (mesma regra de nomeValido() no .gs). Devolve o
  // campo com problema e o motivo, ou null.
  var SO_LETRAS = /^[\p{L}][\p{L} '’´.\-]*$/u;

  // Mesma limpeza do servidor (limparNome no .gs): Unicode composto, sem
  // caracteres invisíveis nem de controle, espaços repetidos viram um só.
  function limpar(v) {
    return String(v == null ? '' : v).normalize('NFC')
      .replace(/\u200b/g, ' ')
      .replace(/[\u200c-\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\u00ad\u180e\ufeff]/g, '')
      .replace(/[\u0080-\u009f]/g, ' ')
      .replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function campoInvalido(campos) {
    for (var i = 0; i < campos.length; i++) {
      var v = limpar(campos[i].value);
      if (!v) continue;
      if (v.split(' ').length < 2) return { campo: campos[i], msg: 'Coloque nome e sobrenome, como no documento.' };
      if (!SO_LETRAS.test(v) || v.length > 80) return { campo: campos[i], msg: 'Use só letras no nome (sem números ou símbolos), até 80 caracteres.' };
    }
    return null;
  }

  function enviarVipme(nomes) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var corte = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    // text/plain evita o preflight de CORS, que o Apps Script não responde.
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        idEvent: Number(idEvento), idList: Number(idLista), names: nomes
      }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(corte);
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }, function (err) { clearTimeout(corte); throw err; });
  }

  var enviando = false;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (enviando) return;
    // Esconde a comemoração do envio anterior (senão ela ficaria ao lado de um erro).
    if (festa) festa.classList.remove('is-visivel');
    // Obs: se a lista já fechou, event-schedule.js já mandou a página de
    // volta pra home antes disso rodar — não precisa de guarda aqui.
    var nomeEvento = form.dataset.evento;
    var campoNome = document.getElementById('f-nome');
    var campoAmigos = Array.prototype.slice.call(form.querySelectorAll('.amigo__nome'));
    var ruim = campoInvalido([campoNome].concat(campoAmigos));
    if (usaVipme && ruim) {
      limparAviso();
      avisar(ruim.msg, true);
      ruim.campo.focus();
      return;
    }
    var nome = limpar(campoNome.value);
    try { localStorage.setItem(CHAVE, JSON.stringify({ nome: nome })); } catch (err) { /* sem storage */ }
    var amigos = campoAmigos.map(function (i) { return limpar(i.value); }).filter(Boolean);
    if (window.r2gMedir) window.r2gMedir(amigos.length ? 'lista_com_amigos' : 'lista_desconto', nomeEvento);

    if (!usaVipme) {
      window.open(urlWhatsApp(nomeEvento, nome, amigos), '_blank', 'noopener');
      comemorar('Agora é só tocar em <strong>enviar</strong> lá no WhatsApp!');
      return;
    }

    var nomes = [nome].concat(amigos);
    if (nomes.length > 50) {
      limparAviso();
      avisar('São no máximo 50 nomes por vez. Tire alguns e envie de novo.', true);
      return;
    }
    enviando = true;
    botao.disabled = true;
    botao.textContent = 'Enviando...';
    limparAviso();

    enviarVipme(nomes).then(function (res) {
      enviando = false; botao.disabled = false; botao.innerHTML = rotuloBotao;
      var repetidos = (res && Array.isArray(res.skippedNames) && res.skippedNames) || [];
      // O servidor só devolve nomes que o pedido enviou; skippedCount avisa que
      // o VipMe achou repetido mesmo quando nenhum nome casou.
      var qtdRepetidos = Math.max(repetidos.length, Number(res && res.skippedCount) || 0);
      if (res && res.success) {
        if (window.r2gMedir) window.r2gMedir('lista_vipme_ok', nomeEvento);
        comemorar(nomes.length > 1 ? 'Pronto! Seus nomes já estão na lista.' : 'Pronto! Seu nome já está na lista.');
        if (repetidos.length) avisar('Já estavam na lista: ' + repetidos.join(', ') + '.', false);
        else if (qtdRepetidos) avisar('Alguns nomes já estavam na lista.', false);
        return;
      }
      if (qtdRepetidos && !(res && res.addedCount)) {
        avisar(repetidos.length
          ? 'Esse nome já estava na lista: ' + repetidos.join(', ') + '. Está tudo certo!'
          : 'Esse nome já estava na lista. Está tudo certo!', false);
        return;
      }
      var msg = (res && res.message) || '';
      // Lista encerrada ou nome fora do padrão: é resposta do servidor, não falha.
      if (/encerrada|nome e sobrenome|só com letras/i.test(msg)) { avisar(msg + '.', true); return; }
      planoB(nomeEvento, nome, amigos);
    }, function () {
      enviando = false; botao.disabled = false; botao.innerHTML = rotuloBotao;
      planoB(nomeEvento, nome, amigos);
    });
  });

  // Plano B: não deu pra enviar sozinho (VipMe fora do ar, sem internet...).
  // Em vez de perder a pessoa, oferece o WhatsApp da promoter com os nomes.
  function planoB(nomeEvento, nome, amigos) {
    if (window.r2gMedir) window.r2gMedir('lista_vipme_falha', nomeEvento);
    var p = avisar('Não consegui colocar seu nome na lista agora. Toque abaixo pra mandar pelo WhatsApp:', true);
    var a = document.createElement('a');
    a.className = 'btn btn-secondary form-status__wa';
    a.href = urlWhatsApp(nomeEvento, nome, amigos);
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-whatsapp"></use></svg>Enviar pelo WhatsApp';
    p.appendChild(document.createElement('br'));
    p.appendChild(a);
  }
})();
