/**
 * Ready 2 Go Squad: recebe as inscrições do squad.html e grava na planilha.
 *
 * Como instalar (uma vez):
 * 1. Na planilha "Ready 2 Go Squad · Inscrições": Extensões > Apps Script.
 * 2. Apagar o que vier no editor, colar este arquivo inteiro e salvar.
 * 3. Implantar > Nova implantação > tipo "App da Web".
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 * 4. Autorizar com a conta dona da planilha e copiar o endereço que termina
 *    em /exec. Esse endereço vai no data-endpoint do <form> em squad.html.
 *
 * Se mudar este código depois: Implantar > Gerenciar implantações > editar
 * (lápis) > Versão: Nova versão. Assim o endereço /exec continua o mesmo.
 *
 * Este arquivo fica no repositório só como referência (fora do site pelo
 * .vercelignore). Não tem senha nem chave nenhuma aqui. O repositório é
 * público: quem ler isto vê as travas abaixo, então nenhuma delas depende
 * de segredo.
 *
 * Travas (revisão de segurança de 12/11/2026):
 * - Tudo é conferido AQUI, não só no navegador: idade de 18 a 120, nome com
 *   sobrenome, telefone com 10 a 13 dígitos, Instagram só com letras, números,
 *   ponto e sublinhado, Sim/Não nas duas perguntas, textos com tamanho máximo.
 *   Pedido fora disso é recusado e não grava nada.
 * - Limite de volume global (o Apps Script não enxerga o IP de quem chama):
 *   por minuto e por dia. Passou do limite, o site mostra o botão do WhatsApp.
 *   Só pedido válido conta; pedido recusado não gasta limite.
 * - Texto que começa com = + - @ ganha um apóstrofo na frente pra planilha
 *   não ler como fórmula. Quem exportar a planilha pra CSV e abrir no Excel
 *   deve abrir pelo Google Planilhas ou importar como texto.
 * - Responde JSON: {success, message, limited, invalid}. O site só diz
 *   "Inscrição recebida" quando success vem verdadeiro.
 * - Aceita o formato novo (JSON em text/plain) e o antigo (formulário
 *   urlencoded), pra publicar o script antes do site sem janela de quebra.
 */

var ABA = 'Inscrições';
var COLUNAS = [
  'Data e hora', 'Nome', 'Telefone', 'Instagram', 'Mora em Cuiabá',
  'Idade', 'Já divulgou eventos', 'Como conheceu', 'Por que quer participar',
  'Autorizou contato (LGPD)'
];

var FUSO = 'America/Cuiaba';
var LIMITE_POR_MINUTO = 20;  // inscrições por minuto, no total
var LIMITE_POR_DIA = 500;    // inscrições por dia, no total
var MAX_NOME = 80;
var MAX_TELEFONE = 20;
var MAX_CONHECEU = 120;
var MAX_MOTIVO = 1000;

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Corpo novo: JSON em text/plain (e.postData.contents). Corpo antigo:
// formulário urlencoded (e.parameter). Devolve null se o JSON estiver quebrado.
function lerPedido(e) {
  var cru = e && e.postData && e.postData.contents;
  if (cru && /^\s*\{/.test(cru)) {
    try { return JSON.parse(cru); } catch (x) { return null; }
  }
  return (e && e.parameter) || {};
}

// Texto sem caracteres de controle, espaços repetidos nem pontas soltas.
// Só aceita texto ou número: lista ou objeto no campo vira vazio (e é recusado).
function limpar(v) {
  if (v == null || typeof v === 'object' || typeof v === 'function') return '';
  return String(v).normalize('NFC')
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '')   // invisíveis (largura zero, direção)
    .replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Confere tudo. Devolve {ok:true, dados:[...]} ou {ok:false, message}.
function validar(p) {
  var nome = limpar(p.nome);
  if (nome.length < 2 || nome.length > MAX_NOME || nome.split(' ').length < 2 ||
      !/^[\p{L}][\p{L} '’´.\-]*$/u.test(nome)) {
    return { ok: false, message: 'Confere o nome: nome e sobrenome, só com letras' };
  }

  var telefone = limpar(p.telefone);
  var digitos = telefone.replace(/\D/g, '');
  if (telefone.length > MAX_TELEFONE || !/^[\d\s()+\-]+$/.test(telefone) ||
      digitos.length < 10 || digitos.length > 13) {
    return { ok: false, message: 'Confere o telefone, com DDD' };
  }

  var insta = limpar(p.instagram).replace(/^@+/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(insta)) {
    return { ok: false, message: 'Confere o Instagram: só o @ do perfil' };
  }

  var cuiaba = limpar(p.cuiaba);
  var divulgou = limpar(p.divulgou);
  if ((cuiaba !== 'Sim' && cuiaba !== 'Não') || (divulgou !== 'Sim' && divulgou !== 'Não')) {
    return { ok: false, message: 'Responda as perguntas de Sim ou Não' };
  }

  var idadeTxt = limpar(p.idade);
  var idade = /^\d{1,3}$/.test(idadeTxt) ? Number(idadeTxt) : NaN;
  if (!(idade >= 18 && idade <= 120)) {
    return { ok: false, message: 'Confere a idade: o squad é só pra maiores de 18 anos' };
  }

  var conheceu = limpar(p.conheceu);
  var motivo = limpar(p.motivo);
  if (!conheceu || conheceu.length > MAX_CONHECEU || !motivo || motivo.length > MAX_MOTIVO) {
    return { ok: false, message: 'Confere os textos: preencha tudo, sem passar do limite' };
  }

  return {
    ok: true,
    dados: [nome, telefone, '@' + insta, cuiaba, String(idade), divulgou, conheceu, motivo, 'Sim']
  };
}

// Conta a inscrição nos dois limites. Quem chama já está com a trava
// (LockService). Devolve true se pode seguir. Falha fechado: erro recusa.
function dentroDoLimite() {
  try {
    var props = PropertiesService.getScriptProperties();
    var agora = new Date();
    var kMin = 'min_' + Math.floor(agora.getTime() / 60000);
    var kDia = 'dia_' + Utilities.formatDate(agora, FUSO, 'yyyyMMdd');
    var todas = props.getProperties();
    var nMin = Number(todas[kMin]) || 0;
    var nDia = Number(todas[kDia]) || 0;
    if (nMin >= LIMITE_POR_MINUTO || nDia >= LIMITE_POR_DIA) return false;

    // Limpa contadores de minutos e dias antigos pra a lista não crescer.
    Object.keys(todas).forEach(function (k) {
      if ((k.indexOf('min_') === 0 && k !== kMin) ||
          (k.indexOf('dia_') === 0 && k !== kDia)) {
        props.deleteProperty(k);
      }
    });
    var novo = {};
    novo[kMin] = String(nMin + 1);
    novo[kDia] = String(nDia + 1);
    props.setProperties(novo);
    return true;
  } catch (e) {
    return false;
  }
}

function doPost(e) {
  try {
    var p = lerPedido(e);
    if (!p) return responder({ success: false, invalid: true, message: 'Pedido inválido' });

    // Armadilha anti-robô preenchida: finge que deu certo e não grava.
    if (p.site) return responder({ success: true });
    // Sem consentimento (LGPD): não grava.
    if (p.consentimento !== 'Sim') {
      return responder({ success: false, invalid: true, message: 'Marque a autorização pra enviar' });
    }

    var v = validar(p);
    if (!v.ok) return responder({ success: false, invalid: true, message: v.message });

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      return responder({ success: false, limited: true, message: 'Muitos envios agora, tente de novo em instantes' });
    }
    try {
      if (!dentroDoLimite()) {
        return responder({ success: false, limited: true, message: 'Muitos envios agora, tente de novo em instantes' });
      }

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var aba = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
      if (aba.getLastRow() === 0) {
        aba.appendRow(COLUNAS);
        aba.setFrozenRows(1);
        aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
      }

      var agora = Utilities.formatDate(new Date(), FUSO, 'dd/MM/yyyy HH:mm');
      // Texto começando com = + - @ viraria fórmula no Sheets: apóstrofo na
      // frente. O @ do Instagram é legítimo e sempre vai como texto puro.
      var linha = [agora].concat(v.dados.map(function (t, i) {
        return (i === 2 || /^[=+\-@]/.test(t)) ? "'" + t : t;
      }));
      aba.appendRow(linha);
    } finally {
      lock.releaseLock();
    }
    return responder({ success: true });
  } catch (err) {
    return responder({ success: false, message: 'Erro ao processar' });
  }
}

// Abrir o endereço /exec no navegador só mostra que está de pé.
function doGet() {
  return responder({ ok: true, servico: 'Ready 2 Go · squad' });
}
