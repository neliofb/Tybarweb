import { DUNGEONS_PROCEDURAIS } from '../../data/dungeonsProcedurais'
import { CabecalhoPagina, useTitulo } from '../../components/ui'

export default function DungeonsStaffPage() {
  useTitulo('Dungeons procedurais')
  return (
    <div className="pagina pagina-larga">
      <CabecalhoPagina sobre="Staff" titulo="Dungeons procedurais">
        Pedra de entrada de cada dungeon e o pergaminho de talento que ela dá a um sorteado do grupo vencedor. {DUNGEONS_PROCEDURAIS.length} dungeons.
      </CabecalhoPagina>
      <div className="tabela-envolve">
        <table className="tabela">
          <thead><tr><th>Dungeon</th><th>Mapa</th><th>Coordenadas da pedra</th><th>Região</th><th>Pergaminho</th></tr></thead>
          <tbody>
            {DUNGEONS_PROCEDURAIS.map(d => (
              <tr key={d.nome}>
                <td>{d.nome}</td>
                <td>{d.mapa}</td>
                <td>{d.x}, {d.y}, {d.z}</td>
                <td>{d.regiao}</td>
                <td>Pergaminho de Conhecimento de Talento, nível {d.pergaminhoNivel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="discreto" style={{ marginTop: 12 }}>Dados em src/data/dungeonsProcedurais.ts (vindos do save e do código do servidor). "—" = a região não está no niveis.json.</p>
    </div>
  )
}
