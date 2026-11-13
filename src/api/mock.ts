// Mocks da API, ativados com VITE_MOCK=1 (npm run dev:mock). Só para desenvolver a tela sem o servidor.
// O Códice e os Ofícios usam os arquivos reais do repo; o resto é inventado (mas com a forma do contrato).
// Logins de teste: "admin" (Administrator), "gm" (GameMaster), qualquer outro = jogador. Qualquer senha.
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { api } from './client'
import type { Build, PedidoConta, ContaStaff, CapituloResumo, Livro } from './site'
import regrasReais from '../data/regras_ficha.json'
import { TIPOS_LIVRO } from './site'
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
// Cópia real de GET /api/ficha/regras (vocações e traços), gerada por tools/site/exportar_talentos.py.
const regras = regrasReais

// ── Estado em memória ──
const agora = () => new Date().toISOString()
let seq = 100
const builds: Build[] = [
  { id: 'b1', nome: 'Guerreiro de Escudo', tipo: 'oficial', autor: 'Staff', estilo: 'Guerreiro de uma mão', povo: 'Thuriano', vantagem: 'Versatilidade', caminho: 'Armas', vocacao: 'Escudeiro', traco: 'Corpulento', atributos: { str: 90, dex: 70, int: 40 }, pericias: { MeleeCombat1H: 3, Parry: 3, Tactics: 2, Medicine: 2, Wrestling: 1, Survival: 1 }, descricao: 'A parede do grupo. Espada e escudo, aguenta a pancada enquanto os outros trabalham.', comoJoga: 'Fica na frente, segura o inimigo com o escudo e bate com a espada. Cura leve com bandagem entre lutas.', porque: '1 Mão e Tactics primárias dão acerto e dano; Parry primária segura o golpe; Medicine secundária para se manter de pé.', criadaEm: '2026-10-20' },
  { id: 'b2', nome: 'Clérigo do Panteão', tipo: 'oficial', autor: 'Staff', estilo: 'Clérigo', imagem: 'classes/clerigo.jpg', povo: 'Zharkiano', caminho: 'Sabedoria', vocacao: 'Acolito', traco: 'Velho', atributos: { str: 50, dex: 50, int: 90 }, pericias: { Magery: 3, MagicLore: 3, Medicine: 3, Alchemy: 2, Parry: 1 }, descricao: 'Cura, proteção e bênçãos. O motivo de o grupo voltar vivo.', criadaEm: '2026-10-20' },
  { id: 'b3', nome: 'Ranger das Fronteiras', tipo: 'oficial', autor: 'Staff', estilo: 'Ranger', povo: 'Numajene', caminho: 'Armas', vocacao: 'Ranger', traco: 'Agil', atributos: { str: 60, dex: 90, int: 50 }, pericias: { RangedCombat: 3, Survival: 3, Sneak: 2, HandleAnimal: 2, Tactics: 2 }, descricao: 'Arco, armadilha e um lobo fiel.', criadaEm: '2026-10-21' },
  { id: 'b4', nome: 'Mesumbeiro de Sangue', tipo: 'oficial', autor: 'Staff', estilo: 'Mesumbeiro', povo: 'Asanita', caminho: 'Sabedoria', kit: 'Mesumbeiro', atributos: { str: 70, dex: 50, int: 80 }, pericias: { Magery: 3, MagicLore: 3, Medicine: 2, Awareness: 1 }, descricao: 'Poder pago com a própria vida.', criadaEm: '2026-10-25' },
  { id: 'b5', nome: 'Lâmina do Deserto', tipo: 'comunidade', autor: 'Kaelthar', estilo: 'Berserker de duas mãos', povo: 'Thuriano', caminho: 'Armas', kit: 'Berserker', atributos: { str: 90, dex: 80, int: 30 }, pericias: { MeleeCombat2H: 3, Tactics: 3, Wrestling: 2, Survival: 2, Medicine: 1 }, descricao: 'Montante e nenhuma piedade.', criadaEm: '2026-10-26' },
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

// livros do site
const livros: Livro[] = [
  { id: 'T1', titulo: 'Crônicas da Estrada Velha', estado: 'aprovado', modelo: 1, tipo: 'Livro', autor: 'Kaelthar', conta: 'kaelthar', criado: '2026-11-01T10:00:00Z', decididoPor: 'bruna', decididoEm: '2026-11-02T09:00:00Z', paginas: ['Era uma vez uma estrada que ninguém lembrava de ter construído.', 'Os mercadores diziam que ela se movia à noite.'] },
  { id: 'T2', titulo: 'Receitas do Forno de Barro', estado: 'pendente', modelo: 0, tipo: 'Caderno de notas', autor: 'Sena', conta: 'kaelthar', criado: '2026-11-08T20:00:00Z', paginas: ['Pão de centeio: três punhados de farinha, sal e paciência.'] },
  { id: 'T3', titulo: 'Poema sem rima', estado: 'recusado', modelo: 0, tipo: 'Caderno de notas', autor: 'Kaelthar', conta: 'kaelthar', criado: '2026-11-05T20:00:00Z', motivo: 'Texto fora do tema do mundo.', decididoPor: 'bruna', decididoEm: '2026-11-06T09:00:00Z', paginas: ['...'] },
]
rota('get', '/api/sessao', () => logado() ? ok({ login: usuario || 'kaelthar', nivel: 'Player', isStaff: staff(), isAdmin: admin(), personagens: [{ nome: 'Kaelthar', serial: 1001, online: false }, { nome: 'Sena', serial: 1002, online: false }] }) : falha(401, 'Entre.'))
rota('get', '/api/livros/meus', () => ok(livros.filter(l => l.conta === 'kaelthar')))
rota('post', '/api/livros', (_m, b: any) => {
  if (!b.titulo?.trim()) return falha(400, 'Dê um título ao livro.')
  if (!(b.paginas ?? []).some((p: string) => p.trim())) return falha(400, 'O livro está em branco.')
  const t = TIPOS_LIVRO.find(x => x.id === b.modelo)!
  livros.unshift({ id: 'T' + ++seq, titulo: b.titulo, estado: 'pendente', modelo: b.modelo, tipo: t.nome, autor: b.personagem === 1002 ? 'Sena' : 'Kaelthar', conta: 'kaelthar', criado: agora(), paginas: b.paginas })
  return ok({ ok: true, estado: 'pendente' })
})
rota('get', '/api/staff/livros', () => staff() ? ok(livros) : falha(403, 'Só staff.'))
rota('post', '/api/staff/livros/([^/]+)/aprovar', m => { const l = livros.find(x => x.id === m[1]); if (!l) return falha(404, 'Livro não encontrado.'); l.estado = 'aprovado'; l.decididoPor = usuario; l.decididoEm = agora(); return ok({ ok: true }) })
rota('post', '/api/staff/livros/([^/]+)/recusar', (m, b) => { const l = livros.find(x => x.id === m[1]); if (!l) return falha(404, 'Livro não encontrado.'); l.estado = 'recusado'; l.motivo = b.motivo; l.decididoPor = usuario; l.decididoEm = agora(); return ok({ ok: true }) })

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
rota('post', '/api/staff/fauna/biomas', (_m, b: any) => staff() ? ok({ ok: true, biomas: b?.biomas ?? [] }) : falha(403, 'Só staff.'))
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
