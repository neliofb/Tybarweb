// Mocks da API, ativados com VITE_MOCK=1 (npm run dev:mock). Só para desenvolver a tela sem o servidor.
// O Códice e os Ofícios usam os arquivos reais do repo; o resto é inventado (mas com a forma do contrato).
// Logins de teste: "admin" (Administrator), "gm" (GameMaster), qualquer outro = jogador. Qualquer senha.
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { api } from './client'
import type { Regras, Build, PedidoConta, ContaStaff, Pericia, CapituloResumo } from './site'
import bestiario from './mock-bestiario.json'
import { mapaFauna, salvarZonasMock } from './mock-fauna'
import receitas from '../../../tools/oficios/receitas.json'

// ── Códice: lê os .txt reais e converte de forma simples (o servidor fará a conversão de verdade) ──
const arquivos = import.meta.glob('../../../TybarServer/Tybar/Data/Tybar/Codice/*.txt', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function esc(s: string) { return s.replace(/&(?!\w+;)/g, '&amp;') }
function txtParaHtml(txt: string) {
  let secao = '', titulo = ''
  const out: string[] = []
  let lista = false, tabela = false, cab = true
  const fechar = () => {
    if (lista) { out.push('</ul>'); lista = false }
    if (tabela) { out.push('</table>'); tabela = false }
  }
  for (const bruta of txt.split(/\r?\n/)) {
    const l = bruta.trimEnd()
    if (l.startsWith('@secao ')) { secao = l.slice(7).trim(); continue }
    if (l.startsWith('@titulo ')) { titulo = l.slice(8).trim(); continue }
    if (l.startsWith('@')) continue
    if (l.startsWith('|')) {
      if (lista) { out.push('</ul>'); lista = false }
      const cel = l.split('|').slice(1, -1).map(c => esc(c.trim()))
      if (!tabela) { out.push('<table>'); tabela = true; cab = true }
      if (cab) { out.push('<tr>' + cel.map(c => `<th>${c}</th>`).join('') + '</tr>'); cab = false }
      else if (cel.length === 1) out.push(`<tr><td class="grupo" colspan="9">${cel[0]}</td></tr>`)
      else out.push('<tr>' + cel.map(c => `<td>${c}</td>`).join('') + '</tr>')
      continue
    }
    if (l.startsWith('- ')) { if (tabela) { out.push('</table>'); tabela = false } if (!lista) { out.push('<ul>'); lista = true } out.push(`<li>${esc(l.slice(2))}</li>`); continue }
    fechar()
    if (!l.trim()) continue
    if (l === '---') out.push('<hr>')
    else if (l.startsWith('## ')) out.push(`<h2>${esc(l.slice(3))}</h2>`)
    else if (l.startsWith('> ')) out.push(`<blockquote>${esc(l.slice(2))}</blockquote>`)
    else out.push(`<p>${esc(l)}</p>`)
  }
  fechar()
  return { secao, titulo, html: out.join('\n') }
}
const capitulos = Object.entries(arquivos)
  .filter(([p]) => !p.endsWith('indice.txt'))
  .map(([p, txt], i) => {
    const id = p.split('/').pop()!.replace('.txt', '')
    return { id, ordem: i + 1, ...txtParaHtml(txt) }
  })
  .sort((a, b) => a.id.localeCompare(b.id, 'pt', { numeric: true }))
  .map((c, i) => ({ ...c, ordem: i + 1 }))

// ── Regras da ficha ──
const P = (id: string, nome: string, grupo: string, descricao: string, formula?: string): Omit<Pericia, 'custo'> => ({ id, nome, grupo, descricao, formula })
const pericias0 = [
  P('MeleeCombat1H', 'Combate Corpo a Corpo 1M', 'Combate', 'Acerto com espadas, maças, machadinhas e adagas de uma mão. Também é a perícia que conta para aparar com arma leve e para os talentos de esgrima. Quanto maior, mais vezes o golpe entra e menos você erra contra alvos de defesa alta.', 'chance de acerto = atk × (100 + HCI) ÷ (2 × def × (100 + DCI))\natk = 1M do atacante + 20 · def = perícia de defesa do alvo + 20'),
  P('MeleeCombat2H', 'Combate Corpo a Corpo 2M', 'Combate', 'Acerto com armas de duas mãos: montantes, machados de guerra, alabardas e martelos. Golpes mais lentos e mais pesados; não combina com escudo.', 'mesma fórmula de acerto, usando 2M como atk'),
  P('RangedCombat', 'Combate à Distância', 'Combate', 'Acerto com arcos e bestas. A munição é gasta a cada disparo; correr atrapalha a mira.', 'mesma fórmula de acerto, usando Distância como atk'),
  P('Tactics', 'Tactics', 'Combate', 'O dano dos seus golpes e as manobras de combate. Soma-se à Força para aumentar o dano de qualquer arma; é exigida pelos golpes especiais.', 'bônus de dano % = Tactics ÷ 1,6 (+ 6,25% a cada 10 de Força)'),
  P('Parry', 'Parry', 'Combate', 'Aparar golpes com escudo ou arma. Com escudo, bloqueia parte do dano; sem escudo, só armas de duas mãos ou com o talento certo aparam.', 'chance de aparar (escudo) = Parry ÷ 2 %'),
  P('Wrestling', 'Wrestling', 'Combate', 'Luta de mãos vazias. É também a defesa de quem está desarmado e a base para desarmar e derrubar.', 'mesma fórmula de acerto, usando Wrestling como atk'),
  P('Sneak', 'Sneak', 'Ladinagem', 'Esconder-se e andar sem ser visto. Cada passo escondido é um teste; armadura pesada atrapalha.', 'chance de continuar oculto por passo ≈ Sneak − penalidade da armadura'),
  P('Pickpocketing', 'Pickpocketing', 'Ladinagem', 'Aliviar bolsas alheias. Itens pesados são mais difíceis; ser pego revela você para todos em volta.', 'chance = (Pickpocketing − peso × 10 + 20) %'),
  P('MechanicalAptitude', 'Mechanical Aptitude', 'Ladinagem', 'Abrir fechaduras, desarmar armadilhas e operar mecanismos. Também conta para as engenhocas de funilaria que exigem precisão.'),
  P('Awareness', 'Awareness', 'Ladinagem', 'Perceber o que está escondido: ladrões ocultos, armadilhas, passagens. Funciona sozinha quando alguém se aproxima escondido.', 'teste = Awareness contra Sneak de quem se esconde'),
  P('Magery', 'Magery', 'Arcanas', 'Conjurar as magias da sua escola (Kitah, Orações do Panteão, Mesum ou Totens de Numaja). Decide se a magia sai e o círculo máximo que você domina.', 'chance de conjurar = (Magery − mínimo do círculo) ÷ 40'),
  P('MagicLore', 'Magic Lore', 'Arcanas', 'O conhecimento que dá força às magias: dano, duração e cura. Para o Mago de Combate substitui a Tactics nos golpes.', 'bônus de poder % = Magic Lore ÷ 1,5'),
  P('Alchemy', 'Alchemy', 'Arcanas', 'Poções, unguentos e preparados. As receitas difíceis pedem estações de alquimia e reagentes raros.'),
  P('Survival', 'Survival', 'Apoio', 'Resistir ao clima, caçar, acampar e esfolar. Diminui a perda por frio e calor e aumenta o couro e a carne tirados das presas.'),
  P('Medicine', 'Medicine', 'Apoio', 'Bandagens, diagnóstico e cirurgia. Cura mais rápido com perícia alta; cura veneno e sangramento acima de 60.', 'cura = Medicine ÷ 5 + 1d10 (bandagem comum)'),
  P('HandleAnimal', 'Handle Animal', 'Apoio', 'Domar, montar e comandar animais. Cada criatura tem dificuldade própria (veja o Bestiário) e ocupa vagas de seguidor.'),
  P('Gathering', 'Gathering', 'Ofício', 'Minerar, cortar lenha e colher areia. A perícia decide os minérios e madeiras que você consegue tirar.'),
  P('Metalworking', 'Metalworking', 'Ofício', 'Fundir e forjar metal: armas, armaduras, escudos e ferramentas.'),
  P('Woodworking', 'Woodworking', 'Ofício', 'Carpintaria, arcos e móveis.'),
  P('DomesticWork', 'Domestic Work', 'Ofício', 'Fiar, tecer, costurar e cozinhar. Pratos de cozinha dão bônus à bateria de aprendizado.'),
]
const cat: Record<string, string> = Object.fromEntries(pericias0.map(p => [p.id, p.grupo]))
const caminhos = [
  { id: 'Armas', nome: 'Armas', descricao: 'Especialistas em combate, mestres de diversas armas. Maior poder em batalha e resistem a mais ferimentos.' },
  { id: 'Subterfugio', nome: 'Subterfúgio', descricao: 'Astúcia, furtividade e perícias ladinas. Vivem de estratégia e de ataques de oportunidade.' },
  { id: 'Sabedoria', nome: 'Sabedoria', descricao: 'Estudiosos, magos e artesãos do intelecto. Vencem pela magia ou pelo conhecimento.' },
]
function custo(p: string, cam: string, kit: string): number {
  const g = cat[p]
  if (kit === 'GuerreiroSanto' && (p === 'Magery' || p === 'Medicine')) return 1
  let c = 3
  if (cam === 'Armas') c = { Combate: 1, Apoio: 2, Ladinagem: 3, Arcanas: 4 }[g] ?? 3
  if (cam === 'Subterfugio') c = g === 'Ladinagem' ? 1 : ['RangedCombat', 'MeleeCombat1H', 'Alchemy'].includes(p) ? 2 : ['MeleeCombat2H', 'Parry', 'Magery', 'MagicLore'].includes(p) ? 4 : 3
  if (cam === 'Sabedoria') c = g === 'Arcanas' || p === 'Medicine' ? 1 : g === 'Combate' ? 4 : 3
  if (g === 'Ofício') c = kit === 'Artifice' || kit === 'Coletor' ? 1 : 4
  if (kit === 'Ranger') c = ({ Survival: 1, Sneak: 2, Tactics: 2, Parry: 3, HandleAnimal: 1 } as Record<string, number>)[p] ?? c
  if (kit === 'Coletor' && p === 'Survival') return 2
  return c
}
const kits = [
  { id: 'Nenhuma', nome: 'Sem kit', descricao: 'Nenhuma vantagem nem desvantagem.' },
  { id: 'Agil', nome: 'Ágil', descricao: '+Destreza e esquiva; menos vida.' },
  { id: 'Corpulento', nome: 'Corpulento', descricao: 'Mais vida e força; anda mais devagar com carga.' },
  { id: 'DuroDeMatar', nome: 'Duro de Matar', descricao: '+2 Pontos de Morte.' },
  { id: 'Genio', nome: 'Gênio', descricao: '+Inteligência; aprende mais rápido as perícias arcanas.' },
  { id: 'SabeTudo', nome: 'Sabe-Tudo', descricao: '+5 pontos de perícia na criação; menos atributos.', pontosExtras: 5 },
  { id: 'Ranger', nome: 'Ranger', descricao: 'Mateiro: Survival, Sneak, Tactics e Handle Animal mais baratos.', caminhos: ['Armas', 'Subterfugio'] },
  { id: 'Berserker', nome: 'Berserker', descricao: 'Fúria em combate: mais dano quando ferido.', caminhos: ['Armas'] },
  { id: 'GuerreiroSanto', nome: 'Guerreiro Santo', descricao: 'Magery e Medicine custam 1. Orações do Panteão em armadura.', caminhos: ['Armas'] },
  { id: 'MagoDeCombate', nome: 'Mago de Combate', descricao: 'Magic Lore substitui Tactics nos golpes.', caminhos: ['Sabedoria'] },
  { id: 'AcolitoDoPanteao', nome: 'Acólito do Panteão', descricao: 'Libera as Orações; árvore de talentos própria.', caminhos: ['Sabedoria'] },
  { id: 'Mesumbeiro', nome: 'Mesumbeiro', descricao: 'Ritos de sangue de Mesum.', caminhos: ['Sabedoria'], povos: ['Asanita', 'Zharkiano'] },
  { id: 'Shimoriano', nome: 'Shimoriano', descricao: 'Mesum com Magery, tradição de Shimor.', caminhos: ['Sabedoria'] },
  { id: 'Totemista', nome: 'Totemista', descricao: 'Totens de Numaja.', caminhos: ['Sabedoria'], povos: ['Numajene'] },
  { id: 'LadinoTreinado', nome: 'Ladino Treinado', descricao: 'Mãos leves e olhos atentos.', caminhos: ['Subterfugio'] },
  { id: 'Artifice', nome: 'Artífice', descricao: 'Todo ofício custa 1; o núcleo do caminho custa +1.' },
  { id: 'Coletor', nome: 'Coletor', descricao: 'Coleta e ofícios custam 1; Survival custa 2.' },
  { id: 'MembroDaNobreza', nome: 'Membro da Nobreza', descricao: 'Vassalo de uma casa; moradia barata na cidadela.', povos: ['Zharkiano'] },
  { id: 'MarcadoDaRaiz', nome: 'Marcado da Raiz', descricao: 'Numajene que cumpriu a Dívida de Raiz.', povos: ['Numajene'] },
]
for (const k of kits as any[]) {
  if (k.caminhos || k.povos) {
    k.permitido = Object.fromEntries((k.caminhos ?? caminhos.map(c => c.id)).map((c: string) => [c, k.povos ?? []]))
    delete k.caminhos; delete k.povos
  }
}
const custos: Regras['custos'] = {}
for (const c of caminhos) {
  custos[c.id] = {}
  for (const k of [{ id: '_' }, ...kits]) custos[c.id][k.id] = Object.fromEntries(pericias0.map(p => [p.id, custo(p.id, c.id, k.id === '_' ? 'Nenhuma' : k.id)]))
}
const regras: Regras = {
  povos: [
    { id: 'Thuriano', nome: 'Thurião', grupo: 'Humanos', descricao: 'Homens do norte, acostumados ao frio e às adversidades. Valorizam a força, a coragem e a honra.', vantagem: 'Resistência maior ao clima frio.' },
    { id: 'Zharkiano', nome: 'Zharkiano', grupo: 'Humanos', descricao: 'Senhores do mundo, ambiciosos e determinados. Valorizam o poder, a riqueza e a influência.', vantagem: 'Gravemente ferido, você tem uma segunda chance em testes de resistência.' },
    { id: 'Asanita', nome: 'Asanita', grupo: 'Humanos', descricao: 'Escondidos nas cidades humanas, mestres do disfarce e da adaptação.', vantagem: 'Você possui 1 Ponto de Morte a mais.' },
    { id: 'Aquilrano', nome: 'Aquilrano', grupo: 'Élficos', descricao: 'Senhores do deserto, adaptados ao calor extremo.', vantagem: 'Resistência maior ao calor do deserto.' },
    { id: 'Vanirio', nome: 'Vanírio', grupo: 'Élficos', descricao: 'Altos elfos e sábios, mestres da magia e da navegação.', vantagem: 'Periodicamente, uma falha em teste de perícia vira sucesso.' },
    { id: 'Numajene', nome: 'Numajene', grupo: 'Élficos', descricao: 'Habitantes das florestas densas, conectados à natureza.', vantagem: 'Você anda em Numaja sem ser importunado pela floresta.' },
  ],
  vantagens: [
    { id: 'Versatilidade', nome: 'Versatilidade', descricao: '+2 pontos para comprar perícias.', povos: ['Thuriano', 'Zharkiano', 'Asanita'], pontosExtras: 2 },
    { id: 'VontadeDeFerro', nome: 'Vontade de Ferro', descricao: 'Resiste melhor a medo e controle.', povos: ['Thuriano', 'Zharkiano', 'Asanita'] },
    { id: 'ConhecedorDoKitah', nome: 'Conhecedor do Kitah', descricao: 'Libera as magias da escola de Kitah.', povos: ['Aquilrano', 'Vanirio', 'Numajene'] },
    { id: 'AliadoDaNatureza', nome: 'Aliado da Natureza', descricao: 'Animais selvagens demoram a atacar.', povos: ['Aquilrano', 'Vanirio', 'Numajene'] },
  ],
  caminhos,
  kits,
  classes: [
    { id: 'Guerreiro', nome: 'Guerreiro', caminho: 'Armas', descricao: 'Linha de frente: armadura pesada, escudo e disciplina.' },
    { id: 'Berserker', nome: 'Berserker', caminho: 'Armas', descricao: 'Troca defesa por fúria; mais dano quanto mais ferido.' },
    { id: 'Paladino', nome: 'Paladino', caminho: 'Armas', descricao: 'Guerreiro Santo: espada e oração.' },
    { id: 'Ranger', nome: 'Ranger', caminho: 'Subterfugio', descricao: 'Arco, mato e animais.' },
    { id: 'Ladino', nome: 'Ladino', caminho: 'Subterfugio', descricao: 'Sombras, fechaduras e bolsas alheias.' },
    { id: 'Clerigo', nome: 'Clérigo', caminho: 'Sabedoria', descricao: 'Orações do Panteão: cura e proteção.' },
    { id: 'MagoDeCombate', nome: 'Mago de Combate', caminho: 'Sabedoria', descricao: 'Kitah e lâmina.' },
    { id: 'Mesumbeiro', nome: 'Mesumbeiro', caminho: 'Sabedoria', descricao: 'Ritos pagos com a própria vida.' },
    { id: 'Totemista', nome: 'Totemista', caminho: 'Sabedoria', descricao: 'Totens de Numaja.' },
  ],
  pericias: pericias0.map(p => ({ ...p, custo: Object.fromEntries(caminhos.map(c => [c.id, custo(p.id, c.id, 'Nenhuma')])) })),
  tiers: [
    { id: 'Terciaria', nome: 'Terciária', multiplicador: 1, valor: 20 },
    { id: 'Secundaria', nome: 'Secundária', multiplicador: 2, valor: 35 },
    { id: 'Primaria', nome: 'Primária', multiplicador: 3, valor: 50 },
  ],
  custos,
  pontos: { pericias: 22, atributos: 110, atributoMin: 30, atributoMax: 90, atributoBase: 30, primariasMax: 3, primariasMaxSabeTudo: 4 },
}

// ── Estado em memória ──
const agora = () => new Date().toISOString()
let seq = 100
const builds: Build[] = [
  { id: 'b1', nome: 'Guerreiro de Escudo', tipo: 'oficial', autor: 'Staff', estilo: 'Guerreiro de uma mão', povo: 'Thuriano', vantagem: 'Versatilidade', caminho: 'Armas', kit: 'Corpulento', atributos: { str: 90, dex: 70, int: 40 }, pericias: { MeleeCombat1H: 3, Parry: 3, Tactics: 3, Medicine: 2, Wrestling: 1, Survival: 1 }, descricao: 'A parede do grupo. Espada e escudo, aguenta a pancada enquanto os outros trabalham.', comoJoga: 'Fica na frente, segura o inimigo com o escudo e bate com a espada. Cura leve com bandagem entre lutas.', porque: '1 Mão e Tactics primárias dão acerto e dano; Parry primária segura o golpe; Medicine secundária para se manter de pé.', criadaEm: '2026-10-20' },
  { id: 'b2', nome: 'Clérigo do Panteão', tipo: 'oficial', autor: 'Staff', estilo: 'Clérigo', imagem: 'classes/clerigo.jpg', povo: 'Zharkiano', caminho: 'Sabedoria', kit: 'AcolitoDoPanteao', atributos: { str: 50, dex: 50, int: 90 }, pericias: { Magery: 3, MagicLore: 3, Medicine: 3, Alchemy: 2, Parry: 1 }, descricao: 'Cura, proteção e bênçãos. O motivo de o grupo voltar vivo.', criadaEm: '2026-10-20' },
  { id: 'b3', nome: 'Ranger das Fronteiras', tipo: 'oficial', autor: 'Staff', estilo: 'Ranger', povo: 'Numajene', caminho: 'Subterfugio', kit: 'Ranger', atributos: { str: 60, dex: 90, int: 50 }, pericias: { RangedCombat: 3, Survival: 3, Sneak: 2, HandleAnimal: 2, Tactics: 2 }, descricao: 'Arco, armadilha e um lobo fiel.', criadaEm: '2026-10-21' },
  { id: 'b4', nome: 'Mesumbeiro de Sangue', tipo: 'oficial', autor: 'Staff', estilo: 'Mesumbeiro', povo: 'Asanita', caminho: 'Sabedoria', kit: 'Mesumbeiro', atributos: { str: 70, dex: 50, int: 80 }, pericias: { Magery: 3, MagicLore: 3, Medicine: 2, Awareness: 1 }, descricao: 'Poder pago com a própria vida.', criadaEm: '2026-10-25' },
  { id: 'b5', nome: 'Lâmina do Deserto', tipo: 'comunidade', autor: 'Kaelthar', estilo: 'Berserker de duas mãos', povo: 'Aquilrano', caminho: 'Armas', kit: 'Berserker', atributos: { str: 90, dex: 80, int: 30 }, pericias: { MeleeCombat2H: 3, Tactics: 3, Wrestling: 2, Survival: 2, Medicine: 1 }, descricao: 'Montante e nenhuma piedade.', criadaEm: '2026-10-26' },
  { id: 'b6', nome: 'Ferreiro de Vila', tipo: 'comunidade', autor: 'Bruna', estilo: 'Ferreiro guerreiro', povo: 'Thuriano', caminho: 'Armas', kit: 'Artifice', atributos: { str: 90, dex: 60, int: 50 }, pericias: { Metalworking: 3, Gathering: 3, MeleeCombat1H: 2, Parry: 2, Tactics: 1 }, descricao: 'Forja de dia, defende a vila à noite.', criadaEm: '2026-10-27', minha: true },
]
const pedidos: PedidoConta[] = [
  { id: 'p1', login: 'aldric', status: 'pendente', discordId: '301928374650192837', discordNome: 'aldric#0', criadoEm: '2026-10-27T18:20:00Z' },
  { id: 'p2', login: 'mirela_v', status: 'pendente', discordId: '412837465019283746', discordNome: 'mirela', criadoEm: '2026-10-28T08:05:00Z' },
  { id: 'p3', login: 'thorgrim', status: 'recusado', motivo: 'Login já em uso por outra conta.', discordId: '523847561029384756', discordNome: 'thorgrim', criadoEm: '2026-10-26T12:00:00Z' },
]
const contas: ContaStaff[] = [
  { login: 'kaelthar', nivel: 'Player', banido: false, discordNome: 'kael', discordId: '1029384756', personagens: [{ nome: 'Kaelthar', online: true }, { nome: 'Sena' }], criadaEm: '2026-09-02', ultimoAcesso: '2026-10-28' },
  { login: 'bruna', nivel: 'Counselor', banido: false, discordNome: 'bruna.ff', discordId: '2039485761', personagens: [{ nome: 'Bruna Ferreira' }], criadaEm: '2026-09-10', ultimoAcesso: '2026-10-27' },
  { login: 'trapaceiro', nivel: 'Player', banido: true, personagens: [{ nome: 'Zé Sombra' }], criadaEm: '2026-10-11', ultimoAcesso: '2026-10-15' },
]
let usuario = localStorage.getItem('mockUser') ?? ''

// ── Roteador ──
type R = { status?: number; data: unknown }
type H = (m: RegExpMatchArray, corpo: any, params: Record<string, string>) => R | Promise<R>
const rotas: [string, RegExp, H][] = []
const rota = (metodo: string, padrao: string, h: H) => rotas.push([metodo, new RegExp('^' + padrao + '$'), h])
const ok = (data: unknown): R => ({ data })
const falha = (status: number, erro: string): R => ({ status, data: { erro } })
const logado = () => !!localStorage.getItem('token')

rota('post', '/api/login', (_m, b) => {
  usuario = String(b.username || 'jogador').toLowerCase()
  localStorage.setItem('mockUser', usuario)
  const nivel = usuario === 'admin' ? 'Administrator' : usuario === 'gm' ? 'GameMaster' : 'Player'
  return ok({ token: 'mock-' + usuario, charName: b.username, factionId: 1, factionRole: 'Membro', isGM: nivel !== 'Player', nivel, isStaff: nivel !== 'Player', isAdmin: nivel === 'Administrator' })
})
rota('get', '/api/me', () => ok({ name: usuario, factionId: 1, factionName: 'Casa Rothenien', factionRole: 'Membro', online: false, coins: { gold: 3, silver: 41, copper: 12, totalCopper: 34112 } }))
rota('get', '/api/factions', () => ok({ factions: [{ id: 1, name: 'Casa Rothenien', description: 'A casa do lobo.', hue: 33, parentId: 0, bankBalance: 120000, memberCount: 14 }, { id: 2, name: 'Zanshirden', description: 'Ouro e areia.', hue: 1150, parentId: 0, bankBalance: 90000, memberCount: 9 }] }))
rota('get', '/api/factions/(\\d+)', m => ok({ id: +m[1], name: 'Casa Rothenien', description: 'A casa do lobo.', hue: 33, parentId: 0, bankBalance: 120000, memberCount: 2, ledger: ['Depósito de 500 cobres'], members: [{ name: 'Kaelthar', role: 'Líder', online: true }, { name: 'Bruna', role: 'Membro', online: false }] }))
rota('get', '/api/war/state', () => ok({ territories: [], pendingMoves: [], history: ['Turno 3: Rothenien tomou o Vale Cinzento.'], nextTurnAt: new Date(Date.now() + 3600e3).toISOString(), copperPerTroop: 100, maxTroops: 50, warFactions: [{ id: 1, name: 'Casa Rothenien', hue: 33 }, { id: 2, name: 'Zanshirden', hue: 1150 }] }))
rota('get', '/api/war/mymoves', () => ok({ moves: [] }))

rota('get', '/api/codice', () => ok(capitulos.map(({ id, titulo, ordem, secao }): CapituloResumo => ({ id, titulo, ordem, secao }))))
rota('get', '/api/codice/([^/]+)', m => {
  const c = capitulos.find(x => x.id === decodeURIComponent(m[1]))
  return c ? ok({ titulo: c.titulo, html: c.html, secao: c.secao }) : falha(404, 'Capítulo não encontrado.')
})
rota('get', '/api/ficha/regras', () => ok(regras))

let usando: string | null = null
rota('get', '/api/builds', (_m, _b, q) => ok(q.tipo ? builds.filter(b => b.tipo === q.tipo) : builds))
rota('get', '/api/builds/minhas', () => logado() ? ok({ builds: builds.filter(b => b.minha), usando }) : falha(401, 'Entre na conta.'))
rota('delete', '/api/builds/usar', () => { usando = null; return ok({ ok: true }) })
rota('get', '/api/builds/([^/]+)', m => { const b = builds.find(x => x.id === m[1]); return b ? ok(b) : falha(404, 'Build não encontrada.') })
rota('post', '/api/builds', (_m, b) => {
  if (!logado()) return falha(401, 'Entre na conta.')
  const nova: Build = { ...b, id: 'b' + ++seq, tipo: b.tipo === 'oficial' ? 'oficial' : 'comunidade', autor: usuario || 'você', minha: true, criadaEm: agora() }
  builds.unshift(nova); return ok(nova)
})
rota('put', '/api/builds/([^/]+)', (m, b) => {
  const i = builds.findIndex(x => x.id === m[1]); if (i < 0) return falha(404, 'Build não encontrada.')
  builds[i] = { ...builds[i], ...b, id: builds[i].id, atualizadaEm: agora() }; return ok(builds[i])
})
rota('delete', '/api/builds/([^/]+)', m => { const i = builds.findIndex(x => x.id === m[1]); if (i >= 0) builds.splice(i, 1); return ok({ ok: true }) })
rota('post', '/api/builds/([^/]+)/usar', m => {
  usando = m[1]
  return ok({ ok: true, usando, mensagem: 'Pronto: o próximo personagem criado nesta conta poderá usar esta build.' })
})

rota('get', '/api/discord/sessao', () => ok(sessionStorage.getItem('mockDiscord')
  ? { conectado: true, discordId: '99887766554433', nome: 'viajante', avatar: null } : { conectado: false }))
rota('get', '/api/contas/pedido/status', () => {
  if (!sessionStorage.getItem('mockDiscord')) return falha(401, 'Entre com o Discord.')
  const p = sessionStorage.getItem('mockPedido')
  return ok({ status: p ? 'pendente' : 'nenhum', login: p ?? undefined, criado: p ? agora() : undefined })
})
rota('post', '/api/contas/pedido', (_m, b) => {
  if (!sessionStorage.getItem('mockDiscord')) return falha(401, 'Entre com o Discord primeiro.')
  if (!/^[A-Za-z0-9_]{3,16}$/.test(b.login || '')) return falha(400, 'Login inválido.')
  if ((b.senha || '').length < 8) return falha(400, 'A senha precisa de 8 caracteres ou mais.')
  if (b.login.toLowerCase() === 'admin') return falha(409, 'Este login já existe.')
  sessionStorage.setItem('mockPedido', b.login)
  pedidos.unshift({ id: 'p' + ++seq, login: b.login, status: 'pendente', discordId: '99887766554433', discordNome: 'viajante', criadoEm: agora() })
  return ok({ ok: true, status: 'pendente' })
})

rota('get', '/api/bestiario', () => logado() ? ok({ gerado_em: agora(), animais: bestiario }) : falha(401, 'Entre na conta.'))
rota('get', '/api/oficios', () => logado() ? ok(receitas) : falha(401, 'Entre na conta.'))

const staff = () => ['admin', 'gm'].includes(usuario)
const admin = () => usuario === 'admin'
rota('get', '/api/fauna/mapa', () => ok(mapaFauna(logado() && staff())))
rota('post', '/api/staff/fauna/zonas', (_m, b) => staff() ? salvarZonasMock(b) : falha(403, 'Só staff.'))
let niveisMock: any[] = [
  { id: 'r1', nome: 'Arredores de Zharkia', periciaMin: 0, periciaMax: 20, cor: '#4caf50', retangulos: [{ x: 2700, y: 1150, largura: 420, altura: 330 }] },
  { id: 'r2', nome: 'Estreito', periciaMin: 20, periciaMax: 40, cor: '#4caf50', retangulos: [{ x: 2675, y: 900, largura: 520, altura: 260 }] },
  { id: 'r3', nome: 'Floresta Numaja', periciaMin: 50, periciaMax: 80, cor: '#d4c43a', retangulos: [{ x: 1500, y: 1700, largura: 700, altura: 500 }] },
  { id: 'r4', nome: 'Terras dos Orcs', periciaMin: 90, periciaMax: 120, cor: '#d23c3c', retangulos: [{ x: 4300, y: 600, largura: 600, altura: 450 }] },
]
rota('get', '/api/fauna/niveis', () => ok(niveisMock))
rota('post', '/api/staff/fauna/niveis', (_m, b: any) => {
  if (!staff()) return falha(403, 'Só staff.')
  niveisMock = (b?.regioes ?? []).map((r: any, i: number) => ({ ...r, id: r.id ?? 'r' + (100 + i) }))
  return ok({ ok: true, regioes: niveisMock })
})
rota('get', '/api/staff/pedidos', () => staff() ? ok(pedidos) : falha(403, 'Só staff.'))
rota('post', '/api/staff/pedidos/([^/]+)/aprovar', m => {
  const p = pedidos.find(x => x.id === m[1]); if (!p) return falha(404, 'Pedido não encontrado.')
  p.status = 'aprovado'; contas.unshift({ login: p.login, nivel: 'Player', banido: false, discordId: p.discordId, discordNome: p.discordNome, personagens: [], criadaEm: agora() })
  return ok({ ok: true })
})
rota('post', '/api/staff/pedidos/([^/]+)/recusar', (m, b) => {
  const p = pedidos.find(x => x.id === m[1]); if (!p) return falha(404, 'Pedido não encontrado.')
  if (!b.motivo) return falha(400, 'Diga o motivo.')
  p.status = 'recusado'; p.motivo = b.motivo; return ok({ ok: true })
})
rota('get', '/api/staff/contas', (_m, _b, q) => {
  if (!admin()) return falha(403, 'Só Administrator.')
  const t = (q.busca || '').toLowerCase()
  return ok(contas.filter(c => !t || c.login.includes(t) || c.discordNome?.toLowerCase().includes(t) || c.personagens?.some(p => p.nome.toLowerCase().includes(t))))
})
rota('post', '/api/staff/contas/([^/]+)/senha', (_m, b) => (b.senha?.length ?? 0) >= 8 ? ok({ ok: true }) : falha(400, 'Senha curta.'))
rota('post', '/api/staff/contas/([^/]+)/nivel', (m, b) => {
  if (b.nivel === 'Administrator' || b.nivel === 'Owner') return falha(403, 'Ninguém sobe acima do próprio nível.')
  const c = contas.find(x => x.login === m[1]); if (c) c.nivel = b.nivel; return ok({ ok: true })
})
rota('post', '/api/staff/contas/([^/]+)/ban', (m, b) => { const c = contas.find(x => x.login === m[1]); if (c) c.banido = !!b.banido; return ok({ ok: true }) })
rota('post', '/api/staff/builds/([^/]+)/oficial', (m, b) => {
  const x = builds.find(y => y.id === m[1]); if (!x) return falha(404, 'Build não encontrada.')
  x.tipo = b.oficial === false ? 'comunidade' : 'oficial'; return ok(x)
})

export function instalarMock() {
  // ?mockLogin=admin|gm|nome entra direto (para capturas de tela sem digitar)
  const ml = new URLSearchParams(location.search).get('mockLogin')
  if (ml) {
    usuario = ml; localStorage.setItem('mockUser', ml)
    const nivel = ml === 'admin' ? 'Administrator' : ml === 'gm' ? 'GameMaster' : 'Player'
    Object.entries({ token: 'mock-' + ml, charName: ml, isGM: String(nivel !== 'Player'), nivel }).forEach(([k, v]) => localStorage.setItem(k, v))
  }
  api.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    await new Promise(r => setTimeout(r, 180 + Math.random() * 220))
    const url = (config.url ?? '').split('?')[0]
    const metodo = (config.method ?? 'get').toLowerCase()
    let corpo: any = {}
    try { corpo = typeof config.data === 'string' ? JSON.parse(config.data) : config.data ?? {} } catch { /* vazio */ }
    const params = Object.fromEntries(Object.entries(config.params ?? {}).map(([k, v]) => [k, String(v)]))
    for (const [m, re, h] of rotas) {
      const achou = metodo === m && url.match(re)
      if (!achou) continue
      const r = await h(achou, corpo, params)
      const resp: AxiosResponse = { data: r.data, status: r.status ?? 200, statusText: 'mock', headers: {}, config }
      if (resp.status >= 400) throw new AxiosError('mock ' + resp.status, 'ERR_BAD_REQUEST', config, null, resp)
      console.debug('[mock]', metodo.toUpperCase(), url, resp.data)
      return resp
    }
    const resp: AxiosResponse = { data: { erro: 'Rota sem mock: ' + url }, status: 404, statusText: 'mock', headers: {}, config }
    throw new AxiosError('mock 404', 'ERR_BAD_REQUEST', config, null, resp)
  }
}
