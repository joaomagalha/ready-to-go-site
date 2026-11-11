/**
 * Ready 2 Go: repassa os nomes da lista de desconto do site pro VipMe.
 *
 * Por que existe: a API do VipMe não libera chamada direta do navegador
 * (sem CORS). Este Apps Script recebe os nomes do site e os entrega ao mesmo
 * endpoint que a página pública do VipMe usa (PublicPage/AddAttendings).
 * Essa API não é documentada pelo VipMe e pode mudar sem aviso: por isso o
 * site tem plano B (abre o WhatsApp da promoter com os nomes).
 *
 * Como instalar (uma vez):
 * 1. script.google.com > Novo projeto. Apagar o que vier, colar este arquivo
 *    inteiro e salvar.
 * 2. Implantar > Nova implantação > tipo "App da Web".
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 * 3. Autorizar com a conta do João e copiar o endereço que termina em /exec.
 *    Esse endereço vai na constante ENDPOINT_PADRAO de assets/js/lista-desconto.js.
 *
 * Se mudar este código depois: Implantar > Gerenciar implantações > editar
 * (lápis) > Versão: Nova versão. Assim o endereço /exec continua o mesmo.
 *
 * Este arquivo fica no repositório só como referência (fora do site pelo
 * .vercelignore). Não tem senha nem chave nenhuma aqui. O repositório é
 * público: quem ler isto vê as travas abaixo, então nenhuma delas depende
 * de segredo.
 *
 * Travas (revisão de segurança de 11/11/2026):
 * - Só aceita lista que (1) existe no VipMe, (2) pertence a uma das empresas
 *   abaixo, (3) é do evento informado, (4) está aberta e (5) pede só o campo
 *   nome. Casa nova (outra empresa no VipMe): acrescentar o idCompany em
 *   EMPRESAS e publicar nova versão.
 * - O promoter vem DAQUI (PROMOTER), nunca do site: ninguém credita nome a
 *   outro promoter. Outra promoter usando o site: mudar a constante.
 * - Limite de volume (global, porque o Apps Script não enxerga o IP de quem
 *   chama): por minuto, pedidos por dia e nomes por dia. Passou do limite, o
 *   site mostra o botão do WhatsApp (plano B). Só pedido que chegaria ao
 *   VipMe conta; pedido malformado é recusado antes e não gasta limite.
 * - Nome: só letras, espaço, apóstrofo, hífen e ponto, 2 a 80 caracteres e
 *   pelo menos 2 palavras.
 * Risco aceito pelo João (11/11/2026): quem souber o id de OUTRA lista aberta
 * da mesma empresa pode pôr nome nela (só escrita). Não há tabela de listas
 * permitidas porque cada festa nova exigiria mexer aqui.
 */

var API = 'https://api-v2.vipme.com.br/v2.0/PublicPage/';
var EMPRESAS = [13185];  // Vilarô (Arena das Atléticas, Nostalgic)
var PROMOTER = 54799;    // Vitória Matos no VipMe; o site não escolhe
var MAX_NOMES = 50;      // limite do próprio VipMe por envio

var LIMITE_POR_MINUTO = 30;   // pedidos ao VipMe por minuto, no total
var LIMITE_PEDIDOS_DIA = 2000; // pedidos por dia (cada um gasta 2 chamadas externas)
var LIMITE_NOMES_DIA = 3000;   // nomes por dia
var FUSO = 'America/Cuiaba';

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function limparNome(n) {
  return String(n == null ? '' : n).replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// Letras (com acento), espaço, apóstrofo, hífen e ponto. Não pode começar com
// símbolo (evita fórmula de planilha e marcação no painel do VipMe).
function nomeValido(n) {
  return n.length >= 2 && n.length <= 80 && n.split(' ').length >= 2 &&
    /^[\p{L}][\p{L} '’.\-]*$/u.test(n);
}

// Conta o pedido nos três limites. Devolve true se pode seguir. Falha fechado:
// se não conseguir a trava ou der erro, recusa.
function dentroDoLimite(qtdNomes) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return false;
  try {
    var p = PropertiesService.getScriptProperties();
    var agora = new Date();
    var kMin = 'min_' + Math.floor(agora.getTime() / 60000);
    var dia = Utilities.formatDate(agora, FUSO, 'yyyyMMdd');
    var kPed = 'ped_' + dia, kNom = 'nom_' + dia;
    var todas = p.getProperties();
    var nMin = Number(todas[kMin]) || 0;
    var nPed = Number(todas[kPed]) || 0;
    var nNom = Number(todas[kNom]) || 0;
    if (nMin >= LIMITE_POR_MINUTO || nPed >= LIMITE_PEDIDOS_DIA || nNom + qtdNomes > LIMITE_NOMES_DIA) {
      return false;
    }
    // Limpa contadores de minutos e dias antigos pra a lista não crescer.
    Object.keys(todas).forEach(function (k) {
      if ((k.indexOf('min_') === 0 && k !== kMin) ||
          ((k.indexOf('ped_') === 0 || k.indexOf('nom_') === 0) && k.slice(4) !== dia)) {
        p.deleteProperty(k);
      }
    });
    var novo = {};
    novo[kMin] = String(nMin + 1);
    novo[kPed] = String(nPed + 1);
    novo[kNom] = String(nNom + qtdNomes);
    p.setProperties(novo);
    return true;
  } catch (e) {
    return false;
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  try {
    var corpo = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var idEvent = Number(corpo.idEvent), idList = Number(corpo.idList);
    if (!(Number.isInteger(idEvent) && idEvent > 0 && Number.isInteger(idList) && idList > 0) ||
        !Array.isArray(corpo.names)) {
      return responder({ success: false, message: 'Pedido inválido' });
    }

    // Nomes: 1 a 50, só caracteres de nome, com sobrenome.
    var nomes = [];
    for (var i = 0; i < corpo.names.length; i++) {
      var n = limparNome(corpo.names[i]);
      if (!n) continue;
      if (!nomeValido(n)) {
        return responder({ success: false, message: 'Informe nome e sobrenome, só com letras' });
      }
      nomes.push(n);
    }
    if (nomes.length < 1 || nomes.length > MAX_NOMES) {
      return responder({ success: false, message: 'Envie de 1 a ' + MAX_NOMES + ' nomes' });
    }

    // Daqui pra baixo o pedido chega ao VipMe: conta no limite.
    if (!dentroDoLimite(nomes.length)) {
      return responder({ success: false, limited: true, message: 'Muitos envios agora, tente de novo em instantes' });
    }

    // Confere a lista no VipMe antes de entregar qualquer nome.
    var lista = JSON.parse(UrlFetchApp.fetch(
      API + 'GetEventListData?eventListId=' + idList,
      { muteHttpExceptions: true }
    ).getContentText() || '{}');
    var ld = lista.listDetail || {}, ev = lista.eventDetail || {}, cfg = lista.publicPageConfig || {};
    var campos = (ld.fields || []).map(function (c) { return c.fieldName; });
    if (ld.id !== idList || ev.id !== idEvent || EMPRESAS.indexOf(cfg.idCompany) < 0) {
      return responder({ success: false, message: 'Lista não reconhecida' });
    }
    if (ld.isClosed || ld.isLocked) {
      return responder({ success: false, message: 'Lista encerrada' });
    }
    if (campos.length !== 1 || campos[0] !== 'name') {
      return responder({ success: false, message: 'Lista pede outros dados' });
    }

    var r = UrlFetchApp.fetch(API + 'AddAttendings', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ idEvent: idEvent, idList: idList, idPromoter: PROMOTER, names: nomes }),
      muteHttpExceptions: true
    });
    var out = {};
    try { out = JSON.parse(r.getContentText()); } catch (x) { out = {}; }
    if (r.getResponseCode() >= 400 && out.success !== false) {
      out = { success: false, message: 'VipMe indisponível' };
    }
    return responder({
      success: !!out.success,
      message: out.message || '',
      addedCount: out.addedCount || 0,
      skippedNames: out.skippedNames || []
    });
  } catch (err) {
    return responder({ success: false, message: 'Erro ao processar' });
  }
}

// Abrir o endereço /exec no navegador só mostra que está de pé.
function doGet() {
  return responder({ ok: true, servico: 'Ready 2 Go · lista VipMe' });
}
