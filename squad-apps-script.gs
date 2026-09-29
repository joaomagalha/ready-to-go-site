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
 * .vercelignore). Não tem senha nem chave nenhuma aqui.
 */

var ABA = 'Inscrições';
var COLUNAS = [
  'Data e hora', 'Nome', 'Telefone', 'Instagram', 'Mora em Cuiabá',
  'Idade', 'Já divulgou eventos', 'Como conheceu', 'Por que quer participar',
  'Autorizou contato (LGPD)'
];
var CAMPOS = [
  'nome', 'telefone', 'instagram', 'cuiaba', 'idade', 'divulgou',
  'conheceu', 'motivo', 'consentimento'
];

function doPost(e) {
  var p = (e && e.parameter) || {};

  // Armadilha anti-robô preenchida ou envio sem consentimento: ignora.
  if (p.site || p.consentimento !== 'Sim') return ok_();

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
    if (aba.getLastRow() === 0) {
      aba.appendRow(COLUNAS);
      aba.setFrozenRows(1);
      aba.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
    }

    var agora = Utilities.formatDate(new Date(), 'America/Cuiaba', 'dd/MM/yyyy HH:mm');
    var linha = [agora].concat(CAMPOS.map(function (c) {
      // Corta texto gigante e evita que a planilha leia a resposta como
      // fórmula (texto começando com = + - @ vira fórmula no Sheets).
      var v = String(p[c] || '').slice(0, 1000);
      return /^[=+\-@]/.test(v) && c !== 'instagram' ? "'" + v : v;
    }));
    // O @ do Instagram é legítimo: grava como texto puro.
    linha[3] = "'" + linha[3].replace(/^'/, '');

    aba.appendRow(linha);
  } finally {
    lock.releaseLock();
  }
  return ok_();
}

function ok_() {
  return ContentService.createTextOutput('ok');
}
