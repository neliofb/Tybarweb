import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CabecalhoPagina, useTitulo } from '../components/ui'

const M = '/media/navio/'
const Foto = ({ f, alt }: { f: string; alt: string }) => (
  <figure style={{ margin: '16px 0' }}>
    <img src={M + f} alt={alt} loading="lazy" style={{ width: '100%', maxWidth: 900, display: 'block', borderRadius: 6 }} />
    <figcaption style={{ color: 'var(--texto-2)', fontSize: 14, marginTop: 6 }}>{alt}</figcaption>
  </figure>
)

function TopicoNavio() {
  return (
    <>
      <video controls preload="metadata" poster={M + 'foto_painel.jpg'} style={{ width: '100%', maxWidth: 1000, display: 'block', borderRadius: 6, background: '#000', aspectRatio: '1280/704' }}>
        <source src={M + 'navio_tybar.mp4'} type="video/mp4" />
      </video>
      <p style={{ color: 'var(--texto-2)' }}>Vídeo de 2min33 em cinco capítulos. <a href={M + 'navio_tybar.mp4'}>Baixar o vídeo</a>.</p>

      <h2>Como conseguir</h2>
      <p>O navio é feito na <b>Marcenaria</b>: exige <b>Woodworking 40</b> e <b>500 tábuas</b>. A madeira usada conta: madeiras melhores dão defesa e casco extras (até +15% de defesa e +20% de casco). Com o navio em mãos, é só embarcar; o <b>painel de bordo abre sozinho</b> e mostra casco, água, fogo, tripulação e porão.</p>
      <Foto f="foto_painel.jpg" alt="O painel de bordo, aberto ao embarcar" />

      <h2>Postos da tripulação</h2>
      <p>Cabem <b>até 4 tripulantes</b>. Cada um ocupa um posto por vez: <b>Leme</b>, <b>Canhões</b>, <b>Reparos</b> ou <b>Convés</b>. Trocar de posto leva <b>10 segundos</b>. <b>Só o timoneiro pilota</b>; o navio anda a um passo a cada 0,4 s (0,25 s correndo).</p>

      <h2>Armas de bordo</h2>
      <p>Os <b>canhões</b> disparam por arco: <b>bombordo</b> (esquerda) e <b>estibordo</b> (direita), frente e ré, com alcance de <b>10 tiles</b> e recarga de 8 segundos. Cada tiro gasta uma <b>bala de canhão</b>, feita na forja, tirada da sua mochila ou do porão. Bala que acerta navio causa 25 a 40 de dano ao casco.</p>
      <Foto f="foto_canhoes.jpg" alt="Salva de canhões pelo bombordo" />
      <p>O <b>arpão</b> mira à proa (30 graus para cada lado), alcance 8 e recarga de 10 segundos, para fisgar e puxar o alvo.</p>
      <p><b>Ataque Naval</b> e <b>Defesa Naval</b> (0 a 100) pesam em todo combate: o Ataque aumenta o dano em até 50% e dá até +15% de acerto nos canhões e no arpão; a Defesa reduz o dano recebido em até 40%. Os dois crescem usando e vencendo.</p>
      <Foto f="foto_combate.jpg" alt="Combate naval em alto-mar" />

      <h2>Reparos e porão</h2>
      <p>O casco tem 300 pontos (mais com madeira boa). Quem está nos <b>Reparos</b> remenda com <b>5 tábuas</b> por tentativa, restaurando 30 de casco (falha gasta 2 tábuas), tira água com o <b>balde</b> e apaga o <b>fogo</b>. Casco abaixo da metade começa a vazar. O <b>porão</b> guarda tábuas, balas e carga, e vale como estoque para os tripulantes.</p>

      <h2>O porão</h2>
      <video controls preload="metadata" poster={M + 'porao.jpg'} style={{ width: '100%', maxWidth: 1000, display: 'block', borderRadius: 6, background: '#000', aspectRatio: '16/9' }}>
        <source src={M + 'porao.mp4'} type="video/mp4" />
      </video>
      <p>Qualquer um a bordo desce pelo botão <b>Descer ao porão</b> do painel ou pelo <b>Porão</b> do menu. Isso vale até para o timoneiro, mas ele solta o leme e o navio para. O porão é montado onde o navio está e fica ali. Dentro dá para <b>andar</b>, <b>guardar baús</b> e <b>decorar</b>, e tudo fica salvo no navio. Tem <b>cama</b> para deitar, e a <b>escada de corda</b> leva de volta ao navio, onde ele estiver.</p>
      <p>Se o navio afundar, a <b>decoração se perde</b> e o conteúdo dos baús vai para o <b>destroço</b>.</p>

      <h2>O bote</h2>
      <p>O navio leva um <b>bote</b> para ir à terra sem atracar: ele se afasta até <b>10 tiles</b> do navio.</p>
      <Foto f="foto_bote.jpg" alt="O bote saindo do navio" />

      <h2>Perigos</h2>
      <p><b>Piratas</b> navegam em navios com canhões próprios. Afundar um deles deixa um <b>destroço com saque</b>, e vale +1 de Ataque Naval.</p>
      <Foto f="foto_pirata_em_chamas.jpg" alt="Navio pirata em chamas" />
      <p>No mar vivem o <b>tubarão-branco</b>, o <b>kraken</b>, a <b>serpente do mar</b>, o <b>elemental da água</b> e o pacífico <b>golfinho</b>. Eles também têm Ataque e Defesa Naval; do tubarão e do kraken saem dentes, couro e tinta de kraken.</p>

      <h2>Naufrágio e salvamento</h2>
      <p>Quando o casco chega a zero, o navio <b>afunda</b>. A tripulação escapa numa <b>canoa de salvamento</b>, e o <b>destroço</b> fica boiando por <b>30 minutos</b>, reservado ao dono nas primeiras <b>24 horas</b> para quem tenta recuperá-lo.</p>
      <Foto f="foto_naufragio.jpg" alt="O naufrágio" />
      <Foto f="foto_salvamento.jpg" alt="A canoa de salvamento" />
      <p>Para <b>restaurar o navio</b> a partir do destroço são necessárias <b>300 tábuas</b>. Não restaurou, perdeu: outros podem fazer o <b>saque</b> do que sobrou.</p>

      <h2>Tintura da vela</h2>
      <p>A vela pode ser tingida, para o navio ter a sua cor no horizonte. Use a tintura sobre o navio.</p>

    </>
  )
}

function TopicoVocacoes() {
  return (
    <>
      <p>O antigo <b>kit</b> misturava duas coisas: de onde você veio e o que você faz. Agora a criação tem duas escolhas obrigatórias, depois do povo e do caminho:</p>
      <ul>
        <li><b>Vocação</b> (uma): muda o custo de algumas perícias na criação, dá um benefício pequeno e define a <b>árvore de talentos</b> do nível 4 ao 20. São 21: <b>Armas</b> (Combatente, Arqueiro, Escudeiro, Médico de Combate, Berserker, Guerreiro Santo, Ranger, Cria da Fúria), <b>Subterfúgio</b> (Assassino, Duelista, Gatuno, Caçador de Tesouros, Batedor), <b>Sabedoria</b> (Acólito do Panteão, Mesumbeiro, Shimoriano, Totemista, Kitahne, Alquimista) e <b>Ofícios</b>, para qualquer caminho (Artífice, Coletor).</li>
        <li><b>Linhas</b>: algumas vocações escolhem uma linha no nível 4. Kitahne: <b>Kitahne</b>, <b>Lâmina Arcana</b> ou <b>Égide</b>. Mesumbeiro e Shimoriano: <b>Necromante</b> e as linhas novas. Mesumbeiro é proibido; Shimoriano é autorizado pelo Círculo de Shimoria.</li>
        <li><b>Traço</b> (um): corpo, mente ou origem, sem árvore. São 16: Ágil, Corpulento, Gênio, Velho, Duro de Matar, Fortitude do Urso, Reflexos de Pantera, Vontade da Águia, Sabe-tudo, Pacto de Mesum, Bandido, Ladino Treinado, Nômade do Deserto, Defensor do Reino, Membro da Nobreza e Marcado da Raiz.</li>
      </ul>
      <p>No nível 2 todos continuam com os <b>Comuns do caminho</b> e os <b>Talentos Gerais</b>. A loja da criação saiu: cada personagem recebe um <b>pacote inicial</b> conforme as perícias, a vocação e o traço.</p>
      <p>Personagens antigos foram convertidos sem perder nada: o kit vira vocação ou traço, e onde há dúvida o jogo pede a escolha no primeiro login. Builds do site feitas com kit também são convertidas (com aviso).</p>
      <p><Link to="/simulador">Monte a sua no simulador</Link>, veja as <Link to="/builds">builds iniciais</Link> ou <Link to="/talentos">todos os talentos por vocação</Link>.</p>
    </>
  )
}

function TopicoConstrucao() {
  return (
    <>
      <video controls preload="metadata" style={{ width: '100%', maxWidth: 1000, display: 'block', borderRadius: 6, background: '#000', aspectRatio: '16/9' }}>
        <source src="/videos/construcao_mansory.mp4" type="video/mp4" />
      </video>
      <p>O <b>Artífice</b> com o talento <b>Pedreiro</b> (nível 2) ergue a casa no estilo do seu povo: <b>zharkianos e numajene</b> constroem em <b>madeira</b>; <b>vanírios, aquilranos e thurianos</b> em <b>pedra</b>. São <b>19 plantas por povo</b>.</p>
      <p>Com o <b>Martelo e Sisal</b> (Funilaria, Metalworking 20) abre-se a lojinha de plantas, com miniatura e prévia. Escolhida a planta, você posiciona vendo o <b>fantasma</b> da casa no terreno.</p>
      <p>Depois é depositar o material no <b>Baú de Obra</b>, que mostra uma barra de progresso. A obra passa por três estágios: <b>vazio, em obra e pronta</b>. O custo vai de <b>10.000 a 20.000 pedras ou toras</b>.</p>
      <h3>Regras</h3>
      <ul>
        <li>Uma casa por conta.</li>
        <li>Proibido construir a menos de 100 passos das cidades.</li>
        <li>A <b>Pedra de Construção</b> sai em qualquer rocha (inclusive em dungeons), mas só na mineração focada.</li>
        <li>A casa fica pronta <b>sem porta</b>: use o Kit de Porta da Marcenaria e a fechadura da Funilaria.</li>
      </ul>
    </>
  )
}

function TopicoMissoesWorkers() {
  return (
    <>
      <video controls preload="metadata" style={{ width: '100%', maxWidth: 1000, display: 'block', borderRadius: 6, background: '#000', aspectRatio: '16/9' }}>
        <source src="/videos/missao_ferreiro_guarda.mp4" type="video/mp4" />
      </video>
      <p>Os ofícios também têm <b>turnos de serviço</b>. Na <b>Oficina da Guarda</b>, ao lado do quartel de Zharkia, o ferreiro (Metalworking 20+) assume o posto com dois cliques no <b>Livro de Serviço</b>, e o turno dura <b>1 hora</b>.</p>
      <p>Os <b>soldados</b> chegam pelo portão, fazem fila no balcão e pedem de <b>1 a 3 peças</b> da forja, do nível do ferreiro. Cada pedido tem <b>5 minutos</b>. Você forja na oficina, com o material dos baús, e entrega com dois cliques no soldado.</p>
      <h3>Recompensas</h3>
      <ul>
        <li><b>6 cobres por peça</b>, pagos no fim do turno.</li>
        <li><b>+0,1 de Metalworking</b> por peça entregue (até 20 por turno).</li>
        <li>As peças <b>excepcionais</b> do turno trocam por um <b>Pergaminho de Talento</b> (1 por turno).</li>
      </ul>
      <h3>Regras</h3>
      <ul>
        <li>Um ferreiro por vez; depois do turno, 3 horas de descanso.</li>
        <li>Tudo da oficina leva <b>[Oficina]</b> no nome e some ao sair, deslogar ou acabar o turno.</li>
        <li>5 minutos parado ou fora da oficina encerra o turno.</li>
      </ul>
      <p>O <b>Estaleiro de Turno</b> faz o mesmo para a <b>marcenaria</b>: reparos e peças de madeira para os navios.</p>
    </>
  )
}

function TopicoCarrocaCharrete() {
  return (
    <>
      <h3>Carrinho de mão</h3>
      <video controls preload="metadata" poster="/videos/carrinho.jpg" style={{ width: '100%', maxWidth: 1000, display: 'block', borderRadius: 6, background: '#000', aspectRatio: '1280/666' }}>
        <source src="/videos/carrinho.mp4" type="video/mp4" />
      </video>
      <p>O carrinho segue você <b>passo a passo, sem tranco</b>, e a roda gira enquanto anda. Vazio ele fica aberto; com carga, aparece coberto com a lona. Aguenta <b>5.000 de peso</b>. Com o carrinho você anda mais devagar, e ele é solto se você montar, se afastar ou morrer. Pelo menu dá para abrir a carga, soltar o carrinho ou recolhê-lo para a mochila.</p>
      <h3>Charrete</h3>
      <video controls preload="metadata" poster="/videos/charrete.jpg" style={{ width: '100%', maxWidth: 1000, display: 'block', borderRadius: 6, background: '#000', aspectRatio: '1280/666' }}>
        <source src="/videos/charrete.mp4" type="video/mp4" />
      </video>
      <p>Para grandes cargas: uma carroça puxada por <b>dois cavalos</b>, com você sentado no banco, de roupa e tudo. Nas curvas, os <b>cavalos viram primeiro</b> e a carroça acompanha. Vazia ela anda aberta; com carga, fecha com a lona. Aguenta <b>30.000 de peso</b> (seis carrinhos) e até 750 itens.</p>
      <ul>
        <li><b>Como fazer:</b> na <b>Marcenaria</b> (Woodworking 60, 300 tábuas, na bancada) sai a <b>Escritura da Charrete</b>. Dois cliques na escritura põem a charrete no chão, ainda <b>sem cavalos</b>. A escritura é só de ida: a charrete não volta a ser escritura.</li>
        <li><b>Prender cavalo:</b> no menu da charrete, escolha <b>Prender cavalo</b> e aponte um cavalo <b>domado por você</b> (cavalo comum ou de tração), perto dela. Ele fica guardado na charrete e <b>deixa de contar como seguidor</b>; dá para prender um, domar outro e prender o segundo. Com <b>dois cavalos</b> presos, a charrete pode ser puxada.</li>
        <li><b>Soltar cavalos:</b> pelo menu os cavalos voltam ao seu lado, como seus, se você tiver espaço de seguidor; a charrete fica parada até você prender de novo.</li>
        <li>Dois cliques abrem o menu: <b>Subir e puxar</b>, <b>Abrir a carga</b>, <b>Prender cavalo</b> e <b>Soltar cavalos</b>.</li>
        <li>Só o dono sobe na charrete; a carga abre com ela parada e o dono ao lado.</li>
        <li>A charrete não é animal: não obedece comandos, não conta como seguidor e não vai para o estábulo.</li>
      </ul>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TopicoDragaoVoador() {
  return (
    <>
      <video controls preload="metadata" poster="/videos/dragao_voador.jpg" style={{ width: '100%', maxWidth: 1000, display: 'block', borderRadius: 6, background: '#000', aspectRatio: '1280/666' }}>
        <source src="/videos/dragao_voador.mp4" type="video/mp4" />
      </video>
      <p><b>Prévia em desenvolvimento.</b> Montado no seu dragão, use <b>[voar</b>: ele abre as asas e ganha altura batendo as asas, com a sombra ficando no chão lá embaixo. No alto, você passa por cima de árvores, muros e rios, entre nuvens. Use <b>[voar</b> de novo para descer e pousar.</p>
      <p>Ainda estamos ajustando detalhes, como as nuvens e o balanço no ar. Quando o dragão chegar ao jogo, este vídeo será trocado.</p>
    </>
  )
}

/** Para adicionar um tópico novo: acrescente um item aqui. */
const TOPICOS: { id: string; titulo: string; Corpo: () => JSX.Element }[] = [
  { id: 'vocacoes', titulo: 'Vocações e Traços', Corpo: TopicoVocacoes },
  { id: 'navio', titulo: 'Navio', Corpo: TopicoNavio },
  { id: 'construcao', titulo: 'Construção (Mansory)', Corpo: TopicoConstrucao },
  { id: 'missoes', titulo: 'Missões para workers', Corpo: TopicoMissoesWorkers },
  { id: 'carroca', titulo: 'Carroça e charrete', Corpo: TopicoCarrocaCharrete },
]

export default function FeaturesPage() {
  useTitulo('Features')
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])
  return (
    <div className="pagina">
      <CabecalhoPagina sobre="Tybar" titulo="Features">
        Sistemas próprios do shard, explicados um a um.
      </CabecalhoPagina>
      <nav aria-label="Tópicos" className="linha" style={{ marginBottom: 24 }}>
        {TOPICOS.map(t => <a key={t.id} href={'#' + t.id} className="btn btn-2">{t.titulo}</a>)}
      </nav>
      {TOPICOS.map(t => (
        <section key={t.id} id={t.id} style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.8em' }}>{t.titulo}</h2>
          <t.Corpo />
        </section>
      ))}
      <p style={{ marginTop: 32 }}>Quer saber mais sobre ofícios e o mundo? Veja o <Link to="/codice">Códice</Link>.</p>
    </div>
  )
}
