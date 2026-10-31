import { ReactNode, useState } from 'react'
import { reverter, Historico } from '../api/loot'
import { msgErro } from '../api/site'

/** Bloco "Como usar" recolhivel */
export function ComoUsar({ children }: { children: ReactNode }) {
  return (
    <details className="painel painel-fino" style={{ marginBottom: 14 }}>
      <summary style={{ cursor: 'pointer', fontFamily: 'var(--fonte-titulo)' }}>Como usar</summary>
      <div style={{ marginTop: 8, lineHeight: 1.5 }}>{children}</div>
    </details>
  )
}

export function ListaHistorico({ itens, aoReverter }: { itens: Historico[]; aoReverter: () => void }) {
  const [msg, setMsg] = useState('')
  const rev = async (id: string) => {
    if (!window.confirm('Reverter para o arquivo anterior a esta alteração? O estado atual vira um novo item do histórico.')) return
    try { await reverter(id); setMsg('Revertido; o motor já recarregou.'); aoReverter() } catch (e) { setMsg(msgErro(e)) }
  }
  return (
    <div>
      {msg && <div className="aviso" role="status" style={{ marginBottom: 8 }}>{msg}</div>}
      {itens.length === 0 ? <p className="discreto">Nenhuma alteração registrada ainda.</p> : (
        <div className="tabela-envolve"><table className="tabela"><thead><tr><th>Quando</th><th>Quem</th><th>Arquivo</th><th>Resumo</th><th /></tr></thead><tbody>
          {itens.map(h => (
            <tr key={h.id}><td>{h.quando}</td><td>{h.quem}</td><td>{h.arquivo}</td><td>{h.acao !== 'salvar' ? h.acao + ': ' : ''}{h.resumo}</td>
              <td><button className="btn btn-2 btn-p" onClick={() => rev(h.id)}>Reverter</button></td></tr>
          ))}
        </tbody></table></div>
      )}
    </div>
  )
}
