import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Midia, Ornamento, fontesPovo, fontesDe, useTitulo } from '../components/ui'
import { useSessao } from '../auth'

const DISCORD = import.meta.env.VITE_DISCORD_CONVITE ?? 'https://discord.gg/'
const LAUNCHER = import.meta.env.VITE_LAUNCHER_URL ?? ''
const LAUNCHER_MAC = import.meta.env.VITE_LAUNCHER_MAC_URL ?? ''

const POVOS = [
  { id: 'Thuriano', nome: 'Thuriões', txt: 'Homens do norte. Força, coragem e honra.' },
  { id: 'Zharkiano', nome: 'Zharkianos', txt: 'Senhores do mundo. Poder, riqueza e influência.' },
  { id: 'Asanita', nome: 'Asanitas', txt: 'Mestres do disfarce dentro das cidades humanas.' },
  { id: 'Aquilrano', nome: 'Aquilranos', txt: 'Senhores do deserto, forjados no calor.' },
  { id: 'Vanirio', nome: 'Vanírios', txt: 'Altos elfos, magia e navegação.' },
  { id: 'Numajene', nome: 'Numajenes', txt: 'O povo da floresta, preso à Dívida de Raiz.' },
]
const CAMINHOS = [
  { id: 'armas', nome: 'Armas', txt: 'Especialistas em combate. O maior poder em batalha e o corpo que mais aguenta.' },
  { id: 'subterfugio', nome: 'Subterfúgio', txt: 'Astúcia, sombra e oportunidade. Vencem antes da luta começar.' },
  { id: 'sabedoria', nome: 'Sabedoria', txt: 'Magia, medicina e alquimia. O conhecimento como arma.' },
]

function FundoHeroi() {
  const [semVideo, setSemVideo] = useState(false)
  return (
    <div className="heroi-fundo" aria-hidden="true">
      <Midia fontes={['/media/hero.jpg', '/media/hero.png', '/media/guerra.jpg']} alt="" rotulo=" " />
      {!semVideo && (
        <div className="midia" style={{ position: 'absolute', inset: 0, background: 'transparent' }}>
          <video autoPlay muted loop playsInline preload="metadata" poster="/media/hero.jpg" onError={() => setSemVideo(true)}>
            <source src="/media/hero.mp4" type="video/mp4" onError={() => setSemVideo(true)} />
          </video>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  useTitulo('')
  const s = useSessao()
  return (
    <>
      <section className="heroi" aria-labelledby="heroi-titulo">
        <FundoHeroi />
        <div className="heroi-conteudo">
          <div className="sobretitulo" style={{ color: 'var(--ouro)' }}>Ultima Online · interpretação obrigatória</div>
          <h1 id="heroi-titulo">Tybar</h1>
          <p className="lema">Quando tudo estava certo, a incerteza os acometeu. Um mundo feito do zero, onde cada escolha e cada palavra pertencem ao seu personagem.</p>
          <div className="acoes">
            {s.logado
              ? <Link to="/painel" className="btn btn-g">Meu painel</Link>
              : <Link to="/criar-conta" className="btn btn-g">Criar minha conta</Link>}
            <Link to="/simulador" className="btn btn-2 btn-g">Montar personagem</Link>
          </div>
        </div>
        <a href="#mundo" className="rolar">DESÇA ▾</a>
      </section>

      <section id="mundo" className="secao">
        <div className="secao-int grade grade-2" style={{ alignItems: 'center', gap: 40 }}>
          <div>
            <div className="sobretitulo">O mundo</div>
            <h2>Uma homenagem ao FLShard, reescrita do zero</h2>
            <Ornamento />
            <p>Tybar nasceu no emulador ServUO para reviver o espírito do antigo FLShard: um lugar onde a interpretação é <b>100% obrigatória</b>, e cada personagem tem peso no rumo da história.</p>
            <p>Muitas lógicas lembram aquele tempo; muitas outras foram refeitas ou criadas aqui: ofícios em cena, guerra de facções, magias pagas com sangue, clima que mata e um códice inteiro para quem quiser entender o mundo antes de pisar nele.</p>
            <div className="linha" style={{ marginTop: 22 }}>
              <Link to="/codice" className="btn btn-2">Abrir o Códice</Link>
              <Link to="/builds" className="btn btn-2">Ver builds</Link>
            </div>
          </div>
          <Midia fontes={['/media/codice.jpg', '/media/codice.png']} alt="Arte do Códice de Tybar" rotulo="Códice" className="painel" style={{ aspectRatio: '16/9', padding: 0, borderRadius: 6 }} />
        </div>
      </section>

      <section className="secao secao-escura" aria-labelledby="povos-t">
        <div className="secao-int">
          <div className="secao-cab">
            <div className="sobretitulo">Seis povos</div>
            <h2 id="povos-t">De onde vem o seu sangue?</h2>
            <p>Três povos humanos, três élficos. Cada um com a sua terra, o seu orgulho e uma vantagem que só ele tem.</p>
          </div>
          <div className="grade grade-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
            {POVOS.map(p => (
              <Link key={p.id} to={'/codice?busca=' + encodeURIComponent(p.nome)} className="carta-povo" aria-label={p.nome + ': ' + p.txt}>
                <Midia fontes={fontesPovo(p.id)} alt={p.nome} />
                <div className="rotulo"><h3>{p.nome}</h3><p>{p.txt}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="secao" aria-labelledby="caminhos-t">
        <div className="secao-int">
          <div className="secao-cab">
            <div className="sobretitulo">Três caminhos</div>
            <h2 id="caminhos-t">Ele não decide quem você é. Decide o que lhe custa aprender.</h2>
          </div>
          <div className="grade grade-3">
            {CAMINHOS.map(c => (
              <article key={c.id} className="painel" style={{ padding: 0, overflow: 'hidden' }}>
                <Midia fontes={fontesDe('caminhos', c.id)} alt={'Caminho: ' + c.nome} rotulo={c.nome} style={{ height: 220 }} />
                <div style={{ padding: 20 }}><h3>{c.nome}</h3><p className="texto-2">{c.txt}</p></div>
              </article>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link to="/simulador" className="btn">Testar uma build no simulador</Link>
          </div>
        </div>
      </section>

      <section className="secao secao-escura" aria-labelledby="comecar-t">
        <div className="secao-int">
          <div className="secao-cab">
            <div className="sobretitulo">Como entrar</div>
            <h2 id="comecar-t">Da taverna ao mundo em três passos</h2>
          </div>
          <div className="passos">
            <div className="painel passo"><h3>Entre no Discord</h3><p className="texto-2">A comunidade vive lá: avisos, sugestões e a staff. É por ele que você pede a conta.</p><a className="btn btn-discord btn-p" style={{ marginTop: 12 }} href={DISCORD} target="_blank" rel="noreferrer">Abrir o Discord</a></div>
            <div className="painel passo"><h3>Peça a sua conta</h3><p className="texto-2">Entre com o Discord aqui no site, escolha login e senha e aguarde a staff aprovar.</p><Link className="btn btn-2 btn-p" style={{ marginTop: 12 }} to="/criar-conta">Criar conta</Link></div>
            <div className="painel passo"><h3>Baixe o launcher</h3><p className="texto-2">Ele baixa e atualiza o jogo inteiro sozinho, no Windows e no Mac.</p>{LAUNCHER ? <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}><a className="btn btn-2 btn-p" href={LAUNCHER}>Baixar para Windows</a>{LAUNCHER_MAC && <a className="btn btn-2" href={LAUNCHER_MAC}>Baixar para Mac</a>}</div> : <p className="discreto" style={{ marginTop: 12 }}>O link aparece no Discord, no canal de downloads.</p>}</div>
          </div>
        </div>
      </section>

      <section className="secao" aria-labelledby="historia-t">
        <div className="secao-int" style={{ maxWidth: 1000 }}>
          <div className="secao-cab">
            <div className="sobretitulo">A história</div>
            <h2 id="historia-t">Antes de Zharkia, depois do Acordo</h2>
            <p>Dez gerações de guerra, pactos e marcas. Assista ao começo de tudo.</p>
          </div>
          <div className="painel" style={{ padding: 8 }}>
            <video controls preload="none" poster="/media/codice.jpg" style={{ width: '100%', display: 'block', borderRadius: 4, background: '#000', aspectRatio: '16/9' }}>
              <source src="/media/historia.mp4" type="video/mp4" />
              Seu navegador não toca vídeo. <a href="/media/historia.mp4">Baixe o vídeo</a>.
            </video>
          </div>
        </div>
      </section>

      <section className="secao">
        <blockquote className="citacao">
          “Este shard não é apenas um jogo, mas um espaço para criar narrativas vivas, intensas e coletivas, onde cada personagem tem peso no rumo da história.”
          <cite>— NYRO</cite>
        </blockquote>
      </section>
    </>
  )
}
