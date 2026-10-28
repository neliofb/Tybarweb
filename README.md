# TybarWeb

O site do Tybar (público, área do jogador e área da staff): React 18 + Vite + TypeScript + react-router + axios.
Conversa com a API do servidor do jogo (`Scripts/Custom/Systems/WebApi`, porta 8085), com o mesmo login da conta do jogo.
Plano e contrato da API: `TybarServer/Tybar/docs/planos/site_tybar.md` (inclusive a seção **Ajustes do contrato**).

```
npm install
npm run dev        # desenvolvimento: /api é repassado para http://localhost:8085
npm run dev:mock   # sem servidor: respostas falsas (VITE_MOCK=1, arquivo .env.mock)
npm run build      # gera dist/ para publicar (os mocks não entram no build)
```

Com os mocks: login `admin` (Administrator), `gm` (GameMaster) ou qualquer outro (jogador), qualquer senha. Para entrar
direto numa página, acrescente `?mockLogin=admin` ao endereço. O Códice e os Ofícios do mock leem os arquivos reais do
repo (`TybarServer/Tybar/Data/Tybar/Codice/*.txt` e `tools/oficios/receitas.json`); o resto é inventado.
No mock, "Entrar com Discord" só marca a sessão local.

## Páginas

| Endereço | Quem vê | O que é |
|---|---|---|
| `/` | todos | Início: vídeo/arte de fundo, mundo, povos, caminhos, como entrar, vídeo da história |
| `/codice`, `/codice/:id` | todos | Códice: índice por seção, leitura em pergaminho, busca no texto (`?busca=`) |
| `/criar-conta` | todos | Discord → login e senha → pedido pendente (status ao vivo) |
| `/simulador`, `/simulador/:id` | todos (salvar: logado) | Ponto de partida (builds padrão) → povo → caminho → kit → atributos → perícias → resumo. `?de=id` começa de uma build |
| `/builds`, `/builds/:id` | todos | Builds padrão (oficiais) e da comunidade, filtro por caminho/busca, detalhe com "Como joga" e "Por que essas perícias" |
| `/entrar` | todos | Login com a conta do jogo |
| `/painel`, `/faccoes`, `/guerra` | logado | Páginas antigas do portal (Painel, Facções, Guerra) dentro do layout novo |
| `/bestiario` | logado | Criaturas com números do jogo, filtros e detalhes |
| `/oficios` | logado | Receitas (só leitura) com busca, filtro por ofício e perícia, ordenação |
| `/minhas-builds` | logado | Criar/editar/apagar; "Usar no próximo personagem" / desmarcar |
| `/staff/pedidos` | Counselor+ | Aprovar/recusar (com motivo) pedidos de conta |
| `/staff/jogadores` | Administrator+ | Buscar contas, trocar senha, banir/desbanir, mudar nível (até Seer, nunca acima do próprio) |
| `/staff/builds` | Counselor+ | Promover/retirar builds oficiais; nova build oficial pelo simulador |

## Código

- `src/api/client.ts`: axios (token Bearer, cookies para a sessão do Discord, 401 com token → volta ao login).
- `src/api/site.ts`: endpoints do site e **conversão** do formato da API para o das telas (regras da ficha, builds com
  `forca/destreza/inteligencia` e tiers por nome, `/api/builds/minhas`, Discord + status do pedido, staff).
- `src/api/mock.ts`: mocks (só com `VITE_MOCK=1`).
- `src/ficha.ts`: custo das perícias (tabela `custos[caminho][kit]` da API), pontos, limite de Primárias, kits permitidos, problemas da build.
- `src/auth.ts`: sessão (nível, staff, admin) a partir da resposta do `/api/login`.
- `src/components/`: `Layout` (cabeçalho público/jogador/staff, menu lateral no celular, rodapé), `ui` (Midia com
  marcador, Modal, Busca, Selo, carregando/erro, `useDados`), `BuildCard`.
- `src/styles.css`: tema (couro, ouro, Cinzel + EB Garamond), responsivo, foco visível, `prefers-reduced-motion`.

## Artes (public/media)

Nomes fixos; se faltar um arquivo, a página mostra um marcador com a inicial. Ordem tentada: `.jpg`, `.png`, `.webp`.
- `hero.mp4` (fundo do Início; `hero.jpg` é o pôster), `historia.mp4` (seção "A história", carrega só ao tocar), `codice.jpg`, `guerra.jpg`
- `povos/<povo>.jpg` (aceita `thuriao`, `zharkianos`… ) e `povos/<Povo>.mp4` (toca no simulador ao passar o mouse/escolher)
- `caminhos/<armas|subterfugio|sabedoria>.jpg`
- `classes/<estilo ou id da build>.jpg` (ex.: `guerreiro.jpg`, `mago_de_combate.jpg`), ou o campo `imagem` da build

## Variáveis (.env)

`VITE_API_URL` (vazio em produção: o Caddy repassa `/api`), `VITE_MOCK`, `VITE_DISCORD_CONVITE` (convite do Discord),
`VITE_LAUNCHER_URL` (link do launcher; sem ele o Início manda procurar no Discord).
Só publicar com HTTPS: o login usa a senha do jogo.
