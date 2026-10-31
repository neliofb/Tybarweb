// Aba "Onde upar" do /mapa (também em /onde-upar): faixas de PERÍCIA DE COMBATE (1 Mão/Tactics) por região (GET /api/fauna/niveis) cruzadas com
// as criaturas do /api/fauna/mapa. Cores: verde fácil → amarelo → laranja → vermelho difícil.
import { useMemo, useState } from 'react'
import { getFaixasNivel, FaixaNivel, MapaFauna as Mapa, LEGENDA_FAIXAS, PERICIA_MAX, faixaEm, ROTULO_HORARIO, Horario } from '../api/fauna'
import MapaFauna from '../components/MapaFauna'
import { Carregando, Erro, useDados } from '../components/ui'

type Avaliacao = { rotulo: string; classe: string; peso: number }
// perícia 0 = "não escolhi" (o controle começa em —); quem tem 0 de verdade escolhe 1
function avaliar(f: FaixaNivel, nivel: number): Avaliacao {
  if (!nivel) return { rotulo: '', classe: 'selo-neutro', peso: .5 }
  if (nivel >= f.min && nivel <= f.max) return { rotulo: 'Ideal para você', classe: 'selo-ok', peso: .85 }
  // mob até 10 pontos acima ainda ensina; mais que isso, você erra demais e não ganha perícia
  if (nivel < f.min) return f.min - nivel <= 10 ? { rotulo: 'Desafiador', classe: 'selo-pendente', peso: .3 } : { rotulo: 'Perigoso para você', classe: 'selo-mal', peso: .04 }
  return { rotulo: 'Fácil demais', classe: 'selo-neutro', peso: .04 }
}

interface Criatura { tipo: string; nome: string; perigoso: boolean; horarios: Set<Horario> }

/** criaturas dos biomas (grade 8x8) e das zonas que cruzam a região */
function criaturasDa(m: Mapa, f: FaixaNivel): Criatura[] {
  const ids = new Set<number>(), out = new Map<string, Criatura>()
  const add = (tipo: string, nome: string, perigoso: boolean, h: Horario) => {
    const c = out.get(tipo) ?? { tipo, nome, perigoso, horarios: new Set<Horario>() }
    c.horarios.add(h); c.perigoso ||= perigoso; out.set(tipo, c)
  }
  for (const r of f.retangulos) {
    const passo = Math.max(1, Math.floor(Math.max(r.largura, r.altura) / m.celula / 60)) // no máximo ~60x60 amostras
    for (let cy = Math.floor(r.y / m.celula); cy < Math.ceil((r.y + r.altura) / m.celula); cy += passo)
      for (let cx = Math.floor(r.x / m.celula); cx < Math.ceil((r.x + r.largura) / m.celula); cx += passo) {
        if (cx < 0 || cy < 0 || cx >= m.colunas || cy >= m.linhas) continue
        const id = m.grade[cy * m.colunas + cx]; if (id) ids.add(id)
      }
    for (const z of m.zonas)
      if (z.retangulos.some(q => q.x < r.x + r.largura && q.x + q.largura > r.x && q.y < r.y + r.altura && q.y + q.altura > r.y))
        add(z.criatura, z.nomeCriatura, z.perigoso, z.horario)
  }
  for (const b of m.biomas) if (ids.has(b.id)) for (const c of b.criaturas) add(c.tipo, c.nome, c.perigoso, c.horario)
  return [...out.values()].sort((a, b) => Number(b.perigoso) - Number(a.perigoso) || a.nome.localeCompare(b.nome, 'pt'))
}

export default function OndeUpar({ mapa }: { mapa: Mapa }) {
  const d = useDados(getFaixasNivel)
  const faixas = d.dados ?? []
  const [nivel, setNivel] = useState(0)
  const [sel, setSel] = useState<string | null>(null)
  const faixa = faixas.find(f => f.id === sel) ?? null
  const criaturas = useMemo(() => (faixa ? criaturasDa(mapa, faixa) : []), [mapa, faixa])
  const ordenadas = useMemo(() => [...faixas].sort((a, b) => {
    const pa = avaliar(a, nivel).peso, pb = avaliar(b, nivel).peso
    return pb - pa || a.min - b.min
  }), [faixas, nivel])

  if (d.carregando) return <Carregando />
  if (d.erro) return <Erro erro={d.erro} tentar={d.carregar} />

  return (
    <div className="mapa-layout">
      <div>
        <section className="painel painel-fino" style={{ marginBottom: 10 }}>
          <div className="meu-nivel">
            <label htmlFor="meu-nivel"><strong>Minha perícia de combate</strong> <small className="discreto">(1 Mão / Tactics)</small></label>
            <input id="meu-nivel" type="range" min={0} max={PERICIA_MAX} value={nivel} onChange={e => setNivel(+e.target.value)} aria-valuetext={nivel ? 'perícia ' + nivel : 'nenhuma'} />
            <span className="valor" aria-hidden="true">{nivel || '—'}</span>
            {nivel > 0 && <button className="btn-link" onClick={() => setNivel(0)}>limpar</button>}
          </div>
          <p className="discreto" style={{ margin: '6px 0 0' }}>{nivel ? 'As regiões boas para a sua perícia ficam acesas; as outras, apagadas.' : 'Arraste para escolher a sua perícia de combate (a de 1 Mão ou de Tactics, a menor das duas) e destacar onde caçar.'}</p>
        </section>
        <MapaFauna mapa={mapa} rotulo="Mapa das faixas de perícia" mostrarBiomas={false} mostrarZonas={false}
          aoTocar={(x, y) => setSel(faixaEm(faixas, x, y)?.id ?? null)}>
          {s => (
            <g>
              {faixas.map(f => {
                const a = avaliar(f, nivel), escolhida = f.id === sel
                return (
                  <g key={f.id}>
                    {f.retangulos.map((r, i) => (
                      <rect key={i} x={r.x} y={r.y} width={r.largura} height={r.altura} fill={f.cor} fillOpacity={escolhida ? Math.max(a.peso, .55) : a.peso}
                        stroke={escolhida ? '#fff' : f.cor} strokeOpacity={escolhida ? 1 : a.peso >= .8 ? 1 : a.peso < .1 ? .15 : .5}
                        strokeWidth={(escolhida ? 4 : a.peso >= .8 ? 3 : 1) / s} />
                    ))}
                  </g>
                )
              })}
              {faixas.map(f => {
                const r = f.retangulos.reduce((m, q) => (q.largura * q.altura > m.largura * m.altura ? q : m), f.retangulos[0])
                if (!r) return null
                const fonte = Math.min(24 / s, r.largura / 4.5, r.altura / 1.6)
                if (fonte * s < 9) return null
                const a = avaliar(f, nivel)
                return (
                  <text key={f.id + 't'} x={r.x + r.largura / 2} y={r.y + r.altura / 2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={fonte} fontFamily="Cinzel, serif" fontWeight={700} fill="#fff" stroke="#000" strokeWidth={fonte / 7} paintOrder="stroke"
                    opacity={a.peso < .1 ? .25 : a.peso < .5 ? .6 : 1} style={{ pointerEvents: 'none' }}>
                    Perícia {f.min}–{f.max}
                  </text>
                )
              })}
            </g>
          )}
        </MapaFauna>
        {faixas.length === 0 && <p className="discreto" style={{ marginTop: 8 }}>A staff ainda não marcou as faixas no mapa.</p>}
      </div>

      <aside className="mapa-lateral">
        <section className="painel painel-fino" aria-live="polite">
          {!faixa ? (
            <>
              <h3>Toque numa região</h3>
              <p className="texto-2">Veja a faixa de nível dos monstros e as criaturas que aparecem por lá.</p>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: 4 }}>{faixa.nome}</h3>
              <div className="faixa-grande" style={{ color: faixa.cor }}>Perícia {faixa.min}–{faixa.max}</div>
              {nivel > 0 && <span className={'selo ' + avaliar(faixa, nivel).classe} style={{ marginTop: 6 }}>{avaliar(faixa, nivel).rotulo}</span>}
              <p className="discreto" style={{ margin: '8px 0' }}>Região para quem tem perícia de combate entre {faixa.min} e {faixa.max}: os monstros que nascem aqui lutam nesse patamar, então você acerta cerca de metade dos golpes e ainda aprende. Sozinho, cada um leva uns 30 s; dois ou três juntos são perigosos. Animais comuns não mudam.</p>
              <h4>Criaturas por aqui</h4>
              {criaturas.length === 0 ? <p className="texto-2">Nenhuma criatura conhecida nesta região.</p> : (
                <ul className="lista-fauna">
                  {criaturas.map(c => (
                    <li key={c.tipo}>
                      <span>{c.nome}</span>
                      <span className="linha" style={{ gap: 4 }}>
                        <span className="selo selo-neutro">{c.horarios.has('sempre') || c.horarios.size > 1 ? ROTULO_HORARIO.sempre : ROTULO_HORARIO[[...c.horarios][0]]}</span>
                        {c.perigoso ? <span className="selo selo-mal">Perigoso</span> : <span className="selo selo-ok">Pacífico</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
        <section className="painel painel-fino">
          <h3>Legenda</h3>
          <ul className="legenda-faixas">
            {LEGENDA_FAIXAS.map(l => <li key={l.cor}><span className="amostra" style={{ background: l.cor }} aria-hidden="true" /><span>{l.rotulo} <small className="discreto">({l.dica})</small></span></li>)}
          </ul>
        </section>
        {faixas.length > 0 && (
          <section className="painel painel-fino">
            <h3>{nivel ? 'Melhores para a perícia ' + nivel : 'Regiões'}</h3>
            <ul className="lista-faixas">
              {ordenadas.map(f => {
                const a = avaliar(f, nivel)
                return (
                  <li key={f.id}>
                    <button aria-pressed={f.id === sel} onClick={() => setSel(f.id)}>
                      <span className="amostra ponto-cor" style={{ background: f.cor }} aria-hidden="true" />
                      <span style={{ flex: 1 }}>{f.nome}</span>
                      <strong>{f.min}–{f.max}</strong>
                      {nivel > 0 && a.rotulo && <span className={'selo ' + a.classe}>{a.rotulo.replace(' para você', '')}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </aside>
    </div>
  )
}
