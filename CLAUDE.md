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
   evento e no `_MODELO.html`. Hoje em `?v=45`. O JS passou a ter `?v=` em
   09/09/2026: sem isso o navegador servia o script velho junto com o HTML
   novo, e recurso novo (destaque da próxima festa, urgência) simplesmente
   não aparecia pra quem já tinha visitado o site.

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
- Envio: `assets/js/squad-form.js` manda por `fetch` (no-cors) pro Apps Script
  cujo endereço fica em `data-endpoint` no `<form>`. Sem endereço, a página
  avisa que as inscrições não estão abertas e não envia nada.
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
  curta apontando pro grupo.
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
