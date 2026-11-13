import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Busca, CabecalhoPagina, useTitulo } from '../components/ui'

// Gerado por tools/site/exportar_talentos.py (a partir do Scripts.dll compilado). Ver o cabeçalho do script.
type T = {
  caminho: string; caminhos?: string[]; vocacoes?: string[]; linhas?: string[]
  nivel: number; tipo: string; marcador: boolean; requer: string[]; nome: string; descricao: string; ativo: boolean; comandos: string[]; status?: string; id?: string
}
type V = { id: string; nome: string; caminho: string; linhas: { id: string; nome: string }[] }
type Arquivo = { gerado_em?: string; vocacoes?: V[]; talentos: T[] }
const COR: Record<string, string> = { implantado: '#6fbf73', parcial: '#e0b050', 'sem efeito': '#d06a5a', aposentado: '#888' }

export default function TalentosPage({ staff = false }: { staff?: boolean }) {
  useTitulo('Talentos')
  const [arq, setArq] = useState<Arquivo>({ talentos: [] })
  useEffect(() => {
    const carregar = staff ? import('../data/talentos_staff.json') : import('../data/talentos.json')
    carregar.then(m => setArq(m.default as unknown as Arquivo))
  }, [staff])
  const todos = arq.talentos
  const vocs = arq.vocacoes ?? []
  const [q, setQ] = useSearchParams()
  const set = (k: string, v: string) => { const n = new URLSearchParams(q); if (v) n.set(k, v); else n.delete(k); setQ(n, { replace: true }) }
  const caminho = q.get('caminho') ?? ''
  const vocacao = q.get('vocacao') ?? ''
  const linha = q.get('linha') ?? ''
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')
  const caminhosVoc = useMemo(() => Array.from(new Set(vocs.map(v => v.caminho))), [vocs])
  const vocSel = vocs.find(v => v.id === vocacao)
  const lista = useMemo(() => {
    const b = busca.toLowerCase()
    return todos.filter(t =>
      (!caminho || (t.caminhos ?? []).includes(caminho)) &&
      (!vocacao || (t.vocacoes ?? []).includes(vocacao)) &&
      (!linha || !(t.linhas ?? []).length || (t.linhas ?? []).includes(linha)) &&
      (!status || t.status === status) &&
      (!tipo || (tipo === 'ativo' ? t.ativo : !t.ativo)) &&
      (!b || (t.nome + ' ' + t.descricao + ' ' + t.comandos.join(' ')).toLowerCase().includes(b)))
  }, [todos, busca, caminho, vocacao, linha, status, tipo])
  const grupos = Array.from(new Set(lista.map(t => t.caminho)))

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre={staff ? 'Staff' : 'Jogador'} titulo="Talentos">
        {staff ? 'Todos os talentos do jogo, por árvore de vocação e linha, com o estado de implantação (inclui os aposentados e os que estão fora das árvores).'
          : 'Todos os talentos que um personagem pode ter: no nível 2, os Comuns do caminho e os Gerais; do nível 4 ao 20, a árvore da vocação (e da linha escolhida no nível 4, quando a vocação tem linhas). Filtre pela sua vocação para ver só a sua árvore.'}
      </CabecalhoPagina>
      <div className="linha" style={{ marginBottom: 12 }}>
        <Busca valor={busca} mudar={setBusca} rotulo="Buscar talento" />
        <label className="campo" style={{ minWidth: 170 }}><span className="sr-only">Caminho</span>
          <select className="entrada" value={caminho} onChange={e => { const n = new URLSearchParams(q); e.target.value ? n.set('caminho', e.target.value) : n.delete('caminho'); n.delete('vocacao'); n.delete('linha'); setQ(n, { replace: true }) }}>
            <option value="">Todos os caminhos</option>
            {caminhosVoc.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="campo" style={{ minWidth: 200 }}><span className="sr-only">Vocação</span>
          <select className="entrada" value={vocacao} onChange={e => { const n = new URLSearchParams(q); e.target.value ? n.set('vocacao', e.target.value) : n.delete('vocacao'); n.delete('linha'); setQ(n, { replace: true }) }}>
            <option value="">Todas as vocações</option>
            {caminhosVoc.filter(c => !caminho || c === caminho || c === 'Ofícios').map(c => (
              <optgroup key={c} label={c}>{vocs.filter(v => v.caminho === c).map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}</optgroup>
            ))}
          </select>
        </label>
        {vocSel && vocSel.linhas.length > 0 && (
          <label className="campo" style={{ minWidth: 180 }}><span className="sr-only">Linha</span>
            <select className="entrada" value={linha} onChange={e => set('linha', e.target.value)}>
              <option value="">Todas as linhas</option>
              {vocSel.linhas.map(l => <option key={l.id} value={l.id}>Linha {l.nome}</option>)}
            </select>
          </label>
        )}
        <label className="campo" style={{ minWidth: 150 }}><span className="sr-only">Tipo</span>
          <select className="entrada" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Ativos e passivos</option><option value="ativo">Só ativos</option><option value="passivo">Só passivos</option>
          </select>
        </label>
        {staff && (
          <label className="campo" style={{ minWidth: 150 }}><span className="sr-only">Status</span>
            <select className="entrada" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Todos os status</option><option value="implantado">Implantado</option><option value="parcial">Parcial</option><option value="sem efeito">Sem efeito</option><option value="aposentado">Aposentado</option>
            </select>
          </label>
        )}
      </div>
      <p className="discreto" aria-live="polite">{lista.length} talentos{arq.gerado_em ? ` · gerado em ${arq.gerado_em}` : ''}</p>
      {grupos.map(c => {
        const doc = lista.filter(t => t.caminho === c)
        const niveis = Array.from(new Set(doc.map(t => t.nivel))).sort((a, b) => a - b)
        return (
          <section key={c} style={{ marginBottom: 28 }}>
            <h2 className="titulo">{c} <span className="discreto" style={{ fontSize: 15 }}>({doc.length})</span></h2>
            {niveis.map(n => (
              <div key={n} style={{ marginBottom: 12 }}>
                <h3 style={{ margin: '8px 0', color: 'var(--ouro)' }}>Nível {n}</h3>
                <div className="grade grade-3">
                  {doc.filter(t => t.nivel === n).map(t => (
                    <div key={(t.id ?? t.nome) + t.nivel} className="painel painel-fino" style={t.marcador ? { borderColor: 'var(--ouro)' } : undefined}>
                      <b style={{ color: 'var(--pergaminho)' }}>{t.nome}</b>
                      <div className="discreto" style={{ margin: '2px 0 6px' }}>
                        {t.tipo} · {t.ativo ? 'ativo' : 'passivo'}
                        {staff && t.status && <> · <span style={{ color: COR[t.status] }}>{t.status}</span></>}
                      </div>
                      <div className="texto-2">{t.descricao}</div>
                      {!!t.comandos.length && <div className="discreto" style={{ marginTop: 6 }}>Comando: {t.comandos.join(', ')}</div>}
                      {staff && t.id && <div className="discreto" style={{ marginTop: 6 }}>ID: {t.id}{t.requer.length ? ' · requer ' + t.requer.join(', ') : ''}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )
      })}
      {!lista.length && <div className="vazio">Nada encontrado.</div>}
    </div>
  )
}
