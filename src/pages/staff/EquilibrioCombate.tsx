import { useState } from 'react'
import dados from '../../data/equilibrioCombate.json'

// Migrado das paginas /equilibrio e /combate do painel local. Dados: tools/combate/equilibrio_site.py -> src/data/equilibrioCombate.json
type L = Record<string, any>
const n1 = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : v == null ? '—' : String(v))

function Tab({ titulo, linhas, cols, max = 30, nota }: { titulo: string; linhas: L[]; cols: [string, string][]; max?: number; nota?: string }) {
  return (
    <div className="tabela-envolve">
      <h4>{titulo}</h4>
      <table className="tabela">
        <thead><tr>{cols.map(([, n]) => <th key={n}>{n}</th>)}</tr></thead>
        <tbody>
          {linhas.slice(0, max).map((l, i) => <tr key={i} style={l.foraDaCurva ? { color: '#e07a5f' } : undefined}>{cols.map(([k]) => <td key={k}>{n1(l[k])}</td>)}</tr>)}
          {linhas.length === 0 && <tr><td colSpan={cols.length} className="discreto">Sem dados.</td></tr>}
        </tbody>
      </table>
      {nota && <p className="discreto">{nota}</p>}
    </div>
  )
}

export default function EquilibrioCombate() {
  const d = dados as unknown as L
  const e = d.equilibrio as L, r = d.resumo as L, k = e.kpis as L
  const [ficha, setFicha] = useState<'kit' | 'vocacao' | 'traco' | 'linha' | 'classe' | 'povo'>('kit')
  const [medida, setMedida] = useState<'danoPorMana' | 'danoPorLance' | 'curaPorMana' | 'falha'>('danoPorMana')
  const magias = [...(e.magias as L[])].sort((a, b) => (b[medida] ?? -1) - (a[medida] ?? -1))
  const data = (s?: string) => (s ? new Date(s).toLocaleString('pt-BR') : '—')
  return (
    <div className="painel">
      <h2 style={{ marginTop: 0 }}>Equilíbrio do combate</h2>
      <p className="discreto">
        Gerado em {d.geradoEm} · {(d.arquivos as string[]).join(', ')} · {k.eventos?.toLocaleString('pt-BR')} eventos ({data(k.inicio)} a {data(k.fim)}) ·
        {' '}{k.golpes} golpes, {k.danos} danos, {k.magias} magias, {k.curas} curas, {k.mortes} mortes. Comparado na mesma faixa de perícia.
        Para atualizar: <code>python tools/combate/equilibrio_site.py PASTA_DOS_LOGS</code>.
      </p>

      <h3>Alertas</h3>
      {(e.alertas as L[]).length ? <ul>{(e.alertas as L[]).map((a, i) => <li key={i}><b>{a.tipo}</b> — {a.texto}</li>)}</ul> : <p className="discreto">Nada fora do padrão (com a amostra mínima).</p>}

      <Tab titulo="Acerto: calculado × real" linhas={e.acerto} cols={[['lado', 'Lado'], ['golpes', 'Golpes'], ['calculado', 'Calculado %'], ['real', 'Real %']]} />
      <Tab titulo="Estilos por faixa de perícia" linhas={e.estilos} cols={[['estilo', 'Estilo'], ['faixa', 'Faixa'], ['golpes', 'Golpes'], ['acerto', 'Acerto %'], ['danoPorAcerto', 'Dano/acerto'], ['esperado', 'Esperado/golpe'], ['delay', 'Tempo (s)'], ['dps', 'Dano/s']]} />

      <h3>Magias</h3>
      <label>Ordenar por{' '}
        <select value={medida} onChange={ev => setMedida(ev.target.value as typeof medida)}>
          <option value="danoPorMana">Dano por mana</option><option value="danoPorLance">Dano por lançamento</option>
          <option value="curaPorMana">Cura por mana</option><option value="falha">Falha %</option>
        </select>
      </label>
      <Tab titulo="" linhas={magias} cols={[['sistema', 'Sistema'], ['acao', 'Ação'], ['faixa', 'Faixa'], ['lancadas', 'Lançadas'], ['falha', 'Falha %'], ['mana', 'Mana'], ['danoPorLance', 'Dano/lanç.'], ['danoPorMana', 'Dano/mana'], ['curaPorLance', 'Cura/lanç.'], ['curaPorMana', 'Cura/mana']]} max={40}
        nota="Falhas contam como lançamento. “Cura 0” em Clérigo/Totemista pode ser falta de instrumentação." />

      <Tab titulo="Treinos (macro) — fora das médias de magia" linhas={e.treinos} cols={[['jogador', 'Jogador'], ['sistema', 'Sistema'], ['acao', 'Ação'], ['lancadas', 'Lançadas'], ['falha', 'Falha %'], ['intervalo', 'Intervalo (s)'], ['minutos', 'Minutos']]} />
      <Tab titulo="Arma de Kitah" linhas={e.armaKitah} cols={[['acao', 'Ação'], ['armou', 'Armou'], ['golpes', 'Golpes'], ['acerto', 'Acerto %']]} />

      <h3>Fichas</h3>
      <label>Agrupar por{' '}
        <select value={ficha} onChange={ev => setFicha(ev.target.value as typeof ficha)}><option value="kit">Kit</option><option value="vocacao">Vocação</option><option value="traco">Traço</option><option value="linha">Linha</option><option value="classe">Classe</option><option value="povo">Povo</option></select>
      </label>
      <Tab titulo="" linhas={e.fichas[ficha] ?? []} cols={[['nome', 'Nome'], ['jogadores', 'Jogadores'], ['golpes', 'Golpes'], ['acerto', 'Acerto %'], ['esperado', 'Esperado/golpe'], ['recebido', 'Recebe/golpe'], ['abates', 'Abates'], ['mortes', 'Mortes'], ['ttk', 'Tempo p/ matar (s)']]} />

      <Tab titulo="Monstros contra jogadores, por nível" linhas={e.monstros} max={60} cols={[['nome', 'Monstro'], ['nivel', 'Nível'], ['vida', 'Vida'], ['golpes', 'Golpes'], ['acerto', 'Acerto %'], ['dano', 'Dano/golpe'], ['abates', 'Mataram'], ['morreu', 'Morreram'], ['ttk', 'Tempo p/ morrer (s)']]}
        nota="Em vermelho: dano por golpe mais de 35% acima da mediana dos monstros do mesmo nível (30 golpes ou mais)." />

      <h3>Resumo recente (2 dias)</h3>
      <Tab titulo="Jogadores" linhas={r.jogadores} cols={[['nome', 'Jogador'], ['ficha', 'Ficha'], ['golpes', 'Golpes'], ['acerto', 'Acerto %'], ['danoPorGolpe', 'Dano/golpe'], ['recebidoPorGolpe', 'Recebe/golpe']]} />
      <Tab titulo="Golpes: chance calculada × acerto real" linhas={r.golpes} cols={[['atk', 'Quem bate'], ['def', 'Quem apanha'], ['n', 'Golpes'], ['chance', 'Calc. %'], ['acerto', 'Real %'], ['skillAtk', 'Perícia atk'], ['valAtk', 'Valor'], ['skillDef', 'Perícia def'], ['valDef', 'Valor']]} />
      <Tab titulo="Dano por origem" linhas={r.danos} cols={[['atk', 'Quem bate'], ['def', 'Quem apanha'], ['origem', 'Origem'], ['n', 'Vezes'], ['pedido', 'Pedido'], ['final', 'Final'], ['passa', 'Passa %']]} />
    </div>
  )
}
