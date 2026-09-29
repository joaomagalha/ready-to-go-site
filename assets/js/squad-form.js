// Formulário do Ready 2 Go Squad (squad.html, 28/09/2026).
// Mesmo padrão do lista-desconto.js: arquivo externo e configuração em
// data-attribute no <form>. As respostas vão pra uma planilha Google por um
// Apps Script publicado como app da Web (código em squad-apps-script.gs, fora
// do site). O endereço dele fica em data-endpoint.
//
// Envio em modo no-cors: o Apps Script não devolve os cabeçalhos de CORS, então
// o navegador não deixa ler a resposta. Se o fetch resolve, a requisição
// chegou; só erro de rede cai no catch. É o jeito padrão de usar Apps Script
// como receptor de formulário sem servidor.
(function () {
  var form = document.getElementById('squad-form');
  if (!form) return;

  var done = document.getElementById('squad-done');
  var status = document.getElementById('squad-status');
  var button = form.querySelector('button[type="submit"]');
  var buttonLabel = button.textContent;

  function setStatus(msg) { status.textContent = msg || ''; }

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
    var n = Number(idade.value);
    if (!Number.isInteger(n) || n < 1 || n > 120) {
      flag(idade);
      setStatus('Confere a idade: só o número, em anos.');
      return;
    }

    var endpoint = form.dataset.endpoint;
    if (!endpoint) {
      setStatus('As inscrições ainda não estão abertas. Tenta de novo mais tarde.');
      return;
    }

    var insta = form.elements.instagram.value.trim().replace(/^@+/, '');
    var data = new URLSearchParams();
    data.append('nome', form.elements.nome.value.trim());
    data.append('telefone', form.elements.telefone.value.trim());
    data.append('instagram', '@' + insta);
    data.append('cuiaba', form.querySelector('input[name="cuiaba"]:checked').value);
    data.append('idade', form.elements.idade.value.trim());
    data.append('divulgou', form.querySelector('input[name="divulgou"]:checked').value);
    data.append('conheceu', form.elements.conheceu.value.trim());
    data.append('motivo', form.elements.motivo.value.trim());
    data.append('consentimento', 'Sim');
    data.append('site', '');

    button.disabled = true;
    button.textContent = 'Enviando...';

    fetch(endpoint, { method: 'POST', mode: 'no-cors', body: data })
      .then(showDone)
      .catch(function () {
        button.disabled = false;
        button.textContent = buttonLabel;
        setStatus('Não deu certo. Confere sua internet e tenta de novo.');
      });
  });
})();
