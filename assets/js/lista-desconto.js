// Formulário "Lista de Desconto" de cada página de evento (eventos/{slug}.html).
// Externo (não inline) de propósito: alguns ambientes de preview local (ex.
// Live Server com CSP) bloqueiam <script> inline e deixam passar só arquivo
// externo — se isso acontecer aqui, o form cai no submit nativo do navegador
// (sem action definida) e o Live Server volta pro index.html, parecendo um
// bug de navegação quando na verdade é o JS que nunca rodou.
// Evento e número da promoter vêm de data-attributes no próprio <form>, pra
// manter o padrão de "copiar a página e trocar os dados" sem precisar tocar
// em JS por evento.
(function () {
  var form = document.getElementById('lista-form');
  if (!form) return;

  // Globinho comemorando depois do clique (29/09/2026): aparece ABAIXO do
  // botão, no fluxo da página (por cima ele cobria nome, preço e campos), com
  // o lembrete de apertar enviar no WhatsApp. Fica uns segundos e fecha.
  var festa = null, timer = null;
  function comemorar() {
    if (!festa) {
      festa = document.createElement('div');
      festa.className = 'globinho-festa-lista';
      festa.setAttribute('role', 'status');
      // Tema Halloween (17/10/2026): comemora de chapéu de bruxa.
      var pose = document.documentElement.classList.contains('tema-halloween') ? 'hw-comemora' : 'comemora';
      festa.innerHTML = '<img src="../assets/mascote/globinho-' + pose + '.svg?v=59" alt="" width="84" height="94">' +
        '<p>Agora é só tocar em <strong>enviar</strong> lá no WhatsApp!</p>';
      var btn = form.querySelector('button[type="submit"]');
      btn.parentNode.insertBefore(festa, btn.nextSibling);
    }
    // reflow pra reiniciar a transição se clicar de novo
    festa.classList.remove('is-visivel'); void festa.offsetWidth; festa.classList.add('is-visivel');
    clearTimeout(timer);
    timer = setTimeout(function () { festa.classList.remove('is-visivel'); }, 6000);
  }

  // Lembrar nome e telefone (16/10/2026): quem volta toda semana entra na
  // lista em 1 toque. Fica só no navegador da pessoa (citado na política de
  // privacidade). Navegador que bloqueia storage: o formulário segue normal.
  var CHAVE = 'r2g-contato';
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (salvo) {
      var fNome = document.getElementById('f-nome'), fTel = document.getElementById('f-telefone');
      if (salvo.nome && !fNome.value) fNome.value = salvo.nome;
      if (salvo.telefone && !fTel.value) fTel.value = salvo.telefone;
    }
  } catch (e) { /* sem storage */ }

  // Amigos (16/10/2026): a promoter aceita os nomes juntos, sem limite. Cada
  // toque em "+ Adicionar amigo" cria um campo com botão de tirar; os nomes vão
  // na mesma mensagem do WhatsApp. Campo vazio é ignorado.
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
        '<input type="text" id="' + id + '" class="amigo__nome" placeholder="Nome do amigo" autocomplete="off">' +
        '<button type="button" class="amigo__tirar" aria-label="Tirar este amigo">&times;</button>';
      linha.querySelector('.amigo__tirar').addEventListener('click', function () { linha.remove(); addAmigo.focus(); });
      caixaAmigos.appendChild(linha);
      linha.querySelector('input').focus();
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Obs: se a lista já fechou, event-schedule.js já mandou a página de
    // volta pra home antes disso rodar — não precisa de guarda aqui.
    var numeroPromoter = form.dataset.numero;
    var nomeEvento = form.dataset.evento;
    var nome = document.getElementById('f-nome').value.trim();
    var telefone = document.getElementById('f-telefone').value.trim();
    try { localStorage.setItem(CHAVE, JSON.stringify({ nome: nome, telefone: telefone })); } catch (err) { /* sem storage */ }
    var amigos = Array.prototype.map.call(form.querySelectorAll('.amigo__nome'), function (i) { return i.value.trim(); })
      .filter(Boolean);
    if (window.r2gMedir) window.r2gMedir(amigos.length ? 'lista_com_amigos' : 'lista_desconto', nomeEvento);

    var texto = 'Oi! Quero entrar na Lista de Desconto:\n' +
      'Evento: ' + nomeEvento + '\n' +
      'Nome: ' + nome + '\n' +
      'Telefone: ' + telefone;
    if (amigos.length) {
      texto += '\n\nAmigos (' + amigos.length + '):\n' + amigos.map(function (a) { return '- ' + a; }).join('\n');
    }

    var url = 'https://wa.me/' + numeroPromoter + '?text=' + encodeURIComponent(texto);
    window.open(url, '_blank');
    comemorar();
  });
})();
