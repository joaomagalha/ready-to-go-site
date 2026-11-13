# Ready 2 Go

Site link-in-bio de festas em Cuiabá. Estático: HTML, CSS e JS puros, sem
build e sem backend. Push no `main` = deploy automático na Vercel.

## Sessão na nuvem (Claude no celular / claude.ai/code)

- **Commit direto no `main` e `git push origin main`.** Nunca criar branch nem
  PR: numa branch a Vercel só gera prévia e o site oficial não muda.
- O flyer chega anexado na conversa: salvar em `assets/eventos/{slug}.jpg` e
  seguir os passos abaixo. Sem `sips` (Linux), comprimir com Python/Pillow
  (`thumbnail((720, 1280))`, `quality=55`) ou ImageMagick, mesmo alvo de ~150 KB.
- Antes do push, conferir: nenhum `{{PLACEHOLDER}}` sobrando na página nova,
  `data-event-date` igual no card e na página, card em ordem cronológica.
- No fim, mandar pro João o link da página nova
  (`https://ready-to-go-site.vercel.app/eventos/{slug}.html`) pra ele conferir.

## Como cadastrar uma festa nova

O João manda por chat: **flyer** (uma imagem só), **dia**, **horário limite
da lista** (se tiver), **nome da lista** (ex. "Lista de Desconto"), **valor**,
**casa/local**, **DJ/artista**.

Regras fixas de cadastro (não perguntar):
- **WhatsApp da promoter é sempre `5565993475757`** — o mesmo pra toda festa.
  Nunca perguntar de novo, nunca usar outro número.
  **Exceção (21/10/2026):** quando a promoter disser que as infos de uma festa
  vão pra outra pessoa da equipe dela, lista e camarote dessa festa usam o
  número que ela indicar (o número fica no `CLAUDE.local.md`, fora do git: é de
  uma terceira pessoa e o repo é público). Só nessa festa; as outras seguem no fixo.
- **Título do card e da página = nome da FESTA**, não de quem organiza
  (ex. "HALTERADOS", não "Atlética Tormenta"). Respeitar o caixa do flyer:
  se a marca é toda maiúscula no flyer, o título vai maiúsculo.
- **`event-poster__meta` (card):** `DD.MM · Dia-da-semana · gancho`. O 3º
  campo é o artista quando há um nome forte; quando são vários DJs locais,
  trocar pelo argumento de venda (ex. "Open Bar a Noite Toda").
- **`event-poster__price` (card):** o valor da lista, curto, sem centavos
  (`R$60`). Desde 09/09/2026 o preço aparece no card, não só na página —
  "quanto custa?" era a pergunta que só era respondida depois do clique.
  Mesmo valor da 2ª linha do `event-rule`, sem divergir.
- **`event-rule` (página):** ordem DJ/artista na 1ª linha, "Lista de Desconto
  por R$XX,00" na 2ª, e o aviso/gancho (open bar, horário) na última.

Passos:

1. **Flyer** → salvar em `assets/eventos/{slug}.jpg` (`{slug}` = nome-dia, ex.
   `mc-don-juan-19-09`). **Comprimir sempre**, mesmo se já vier JPG: redimensionar
   pra 720px de largura (`sips -Z 1280`) e qualidade ~55
   (`sips -s format jpeg -s formatOptions 55`), alvo ~150 KB — a faixa das
   outras imagens de evento. Não deixar flyer pesado no site (a
   `dale-revoada` com 883 KB é exceção antiga, não é referência).
2. **Página** → copiar `eventos/_MODELO.html` pra `eventos/{slug}.html` e
   trocar todos os `{{PLACEHOLDERS}}` (as instruções estão no topo do
   `_MODELO.html`). Pontos que não podem sair errados:
   - `data-event-date="AAAA-MM-DD"` — dia da festa.
   - `data-list-close="AAAA-MM-DDTHH:mm"` — horário limite da lista. **Sem
     horário informado: apagar o atributo inteiro** (o site fecha sozinho às
     23:59 do dia da festa).
   - `og:title` / `og:description` / `og:image` / `og:url` / `canonical` — é o
     preview quando o link é colado no WhatsApp. **`og:image` e `og:url` são
     URL ABSOLUTA** (`https://ready-to-go-site.vercel.app/...`): raspador de
     link não resolve caminho relativo, e com relativo o preview vem sem
     imagem nenhuma. `og:image:width/height` = as dimensões reais do flyer.
3. **Card no index** → dentro de `index.html`, entre `<!-- FESTAS:INÍCIO -->`
   e `<!-- FESTAS:FIM -->`, adicionar um `<a class="event-poster">` copiando
   um card existente, **em ordem cronológica** (sem JS não há reordenação).
   Precisa de `href` pra `eventos/{slug}.html`, `data-event-date` e (se
   houver) `data-list-close` iguais aos da página, e o conteúdo:
   - `event-poster__pills` > `event-poster__eyebrow` (o selo "Lista De
     Desconto"). O JS injeta a 2ª pílula, de urgência, aqui dentro.
   - `event-poster__title` (nome curto) e `event-poster__meta`
     (`DD.MM · Dia-da-semana · Artista`).
   - `event-poster__foot` > `event-poster__price` (`R$60`) +
     `event-poster__cta` ("Garantir Meu Desconto" + a seta).

   **Nunca envolver o texto do `event-poster__cta` num `<span>`** — o
   `event-schedule.js` troca o nodeValue do primeiro nó de texto solto por
   "Lista encerrada", e um wrapper quebra isso em silêncio.

4. **Cache-bust** → se mexeu no `css/style.css` **ou em qualquer arquivo de
   `assets/js/`**, subir o `?v=N` em `index.html`, em todas as páginas de
   evento e no `_MODELO.html`. Hoje em `?v=75`. O JS passou a ter `?v=` em
   09/09/2026: sem isso o navegador servia o script velho junto com o HTML
   novo, e recurso novo (destaque da próxima festa, urgência) simplesmente
   não aparecia pra quem já tinha visitado o site.

## Camarote em toda festa (16/10/2026)

Pedido da promoter (precisa vender mais camarote). Toda festa nova leva os dois:
- **Card no index:** logo depois do `event-poster__meta`, a linha
  `<p class="event-poster__camarote"><svg aria-hidden="true"><use href="#i-coroa"></use></svg>Camarotes disponíveis</p>`.
  Não vira 3ª pílula no topo (selo e contagem ficam lado a lado) nem botão
  (o card inteiro já é link).
- **Página da festa:** o bloco `.camarote-card` que já vem no `_MODELO.html`,
  logo depois do formulário, com `{{CAMAROTE_WA_URL}}` trocado (instrução no
  topo do modelo). Link puro pro WhatsApp da promoter, sem JS; ela confirma a
  disponibilidade na conversa.
- O texto do bloco é da promoter: trocar só se ela pedir.
- **Festa com ingresso vendido fora (09/11/2026, NOSTALGIC):** o bloco do ingresso
  (mesmo molde `.camarote-card`) vai **acima** do camarote, com botão `btn-primary`; o
  camarote fica `btn-secondary` embaixo. O Ticpass não aplica cupom pelo link (o `?c=` é
  código de afiliado, sem desconto): o botão copia o cupom no clique, mostra o aviso e
  abre o Ticpass (script no fim de `eventos/nostalgic-19-11.html`, copiar de lá). A
  métrica do camarote pega só `.camarote-card a[href*="wa.me"]`.

## Extras da festa (16/10/2026)

Toda página de festa sai do `_MODELO.html` com:
- **Fundo com a cor do flyer:** gerar `assets/eventos/{slug}-fundo.jpg` com
  `sips -Z 40 -s format jpeg -s formatOptions 70` (Pillow: `thumbnail((40, 72))`).
  A imagem minúscula esticada já fica desfocada; não usar `filter: blur`
  (pesa na rolagem do celular).
- **3 atalhos** (`.festa-acoes`, `assets/js/festa-extras.js`): Mandar pros
  amigos (compartilhar do celular; no computador copia o link), Salvar na
  agenda (`.ics` gerado na hora; `data-hora` se o flyer disser o horário) e
  Como chegar (Google Maps da casa). A agenda tem dois caminhos: **Android**
  abre o Google Agenda preenchido (o app do Google não abre `.ics` baixado; o
  link não aceita lembrete, vale o padrão da pessoa); **iPhone e computador**
  baixam o `.ics`, com lembrete. Horário sempre de Cuiabá (`-04:00` fixo).
- **Nome lembrado** no navegador (`localStorage`, chave `r2g-contato`),
  citado na política de privacidade. O telefone deixou de ser coletado em
  11/11/2026 (decisão do João); versão antiga guardada no navegador é apagada.
- **Cliques medidos no Clarity** (`clarity("event")` + tag `festa`):
  `card_festa`, `lista_desconto`, `camarote`, `compartilhar`, `agenda`,
  `como_chegar`; do envio pro VipMe: `lista_vipme_ok` e `lista_vipme_falha`.
  Ver em Clarity > Filtros > Eventos personalizados.

## Lista no VipMe (11/11/2026)

A promoter coloca os nomes da lista no VipMe (events.vipme.com.br). O formulário
da festa manda o nome (e os amigos) direto pra lista de lá, sem a pessoa sair do
site e sem a promoter digitar:
- **Como funciona:** `lista-desconto.js` faz `POST` (text/plain, sem preflight)
  pro Apps Script de `vipme-apps-script.gs`, que confere a lista no VipMe e
  repassa pro `PublicPage/AddAttendings` (API **não oficial**, pode mudar; o
  navegador não chama o VipMe direto porque a API não tem CORS).
- **Endereço do Apps Script:** constante `ENDPOINT_PADRAO` no topo do
  `lista-desconto.js` (um só pra todas as festas). **Vazio = tudo cai no
  WhatsApp**, o jeito antigo. Instalação e nova versão: cabeçalho do `.gs`.
- **Festa nova com lista no VipMe:** do link do VipMe tirar `{{VIPME_EVENTO}}` (1º
  número do link `events.vipme.com.br/{evento}/{lista}`) e `{{VIPME_LISTA}}` (número
  em `/list/{lista}-lista-de-desconto`). **O promoter não vai na página:** é fixo no
  `.gs` (`PROMOTER = 54799`, a promoter; outra promoter usando o site: mudar a
  constante). Conferir nos dados da lista
  (`GET https://api-v2.vipme.com.br/v2.0/PublicPage/GetEventListData?eventListId={lista}`):
  `listDetail.fields` só `name`, `allowMultipleNames: true`, `idCompany`.
  **Empresa nova (outra casa no VipMe):** acrescentar o `idCompany` em `EMPRESAS`
  no `.gs` e publicar nova versão, senão o Apps Script recusa. Lista que pede
  mais que o nome (telefone, CPF) não funciona neste fluxo.
- **Festa sem lista no VipMe:** apagar os 2 `data-vipme-*` do `<form>`.
- **Travas do Apps Script (revisão de segurança de 11/11/2026):** nome só com
  letras (acento, espaço, apóstrofo, hífen e ponto), 2 a 80 caracteres, 2 palavras
  (o JS valida igual antes de enviar, `SO_LETRAS`); limite global de 30 pedidos por
  minuto, 2.000 por dia e 3.000 nomes por dia (o Apps Script não vê o IP). Passou do
  limite, o site mostra o botão do WhatsApp. Risco aceito pelo João: quem souber o id
  de outra lista aberta da mesma empresa pode pôr nome nela (não há tabela de listas).
  Mexeu no `.gs`: Implantar > Gerenciar implantações > editar > Nova versão.
- **Plano B:** se o envio falhar ou passar do limite, aparece o botão "Enviar pelo
  WhatsApp" com os nomes (sem telefone). Máximo 50 nomes por envio.

## Regras da casa e Perguntas rápidas (16/10/2026)

Respostas da promoter, únicas fontes da seção `#duvidas` do index (não inventar
outra): idade mínima 18 (mais de 16 entra com a autorização dos pais,
`assets/autorizacao-menores.pdf`, acompanhado de maior de 18, com cópia do RG
de quem assinou e documento original com foto); nome na lista vale **até meia-noite** (também no
`form-note` de toda festa); a pergunta "Tem dress code?" saiu do FAQ em 10/11/2026
(só existia por causa do Halloween, que passou; não recolocar); paga
**na saída** com pulseira, do jeito que quiser, menos boleto e parcelado; pode
mandar nome de amigos **sem limite** (botão "+ Adicionar amigo" do formulário,
`lista-desconto.js`; os nomes vão na mesma mensagem). Toda página de festa tem
o link "Ficou com dúvida?" pro `../index.html#duvidas`.

## Temas sazonais (17/10/2026)

**Estado: Halloween desligado em 03/11/2026** (pedido da promoter, a festa passou). Tudo do tema continua no repo pra religar.

**Natal ligado em 10/11/2026** (pedido do João): `var TEMA = 'natal'` no `tema.js` (Halloween em `decoracaoHalloween()`, Natal em `decoracaoNatal()`). Visual em `css/tema-natal.css` (só `.tema-natal`, prefixo `nt-`).
- **Fundo (10/11/2026, 2ª versão): um vídeo só atrás da página inteira** (cidade de Natal com neve e árvore com globo de espelho, Runway do Evandro): `assets/tema/natal-video-9x16.mp4`/`-16x9.mp4` com pôster `.jpg` de mesmo nome. O `tema.js` cria `.nt-video` (fixo, z -2, mesma media query do `hero-video.js`); véu fixo leve no `body::before` (0,72 em Squad e política, `nt-sem-hero`); `.nt-degrade` vai do fim do topo até o fim da página (0,55 a 0,72). Topo sem fundo; o vídeo dos globos não baixa com o Natal (MutationObserver no `tema.js` + trava no `hero-video.js`; só o pôster `globos-hero-9x16.jpg` ainda baixa, pelo HTML). Reduced-motion: sem vídeo, só o pôster. Páginas de festa: sem vídeo. Antes era a imagem `natal-fundo-*.jpg` (ainda no repo), que não combinava com o vídeo do topo.
- **Neve** em todas as páginas (40 flocos; 22 abaixo de 640 px), **atrás do conteúdo** (z -1, último filho do body; pedido do João 10/11), `pointer-events: none`. **Árvore com 3 presentes** parada: fixa no canto de baixo à esquerda a partir de 1280 px (z 25; 90 px entre 1280 e 1399, 140 a partir de 1400, senão cobre o card da esquerda); abaixo disso ou com menos de 600 px de altura, no fluxo acima do rodapé (senão cobre cartão e botão). Nunca nas páginas de festa. Gorro de Papai Noel no título "Próximas Festas" (pílula em flex, gorro em `em`, letter-spacing final compensado; não voltar pro `vertical-align`). Reduced-motion: sem neve e sem pisca.
- **Globinho de Natal** (`globinho-xm-*.svg`, seção "fantasias de Natal" do `mascote/gerar_globinho.py`): noel, mamae-noel, rena, elfo, grinch (homenagem, sem nome no SVG), boneco-neve, biscoito, pijama, quebra-nozes, anjo; tonto e comemora com gorro (o `tema.js` troca e volta pro original se falhar).

- **Ligar e desligar:** `assets/js/tema.js`, 1ª linha de código:
  `var TEMA = 'halloween';` (desligar: `var TEMA = '';`). Ele põe
  `class="tema-halloween"` no `<html>` antes de pintar e injeta a decoração.
  Todo o visual mora em `css/tema-halloween.css`, só com seletores
  `.tema-halloween`; desligado, o site volta exatamente ao de sempre
  (conferido). Toda página (e o `_MODELO.html`) carrega os dois no `<head>`.
- **Fundo do tema (4ª rodada, 17/10, depois da auditoria):** o topo é opaco `#0c0a14` e termina nessa cor; a imagem de fundo fica inteira atrás da página (fixa); **um** degradê `.ht-degrade` (tema.js) começa no fim do topo, na mesma cor, e some em ~360 px (260 no celular), rolando com o conteúdo. Não repetir: imagem deslocada dentro de camada com máscara (borda virou linha reta) nem névoa dentro da coluna central (virou retângulo). Sem topo (Squad, política): véu mais escuro (`ht-sem-hero`).
- **Halloween:** céu de lua e galhos (antes: cenário gótico) atrás da home, Squad e política
  (`assets/tema/halloween-fundo-9x16.jpg` no celular e `-16x9.jpg` no
  computador; originais no cofre, `midia/halloween/site/`); teias, aranha e
  morcegos no hero; teia e aranha nas páginas de festa (que mantêm o fundo
  da cor do flyer); chapéu de bruxa no título das festas; caldeirão nas
  Perguntas Rápidas; abóboras no rodapé; títulos em pílula escura e cartões
  opacos (a lua passa atrás do texto na rolagem).
- **Globinho fantasiado (v2, 17/10, "iguais aos personagens"):** `globinho-hw-*.svg`, feitos no gerador do cofre (`mascote/gerar_globinho.py`, seção "fantasias de Halloween"), nunca imagem de IA. 10 fantasias: mascara (Jason), listrado (Beetlejuice), vampiro, garras (Freddy), monstro (Frankenstein), bruxa (pinta + gato preto), mumia, ghostface, palhaco (It), chucky. Cada uma tem pele, cabelo/chapéu, roupa e objeto; luva e manga por fantasia (`braco_c`). Espiando sorteia uma; carregando, comemorando e dançando usam chapéu de bruxa. Sem nome nem logo de filme no site.
- Decoração sempre `pointer-events: none`, nunca em cima de texto, botão,
  preço ou campo; `prefers-reduced-motion` para tudo.

## Festa que já passou: apagar (29/09/2026)

Ao cadastrar festa nova, apagar as que já passaram: o card do `index.html`, a
página `eventos/{slug}.html` e o flyer `assets/eventos/{slug}.jpg`. Não guardar
festa antiga (decisão do João). Link antigo cai no `404.html`, que manda pra
home. O `event-schedule.js` continua escondendo sozinho quem passou até alguém
apagar.

## Layout (responsivo desde 28/09/2026)

- **< 640px (celular):** coluna única de 480px, o layout original. Nada das
  regras de tela larga vale aqui.
- **640 a 1023px:** cards em 2 colunas; **≥ 1024px:** 3 colunas, até 1120px.
  A grade é flex com `wrap` e `justify-content: center`: linha incompleta fica
  centralizada. Cadastro de festa não muda: o card é o mesmo HTML.
- Botão do grupo, nota, Redes e o estado vazio continuam com 480px no máximo.
- **Página da festa ≥ 900px:** `.event-layout` (flyer parado à esquerda,
  formulário à direita). Toda página nova sai do `_MODELO.html`, que já tem o
  wrapper e o `<body class="event-page">`.
- **Hero:** em tela larga e deitada, `assets/js/hero-video.js` troca pelo vídeo
  16:9 se o `<video>` tiver `data-src-wide` (e `data-poster-wide`). Sem isso,
  fica o vertical.
- Conferir sempre em 320, 360, 375, 640, 768, 1024 e 1440: sem rolagem lateral
  e a linha `data · dia · artista` do card numa linha só.

## Formulário do Ready 2 Go Squad (`squad.html`, 28/09/2026)

- Inscrição de creators que divulgam as festas. Texto e perguntas são da
  promoter; a caixinha de autorização existe por causa da LGPD, não tirar.
- Envio: `assets/js/squad-form.js` manda um JSON (`text/plain`, sem preflight)
  por `fetch` pro Apps Script cujo endereço fica em `data-endpoint` no `<form>`
  e **lê a resposta** (`{success, message, limited, invalid}`): a tela só diz
  "Inscrição recebida" quando `success` vem verdadeiro; recusa de dado mostra a
  mensagem, e limite, erro de rede ou resposta estranha mostram o botão "Enviar
  pelo WhatsApp" (`data-numero` do `<form>`) com os dados escritos. Sem endereço,
  a página avisa que as inscrições não estão abertas e não envia nada.
- **O servidor confere tudo** (idade 18 a 120, nome com sobrenome, telefone de
  10 a 13 dígitos, Instagram, Sim/Não, tamanhos) e tem limite global de 20 por
  minuto e 500 por dia; o navegador usa as mesmas regras só pra avisar antes.
  Mexeu numa regra: mudar nos dois lados e rodar os testes.
- Os `<form>` do Squad e da lista levam `data-clarity-mask="true"` (o que a
  pessoa digita não vai pro Clarity); festa nova herda do `_MODELO.html`.
- O código do Apps Script está em `squad-apps-script.gs` (fora do site pelo
  `.vercelignore`), com o passo a passo de instalação no topo. Mudou o código:
  publicar como **nova versão da mesma implantação**, senão o endereço muda.
- Campo `site` é armadilha anti-robô: nunca mostrar nem tornar obrigatório.

## Comportamento automático das festas (`assets/js/event-schedule.js`)

Não precisa mexer em nada pra **tirar** festa. O script roda nas 3 páginas e
cuida sozinho, **contando a partir do horário de fecho da lista**
(`data-list-close`, ou 23:59 do `data-event-date` se não tem horário):

- **Lista fechou:** no index o card fica **cinza**, vai pro **fim da lista**,
  o CTA vira "Lista encerrada" e o card vira um **flyer desativado, SEM
  clique** (o JS tira o `href`). Quem abrir o **link direto** da página da
  festa é **redirecionado pra `index.html`** (`window.location.replace`) —
  a página não serve pra mais nada depois que a lista fecha.
- **24h depois de a lista fechar:** o card **some do index** de vez.
- **Nenhuma festa ativa:** some o título "Próximas Festas" e entra uma frase
  curta apontando pro grupo, com o Globinho dançando.
- **Contagem regressiva (09/09/2026):** toda festa aberta ganha uma pílula
  clara em `.event-poster__pills` com "Fecha hoje" / "Fecha amanhã" /
  "Faltam N dias". Conta em dias de calendário, não em horas cheias, e sai
  sempre de data real — nunca inventar pressa. Card com lista fechada perde
  a pílula (o "Lista encerrada" no CTA já diz o que precisa).
- **Cards são iguais entre si.** Chegou a existir um `.is-next` que destacava
  a próxima festa com CTA em pílula vermelha; o João mandou tirar no mesmo
  dia. Não reintroduzir destaque por card sem ele pedir.

### Quando o JS roda (não é só no carregamento)

O site se mantém sozinho, ninguém edita contagem na mão nem tira festa
vencida. `aplicarNoIndex()` é idempotente (atualiza a pílula em vez de criar
outra) e roda em 4 momentos: no carregamento, no `pageshow` vindo do bfcache
(o "voltar" do celular devolve a página inteira sem reexecutar script — sem
isso a contagem congela e festa vencida fica clicável), ao voltar pra aba
(`visibilitychange`) e a cada minuto com a página à vista.

A **página de evento** é checada só no carregamento e no `pageshow`, de
propósito: se a lista fechar com alguém digitando o nome no formulário,
redirecionar no meio seria pior que deixar terminar.

O HTML do card antigo continua no `index.html` (só escondido pelo JS) — dá pra
limpar numa próxima passada, é cosmético. Sem JS, nada some (é exibição, não
trava de segurança; a promoter confirma cada nome na mão).

O `_MODELO.html` e este `CLAUDE.md` são auxiliares de autoria: estão no git (a
sessão na nuvem precisa deles), mas ficam fora do site pelo `.vercelignore`.
**O repo é público:** nada pessoal neste arquivo; contexto pessoal vai no
`CLAUDE.local.md` (fora do git).
