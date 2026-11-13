import { useEffect, useMemo, useState } from 'react'
import { getCombate, DimCombate, LinhaCombate, StatsCombate } from '../../api/combate'
import { msgErro } from '../../api/site'
import AnaliseBalanceamento from './AnaliseBalanceamento'
import EquilibrioCombate from './EquilibrioCombate'
import { CabecalhoPagina, Carregando, Erro, useTitulo } from '../../components/ui'

const DIMS: { id: DimCombate; nome: string }[] = [
  { id: 'classe', nome: 'Classe/kit' }, { id: 'estilo', nome: 'Arma (estilo)' }, { id: 'modelo', nome: 'Arma (modelo)' },
  { id: 'matArma', nome: 'Material da arma' }, { id: 'matArmadura', nome: 'Material da armadura' },
  { id: 'faixa', nome: 'Faixa de perícia da arma' }, { id: 'periciaTop', nome: 'Perícia mais alta (arma/magia)' },
  { id: 'magia', nome: 'Magia/ação' }, { id: 'escola', nome: 'Escola' }, { id: 'jogador', nome: 'Jogador' },
]
type Col = 'chave' | 'causado' | 'nCausado' | 'media' | 'recebido' | 'cura' | 'golpes' | 'acerto' | 'crit'
const COLS: { id: Col; nome: string }[] = [
  { id: 'chave', nome: '' }, { id: 'causado', nome: 'Dano causado' }, { id: 'nCausado', nome: 'Qtde de danos' }, { id: 'media', nome: 'Média/dano' },
  { id: 'recebido', nome: 'Dano recebido' }, { id: 'cura', nome: 'Cura' }, { id: 'golpes', nome: 'Golpes' }, { id: 'acerto', nome: 'Acerto %' }, { id: 'crit', nome: 'Crítico %' },
]
const val = (l: LinhaCombate, c: Col): number | string => {
  switch (c) {
    case 'chave': return l.chave
    case 'media': return l.nCausado ? l.causado / l.nCausado : 0
    case 'acerto': return l.golpes ? 100 * l.acertos / l.golpes : -1
    case 'crit': return l.nCausado ? 100 * l.criticos / l.nCausado : -1
    default: return l[c]
  }
}
const f1 = (n: number) => (n < 0 ? '—' : n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }))

export default function CombateStaffPage() {
  useTitulo('Registro de combate')
  const [dias, setDias] = useState(7), [dim, setDim] = useState<DimCombate>('classe')
  const [d, setD] = useState<StatsCombate | null>(null), [erro, setErro] = useState('')
  const [ord, setOrd] = useState<Col>('causado'), [asc, setAsc] = useState(false)

  useEffect(() => {
    let vivo = true
    let t: ReturnType<typeof setTimeout> | undefined
    setD(null); setErro('')
    const buscar = () => getCombate(dias).then(r => {
      if (!vivo) return
      if (r.data.calculando) t = setTimeout(buscar, 3000); else setD(r.data)
    }).catch(e => { if (vivo) setErro(msgErro(e)) })
    buscar()
    return () => { vivo = false; if (t) clearTimeout(t) }
  }, [dias])

  const linhas = useMemo(() => {
    const l = [...(d?.[dim] ?? [])]
    l.sort((a, b) => { const x = val(a, ord), y = val(b, ord); const r = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number); return asc ? r : -r })
    return l
  }, [d, dim, ord, asc])
  const max = Math.max(1, ...linhas.map(l => l.causado))
  const clicar = (c: Col) => { if (c === ord) setAsc(!asc); else { setOrd(c); setAsc(c === 'chave') } }

  return (
    <div className="pagina">
      <CabecalhoPagina sobre="Staff" titulo="Registro de combate">Estatísticas dos jogadores a partir dos arquivos do registro de combate.</CabecalhoPagina>
      <div className="painel painel-fino" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label>Últimos dias{' '}
          <select value={dias} onChange={e => setDias(+e.target.value)}>{[1, 3, 7, 14, 30].map(n => <option key={n} value={n}>{n}</option>)}</select>
        </label>
        <label>Agrupar por{' '}
          <select value={dim} onChange={e => setDim(e.target.value as DimCombate)}>{DIMS.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
        </label>
        {d && <span className="discreto">{d.eventos?.toLocaleString('pt-BR')} eventos em {d.arquivos} arquivo(s)</span>}
      </div>
      {erro ? <Erro erro={erro} /> : !d ? <Carregando texto="Lendo os registros (pode levar alguns segundos)…" /> : (
        <div className="tabela-envolve">
          <table className="tabela">
            <thead><tr>{COLS.map(c => <th key={c.id} onClick={() => clicar(c.id)} style={{ cursor: 'pointer' }}>{c.id === 'chave' ? DIMS.find(x => x.id === dim)!.nome : c.nome}{ord === c.id ? (asc ? ' ▲' : ' ▼') : ''}</th>)}</tr></thead>
            <tbody>
              {linhas.map(l => (
                <tr key={l.chave}>
                  <td>{l.chave}</td>
                  <td><div style={{ minWidth: 120 }}>{f1(l.causado)}<div style={{ height: 4, background: 'var(--cor-destaque, #c9a227)', width: `${100 * l.causado / max}%` }} /></div></td>
                  <td>{l.nCausado}</td><td>{f1(val(l, 'media') as number)}</td><td>{f1(l.recebido)}</td><td>{f1(l.cura)}</td>
                  <td>{l.golpes}</td><td>{f1(val(l, 'acerto') as number)}</td><td>{f1(val(l, 'crit') as number)}</td>
                </tr>
              ))}
              {linhas.length === 0 && <tr><td colSpan={9} className="discreto">Sem dados neste período.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <AnaliseBalanceamento />
      <EquilibrioCombate />
      <div className="painel painel-fino">
        <h3 style={{ marginTop: 0 }}>Como ler</h3>
        <ul className="discreto" style={{ margin: 0 }}>
          <li>Só conta quem é jogador: dano causado, recebido e cura são do jogador do grupo escolhido (pets e monstros ficam de fora).</li>
          <li>Dano e cura são o valor final (depois de resistências). Média/dano = dano causado dividido pela quantidade de danos.</li>
          <li>Acerto % = golpes de arma que acertaram sobre o total de golpes; crítico % = danos com crítico ou bônus sobre a quantidade de danos. Magia não tem golpe, então o acerto fica em branco.</li>
          <li>Material da armadura é o predominante nas peças (metal, couro, tecido, osso, madeira). Magia/ação vem do contexto da ação (Sistema:Ação); escola é o sistema.</li>
          <li>Média alta com poucos danos não prova desequilíbrio: olhe também a quantidade. Os dados são atualizados a cada 5 minutos.</li>
          <li>Clique no título de uma coluna para ordenar.</li>
        </ul>
      </div>
    </div>
  )
}
