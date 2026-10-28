import ComoUsarBuild from '../components/ComoUsarBuild'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getMinhasBuilds, getRegras, usarBuild, desmarcarBuild, apagarBuild, msgErro, Build } from '../api/site'
import BuildCard from '../components/BuildCard'
import { CabecalhoPagina, Carregando, Erro, Modal, useDados, useTitulo } from '../components/ui'

export default function MinhasBuildsPage() {
  useTitulo('Minhas builds')
  const builds = useDados(getMinhasBuilds)
  const regras = useDados(getRegras)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [apagar, setApagar] = useState<Build | null>(null)

  async function usar(b: Build) {
    setMsg(null)
    try { const r = await usarBuild(b.id); setMsg({ ok: true, t: r.data?.mensagem ?? `“${b.nome}” marcada para o próximo personagem.` }); builds.carregar() }
    catch (e) { setMsg({ ok: false, t: msgErro(e) }) }
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Jogador" titulo="Minhas builds">
        Marque uma build com <b>Usar no próximo personagem</b>: na criação do personagem, o jogo oferece “Usar a build escolhida no site” e preenche a ficha (avisando se algo não couber mais).
      </CabecalhoPagina>
      <div className="linha" style={{ marginBottom: 20 }}><Link to="/simulador" className="btn">Criar build</Link></div>
      <ComoUsarBuild />
      <div style={{ height: 20 }} />
      {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status" style={{ marginBottom: 18 }}>{msg.t}</div>}
      {builds.carregando && <Carregando />}
      {builds.erro && <Erro erro={builds.erro} tentar={builds.carregar} />}
      {builds.dados && (builds.dados.length ? (
        <div className="grade grade-3">
          {builds.dados.map(b => (
            <BuildCard key={b.id} b={b} r={regras.dados} extra={<>
              {b.emUso
                ? <button className="btn btn-2 btn-p" onClick={async () => { try { await desmarcarBuild(); setMsg({ ok: true, t: 'Nenhuma build marcada agora.' }); builds.carregar() } catch (e) { setMsg({ ok: false, t: msgErro(e) }) } }}>Desmarcar</button>
                : <button className="btn btn-p" onClick={() => usar(b)}>Usar no próximo personagem</button>}
              <Link className="btn btn-2 btn-p" to={'/simulador/' + b.id}>Editar</Link>
              <button className="btn btn-perigo btn-p" onClick={() => setApagar(b)}>Apagar</button>
            </>} />
          ))}
        </div>
      ) : <div className="vazio">Você ainda não tem builds. <Link to="/simulador">Monte a primeira no simulador.</Link></div>)}
      <Modal titulo="Apagar build?" aberto={!!apagar} fechar={() => setApagar(null)} acoes={<>
        <button className="btn btn-2" onClick={() => setApagar(null)}>Cancelar</button>
        <button className="btn btn-perigo" onClick={async () => {
          try { await apagarBuild(apagar!.id); setMsg({ ok: true, t: 'Build apagada.' }); builds.carregar() } catch (e) { setMsg({ ok: false, t: msgErro(e) }) }
          setApagar(null)
        }}>Apagar</button>
      </>}>
        <p>“{apagar?.nome}” some para sempre.</p>
      </Modal>
    </div>
  )
}
