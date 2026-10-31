// Mock do mapa da fauna (só com VITE_MOCK=1). Grade dos biomas: tools/fauna/radar_felucca.png classificado pela cor
// (aproximado, só para a tela); zonas: os .cfg reais de Data/Tybar/Fauna/areas (linhas de 8 tiles juntadas).
import gradeRle from './mock-fauna-grade.txt?raw'

const cfgs = import.meta.glob('../../../TybarServer/Tybar/Data/Tybar/Fauna/areas/*.cfg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

type A = [tipo: string, nome: string, peso: number, horario: 'sempre' | 'dia' | 'noite', perigoso: boolean, gmin?: number, gmax?: number, clima?: string]
const ap = (l: A[]) => l.map(([tipo, nome, peso, horario, perigoso, grupoMin = 1, grupoMax = 1, clima]) => ({ tipo, nome, peso, horario, perigoso, grupoMin, grupoMax, clima }))

const biomas = [
  { id: 1, nome: 'Deserto', criaturas: ap([['Scorpion', 'Escorpião', 2, 'sempre', true], ['Snake', 'Cobra', 2, 'sempre', true], ['DesertOstard', 'Ostard do deserto', .3, 'noite', false, 1, 3], ['Goat', 'Cabra', .5, 'sempre', false], ['TybarElementalAr', 'Elemental do ar', .6, 'sempre', true, 1, 1, 'tempestade'], ['Eagle', 'Águia', .3, 'dia', false, 1, 2]]) },
  { id: 2, nome: 'Planície', criaturas: ap([['Eagle', 'Águia', .4, 'dia', false, 1, 2], ['Rabbit', 'Coelho', .8, 'noite', false, 1, 2], ['Ferret', 'Furão', .6, 'noite', false, 1, 2], ['TybarLobo', 'Lobo', 2, 'noite', true, 1, 6], ['TybarWarg', 'Warg', 8, 'noite', true], ['GrizzlyBear', 'Urso cinzento', .6, 'noite', true, 1, 2]]) },
  { id: 3, nome: 'Floresta', criaturas: ap([['Hind', 'Corça', .8, 'sempre', false], ['GreatHart', 'Cervo', .4, 'sempre', false], ['Boar', 'Javali', .4, 'noite', false, 4, 8], ['Parrot', 'Papagaio', .6, 'sempre', false], ['BrownBear', 'Urso marrom', .5, 'sempre', true, 1, 3], ['TybarLobo', 'Lobo', 2.5, 'noite', true, 1, 6], ['TybarWarg', 'Warg', 8, 'noite', true], ['Cougar', 'Puma', 1, 'noite', true], ['TybarFantasma', 'Fantasma', 4, 'noite', true, 1, 1, 'névoa']]) },
  { id: 4, nome: 'Pântano', criaturas: ap([['Snake', 'Cobra', 1, 'sempre', true], ['Alligator', 'Jacaré', .8, 'sempre', true, 1, 8], ['Bogling', 'Bogling', .8, 'sempre', true], ['Lizardman', 'Homem-lagarto', .6, 'sempre', true], ['BullFrog', 'Sapo-touro', .8, 'noite', true], ['GiantSerpent', 'Serpente gigante', .1, 'sempre', true]]) },
  { id: 5, nome: 'Neve', criaturas: ap([['TybarUrsoPolar', 'Urso polar', .5, 'sempre', true], ['SnowLeopard', 'Leopardo das neves', .8, 'noite', true], ['Walrus', 'Morsa', .6, 'sempre', false, 6, 12], ['DireWolf', 'Lobo gigante', .2, 'noite', true, 1, 6, 'nevasca']]) },
  { id: 6, nome: 'Floresta Numaja', criaturas: ap([['TybarFada', 'Fada', 1, 'sempre', false], ['TybarEnt', 'Ent', .6, 'sempre', true], ['Unicorn', 'Unicórnio', .2, 'sempre', false], ['Gaman', 'Gaman', .6, 'dia', false, 1, 8], ['ForestOstard', 'Ostard da floresta', .5, 'dia', false, 1, 4], ['Panther', 'Pantera', .5, 'noite', true, 1, 2]]) },
]

const PERIGOSOS = new Set(['Alligator', 'BrownBear', 'BullFrog', 'DireWolf', 'GiantSerpent', 'GrizzlyBear', 'Panther', 'SnowLeopard', 'Snake', 'TybarWarg', 'Sewerrat', 'Boar'])
const titulo = (s: string) => s.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())

function zonasDosCfg() {
  return Object.entries(cfgs).map(([caminho, txt], i) => {
    const arq = caminho.split('/').pop()!.replace('.cfg', '')
    let tipo = ''
    const linhas: number[][] = []
    for (const l of txt.split(/\r?\n/)) {
      const t = l.trim()
      if (!t || t.startsWith('#')) continue
      if (t.startsWith('tipo ')) { tipo = t.slice(5).trim(); continue }
      const n = t.split(/\s+/).map(Number)
      if (n.length === 4 && n.every(v => !isNaN(v))) linhas.push(n)
    }
    // junta linhas iguais empilhadas (mesmo x e largura, uma logo abaixo da outra)
    linhas.sort((a, b) => a[0] - b[0] || a[2] - b[2] || a[1] - b[1])
    const rets: { x: number; y: number; largura: number; altura: number }[] = []
    for (const [x, y, w, h] of linhas) {
      const u = rets[rets.length - 1]
      if (u && u.x === x && u.largura === w && u.y + u.altura === y) u.altura += h
      else rets.push({ x, y, largura: w, altura: h })
    }
    const noite = /warg|lobo|pantera|leopardo|sapo/.test(arq)
    return {
      id: arq, nome: titulo(arq), criatura: { tipo, nome: titulo(arq.replace('_de_dia', '')) }, retangulos: rets,
      horario: arq === 'warg_de_dia' ? 'dia' : noite ? 'noite' : 'sempre', perigoso: PERIGOSOS.has(tipo),
      clima: arq === 'lobo_gigante' ? 'nevasca' : null,
      nivel: null, grupoMin: 1, grupoMax: arq === 'javali' ? 6 : 2, maximo: 20 + i,
      ajustes: arq === 'urso_cinzento' ? { pericia_ataque: 85, pericia_defesa: 70, dano: 15, vida: 20, armadura: null, velocidade: null, nome: 'urso cinzento das montanhas' } : null,
    }
  })
}

let zonas: any[] | null = null
const catalogo = () => {
  const m = new Map<string, any>()
  for (const b of biomas) for (const c of b.criaturas) m.set(c.tipo, { tipo: c.tipo, nome: c.nome, perigoso: c.perigoso })
  for (const z of zonas ?? []) if (!m.has(z.criatura.tipo)) m.set(z.criatura.tipo, { tipo: z.criatura.tipo, nome: z.criatura.nome, perigoso: z.perigoso })
  for (const [tipo, nome, perigoso] of [['TybarOrcSword', 'Orc espadachim', true], ['Mongbat', 'Morcego-macaco', true], ['TybarOgro', 'Ogro', true]] as const) m.set(tipo, { tipo, nome, perigoso })
  return [...m.values()]
}

export function mapaFauna(staff: boolean) {
  zonas ??= zonasDosCfg()
  const pub = (o: any) => { const { peso: _p, grupoMin: _a, grupoMax: _b, maximo: _m, nivel: _n, ajustes: _j, ...r } = o; return r }
  return {
    gerado_em: new Date().toISOString(), largura: 6144, altura: 4096,
    grade: { celula: 8, colunas: 768, linhas: 512, dados: gradeRle.trim() },
    biomas: biomas.map(b => ({ ...b, criaturas: staff ? b.criaturas : b.criaturas.map(pub) })),
    zonas: staff ? zonas : zonas.map(pub),
    criaturas: catalogo(),
    climas: ['chuva', 'tempestade', 'neve', 'nevasca', 'névoa', 'calor'],
  }
}

export function salvarZonasMock(corpo: any): { status?: number; data: any } {
  const lista = corpo?.zonas
  if (!Array.isArray(lista)) return { status: 400, data: { erro: 'Corpo sem "zonas".' } }
  const problemas: string[] = []
  const cat = catalogo()
  lista.forEach((z: any, i: number) => {
    if (!z.criatura) problemas.push(`zona ${i + 1}: sem criatura`)
    if (!Array.isArray(z.retangulos) || !z.retangulos.length) problemas.push(`${z.nome || 'zona ' + (i + 1)}: sem retângulos`)
    for (const r of z.retangulos ?? []) if (r.x < 0 || r.y < 0 || r.x + r.largura > 6144 || r.y + r.altura > 4096 || r.largura < 1 || r.altura < 1) { problemas.push(`${z.nome}: retângulo fora do mapa`); break }
  })
  if (problemas.length) return { status: 400, data: { erro: 'Zonas inválidas', problemas } }
  let n = 0
  zonas = lista.map((z: any) => {
    const c = cat.find(c => c.tipo === z.criatura)
    return { ...z, id: z.id ?? 'zona_' + Date.now().toString(36) + (n++), perigoso: c?.perigoso ?? false, criatura: { tipo: z.criatura, nome: c?.nome ?? z.criatura } }
  })
  return { data: { ok: true, zonas } }
}
