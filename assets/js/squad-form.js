// Formulário do Ready 2 Go Squad (squad.html, 28/09/2026).
// Mesmo padrão do lista-desconto.js: arquivo externo e configuração em
// data-attribute no <form>. As respostas vão pra uma planilha Google por um
// Apps Script publicado como app da Web (código em squad-apps-script.gs, fora
// do site). O endereço dele fica em data-endpoint.
//
// Envio como JSON em text/plain (não gera preflight, igual ao lista-desconto.js)
// pra poder LER a resposta do Apps Script: {success, message, limited, invalid}.
// A tela só diz "Inscrição recebida" quando success vem verdadeiro. Se o envio
// falhar (rede, limite, erro do Google), aparece o botão do WhatsApp da promoter
// com os dados já escritos. As mesmas regras de validação rodam no servidor
// (squad-apps-script.gs): aqui servem só pra avisar a pessoa antes de enviar.
(function () {
  var form = document.getElementById('squad-form');
  if (!form) return;

  var done = document.getElementById('squad-done');
  var status = document.getElementById('squad-status');
  var button = form.querySelector('button[type="submit"]');
  var buttonLabel = button.textContent;

  function setStatus(msg) { status.textContent = msg || ''; }

  // Mesma limpeza do servidor (limpar() no .gs): Unicode composto, sem
  // caracteres invisíveis nem de controle, espaços repetidos viram um só.
  function limpar(v) {
    return String(v == null ? '' : v).normalize('NFC')
      .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '')
      .replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Plano B: link do WhatsApp da promoter com a inscrição escrita. Só aparece
  // quando o envio não deu certo. Base fixa e número do data-numero (HTML do
  // autor); o texto digitado entra só dentro do encodeURIComponent.
  var planoB = null;
  function esconderPlanoB() {
    if (planoB && planoB.parentNode) planoB.parentNode.removeChild(planoB);
    planoB = null;
  }
  function mostrarPlanoB(d) {
    esconderPlanoB();
    var numero = form.dataset.numero;
    if (!numero) return;
    var texto = 'Oi! Quero entrar no Ready 2 Go Squad.\n' +
      'Nome: ' + d.nome + '\n' +
      'Telefone: ' + d.telefone + '\n' +
      'Instagram: ' + d.instagram + '\n' +
      'Mora em Cuiabá: ' + d.cuiaba + '\n' +
      'Idade: ' + d.idade + '\n' +
      'Já divulgou eventos: ' + d.divulgou + '\n' +
      'Como conheceu: ' + d.conheceu + '\n' +
      'Por que quer participar: ' + d.motivo;
    planoB = document.createElement('a');
    planoB.className = 'btn btn-secondary';
    planoB.href = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
    planoB.target = '_blank';
    planoB.rel = 'noopener';
    planoB.textContent = 'Enviar pelo WhatsApp';
    status.parentNode.insertBefore(planoB, status.nextSibling);
  }

  function showDone() {
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  // Marca o campo com problema e leva a pessoa até ele. Rádio e caixinha usam
  // o bloco em volta (fieldset / label) pra ganhar a borda vermelha.
  function flag(el) {
    var box = el.closest('.field-choice') || el.closest('.consent') || el;
    box.classList.add('is-invalid');
    el.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('input', function (e) {
    var box = e.target.closest('.is-invalid');
    if (box) box.classList.remove('is-invalid');
    setStatus('');
  });
  form.addEventListener('change', function (e) {
    var box = e.target.closest('.is-invalid');
    if (box) box.classList.remove('is-invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('');

    // Robô preencheu a armadilha: finge que deu certo e não envia.
    if (form.elements.site.value) { showDone(); return; }

    var required = form.querySelectorAll('[required]');
    for (var i = 0; i < required.length; i++) {
      var el = required[i];
      var ok = el.type === 'radio'
        ? !!form.querySelector('input[name="' + el.name + '"]:checked')
        : el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
      if (!ok) {
        flag(el);
        setStatus(el.type === 'checkbox'
          ? 'Marque a autorização pra enviar.'
          : 'Preencha todas as perguntas pra enviar.');
        return;
      }
    }

    // Idade: o novalidate desliga o min/max do HTML, então confere aqui.
    var idade = form.elements.idade;
    var idadeTxt = limpar(idade.value);
    var n = /^\d{1,3}$/.test(idadeTxt) ? Number(idadeTxt) : NaN;
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      flag(idade);
      setStatus('Confere a idade: só o número, em anos.');
      return;
    }
    // Idade mínima 18 (decisão da Vitória, 29/09/2026).
    if (n < 18) {
      flag(idade);
      setStatus('O Ready 2 Go Squad é só pra maiores de 18 anos.');
      return;
    }

    // Mesmas regras do servidor (squad-apps-script.gs), pra avisar antes.
    var nome = form.elements.nome;
    var nomeTxt = limpar(nome.value);
    if (nomeTxt.length < 2 || nomeTxt.split(' ').length < 2 ||
        !/^[\p{L}][\p{L} '’´.\-]*$/u.test(nomeTxt)) {
      flag(nome);
      setStatus('Confere o nome: nome e sobrenome, só com letras.');
      return;
    }
    var telefone = form.elements.telefone;
    var telTxt = limpar(telefone.value);
    var digitos = telTxt.replace(/\D/g, '');
    if (!/^[\d\s()+\-]+$/.test(telTxt) || digitos.length < 10 || digitos.length > 13) {
      flag(telefone);
      setStatus('Confere o telefone, com DDD.');
      return;
    }
    var instagram = form.elements.instagram;
    var insta = limpar(instagram.value).replace(/^@+/, '');
    if (!/^[A-Za-z0-9._]{1,30}$/.test(insta)) {
      flag(instagram);
      setStatus('Confere o Instagram: só o @ do perfil, sem link.');
      return;
    }

    var endpoint = form.dataset.endpoint;
    if (!endpoint) {
      setStatus('As inscrições ainda não estão abertas. Tenta de novo mais tarde.');
      return;
    }

    var dados = {
      nome: nomeTxt,
      telefone: telTxt,
      instagram: '@' + insta,
      cuiaba: form.querySelector('input[name="cuiaba"]:checked').value,
      idade: String(n),
      divulgou: form.querySelector('input[name="divulgou"]:checked').value,
      conheceu: limpar(form.elements.conheceu.value),
      motivo: limpar(form.elements.motivo.value),
      consentimento: 'Sim',
      site: ''
    };

    function falhou(msg, comPlanoB) {
      button.disabled = false;
      button.textContent = buttonLabel;
      setStatus(msg);
      if (comPlanoB) mostrarPlanoB(dados);
    }

    esconderPlanoB();
    button.disabled = true;
    button.textContent = 'Enviando...';

    var controle = typeof AbortController === 'function' ? new AbortController() : null;
    var relogio = controle ? setTimeout(function () { controle.abort(); }, 20000) : null;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(dados),
      signal: controle ? controle.signal : undefined
    })
      .then(function (r) { return r.json(); })
      .then(function (out) {
        if (relogio) clearTimeout(relogio);
        if (out && out.success === true) { showDone(); return; }
        if (out && out.invalid && out.message) {
          falhou(String(out.message) + '.', false);
        } else if (out && out.limited) {
          falhou('Muitos envios agora. Tenta de novo em instantes ou manda pelo WhatsApp.', true);
        } else {
          falhou('Não conseguimos registrar sua inscrição agora. Manda pelo WhatsApp, rapidinho.', true);
        }
      })
      .catch(function () {
        if (relogio) clearTimeout(relogio);
        falhou('Não deu certo. Confere sua internet e tenta de novo, ou manda pelo WhatsApp.', true);
      });
  });
})();
