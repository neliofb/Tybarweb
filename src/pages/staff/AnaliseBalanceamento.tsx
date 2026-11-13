import analise from '../../data/analiseCombate.json'
import { RECOMENDACOES } from '../../data/recomendacoesCombate'

// Análise estática (tools/combate/balanceamento.py sobre combate_*.jsonl do oficial).
type Linha = { chave: string; [k: string]: string | number | null | undefined }
const n1 = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—')

function Tabela({ titulo, linhas, cols, max = 15 }: { titulo: string; linhas: Linha[]; cols: [string, string][]; max?: number }) {
  return (
    <div className="tabela-envolve">
      <h4>{titulo}</h4>
      <table className="tabela">
        <thead><tr><th></th>{cols.map(([, n]) => <th key={n}>{n}</th>)}</tr></thead>
        <tbody>{linhas.slice(0, max).map(l => <tr key={l.chave}><td>{l.chave}</td>{cols.map(([k]) => <td key={k}>{n1(l[k])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

const GOLPE: [string, string][] = [['golpes', 'Golpes'], ['acerto', 'Acerto %'], ['danos', 'Danos'], ['media', 'Média'], ['crit', 'Crít. %'], ['max', 'Máx.'], ['esperado', 'Dano/golpe']]

export default function AnaliseBalanceamento() {
  const a = analise as unknown as Record<string, any>
  const c = a.maiorCritico
  return (
    <div className="painel">
      <h2 style={{ marginTop: 0 }}>Análise de balanceamento — {a.geradoEm}</h2>
      <p className="discreto">Período {a.periodo?.join(' a ')} · {a.arquivos} arquivos · {a.eventos?.toLocaleString('pt-BR')} eventos. Só golpes de arma de jogadores; “Dano/golpe” = acerto × média.</p>
      {c && <p><b>Maior crítico já registrado:</b> {c.valor} de dano ({c.critico}) — {c.jogador} ({c.kit}) com {c.arma} em {c.alvo}, {c.data} UTC. Também é o maior golpe único do registro.</p>}

      <h3>Recomendações</h3>
      <ol>{RECOMENDACOES.map(r => <li key={r.titulo}><b>{r.titulo}</b> — {r.texto} <span className="discreto">({r.onde})</span></li>)}</ol>

      <Tabela titulo="Por kit" linhas={a.kit} cols={GOLPE} />
      <Tabela titulo="Por arma" linhas={a.arma} cols={GOLPE} max={25} />
      <Tabela titulo="Por estilo" linhas={a.estilo} cols={GOLPE} />
      <Tabela titulo="Por perícia de ataque" linhas={a.pericia} cols={[['golpes', 'Golpes'], ['acerto', 'Acerto %']]} />
      <Tabela titulo="Curas por fonte" linhas={a.curas} cols={[['n', 'Vezes'], ['media', 'Média'], ['total', 'Total'], ['aproveitamento', 'Aproveit. %']]} />
      <Tabela titulo="Cura por kit (quem cura)" linhas={a.curaPorKit} cols={[['n', 'Vezes'], ['media', 'Média'], ['total', 'Total']]} />
      <Tabela titulo="Habilidades (sistema:ação)" linhas={a.acoes} cols={[['n', 'Usos'], ['sucesso', 'Sucesso %']]} max={25} />
      <Tabela titulo="Mortes" linhas={a.mortes} cols={[['n', 'Mortes']]} />
      <Tabela titulo="Quem mais mata jogadores" linhas={a.matadoresDeJogador} cols={[['n', 'Mortes']]} />
      <Tabela titulo="Mortes de jogador por kit" linhas={a.mortesPorKit} cols={[['n', 'Mortes']]} />
      <Tabela titulo="PvP" linhas={a.pvp} cols={[['n', 'Mortes']]} />
    </div>
  )
}
