// Passo a passo de como a build marcada no site chega ao jogo (aparece em Minhas builds e no detalhe da build).
export default function ComoUsarBuild() {
  return (
    <div className="painel" style={{ marginTop: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Como usar a build no jogo</h3>
      <ol style={{ paddingLeft: 20, display: 'grid', gap: 6 }}>
        <li>Aqui no site, clique em <b>Usar no próximo personagem</b> (só uma build fica marcada por vez).</li>
        <li>Abra o jogo pelo launcher e entre com a <b>mesma conta</b> do site.</li>
        <li>Crie um <b>personagem novo</b>. Na primeira tela da criação (“Sejam bem-vindos a Tybar”), clique no botão <b>Usar a build escolhida no site</b>, logo abaixo de “Iniciar a jornada”.</li>
        <li>O jogo preenche povo, caminho, kit, atributos e perícias. Confira cada passo e ajuste o que quiser antes de finalizar; se algo não couber nas regras, ele avisa.</li>
      </ol>
      <p className="discreto" style={{ marginTop: 8 }}>A marca é usada uma vez: depois de criar o personagem, ela sai. Para usar de novo, marque outra vez.</p>
    </div>
  )
}
