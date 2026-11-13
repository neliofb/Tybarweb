// Builds iniciais (13/11/2026): uma por vocação e uma por linha (Kitahne, Mesumbeiro, Shimoriano) ou tipo do N4 (Ranger, Totemista, Alquimista).
// Só perícias reais do shard; custos e pontos conferidos com src/ficha.ts e src/data/regras_ficha.json
// (cópia de /api/ficha/regras gerada por tools/site/exportar_talentos.py). Para conferir de novo: npm run conferir-builds (scripts/conferir_builds.ts).
import type { Build } from '../api/site'

type Grau = 'P' | 'S' | 'T'
export interface BuildSugerida {
  id: string
  nome: string
  vocacao: string
  /** LinhaVocacao (N4) quando a vocação tem linhas */
  linha?: string
  caminho: 'Armas' | 'Subterfugio' | 'Sabedoria'
  povo: string
  vantagem: string
  traco: string
  atributos: { str: number; dex: number; int: number }
  pericias: Record<string, Grau>
  descricao: string
  /** talentos-chave por nível (nomes como no jogo) */
  talentos: { nivel: number; nome: string }[]
}

const T = (...xs: [number, string][]) => xs.map(([nivel, nome]) => ({ nivel, nome }))

export const BUILDS_SUGERIDAS: BuildSugerida[] = [
  // ── Armas ──
  { id: 'combatente', nome: 'Combatente de espada e escudo', vocacao: 'Combatente', caminho: 'Armas', povo: 'Thuriano', vantagem: 'Versatilidade', traco: 'Corpulento',
    atributos: { str: 90, dex: 70, int: 40 }, pericias: { MeleeCombat1H: 'P', Tactics: 'P', Parry: 'S', Wrestling: 'S', Medicine: 'S', Survival: 'S', Awareness: 'T', MeleeCombat2H: 'T' },
    descricao: 'Soldado de linha: acerta, aguenta e se cura com bandagem entre as lutas.',
    talentos: T([2, 'Maestria em Armas 1H (Geral)'], [4, 'Classe: Combatente'], [6, 'Ignorar Defesas'], [8, 'Ripostar'], [10, 'Pele de Ferro'], [14, 'Elite: Campeão'], [20, 'Avatar da Guerra']) },
  { id: 'arqueiro', nome: 'Arqueiro de linha', vocacao: 'Arqueiro', caminho: 'Armas', povo: 'Asanita', vantagem: 'Versatilidade', traco: 'Agil',
    atributos: { str: 60, dex: 90, int: 50 }, pericias: { RangedCombat: 'P', Tactics: 'P', Survival: 'S', Awareness: 'S', Medicine: 'S', MeleeCombat1H: 'S', Parry: 'T', Sneak: 'T' },
    descricao: 'Arco longo de trás da linha; Survival e Awareness baratos para rastrear e vigiar.',
    talentos: T([2, 'Maestria à Distância (Geral)'], [4, 'Classe: Arqueiro'], [6, 'Tiro Preciso'], [8, 'Olhar de Águia'], [12, 'Tiro Duplo'], [14, 'Elite: Mestre Arqueiro'], [16, 'Chuva de Flechas'], [20, 'Tempestade de Aço']) },
  { id: 'escudeiro', nome: 'Escudeiro muralha', vocacao: 'Escudeiro', caminho: 'Armas', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Urso',
    atributos: { str: 90, dex: 70, int: 40 }, pericias: { MeleeCombat1H: 'P', Parry: 'P', Tactics: 'S', Wrestling: 'S', Medicine: 'S', Survival: 'S', Awareness: 'T', RangedCombat: 'T' },
    descricao: 'Escudo à frente do grupo: provoca, segura e devolve.',
    talentos: T([2, 'Armadura de Metais (Geral)'], [4, 'Classe: Escudeiro'], [6, 'Provocar'], [8, 'Treinamento de Escudeiro'], [10, 'Contra-Ataque'], [14, 'Casulo de Ferro'], [18, 'Veterano'], [20, 'Muralha Indomável']) },
  { id: 'medico', nome: 'Médico de campo', vocacao: 'MedicoDeCombate', caminho: 'Armas', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Genio',
    atributos: { str: 70, dex: 60, int: 70 }, pericias: { Medicine: 'P', MeleeCombat1H: 'P', Tactics: 'S', Parry: 'S', Survival: 'S', Wrestling: 'S', Awareness: 'T', HandleAnimal: 'T' },
    descricao: 'Mantém o grupo de pé com bandagens e compostos, e ainda segura a espada.',
    talentos: T([4, 'Classe: Médico de Combate'], [6, 'Protocolo Vermelho'], [8, 'Comando de Campo'], [10, 'Composto Coagulante'], [12, 'Névoa Revigorante'], [18, 'Socorrista Veterano'], [20, 'Ressurreição']) },
  { id: 'berserker', nome: 'Berserker de montante', vocacao: 'Berserker', caminho: 'Armas', povo: 'Thuriano', vantagem: 'Versatilidade', traco: 'Corpulento',
    atributos: { str: 90, dex: 80, int: 30 }, pericias: { MeleeCombat2H: 'P', Tactics: 'P', Wrestling: 'S', Survival: 'S', Parry: 'S', Medicine: 'T', Awareness: 'T', RangedCombat: 'T' },
    descricao: 'Fúria quando ferido; armadura leve e montante. Medicine fica baixa (não usa bandagem em Fúria).',
    talentos: T([2, 'Pacto com Almak'], [4, 'Guarda Instintiva'], [6, 'Investida'], [8, 'Vigor de Batalha'], [12, 'Grito de Guerra'], [14, 'Marca da Fúria'], [18, 'Execução Brutal'], [20, 'Fúria Indomável']) },
  { id: 'guerreiro-santo', nome: 'Guerreiro Santo', vocacao: 'GuerreiroSanto', caminho: 'Armas', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Aguia',
    atributos: { str: 80, dex: 50, int: 70 }, pericias: { MeleeCombat1H: 'P', Magery: 'P', Medicine: 'S', Parry: 'S', Tactics: 'S', MagicLore: 'T', Wrestling: 'T', Survival: 'T' },
    descricao: 'Paladino do Panteão: espada, escudo e orações de proteção para o grupo.',
    talentos: T([4, 'Salvaguarda'], [6, 'Proteção de Rothen'], [8, 'Consagração'], [10, 'Purificação'], [12, 'Aura de Fé'], [16, 'Sacrifício dos Mártires'], [20, 'Proteção Divina']) },
  { id: 'ranger-cacador', nome: 'Ranger caçador', vocacao: 'Ranger', caminho: 'Armas', povo: 'Numajene', vantagem: 'AliadoDaNatureza', traco: 'Agil',
    atributos: { str: 60, dex: 90, int: 50 }, pericias: { RangedCombat: 'P', Survival: 'P', Tactics: 'S', HandleAnimal: 'S', Medicine: 'S', Awareness: 'T', MeleeCombat1H: 'T', Parry: 'T' },
    descricao: 'Marca a presa e acaba com ela; Survival faz o papel de Tactics no dano.',
    talentos: T([4, 'Caçador'], [6, 'Marca do Caçador'], [8, 'Armadilheiro'], [10, 'Escalpelador'], [12, 'Ataque Extra'], [14, 'Conhecimento de Caçador'], [20, 'Marca do Caçador Aprimorada']) },
  { id: 'ranger-feras', nome: 'Ranger mestre das feras', vocacao: 'Ranger', caminho: 'Armas', povo: 'Thuriano', vantagem: 'Versatilidade', traco: 'Aguia',
    atributos: { str: 60, dex: 80, int: 60 }, pericias: { HandleAnimal: 'P', Survival: 'P', RangedCombat: 'S', Tactics: 'S', Medicine: 'S', Awareness: 'T', MeleeCombat1H: 'T', Wrestling: 'T' },
    descricao: 'Luta ao lado de um animal domado que fica cada vez mais forte.',
    talentos: T([4, 'Mestre das Feras'], [6, 'Companheiro Animal'], [8, 'Comandar Animal'], [12, 'Ataque Conjunto'], [14, 'Provocar Animal'], [18, 'Mestre Domador'], [20, 'Companheiro Animal Aprimorado']) },
  { id: 'cria-da-furia', nome: 'Cria da Fúria', vocacao: 'CriaDaFuria', caminho: 'Armas', povo: 'Numajene', vantagem: 'VontadeDeFerro', traco: 'Corpulento',
    atributos: { str: 90, dex: 80, int: 30 }, pericias: { MeleeCombat2H: 'P', Tactics: 'P', Survival: 'S', Wrestling: 'S', Medicine: 'S', MagicLore: 'T', Parry: 'T', Awareness: 'T' },
    descricao: 'Força bestial da floresta: quanto mais ferido, mais perigoso.',
    talentos: T([4, 'Classe: Cria da Fúria'], [6, 'Golpe Feral'], [8, 'Ímpeto Selvagem'], [10, 'Frenesi'], [14, 'Carga Raivosa'], [18, 'Sangue Fervente'], [20, 'Fúria Sanguínea']) },
  // ── Subterfúgio ──
  { id: 'assassino', nome: 'Assassino do Véu', vocacao: 'Assassino', caminho: 'Subterfugio', povo: 'Asanita', vantagem: 'Versatilidade', traco: 'Agil',
    atributos: { str: 60, dex: 90, int: 50 }, pericias: { MeleeCombat1H: 'P', Sneak: 'P', Alchemy: 'S', Awareness: 'S', Tactics: 'S', MechanicalAptitude: 'T', Pickpocketing: 'T', Medicine: 'T' },
    descricao: 'Kryss envenenada, ataque pelas costas e sumir antes da resposta.',
    talentos: T([4, 'Classe: Agente das Sombras'], [6, 'Ataque pelas Costas'], [8, 'Clone de Sombras'], [10, 'Veneno Debilitante'], [14, 'Elite: Executor'], [16, 'Golpe Fantasma'], [20, 'Execução']) },
  { id: 'duelista', nome: 'Duelista de rua', vocacao: 'Duelista', caminho: 'Subterfugio', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Pantera',
    atributos: { str: 70, dex: 90, int: 40 }, pericias: { MeleeCombat1H: 'P', Awareness: 'P', Parry: 'S', Tactics: 'S', Sneak: 'S', Wrestling: 'T' },
    descricao: 'Um contra um: finta, apara e responde com a lâmina.',
    talentos: T([4, 'Classe: Esgrimista'], [6, 'Finta'], [8, 'Precisão Cirúrgica'], [12, 'Reflexos Aprimorados'], [14, 'Elite: Mestre Duelista'], [18, 'Mil Cortes'], [20, 'Lâmina Zenital']) },
  { id: 'gatuno', nome: 'Gatuno mão leve', vocacao: 'Gatuno', caminho: 'Subterfugio', povo: 'Asanita', vantagem: 'Versatilidade', traco: 'Agil',
    atributos: { str: 50, dex: 90, int: 60 }, pericias: { Pickpocketing: 'P', Sneak: 'P', MechanicalAptitude: 'S', Awareness: 'S', MeleeCombat1H: 'S', Alchemy: 'T', Tactics: 'T', Medicine: 'T', Wrestling: 'T' },
    descricao: 'Ladrão de cidade: [Marcar, [Roubar, gazua e fuga pela multidão.',
    talentos: T([4, 'Mão Leve'], [6, 'Bolso Fundo'], [8, 'Distração'], [10, 'Sumiço na Multidão'], [14, 'Marca Dupla'], [16, 'Golpe da Bolsa'], [20, 'Príncipe dos Ladrões']) },
  { id: 'cacador-tesouros', nome: 'Caçador de Tesouros', vocacao: 'CacadorDeTesouros', caminho: 'Subterfugio', povo: 'Thuriano', vantagem: 'Versatilidade', traco: 'DuroDeMatar',
    atributos: { str: 70, dex: 80, int: 50 }, pericias: { MechanicalAptitude: 'P', Awareness: 'P', Sneak: 'S', Survival: 'S', Tactics: 'S', MeleeCombat1H: 'S', Medicine: 'T' },
    descricao: 'Ruínas, baús e armadilhas: entra, desarma, abre e sai vivo.',
    talentos: T([4, 'Classe: Caçador de Tesouros'], [6, 'Sentido de Perigo'], [8, 'Bomba de Fumaça'], [10, 'Conhecimento de Masmorras'], [14, 'Elite: Aventureiro'], [16, 'Mestre das Fugas'], [20, 'Instinto de Sobrevivência']) },
  { id: 'batedor', nome: 'Batedor emboscador', vocacao: 'Batedor', caminho: 'Subterfugio', povo: 'Numajene', vantagem: 'AliadoDaNatureza', traco: 'Pantera',
    atributos: { str: 60, dex: 90, int: 50 }, pericias: { RangedCombat: 'P', Sneak: 'P', Awareness: 'S', Survival: 'S', Tactics: 'S', Medicine: 'T' },
    descricao: 'Vê primeiro, atira escondido e guia a party pelas estradas.',
    talentos: T([4, 'Emboscador'], [6, 'Tiro Abafado'], [8, 'Flecha no Joelho'], [10, 'Camuflagem'], [12, 'Tiro em Movimento'], [16, 'Ninho'], [20, 'Caçada Fantasma']) },
  // ── Sabedoria ──
  { id: 'acolito', nome: 'Clérigo do Panteão', vocacao: 'Acolito', caminho: 'Sabedoria', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Velho',
    atributos: { str: 60, dex: 50, int: 90 }, pericias: { Magery: 'P', MagicLore: 'P', Medicine: 'S', Alchemy: 'S', Awareness: 'S', MeleeCombat1H: 'T', Survival: 'T', Parry: 'T' },
    descricao: 'Orações de cura e proteção; o motivo de o grupo voltar vivo.',
    talentos: T([2, 'Mente Serena'], [4, 'Classe: Sacerdote de Panteão'], [6, 'Guardiões da Casa'], [8, 'A Glória de Zanshir'], [12, 'O Julgo de Khumar'], [14, 'Elite: Devoto'], [20, 'Dogma Inquebrável']) },
  { id: 'mesumbeiro-necromante', nome: 'Mesumbeiro necromante', vocacao: 'Mesumbeiro', linha: 'Necromante', caminho: 'Sabedoria', povo: 'Numajene', vantagem: 'ConhecedorDaMesum', traco: 'PactoMesum',
    atributos: { str: 50, dex: 60, int: 90 }, pericias: { Magery: 'P', MagicLore: 'P', Alchemy: 'S', Medicine: 'S', Sneak: 'S', Survival: 'S', Awareness: 'T' },
    descricao: 'Proibido: ergue mortos, envenena e drena vida. Pacto de Mesum dá mais poder e mais Corrupção.',
    talentos: T([4, 'Linha: Necromante'], [6, 'Erguer Esqueleto'], [8, 'Drenar Vitalidade'], [14, 'Elite: Lich'], [16, 'Praga'], [18, 'Corrupção do Solo'], [20, 'Forma de Lich']) },
  { id: 'mesumbeiro-sangue', nome: 'Mesumbeiro senhor do sangue', vocacao: 'Mesumbeiro', linha: 'SenhorDoSangue', caminho: 'Sabedoria', povo: 'Thuriano', vantagem: 'Versatilidade', traco: 'DuroDeMatar',
    atributos: { str: 70, dex: 50, int: 80 }, pericias: { Magery: 'P', MagicLore: 'P', Medicine: 'S', Alchemy: 'S', Survival: 'S', Sneak: 'S', Awareness: 'T', MechanicalAptitude: 'T' },
    descricao: 'Paga os ritos com a própria vida e se sustenta do dano que causa.',
    talentos: T([4, 'Linha: Senhor do Sangue'], [6, 'Sangria Ritual'], [8, 'Bebedor de Feridas'], [10, 'Coágulo'], [14, 'Sangue Fervente'], [18, 'Resistir à Cobrança'], [20, 'Comunhão Profana']) },
  { id: 'mesumbeiro-tecelao', nome: 'Mesumbeiro tecelão de maldições', vocacao: 'Mesumbeiro', linha: 'Tecelao', caminho: 'Sabedoria', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Aguia',
    atributos: { str: 50, dex: 60, int: 90 }, pericias: { Magery: 'P', MagicLore: 'P', Alchemy: 'S', Medicine: 'S', Awareness: 'S', Sneak: 'S', Survival: 'T' },
    descricao: 'Maldições, silêncio e elo de dor: enfraquece o inimigo para o grupo.',
    talentos: T([4, 'Linha: Tecelão de Maldições'], [6, 'Olho de Asan'], [8, 'Elo Doloroso'], [10, 'Língua Presa'], [14, 'Peso dos Séculos'], [16, 'Marca do Credor'], [20, 'Sentença de Jarko']) },
  { id: 'shimoriano-tecelao', nome: 'Shimoriano tecelão (Círculo)', vocacao: 'Shimoriano', linha: 'Tecelao', caminho: 'Sabedoria', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Aguia',
    atributos: { str: 50, dex: 60, int: 90 }, pericias: { Magery: 'P', MagicLore: 'P', Alchemy: 'S', Medicine: 'S', Awareness: 'S', Sneak: 'S', Survival: 'T' },
    descricao: 'Mesum autorizada pelo Círculo de Shimoria; a linha recomendada pelo Círculo.',
    talentos: T([4, 'Linha: Tecelão de Maldições'], [6, 'Olho de Asan'], [8, 'Elo Doloroso'], [10, 'Língua Presa'], [14, 'Peso dos Séculos'], [16, 'Marca do Credor'], [20, 'Sentença de Jarko']) },
  { id: 'shimoriano-necromante', nome: 'Shimoriano necromante', vocacao: 'Shimoriano', linha: 'Necromante', caminho: 'Sabedoria', povo: 'Asanita', vantagem: 'Versatilidade', traco: 'Genio',
    atributos: { str: 50, dex: 60, int: 90 }, pericias: { Magery: 'P', MagicLore: 'P', Alchemy: 'S', Medicine: 'S', Sneak: 'S', Survival: 'S', Awareness: 'T', MechanicalAptitude: 'T' },
    descricao: 'Necromancia com autorização: mortos, veneno e Forma de Lich.',
    talentos: T([4, 'Linha: Necromante'], [6, 'Nuvem de Miíase'], [8, 'Toque Gélido'], [14, 'Elite: Lich'], [16, 'Servo Avançado'], [18, 'Pacto da Alma'], [20, 'Forma de Lich']) },
  { id: 'shimoriano-sangue', nome: 'Shimoriano senhor do sangue', vocacao: 'Shimoriano', linha: 'SenhorDoSangue', caminho: 'Sabedoria', povo: 'Numajene', vantagem: 'SabedoriaDosAntigos', traco: 'DuroDeMatar',
    atributos: { str: 70, dex: 50, int: 80 }, pericias: { Magery: 'P', MagicLore: 'P', Medicine: 'S', Alchemy: 'S', Survival: 'S', Sneak: 'S', Awareness: 'T' },
    descricao: 'Ritos pagos com vida, sem sair da lei.',
    talentos: T([4, 'Linha: Senhor do Sangue'], [6, 'Sangria Ritual'], [8, 'Bebedor de Feridas'], [12, 'Pacto Menor'], [16, 'Carne Emprestada'], [18, 'Resistir à Cobrança'], [20, 'Comunhão Profana']) },
  { id: 'totemista-voz', nome: 'Totemista voz dos espíritos', vocacao: 'Totemista', caminho: 'Sabedoria', povo: 'Numajene', vantagem: 'AliadoDaNatureza', traco: 'MarcadoDaRaiz',
    atributos: { str: 50, dex: 60, int: 90 }, pericias: { Magery: 'P', HandleAnimal: 'P', MagicLore: 'S', Medicine: 'S', Survival: 'S', Alchemy: 'T', Awareness: 'T', Sneak: 'T' },
    descricao: 'Invoca espíritos dos pactos e protege o grupo com eles.',
    talentos: T([4, 'Voz dos Espíritos'], [6, 'Chamado Rápido'], [8, 'Vínculo de Sangue'], [10, 'Espírito Guardião'], [14, 'Uivo da Matilha'], [18, 'Coro dos Espíritos'], [20, 'Avatar de Numaja']) },
  { id: 'totemista-pele', nome: 'Totemista pele da fera', vocacao: 'Totemista', caminho: 'Sabedoria', povo: 'Numajene', vantagem: 'VontadeDeFerro', traco: 'Corpulento',
    atributos: { str: 80, dex: 60, int: 60 }, pericias: { Magery: 'P', MagicLore: 'P', HandleAnimal: 'S', Wrestling: 'S', Medicine: 'S', Survival: 'T' },
    descricao: 'Encarna a fera e luta de garras com o Conhecimento Mágico.',
    talentos: T([4, 'Pele da Fera'], [6, 'Garras Herdadas'], [8, 'Salto da Pantera'], [10, 'Couro do Urso'], [14, 'Fúria Ancestral'], [16, 'Troca de Pele'], [20, 'Forma Primeva']) },
  { id: 'kitahne-kitahne', nome: 'Kitahne (linha Kitahne)', vocacao: 'Kitahne', linha: 'Kitahne', caminho: 'Sabedoria', povo: 'Vanirio', vantagem: 'SabedoriaDosAntigos', traco: 'Genio',
    atributos: { str: 60, dex: 50, int: 90 }, pericias: { Magery: 'P', MagicLore: 'P', MeleeCombat1H: 'S', Parry: 'S', Medicine: 'S', Alchemy: 'T', Awareness: 'T' },
    descricao: 'Magia de gema, arma encantada e antimagia (Zona de Silêncio, Prisão de Runas).',
    talentos: T([4, 'Linha: Kitahne'], [6, 'Arma Encantada'], [8, 'Escudo de Mana'], [14, 'Elite: Quebra-Magias'], [16, 'Zona de Silêncio'], [18, 'Prisão de Runas'], [20, 'Avatar Arcano']) },
  { id: 'kitahne-lamina', nome: 'Kitahne lâmina arcana', vocacao: 'Kitahne', linha: 'LaminaArcana', caminho: 'Sabedoria', povo: 'Thuriano', vantagem: 'ConhecedorDoKitah', traco: 'Corpulento',
    atributos: { str: 90, dex: 60, int: 50 }, pericias: { MeleeCombat1H: 'P', MagicLore: 'P', Magery: 'S', Medicine: 'S', Parry: 'T', Alchemy: 'T', Survival: 'T' },
    descricao: 'Espada e gema: golpes que devolvem mana e cargas rúnicas. Conhecimento Mágico vale como Tactics.',
    talentos: T([4, 'Linha: Lâmina Arcana'], [6, 'Carga Rúnica'], [8, 'Conjurar em Armadura'], [10, 'Golpe e Feitiço'], [12, 'Passo Piscante'], [14, 'Tempestade de Aço'], [20, 'Arcano Encarnado']) },
  { id: 'kitahne-egide', nome: 'Kitahne égide', vocacao: 'Kitahne', linha: 'Egide', caminho: 'Sabedoria', povo: 'Vanirio', vantagem: 'VontadeDeFerro', traco: 'Urso',
    atributos: { str: 80, dex: 50, int: 70 }, pericias: { Magery: 'P', MagicLore: 'P', Parry: 'S', MeleeCombat1H: 'S', Medicine: 'S', Alchemy: 'T', Survival: 'T' },
    descricao: 'Defesa arcana: mana no lugar da vida, contramágica e muro de força.',
    talentos: T([4, 'Linha: Égide'], [6, 'Pele de Pedra'], [8, 'Contramágica'], [10, 'Escudo Reflexo'], [14, 'Muro de Força'], [18, 'Recompor'], [20, 'Bastião Arcano']) },
  { id: 'alquimista-boticario', nome: 'Alquimista boticário', vocacao: 'Alquimista', caminho: 'Sabedoria', povo: 'Vanirio', vantagem: 'SabedoriaDosAntigos', traco: 'Genio',
    atributos: { str: 50, dex: 60, int: 90 }, pericias: { Alchemy: 'P', MagicLore: 'P', Gathering: 'S', Medicine: 'S', Magery: 'S', Survival: 'T', Awareness: 'T' },
    descricao: 'Poções e elixires para o grupo; colhe os próprios ingredientes.',
    talentos: T([4, 'Boticário'], [6, 'Frasco Extra'], [8, 'Tônico de Party'], [12, 'Elixir de Saves'], [14, 'Transmutação Menor'], [18, 'Antídoto Universal'], [20, 'Pedra Filosofal (menor)']) },
  { id: 'alquimista-pirotecnico', nome: 'Alquimista pirotécnico', vocacao: 'Alquimista', caminho: 'Sabedoria', povo: 'Zharkiano', vantagem: 'Versatilidade', traco: 'Pantera',
    atributos: { str: 60, dex: 80, int: 60 }, pericias: { Alchemy: 'P', Medicine: 'P', Gathering: 'S', MagicLore: 'S', Awareness: 'S', RangedCombat: 'T' },
    descricao: 'Bombas de gelo, ácido e pólvora arremessadas de longe.',
    talentos: T([4, 'Pirotécnico'], [6, 'Pavio Curto'], [8, 'Bomba de Gelo'], [10, 'Bomba Ácida'], [14, 'Carga Dupla'], [16, 'Bomba de Atordoar'], [20, 'Barril de Pólvora']) },
  // ── Ofícios (qualquer caminho) ──
  { id: 'artifice', nome: 'Artífice ferreiro', vocacao: 'Artifice', caminho: 'Armas', povo: 'Thuriano', vantagem: 'Versatilidade', traco: 'Corpulento',
    atributos: { str: 90, dex: 60, int: 50 }, pericias: { Metalworking: 'P', Gathering: 'P', Woodworking: 'S', DomesticWork: 'S', MeleeCombat1H: 'S', Survival: 'S', Tactics: 'T', Parry: 'T' },
    descricao: 'Forja, marcenaria e costura baratas; defende a vila quando precisa.',
    talentos: T([2, 'Pedreiro'], [4, 'Classe: Metalurgo'], [14, 'Elite: Mestre da Forja']) },
  { id: 'coletor', nome: 'Coletor da mata', vocacao: 'Coletor', caminho: 'Sabedoria', povo: 'Numajene', vantagem: 'AliadoDaNatureza', traco: 'MarcadoDaRaiz',
    atributos: { str: 80, dex: 60, int: 60 }, pericias: { Gathering: 'P', Survival: 'P', Metalworking: 'S', Woodworking: 'S', Medicine: 'S', HandleAnimal: 'S', Magery: 'T', Alchemy: 'T' },
    descricao: 'Minera, corta lenha e vive do mato; ofícios baratos para transformar o que colhe.',
    talentos: T([4, 'Classe: Mineiro'], [14, 'Elite: Prospector']) },
]

const GRAU: Record<Grau, number> = { T: 1, S: 2, P: 3 }

/** Converte a build inicial para o formato de build do site (cartão, simulador, validação). */
export function sugeridaParaBuild(s: BuildSugerida): Build {
  return {
    id: 'inicial-' + s.id, nome: s.nome, tipo: 'oficial', autor: 'Staff do Tybar', estilo: s.nome, descricao: s.descricao,
    povo: s.povo, vantagem: s.vantagem, caminho: s.caminho, vocacao: s.vocacao, traco: s.traco, linha: s.linha,
    atributos: s.atributos, pericias: Object.fromEntries(Object.entries(s.pericias).map(([k, g]) => [k, GRAU[g]])),
  }
}
