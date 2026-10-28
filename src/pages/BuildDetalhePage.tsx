import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getBuild, getRegras, usarBuild, apagarBuild, tornarOficial, msgErro } from '../api/site'
import { useSessao } from '../auth'
import { CabecalhoPagina, Carregando, Erro, Midia, Modal, Selo, useDados, useTitulo, dataBR } from '../components/ui'
import { fontesBuild } from '../components/BuildCard'
import { custoPericia, nomeDe, pontosGastos, pontosTotais, problemas, tiersDe } from '../ficha'

export default function BuildDetalhePage() {
  const { id = '' } = useParams()
  const s = useSessao()
  const navigate = useNavigate()
  const build = useDados(() => getBuild(id), [id])
  const regras = useDados(getRegras)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [confirmar, setConfirmar] = useState(false)
  const b = build.dados, r = regras.dados
  useTitulo(b?.nome ?? 'Build')

  if (build.carregando || regras.carregando) return <div className="pagina"><Carregando /></div>
  if (build.erro || !b) return <div className="pagina"><Erro erro={build.erro || 'Build não encontrada.'} tentar={build.carregar} /></div>

  const tiers = r ? tiersDe(r) : []
  const probs = r ? problemas(r, b) : []
  const podeEditar = b.minha || s.staff

  async function acao(fn: () => Promise<any>, ok: string) {
    setMsg(null)
    try { const res = await fn(); setMsg({ ok: true, t: res?.data?.mensagem ?? ok }); build.carregar() } catch (e) { setMsg({ ok: false, t: msgErro(e) }) }
  }

  return (
    <div className="pagina">
      <div className="detalhe-build">
        <Midia className="painel" style={{ padding: 0, aspectRatio: '3/4', alignSelf: 'start' }}
          fontes={fontesBuild(b)} alt={b.nome} rotulo={b.estilo || b.nome} />
        <div>
          <div className="linha" style={{ marginBottom: 10 }}><Selo tipo={b.tipo} />{b.emUso && <span className="selo selo-ok">Marcada para o próximo personagem</span>}</div>
          <CabecalhoPagina titulo={b.nome}>{b.autor ? `por ${b.autor}` : ''}{b.criadaEm ? ` · ${dataBR(b.criadaEm)}` : ''}</CabecalhoPagina>
          {b.descricao && <p style={{ whiteSpace: 'pre-wrap', marginBottom: 20 }}>{b.descricao}</p>}
          {b.comoJoga && <section style={{ marginBottom: 18 }}><h3>Como joga</h3><p style={{ whiteSpace: 'pre-wrap' }}>{b.comoJoga}</p></section>}
          {b.porque && <section style={{ marginBottom: 18 }}><h3>Por que essas perícias</h3><p style={{ whiteSpace: 'pre-wrap' }}>{b.porque}</p></section>}
          <div className="linha" style={{ marginBottom: 20 }}>
            <Link className="btn btn-2" to={'/simulador?de=' + b.id}>{b.tipo === 'oficial' ? 'Começar a partir desta' : 'Abrir no simulador'}</Link>
            {s.logado && <button className="btn" onClick={() => acao(() => usarBuild(b.id), 'Marcada: o próximo personagem desta conta poderá usar esta build.')}>Usar no próximo personagem</button>}
            {podeEditar && <Link className="btn btn-2" to={'/simulador/' + b.id}>Editar</Link>}
            {s.staff && <button className="btn btn-2" onClick={() => acao(() => tornarOficial(b.id, b.tipo !== 'oficial'), b.tipo === 'oficial' ? 'Voltou a ser da comunidade.' : 'Agora é oficial.')}>{b.tipo === 'oficial' ? 'Tirar selo oficial' : 'Tornar oficial'}</button>}
            {podeEditar && <button className="btn btn-perigo" onClick={() => setConfirmar(true)}>Apagar</button>}
          </div>
          {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status" style={{ marginBottom: 18 }}>{msg.t}</div>}
          {probs.length > 0 && <div className="aviso aviso-erro" style={{ marginBottom: 18 }}>Esta build não fecha com as regras atuais: {probs.join(' ')}</div>}

          <div className="grade grade-2">
            <section className="painel">
              <h3>Origem</h3>
              <ul className="resumo-lista">
                <li><span>Povo</span><span>{nomeDe(r?.povos, b.povo)}</span></li>
                {b.vantagem && <li><span>Vantagem</span><span>{nomeDe(r?.vantagens, b.vantagem)}</span></li>}
                <li><span>Caminho</span><span>{nomeDe(r?.caminhos, b.caminho)}</span></li>
                <li><span>Kit</span><span>{nomeDe(r?.kits, b.kit)}</span></li>
                <li><span>Estilo</span><span>{b.estilo || '—'}</span></li>
                {b.atributos && <>
                  <li><span>Força</span><span>{b.atributos.str}</span></li>
                  <li><span>Destreza</span><span>{b.atributos.dex}</span></li>
                  <li><span>Inteligência</span><span>{b.atributos.int}</span></li>
                </>}
              </ul>
            </section>
            <section className="painel">
              <h3>Perícias</h3>
              {r && <p className="discreto" style={{ marginBottom: 6 }}>{pontosGastos(r, b.pericias ?? {}, b.caminho, b.kit)} de {pontosTotais(r, b.kit, b.vantagem)} pontos</p>}
              <ul className="resumo-lista">
                {Object.entries(b.pericias ?? {}).sort((a, z) => z[1] - a[1]).map(([pid, t]) => (
                  <li key={pid}><span title={r?.pericias.find(p => p.id === pid)?.descricao}>{nomeDe(r?.pericias, pid)}</span>
                    <span>{tiers[t - 1]?.nome ?? t}{r ? ` · ${custoPericia(r, pid, b.caminho, b.kit) * (tiers[t - 1]?.multiplicador ?? t)} pts` : ''}</span></li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Modal titulo="Apagar build?" aberto={confirmar} fechar={() => setConfirmar(false)}
        acoes={<>
          <button className="btn btn-2" onClick={() => setConfirmar(false)}>Cancelar</button>
          <button className="btn btn-perigo" onClick={async () => { try { await apagarBuild(b.id); navigate(b.minha ? '/minhas-builds' : '/builds') } catch (e) { setMsg({ ok: false, t: msgErro(e) }); setConfirmar(false) } }}>Apagar</button>
        </>}>
        <p>“{b.nome}” some para sempre. Não dá para desfazer.</p>
      </Modal>
    </div>
  )
}
