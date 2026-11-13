// Confere as builds iniciais (src/data/buildsSugeridas.ts) com as regras reais (src/data/regras_ficha.json)
// e os nomes de talento (src/data/talentos.json). Uso: npm run conferir-builds
import { BUILDS_SUGERIDAS, sugeridaParaBuild } from '../src/data/buildsSugeridas'
import { problemas, pontosGastos, pontosTotais } from '../src/ficha'
import { normalizarRegras } from '../src/api/site'
import regrasApi from '../src/data/regras_ficha.json'
import talentos from '../src/data/talentos.json'

const r = normalizarRegras(regrasApi as any)
const nomes = new Set((talentos as any).talentos.map((t: any) => t.nome))
let ruins = 0
for (const s of BUILDS_SUGERIDAS) {
  const b = sugeridaParaBuild(s)
  const p = problemas(r, b)
  const tal = s.talentos.map(t => t.nome.replace(/ \(Geral\)$/, '')).filter(n => !nomes.has(n))
  if (tal.length) p.push('talentos desconhecidos: ' + tal.join(', '))
  const g = pontosGastos(r, b.pericias ?? {}, b.caminho, b.vocacao, b.traco), t = pontosTotais(r, b.vocacao, b.traco, b.vantagem)
  if (p.length) ruins++
  console.log((p.length ? 'ERRO ' : 'ok   ') + s.id.padEnd(26) + ` ${g}/${t}` + (p.length ? '  ' + p.join(' | ') : ''))
}
console.log(`${BUILDS_SUGERIDAS.length} builds, ${ruins} com problema`)
if (ruins) process.exitCode = 1

// Builds oficiais do servidor (TybarServer/Tybar/Data/Tybar/Site/builds_oficiais.json)
import oficiais from '../../TybarServer/Tybar/Data/Tybar/Site/builds_oficiais.json'
const TI: Record<string, number> = { Terciaria: 1, Secundaria: 2, Primaria: 3 }
let ruinsO = 0
for (const o of oficiais as any[]) {
  const b = { ...o, atributos: { str: o.atributos.forca, dex: o.atributos.destreza, int: o.atributos.inteligencia }, pericias: Object.fromEntries(Object.entries(o.pericias).map(([k, v]) => [k, TI[v as string]])) }
  const p = problemas(r, b)
  if (p.length) ruinsO++
  console.log((p.length ? 'ERRO ' : 'ok   ') + o.id.padEnd(30) + ` ${pontosGastos(r, b.pericias, b.caminho, b.vocacao, b.traco)}/${pontosTotais(r, b.vocacao, b.traco, b.vantagem)}` + (p.length ? '  ' + p.join(' | ') : ''))
}
console.log(`${(oficiais as any[]).length} oficiais, ${ruinsO} com problema`)
if (ruinsO) process.exit(1)
