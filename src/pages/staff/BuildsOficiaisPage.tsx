import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getBuilds, getRegras, tornarOficial, msgErro } from '../../api/site'
import BuildCard from '../../components/BuildCard'
import { CabecalhoPagina, Carregando, Erro, useDados, useTitulo } from '../../components/ui'

export default function BuildsOficiaisPage() {
  useTitulo('Builds oficiais')
  const oficiais = useDados(() => getBuilds('oficial'))
  const comunidade = useDados(() => getBuilds('comunidade'))
  const regras = useDados(getRegras)
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)

  async function marcar(id: string, oficial: boolean) {
    setMsg(null)
    try { await tornarOficial(id, oficial); setMsg({ ok: true, t: oficial ? 'Build promovida a oficial.' : 'Selo oficial retirado.' }); oficiais.carregar(); comunidade.carregar() }
    catch (e) { setMsg({ ok: false, t: msgErro(e) }) }
  }

  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Staff" titulo="Builds oficiais">
        Crie uma build no simulador marcando “Publicar como build oficial”, ou promova uma da comunidade.
      </CabecalhoPagina>
      <div className="linha" style={{ marginBottom: 20 }}><Link className="btn" to="/simulador">Nova build oficial</Link></div>
      {msg && <div className={'aviso ' + (msg.ok ? 'aviso-ok' : 'aviso-erro')} role="status" style={{ marginBottom: 14 }}>{msg.t}</div>}
      <h2 style={{ marginBottom: 14 }}>Oficiais</h2>
      {oficiais.carregando && <Carregando />}
      {oficiais.erro && <Erro erro={oficiais.erro} tentar={oficiais.carregar} />}
      <div className="grade grade-3">
        {oficiais.dados?.map(b => <BuildCard key={b.id} b={b} r={regras.dados} extra={<>
          <Link className="btn btn-2 btn-p" to={'/simulador/' + b.id}>Editar</Link>
          <button className="btn btn-2 btn-p" onClick={() => marcar(b.id, false)}>Tirar selo</button>
        </>} />)}
      </div>
      <h2 style={{ margin: '36px 0 14px' }}>Da comunidade</h2>
      {comunidade.carregando && <Carregando />}
      {comunidade.erro && <Erro erro={comunidade.erro} tentar={comunidade.carregar} />}
      <div className="grade grade-3">
        {comunidade.dados?.map(b => <BuildCard key={b.id} b={b} r={regras.dados} extra={<button className="btn btn-p" onClick={() => marcar(b.id, true)}>Tornar oficial</button>} />)}
      </div>
      {comunidade.dados && !comunidade.dados.length && <div className="vazio">Nenhuma build da comunidade.</div>}
    </div>
  )
}
