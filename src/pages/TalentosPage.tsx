import { useEffect, useMemo, useState } from 'react'
import { Busca, CabecalhoPagina, useTitulo } from '../components/ui'

type T = { caminho: string; nivel: number; tipo: string; marcador: boolean; requer: string[]; nome: string; descricao: string; ativo: boolean; comandos: string[]; status?: string; id?: string }
const COR: Record<string, string> = { implantado: '#6fbf73', parcial: '#e0b050', 'sem efeito': '#d06a5a' }

export default function TalentosPage({ staff = false }: { staff?: boolean }) {
  useTitulo('Talentos')
  const [todos, setTodos] = useState<T[]>([])
  useEffect(() => {
    const carregar = staff ? import('../data/talentos_staff.json') : import('../data/talentos.json')
    carregar.then(m => setTodos((m.default as { talentos: T[] }).talentos))
  }, [staff])
  const [busca, setBusca] = useState('')
  const [caminho, setCaminho] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')
  const caminhos = useMemo(() => Array.from(new Set(todos.map(t => t.caminho))), [todos])
  const lista = useMemo(() => {
    const q = busca.toLowerCase()
    return todos.filter(t => (!caminho || t.caminho === caminho) && (!status || t.status === status) &&
      (!tipo || (tipo === 'ativo' ? t.ativo : !t.ativo)) && (!q || (t.nome + ' ' + t.descricao + ' ' + t.comandos.join(' ')).toLowerCase().includes(q)))
  }, [todos, busca, caminho, status, tipo])
  const grupos = caminhos.filter(c => lista.some(t => t.caminho === c))

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre={staff ? 'Staff' : 'Jogador'} titulo="Talentos">
        {staff ? 'Todos os talentos de todos os caminhos, por nível, com o estado de implantação segundo o mapa do código.'
          : 'A árvore de talentos de cada caminho: o que cada um faz e em que nível se escolhe.'}
      </CabecalhoPagina>
      <div className="linha" style={{ marginBottom: 12 }}>
        <Busca valor={busca} mudar={setBusca} rotulo="Buscar talento" />
        <label className="campo" style={{ minWidth: 200 }}><span className="sr-only">Caminho</span>
          <select className="entrada" value={caminho} onChange={e => setCaminho(e.target.value)}>
            <option value="">Todos os caminhos</option>
            {caminhos.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="campo" style={{ minWidth: 150 }}><span className="sr-only">Tipo</span>
          <select className="entrada" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Ativos e passivos</option><option value="ativo">Só ativos</option><option value="passivo">Só passivos</option>
          </select>
        </label>
        {staff && (
          <label className="campo" style={{ minWidth: 150 }}><span className="sr-only">Status</span>
            <select className="entrada" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Todos os status</option><option value="implantado">Implantado</option><option value="parcial">Parcial</option><option value="sem efeito">Sem efeito</option>
            </select>
          </label>
        )}
      </div>
      <p className="discreto" aria-live="polite">{lista.length} talentos</p>
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
                    <div key={t.nome + t.nivel} className="painel painel-fino" style={t.marcador ? { borderColor: 'var(--ouro)' } : undefined}>
                      <b style={{ color: 'var(--pergaminho)' }}>{t.nome}</b>
                      <div className="discreto" style={{ margin: '2px 0 6px' }}>
                        {t.tipo} · {t.ativo ? 'ativo' : 'passivo'}
                        {staff && t.status && <> · <span style={{ color: COR[t.status] }}>{t.status}</span></>}
                      </div>
                      <div className="texto-2">{t.descricao}</div>
                      {!!t.comandos.length && <div className="discreto" style={{ marginTop: 6 }}>Comando: {t.comandos.join(', ')}</div>}
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
