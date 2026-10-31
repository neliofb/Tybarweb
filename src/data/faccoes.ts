// Gerado de ImagensGumps/TextosFaccoes/*_Homebrewery.txt (texto final da lore). Não inventar conteúdo aqui:
// mude o texto na fonte e regenere. Marcação inline: **negrito** e *itálico*.
export type Bloco =
  | { t: 'p'; texto: string }
  | { t: 'campo'; rotulo: string; texto: string }
  | { t: 'pessoa'; nome: string; titulo: string; texto: string }
export interface Secao { titulo: string; blocos: Bloco[] }
export interface Faccao {
  id: string; nome: string; lema: string; lider: string; sede: string; imagem: string
  oculta: boolean; extinta: boolean; intro: Bloco[]; secoes: Secao[]; historias: Secao[]; notas: string[]
}
export interface Capitulo { titulo: string; intro: Bloco[]; secoes: Secao[]; notas: string[] }
export interface PaginaLore { id: string; titulo: string; nota: string; imagem: string; faccoes: string[]; capitulos: Capitulo[] }

export const INTRO_FACCOES: { nota: string; texto: string } = {
 "nota": "Toda ordem nasce de um juramento. Toda facção, de uma ferida. O que se segue é o registro das organizações que moldam Tybar no ano de 468 — o que foram, o que juraram ser e o que de fato se tornaram.",
 "texto": "As facções de Tybar sobreviveram a três guerras, a dez gerações de Rothen e a um continente que apodrece por dentro. Algumas mantiveram o nome e perderam a alma; outras perderam tudo, menos o juramento. Para cada uma delas, este capítulo registra sua **identidade**, sua **origem** nas crônicas antigas, sua **situação atual** no ano de 468 e suas **relações**."
}

export const FACCOES: Faccao[] = [
 {
  "id": "filhos-da-areia",
  "nome": "Filhos da Areia",
  "lema": "\"O deus morreu para nos salvar. Agora nós morremos para que ele não seja esquecido.\"",
  "lider": "Taasymir, o Matador de Dragões",
  "sede": "Forte Zamor (Trono de Areia)",
  "imagem": "/media/faccoes/filhos-da-areia.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Taasymir, o Matador de Dragões** — Aquilrano ancião, com mais de três séculos de vida."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Forte Zamor**, chamado pelos aquilranos de **Trono de Areia**."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ano 155 (como Caçadores Draconianos); ano 466 (como Filhos da Areia)."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Capa e manto negros, herança dos Caçadores, com um olho de rubi bordado sobre o peito."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Taasymir > Sacerdotes de Aquil > Caçadores > Vilarejos vassalos."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Em **155**, o jovem batedor Taasymir viu um ovo de pedra negra rachar no meio de sua vila e dele nascer um **Dragão**. Foi um dos poucos sobreviventes — e daquele dia fundou os **Caçadores Draconianos**, com sede nas **Ruínas de Umberil**, dedicados a matar Draconianos Anciões antes que completassem seu ciclo. Por gerações foram tratados como heróis por todos os povos de Tybar."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Há **130 anos (ano 338)**, numa noite fria e estrelada, o próprio Taasymir encontrou nas areias um **cadáver mumificado com olhos de rubi**. Proclamou-o a forma material de **Aquil** — o deus que se sacrificou no Dia da Queda — e o culto tornou-se religião oficial do deserto. Desde então, a cada estação, um **aquilrano voluntário é sacrificado** em nome da segurança e prosperidade de seu povo."
     },
     {
      "t": "p",
      "texto": "Os vilarejos draconianos, quebrados por décadas de caçada, **submeteram-se** e pagam tributo em metais preciosos. Taasymir selou também um pacto com os **Guardiões do Abismo**, unindo as duas facções aquilranas sob uma única bandeira."
     },
     {
      "t": "p",
      "texto": "Quando Zharkia abandonou o **Forte Zamor** (rota cortada em 392), os condenados da Jaula resistiram por quase um século. Em **466**, os últimos caíram. Os Filhos da Areia ocuparam as estruturas sólidas da fortaleza zharkiana e ergueram ali um **império aquilrano**. A relíquia de olhos de rubi repousa hoje numa sala sagrada no coração do forte. **Zharkia ainda não sabe.**"
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Draconianos",
      "texto": "Vassalos humilhados. Pagam ouro — e esperam."
     },
     {
      "t": "campo",
      "rotulo": "Guardiões do Abismo",
      "texto": "Absorvidos pelo pacto; alguns veteranos resistem ao culto do sacrifício."
     },
     {
      "t": "campo",
      "rotulo": "Zharkia",
      "texto": "Ignora que o muro mudou de dono. O nome \"Filhos da Areia\", antes dado aos mestiços de Zharkia (ano 358), foi tomado de propósito: **é um chamado para que voltem para casa**."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "associacao-mercantil-de-tybar",
  "nome": "Associação Mercantil de Tybar",
  "lema": "\"Deuses mudam a cada dez gerações. O preço do ferro, nunca.\"",
  "lider": "Presidenta Lisandra Maysmwedas",
  "sede": "Paço das Oito Forjas, Zharkia",
  "imagem": "/media/faccoes/associacao-mercantil-de-tybar.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Presidenta Lisandra Maysmwedas**, descendente direta do fundador Rhode."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Paço das Oito Forjas**, em Zharkia. A antiga Casa da Associação, na estrada para Aghaja, virou entreposto."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "106 A.Z., em Ahenson, Ilha de Memmar (como Associação Cenariana)."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Anel com as iniciais da Associação — agora em ouro, com o selo **A.M.T.**"
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Presidência > Conselho das Oito Forjas > Associados > Aprendizes."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Fundada pelo ferreiro **Rhode Maysmwedas** e batizada em honra a **Cenarim Hivyttain**, a **Associação Cenariana** armou a resistência em Memmar, construiu os navios do êxodo e — em Tybar — **idealizou a escravidão vaníria**. Perdeu força sob Kristine e foi **pilhada no Ano Negro (228)**, quando o presidente **Kirth Galam** sumiu com os tesouros da guilda. Seu paradeiro nunca foi descoberto."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Com o crescimento de Zharkia e de suas cidades-estado, a Associação expandiu-se em todos os sentidos e tornou-se, com larga vantagem, a **mais rica de Tybar**. Sob **Marcelo das Oito Forjas** (ano 385), que tinha audiência semanal com o rei, assumiu o nome de **Associação Mercantil de Tybar**."
     },
     {
      "t": "p",
      "texto": "Seu projeto mais ambicioso foi a **reconstrução de Zharkia** após o Ano Negro: **150 anos de obras**, concluídas entre escândalos de corrupção e desvio de dinheiro. Hoje controla as **fazendas reais**, todo o comércio de Zharkia e das demais cidades, e a relação mercantil com **Aghaja e seus portos**. Leis podem ser compradas; a AMT é quem vende o melhor preço."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Cavaleiros de Rothen",
      "texto": "Clientes e parceiros. Decretos favoráveis custam caro, mas valem a pena."
     },
     {
      "t": "campo",
      "rotulo": "Orgulho Vanírio",
      "texto": "Frieza calculada. Os elfos não esquecem quem desenhou suas correntes — mas lucram com os portos."
     },
     {
      "t": "campo",
      "rotulo": "Manopla Dourada",
      "texto": "Principal contratante de escoltas e cobranças."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "orgulho-vanirio",
  "nome": "Orgulho Vanírio",
  "lema": "\"Nunca mais de joelhos. Nem diante de humanos, nem diante de irmãos.\"",
  "lider": "Elric Zynk",
  "sede": "Templo da Verdade",
  "imagem": "/media/faccoes/orgulho-vanirio.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Elric Zynk**, ditador de fato de Aghaja."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Templo da Verdade**, na Floresta dos Condenados."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ano 79 (rebelião secreta); refundado após o acordo de 187."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Mantos marrons; Elric veste manto negro ornado em runas."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Elric > Patronos > Aprendizes. Antes autônomos, hoje sob comando militar."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Nascido em **79** como sociedade secreta de rebelião, o Orgulho conduziu a **Pesquisa Espiritual**, recuperou o **Segredo de Kitah** e liderou a **Revolução de 148**. Dissolvido em 158 para não interferir no novo governo, renasceu quando o Conselho aceitou as desculpas de Kristine: magos de batalha que abriram mão de tudo para retaliar qualquer mal feito a um vanírio. Tão restritos que um aprendiz só entrava se um membro aceitasse ser seu **patrono** — e responder por cada um de seus atos."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Antes misteriosos e reclusos, hoje são a **liderança militar e política de Aghaja**. Após esmagar o **ataque Numajene de 295** com o Kitah, Elric **dissolveu o Conselho dos Elfos** (296) e transformou a Cidadela Branca numa ditadura. Cercado por mentes brilhantes, guia o império vanírio pelas cidades portuárias da costa sul, pelo **Tribunal de Regressão** e pela **Dívida de Raiz**."
     },
     {
      "t": "p",
      "texto": "O **Templo da Verdade** permanece como sede. Entre tarefas de Estado, o ingresso e o estudo da **Sangria** — a disciplina mais antiga do Kitah — são mantidos como rito quase **religioso**."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Numajenes",
      "texto": "Devedores marcados no pescoço. Ódio silencioso."
     },
     {
      "t": "campo",
      "rotulo": "Zharkia",
      "texto": "Diplomacia fria, protocolar, lucrativa."
     },
     {
      "t": "campo",
      "rotulo": "Vigilantes Eternos",
      "texto": "Antiga simpatia; ambos \"abriram mão de uma boa imagem para fazer o que deve ser feito\"."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "vigilantes-eternos",
  "nome": "Vigilantes Eternos",
  "lema": "\"A vigília não termina com a morte do vigia.\"",
  "lider": "Desconhecido (extinta)",
  "sede": "Nenhuma",
  "imagem": "/media/faccoes/vigilantes-eternos.webp",
  "oculta": false,
  "extinta": true,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Último Líder",
      "texto": "**Corwin Androes**, bisneto de Zalbard Androes — desaparecido desde 440."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "Nenhuma. Antiga sede na **Torre Shimoria**."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ano 203, por ordem de Kristine."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Elmo único e representativo. Hoje, usá-lo é sentença de morte."
     },
     {
      "t": "campo",
      "rotulo": "Situação",
      "texto": "**Extinta oficialmente** por decreto de Osvan Rothen."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Criados por **Kristine** a partir de cavaleiros \"de pouca fé\", sob o comando de **Zalbard Androes**, os Vigilantes vigiavam o Círculo Shimoria e caçavam Mesumbeiros por toda Tybar. Seu treino expunha recrutas a magias muitas vezes fatais, forjando caçadores imunes. Quase todos morreram no **Ano Negro (228)**; o líder **Balgan Geshp** sobreviveu foragido e reconstruiu a ordem nas sombras."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "**Corwin Androes**, vendo o crescimento do culto de Asan e a corrupção dos Cavaleiros, recusou-se a curvar o juramento de Kristine. Essa firmeza selou o fim da facção: na **Noite sem Vigilantes (440)**, **Osvan Rothen** mandou prender todos por traição e Mesum, sem prova nem julgamento. Os que resistiram morreram nas ruas; o corpo de **Dorn Maré-Cinza** foi exposto na Torre Shimoria. Corwin não estava entre os corpos."
     },
     {
      "t": "p",
      "texto": "Não há vigilantes conhecidos vivos. Os que fugiram do massacre nunca mais foram vistos. Em Zharkia, *vigilante* virou insulto."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Cavaleiros de Rothen",
      "texto": "Carrascos de seus irmãos."
     },
     {
      "t": "campo",
      "rotulo": "Clero de Zhark",
      "texto": "Último aliado. Os **Guardiões da Verdade** discutem em segredo recriar a ordem sob tutela do Clero."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "cavaleiros-de-rothen",
  "nome": "Cavaleiros de Rothen",
  "lema": "\"Cavaleiro tem uma só palavra.\" — Art. 1º, Código dos Cavaleiros, hoje apenas recitado.",
  "lider": "Grão-Mestre Calder Voz-de-Ferro",
  "sede": "Saguão da Honra",
  "imagem": "/media/faccoes/cavaleiros-de-rothen.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Grão-Mestre Calder Voz-de-Ferro**."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Saguão da Honra**, no Castelo de Zharkia."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ano 157 (guerreiros do Clero); oficializados por Kristine em 187."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Capas brancas — ainda."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Deus-Rei > Grão-Mestre > Cavaleiros > Noviços."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Nascidos para destruir **Asan** e Jarko (169, sob Lorde Bowie Ellis), os Cavaleiros foram o orgulho de **Kristine**: juízes, júri e executores, mas presos a um código rígido — nunca condenar sem julgamento, nunca cobrar por serviço. Quase extintos no Ano Negro, reerguidos por **Thargo Misselas** e **Wulfric, o Ruivo**, foram por gerações vistos como heróis até pelos vanírios."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "É a facção que **mais se corrompeu** em todas as gerações de Rothen. Edvard Corvo (325) os voltou ao Rei; Silas Ferro-Cinza (372) quebrou a tradição do Clero; Bertold Lâmina-Dobrada (418) iniciou as execuções sem julgamento. Hoje servem ao **Deus-Rei** — ou o Deus-Rei serve a **Calder**. Ninguém sabe ao certo."
     },
     {
      "t": "p",
      "texto": "São responsáveis por **julgamentos e execuções**, sempre favoráveis a Zharkia. Suas leis, criadas por **decretos**, escancaram a podridão: basta ter dinheiro para comprar privilégios legislativos e judiciários."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "AMT",
      "texto": "Os melhores pagadores."
     },
     {
      "t": "campo",
      "rotulo": "Clero de Zhark",
      "texto": "Tensão crescente. Aldras é o único que lembra o que eles deveriam ser."
     },
     {
      "t": "campo",
      "rotulo": "Círculo Shimoria",
      "texto": "Controlado — Calder escolheu o Arquimago."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "circulo-shimoria",
  "nome": "Círculo Shimoria",
  "lema": "\"A convivência é possível, sim.\" — lema dos fundadores.",
  "lider": "Arquimago Vael de Cinzas",
  "sede": "Torre Shimoria",
  "imagem": "/media/faccoes/circulo-shimoria.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Arquimago Vael de Cinzas**."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Torre Shimoria**, centro científico do continente."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ano 203, por acordo entre Mesumbeiros redimidos e Kristine."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Anéis de pedra — branca (Shimoriano), azul (Conselheiro), vermelha (Arquimago) — e o documento de autorização."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Arquimago > Conselheiros > Shimorianos > Ouvintes."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Fundado por ex-Mesumbeiros que se recusaram a ser devorados pela magia, o Círculo praticava apenas o **aspecto neutro da Mesum**, sob vigilância constante dos Vigilantes Eternos. Kristine, dizia o povo, \"mantinha um titã de estimação através de um enforcador\". Arquimagos: **Arges Darbor**, **Quentyn Ztarst** (antigo discípulo de Raiz), **Mirna Dusk**, **Rael Sombra-Fina**."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "São hoje os **mestres da inteligência e tecnologia de Zharkia**: alquimistas, professores, cientistas, físicos e magos. Expandiram o estudo da Mesum para **a natureza como um todo**. A Torre, embora reclusa, tornou-se o centro científico do continente, e muitas crianças frequentam aulas nas **salas abertas**."
     },
     {
      "t": "p",
      "texto": "Por trás da fachada, o Círculo está **infiltrado e enfraquecido**. Rael morreu dizendo que *\"algo está bebendo a magia\"*; seus papéis foram lacrados pelos Cavaleiros. **Vael**, indicado por Calder, é eficiente — e não faz ideia do que Rael sabia."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Cavaleiros de Rothen",
      "texto": "Donos de fato da cadeira do Arquimago."
     },
     {
      "t": "campo",
      "rotulo": "A Promessa",
      "texto": "Sem saber, alimentam Raiz: estudos de Shimoria sobre a natureza sustentam a fé do culto."
     },
     {
      "t": "campo",
      "rotulo": "Povo de Zharkia",
      "texto": "Respeito e admiração — pela primeira vez na história."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "manopla-dourada",
  "nome": "Manopla Dourada",
  "lema": "\"Olho por olho, dente por dente — e o resto, a combinar.\"",
  "lider": "O Carrasco",
  "sede": "Fortim do Talião",
  "imagem": "/media/faccoes/manopla-dourada.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**O Carrasco** — o atual é esguio, muito magro, de face serena."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Fortim do Talião**, na Floresta dos Condenados."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Época da fundação de Asan, por exilados de Zharkia."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Sem uniforme. Os mais fiéis tatuam um **C** sobre o peito direito."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "O Carrasco > cargos temporários (capitães, generais, diplomatas) > bandidos."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Formada pelos primeiros criminosos exilados sob a regência do Clero, a Manopla manteve-se **neutra** entre Zharkia e Asan e, sem crimes que a condenassem, retirou-se para a floresta. O primeiro Carrasco instituiu a lei do mais forte: qualquer um pode liderar, desde que vença o atual **num duelo de vida ou morte**. O nome deixou de ser de um homem e tornou-se uma **entidade**."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Os mercenários **nunca foram tão úteis**. Com o caos tomando as grandes cidades, ricos comerciantes e viajantes contratam a Manopla para **viagens seguras, cobranças de dívidas e empréstimos**. O controle se estendeu a **todos os bandidos da Floresta dos Condenados**, onde vigora a **lei do talião**."
     },
     {
      "t": "p",
      "texto": "Ninguém desconfiaria da capacidade do atual Carrasco por sua aparência — mas é um dos guerreiros mais hábeis da Cidadela. Dizem que na juventude pertenceu a facções de renome em Zharkia. Ninguém sabe quem ele era."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "AMT",
      "texto": "Melhor cliente."
     },
     {
      "t": "campo",
      "rotulo": "Orgulho Vanírio",
      "texto": "A única facção criminosa capaz de aceitar um contrato contra eles."
     },
     {
      "t": "campo",
      "rotulo": "Cavaleiros de Rothen",
      "texto": "Desprezo mútuo e negócios eventuais."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "clero-de-zhark",
  "nome": "Clero de Zhark",
  "lema": "\"Crer, espalhar, seguir.\" — as Três Diretrizes.",
  "lider": "Sumo-Sacerdote Aldras Mão-Branca",
  "sede": "Grande Templo de Rothen",
  "imagem": "/media/faccoes/clero-de-zhark.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Sumo-Sacerdote Aldras Mão-Branca**."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Grande Templo de Rothen**, aos pés do Castelo; templos dedicados a cada divindade pelo continente."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Logo após o Pacto Divino, em Memmar."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Acólitos de cinza, Sacerdotes de vermelho; o Sumo-Sacerdote porta o cajado ancestral."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Sumo-Sacerdote > Alto Sacerdotes > Sacerdotes > Acólitos."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Guardião do **Teste de Fé** que identifica cada Deus-Rei, o Clero governou Zharkia após a Segunda Guerra Civil, fundou a Guarda e, sob Kristine, recebeu as **Runas** de poder divino. No **Ano Negro** perdeu o Sumo-Sacerdote **Lael Micarlin**; **Harriot Elodin** o reergueu ao lado de Zamordus."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Com o passar dos séculos e a **reintegração de Asan** ao Panteão (281), revelada ao Sumo-Sacerdote da época após o Arrebatamento dos Corrompidos, o Clero passou a manter **templos específicos** para cada deus. O Sumo-Sacerdote gere todos eles, aparecendo de surpresa em pequenos cultos."
     },
     {
      "t": "p",
      "texto": "No ano **443**, três anos após a Noite sem Vigilantes, o Clero fundou em segredo **Os Guardiões da Verdade**: um centro de estudos sobre temas capazes de desencadear desastres em Tybar. Num desses encontros, reuniram evidências de que **o Mesum corrompe todos em Zharkia** — uns dizem que é o ar, outros, as **raízes das árvores** de todo o continente. As magias de corrupção tornaram-se quase incontroláveis."
     },
     {
      "t": "p",
      "texto": "Desde o **Presságio dos Dois Tronos**, Aldras carrega um cálice de prata e teme o que Selvana e Kael significam."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Cavaleiros de Rothen",
      "texto": "O braço armado que se soltou do corpo."
     },
     {
      "t": "campo",
      "rotulo": "Vigilantes Eternos",
      "texto": "Em segredo, cogitam recriá-los sob tutela do Clero."
     },
     {
      "t": "campo",
      "rotulo": "Casa Asanien",
      "texto": "Irmãos de Panteão desde a revelação de 281. O Sacerdote Cassian é aliado próximo de Aldras; o povo ainda desconfia."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "a-promessa",
  "nome": "A Promessa",
  "lema": "\"Nós não temos pressa. As raízes não têm pressa.\"",
  "lider": "Raiz",
  "sede": "Clareira das Árvores Negras",
  "imagem": "/media/faccoes/a-promessa.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Raiz**, o Numajene exilado que a floresta guarda."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Clareira das Árvores Negras**, no coração corrompido de Numaja."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Oculta. Os primeiros sinais datam de 300."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Seiva negra sob as unhas; flores que nascem onde dormem."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Raiz > Anciões Enraizados > Fiéis."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Raiz sobreviveu ao **Arrebatamento dos Grandes Mestres (279)** — o Arrebatamento dos Corrompidos — quando deveria ter desaparecido. Aprendeu em **252** que a Mesum pode ser **plantada**, teve como discípulo o futuro Arquimago **Quentyn Ztarst** e retornou em **300** com as marcas de Aghaja queimadas nas costas. Desde então, a floresta adoece: a estrada de Zamor sumiu (431), e raízes brancas crescem em direção a Zharkia (467)."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Alguns Numajenes passaram a seguir Raiz como **única religião**. Flertando com o caos e com sua longa vida, acreditam que **os invasores de Tybar pagarão** por tudo que fizeram e fazem à natureza."
     },
     {
      "t": "p",
      "texto": "A Promessa é um **culto às árvores negras** e à idolatria do caos, que aproxima **Lothcirith, a Besta**, do Mesum. Bebe de séculos de estudo numajene e — sem que a Torre saiba — dos estudos de Shimoria. Seu objetivo: **expandir a floresta** até onde for possível, para que a Besta seja livre para alcançar tudo o que as raízes alcançam."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Orgulho Vanírio",
      "texto": "O alvo primeiro. Cada marca da Dívida é uma promessa de vingança."
     },
     {
      "t": "campo",
      "rotulo": "Totemistas de Numaja",
      "texto": "Perseguidores — e cada vez menos numerosos."
     },
     {
      "t": "campo",
      "rotulo": "Todos os demais",
      "texto": "Ainda não sabem que estão em guerra."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "guarda-de-zharkia",
  "nome": "Guarda de Zharkia",
  "lema": "\"Ninguém lembra do guarda que segurou a porta. Só do cavaleiro que levou o crédito.\"",
  "lider": "Capitã Ysolde Alastair",
  "sede": "Anexo da Muralha",
  "imagem": "/media/faccoes/guarda-de-zharkia.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Capitã Ysolde Alastair**, trineta de Gideon Alastair."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Térreo do Anexo da Muralha**, em Zharkia."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ano 158, pelo Clero, sobre as cinzas do Exército de Zharkia."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Capa vermelha; túnica amarela (Guarda), azul (Tenente), preta (Capitão). Defensores usam apenas a faixa vermelha."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Capitão > Tenentes > Guardas > Defensores."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Nascida do antigo **Exército de Cendril**, a Guarda foi refundada pelo Clero após a Segunda Guerra Civil, sem nenhum dos homens que haviam servido à escravidão. Dizimada e corrompida no **Ano Negro (228)**, foi reerguida por **Gideon Alastair**, veterano do Forte Zamor, depois que o Capitão **Darkan** fugiu dos muros e o Tenente **Theodore Mavel** morreu sem abandonar o posto. Por séculos foi o caminho mais comum para um guerreiro chamar a atenção dos Cavaleiros ou dos Vigilantes."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "A Guarda é hoje **o último braço da lei que ainda pisa nas ruas**. Os Cavaleiros julgam e executam do alto; quem prende, patrulha e enterra são os guardas. Desde **455**, sem a Jaula, os piores condenados ficam nas celas do Anexo — superlotadas e mal pagas."
     },
     {
      "t": "p",
      "texto": "**Ysolde Alastair** assumiu em **462**, após o Capitão anterior ser executado pelos Cavaleiros por \"insubordinação\" — ele se recusara a prender um Asanita sem provas. Ysolde é honesta, cansada e prática: sabe que metade dos Defensores aceita moedas das **Máscaras Cinzas** e da **AMT**, e escolhe suas brigas. Corre nos quartéis um nome sussurrado para o grupo de guardas que ainda seguem o velho juramento: **os Mavelinos**."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Cavaleiros de Rothen",
      "texto": "Superiores temidos e desprezados."
     },
     {
      "t": "campo",
      "rotulo": "Clero de Zhark",
      "texto": "Aliado discreto; o juramento ainda é feito no Templo."
     },
     {
      "t": "campo",
      "rotulo": "Povo",
      "texto": "Desconfiança com os Defensores, respeito aos raros guardas honestos."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "liga-das-velas-livres",
  "nome": "Liga das Velas Livres",
  "lema": "\"Rei nenhum manda no vento. Nós só cobramos por ele.\"",
  "lider": "Almirante-Mercador Corin Vasquel",
  "sede": "Porto Errante",
  "imagem": "/media/faccoes/liga-das-velas-livres.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Almirante-Mercador Corin Vasquel, o Sal-Velho**."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Porto Errante**, na Ilha da Salmoura — enseada escondida ao sul, erguida com madeira de naufrágios."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ano 392, quando a rota marítima ao Forte Zamor foi cancelada."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Uma vela costurada em retalhos de várias cores; cada capitão carrega um **livro-razão acorrentado** à cintura."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Almirante-Mercador > Mesa dos Capitães > Mestres de Navio > Tripulação."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Em **344**, a rainha **Marta Rothen** contratou pequenos mercadores e barqueiros independentes para manter a **rota marítima de abastecimento** ao Forte Zamor. Por quase meio século, gente sem nome nem anel da Associação levou pão e flechas a homens esquecidos — e aprendeu cada corrente, recife e enseada do continente."
     },
     {
      "t": "p",
      "texto": "Em **392**, a rota foi cancelada **\"por ordem econômica\"**. Os contratos não foram pagos. Os barcos foram confiscados no porto de Zharkia para \"quitar dívidas\". Os que conseguiram fugir juraram nunca mais servir a coroa nenhuma."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Setenta anos depois, os fugitivos são uma **frota de mais de oitenta navios**, à parte de todos os reinos. Transportam o que a AMT taxa, o que Aghaja proíbe e o que Zharkia finge não precisar. Não têm bandeira, pagam pouco imposto a ninguém e cobram **pedágio de vento** nas rotas do sul."
     },
     {
      "t": "p",
      "texto": "A Liga mantém contato com o **Grande Clã Skaldgard** nos fiordes do norte — e corre o boato de que o Sal-Velho financia uma expedição para descobrir **o que os dragões deixaram de Thuria**. Mais grave: são os únicos que sabem que **o Forte Zamor caiu**. Venderam a informação a alguém. Ninguém sabe a quem."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "AMT",
      "texto": "Rival declarada. A Associação quer seus navios; a Liga quer o porto de Aghaja."
     },
     {
      "t": "campo",
      "rotulo": "Orgulho Vanírio",
      "texto": "Inimigos nos mares do sul; parceiros quando há ouro bastante."
     },
     {
      "t": "campo",
      "rotulo": "Manopla Dourada",
      "texto": "Escoltas em terra, cobranças em comum."
     },
     {
      "t": "campo",
      "rotulo": "Filhos da Areia",
      "texto": "Compram ouro draconiano a preço de areia."
     },
     {
      "t": "campo",
      "rotulo": "Grande Clã Skaldgard",
      "texto": "Peles, âmbar e aço gélido descem pelo mar do norte; perguntas sobre Thuria sobem."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "mascaras-cinzas",
  "nome": "Máscaras Cinzas",
  "lema": "\"Todo segredo tem dono. Nós só guardamos o recibo.\"",
  "lider": "\"Máscara\"",
  "sede": "Desconhecida",
  "imagem": "/media/faccoes/mascaras-cinzas.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**\"Máscara\"** — figura das fábulas zharkianas, que fala em rimas e charadas. Ninguém sabe se é um homem, uma mulher ou um cargo."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "Desconhecida. Os boatos apontam o **Berço de Zanshir** e as ruínas sem nome da Floresta dos Condenados; os Máscaras deixam os boatos correrem."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Incerta. A teoria mais aceita aponta para os criminosos que escaparam da limpeza do Clero (século II)."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Nenhum. Entre si, usam máscaras de porcelana cinza, lisas e sem expressão."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Máscara > Mãos (roubo) / Olhos (espionagem) / Vozes (coerção) > Contatos."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Ninguém sabe ao certo a origem dos Máscaras. Uns falam na **Lâmina Vermelha** de Memmar, outros em infiltrados da Manopla Dourada. A versão mais aceita diz que são os ladinos que **escaparam da limpeza do Clero** e de Kristine e fizeram da sobrevivência uma arte. Com os anos, os crimes deixaram de ser frequentes e pequenos e passaram a ser **raros e refinados**: grandes roubos e assassinatos capazes de mudar o cenário político de Zharkia. Oficialmente, o Reino **nega que existam**."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Num reino onde leis se compram por decreto, quem vende os segredos manda mais do que quem vende as leis. Os Máscaras Cinzas vivem seu **auge silencioso**: subornam Defensores da Guarda, chantageiam conselheiros e sabem o que cada nobre pagou aos Cavaleiros de Rothen. Dizem que guardam **um registro de cada decreto comprado desde Corvus, o Dourado**, e que esse livro, se viesse a público, derrubaria metade da corte."
     },
     {
      "t": "p",
      "texto": "Corre também uma história mais estranha. Em **228**, o presidente da Associação Cenariana, **Kirth Galam**, sumiu com os tesouros da guilda na noite do Ano Negro. Os Máscaras sempre souberam para onde ele foi, e nunca venderam essa informação. Há quem diga que foi esse ouro que os fez nascer."
     },
     {
      "t": "p",
      "texto": "Desde o nascimento de **Selvana e Kael**, os Máscaras pararam de aceitar contratos de assassinato. É a primeira vez em dois séculos."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Guarda de Zharkia",
      "texto": "Infiltrada em todos os níveis, menos entre os Mavelinos — e isso os incomoda."
     },
     {
      "t": "campo",
      "rotulo": "Cavaleiros de Rothen",
      "texto": "Clientes e reféns ao mesmo tempo."
     },
     {
      "t": "campo",
      "rotulo": "AMT",
      "texto": "Rivais na compra de influência; Lisandra Maysmwedas quer o segredo de Kirth Galam."
     },
     {
      "t": "campo",
      "rotulo": "Liga das Velas Livres",
      "texto": "Os Máscaras compraram dela a notícia da queda do Forte Zamor."
     }
    ]
   }
  ],
  "historias": [],
  "notas": []
 },
 {
  "id": "casa-asanien",
  "nome": "Casa Asanien",
  "lema": "\"Morremos uma vez pela cobiça. Não morreremos de novo pelo rancor.\"",
  "lider": "Lady Vespera Asanien",
  "sede": "Cidadela de Asan",
  "imagem": "/media/faccoes/casa-asanien.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Lady Vespera Asanien**, Matriarca da Cidadela."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "**Cidadela de Asan**, erguida sobre as **ruínas da antiga cidade de Asan** e ainda em reconstrução: o futuro centro cultural, administrativo e espiritual dos asanitas leais."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Linhagem dos antigos Ássios; reconhecida como casa nobre do Panteão após a reintegração de Asan (281)."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Vestes negras com bordados de prata em forma de **corrente quebrada**."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Matriarca > Nobreza Asanien > Sacerdócio de Asan > Leais de Asan."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Os **Ássios**, seguidores de Asan em Memmar, romperam o Pacto Divino e mergulharam a ilha na Primeira Guerra Civil; vencidos, foram deixados para trás. Em **155**, Asan selou com Jarko o **Pacto Negro** e deu ao mundo a Mesum. A cidade de **Asan** (159) virou abrigo de criminosos e piratas e caiu em **169**. No **Ano Negro (228)**, asanitas infiltrados tomaram brevemente Zharkia."
     },
     {
      "t": "p",
      "texto": "Em **279**, o **Arrebatamento dos Corrompidos** — que o povo chama de Arrebatamento dos Grandes Mestres — levou numa só noite os grandes mestres da Mesum. Foi o preço de um **pacto secreto** entre Asan e seus irmãos divinos: o expurgo dos corrompidos em troca do perdão. Em **281**, o culto voltou oficialmente a Tybar."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "Asan está **reintegrado ao Panteão de Zhark**. A cobiça ficou para trás: hoje seu aspecto no Templo é o da **Morte, da Redenção e do Recomeço**, e seus altares recebem zharkianos de todas as linhagens. Como as casas **Rothenien, Zanshirden, Khumarin e Hyvithorian**, Asan tem sua linhagem nobre: os **Asanien**, a quem a coroa entregou as **ruínas da antiga cidade de Asan**, hoje revitalizadas pedra a pedra como **Cidadela de Asan**."
     },
     {
      "t": "p",
      "texto": "A reconciliação é oficial, não unânime. Parte do povo ainda vê heresia em cada asanita, e os Cavaleiros executaram um deles sem julgamento em **421**. Por dentro, a Casa caça o **Véu do Rancor**, os extremistas que nunca aceitaram o perdão."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Clero de Zhark",
      "texto": "Irmãos de Panteão. O Sacerdote **Cassian** é aliado próximo de **Aldras Mão-Branca**."
     },
     {
      "t": "campo",
      "rotulo": "Coroa de Zharkia",
      "texto": "Lealdade jurada; Vespera responde ao Trono."
     },
     {
      "t": "campo",
      "rotulo": "Véu do Rancor",
      "texto": "Inimigo interno, caçado sem piedade."
     },
     {
      "t": "campo",
      "rotulo": "Vanírios",
      "texto": "Desprezo antigo, que nenhuma redenção apagou."
     }
    ]
   }
  ],
  "historias": [
   {
    "titulo": "A Reintegração Divina e a Nova Fé do Panteão",
    "blocos": [
     {
      "t": "p",
      "texto": "**O Novo Dogma de Asan.** Com a restauração de Asan ao Panteão de Zhark, o culto desfez-se da antiga associação com a cobiça e a ganância. Hoje, o aspecto divino de Asan dentro do Templo de Zhark representa a **Morte, a Redenção e o Recomeço**."
     },
     {
      "t": "p",
      "texto": "**O Pacto do Arrebatamento.** O evento conhecido como **Arrebatamento dos Corrompidos** foi o resultado de um pacto secreto selado entre Asan e os demais deuses do Panteão. Em troca do expurgo das forças corrompidas e de uma nova chance para o deus e seus devotos, Asan foi perdoado pelos irmãos divinos. Os detalhes do acordo permanecem obscuros aos mortais, mas o Sumo-Sacerdote e a alta hierarquia do Clero da época receberam a revelação divina e conduziram a plena reintegração do culto, em harmonia com as outras divindades."
     },
     {
      "t": "p",
      "texto": "**Um Culto para Todos os Zharkianos.** Os templos de Asan deixaram de ser exclusivos da raça asanita. Cidadãos de todas as linhagens e origens de Zharkia frequentam seus altares e encontram nos ensinamentos sobre a Morte e o Recomeço reconforto para o luto, superação de erros passados e esperança de novos ciclos."
     }
    ]
   },
   {
    "titulo": "A Nobreza Asanita e a Cidadela de Asan",
    "blocos": [
     {
      "t": "p",
      "texto": "**A Família Nobre Asanien.** Seguindo a tradição das grandes casas nobres associadas aos deuses — **Rothenien, Zanshirden, Khumarin e Hyvithorian** —, a linhagem que representa o aspecto de Asan atende pelo nome de **Asanien**."
     },
     {
      "t": "p",
      "texto": "**A Cidadela de Asan.** Como símbolo da reconciliação e da restauração política, a coroa de Zharkia entregou à nobreza Asanien o domínio das **ruínas da antiga cidade de Asan** — a mesma que Jarko fundou e que caiu em 169. Ali a Casa revitaliza a **Cidadela de Asan**, ainda em reconstrução: o centro cultural, administrativo e espiritual dos asanitas leais, onde prosperam em paz, governam seu povo e mantêm a ordem em comunhão com o Trono."
     }
    ]
   },
   {
    "titulo": "A Mesum e o Abismo do Poder",
    "blocos": [
     {
      "t": "p",
      "texto": "A magia proibida da **Mesum** permanece presente em Tybar. Enquanto o **Círculo Shimoria** e seus adeptos estudam e praticam seus aspectos neutros com disciplina e rigor científico, a energia da Mesum continua a corromper quem busca atalhos para o poder absoluto sem medir consequências."
     }
    ]
   },
   {
    "titulo": "Os Leais de Asan — Guardiões da Aliança",
    "blocos": [
     {
      "t": "p",
      "texto": "Em contrapartida à ameaça extremista, a maioria da nobreza e do sacerdócio asanita serve como pilar de integridade e devoção a Zharkia."
     },
     {
      "t": "pessoa",
      "nome": "Lady Vespera Asanien",
      "titulo": "Matriarca da Cidadela",
      "texto": "Líder da Casa Asanien na Cidadela de Asan. Mulher firme, de diplomacia afiada e lealdade inabalável à aliança com o reino. Caça impiedosamente qualquer indício do Véu do Rancor em seus domínios, para proteger a honra e o futuro de seu povo."
     },
     {
      "t": "pessoa",
      "nome": "Sacerdote Cassian, o Guia da Penumbra",
      "titulo": "",
      "texto": "Alto-sacerdote do Templo de Asan em Zharkia. Querido em todos os bairros, dedica a vida a consolar os moribundos em suas últimas horas e a guiar criminosos arrependidos no caminho da redenção. É aliado próximo do Sumo-Sacerdote **Aldras Mão-Branca**."
     }
    ]
   }
  ],
  "notas": []
 },
 {
  "id": "o-veu-do-rancor",
  "nome": "O Véu do Rancor",
  "lema": "\"Eles quebraram a corrente para nos alinhavar ao trono; nós afiamos os elos para degolar o rei.\"",
  "lider": "Desconhecido",
  "sede": "Subterrâneos de Zharkia",
  "imagem": "",
  "oculta": true,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "Nenhum declarado. Os nomes conhecidos são **Lorde Vane Asanien** e **Mestre Malakor, o Mão-de-Cinza**."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "Os **subterrâneos de Zharkia** e as ruínas sob as cidades."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Ninguém sabe. O Véu nunca morreu: vive no rancor de alguns asanitas desde os séculos difíceis. A Mesum vendida nos fundos de templos em **407** pode ter sido um de seus rastros."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "Nenhum visível. Apenas a saudação da cinza."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Células urbanas, financiadas de cima e sem contato entre si."
     }
    ]
   },
   {
    "titulo": "Os Extremistas Ocultos",
    "blocos": [
     {
      "t": "p",
      "texto": "Apesar da reconciliação oficial, nem todos os asanitas aceitaram o perdão e o novo papel no reino. Nos subterrâneos de Zharkia opera um grupo extremista e silencioso: **o Véu do Rancor**. Não é uma facção à parte da Casa Asanien — é a **ferida dentro dela**, e por isso está registrado aqui, ao lado de quem o caça."
     },
     {
      "t": "p",
      "texto": "**Objetivo.** Destruir Zharkia por dentro, desestabilizar as instituições do Panteão e restaurar a supremacia asanita pela força."
     },
     {
      "t": "p",
      "texto": "**Prática.** Recusam os novos dogmas de redenção e veem a reintegração como uma humilhação histórica. Cultivam a **Mesum negra** sem medo da corrupção e infiltram-se na burocracia, na guarda e no comércio para explorar as brechas da sociedade zharkiana."
     }
    ]
   },
   {
    "titulo": "Personagens do Véu do Rancor",
    "blocos": [
     {
      "t": "pessoa",
      "nome": "Lorde Vane Asanien",
      "titulo": "O Infiltrado",
      "texto": "Membro da nobreza que frequenta os banquetes da Cidadela e do Castelo de Zharkia. Apresenta-se como diplomata impecável e defensor da paz, mas financia em segredo as células urbanas do Véu e fornece recursos para rituais proibidos."
     },
     {
      "t": "pessoa",
      "nome": "Mestre Malakor, o Mão-de-Cinza",
      "titulo": "",
      "texto": "Praticante radical da Mesum que habita as ruínas sob as cidades. Acredita que a corrupção da magia negra é a única arma capaz de derrubar as muralhas de Zharkia; usa cobaias humanas e infiltra acólitos corrompidos nos templos."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Casa Asanien",
      "texto": "O sangue que querem tomar — e a mão que os caça."
     },
     {
      "t": "campo",
      "rotulo": "Clero de Zhark",
      "texto": "Alvo de infiltração."
     },
     {
      "t": "campo",
      "rotulo": "Guarda de Zharkia",
      "texto": "Comprável, nos Defensores; perigosa, nos Mavelinos."
     }
    ]
   }
  ],
  "historias": [],
  "notas": [
   "**A Saudação Secreta (entre infiltrados)**\n— *\"O que a cinza guarda?\"*\n— *\"O fogo que há de queimar Zharkia.\"*"
  ]
 },
 {
  "id": "grande-cla-skaldgard",
  "nome": "Grande Clã Skaldgard",
  "lema": "\"Thuria arde. O juramento, não.\"",
  "lider": "Jarl Torstein Barba-de-Gelo",
  "sede": "Salão do Clã, Cidadela dos Rothenien",
  "imagem": "/media/faccoes/grande-cla-skaldgard.webp",
  "oculta": false,
  "extinta": false,
  "intro": [],
  "secoes": [
   {
    "titulo": "Identidade",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Líder",
      "texto": "**Jarl Torstein Barba-de-Gelo**, que comandou a frota de fuga na queda de Thuria."
     },
     {
      "t": "campo",
      "rotulo": "Sede",
      "texto": "O **Salão do Clã**, dentro da **Cidadela dos Rothenien**. O povo vive, pesca e caça nos **fiordes do extremo norte**."
     },
     {
      "t": "campo",
      "rotulo": "Fundação",
      "texto": "Há cerca de duas décadas, após a queda de Thuria e a **Segunda Grande Migração**."
     },
     {
      "t": "campo",
      "rotulo": "Reconhecimento",
      "texto": "O **Dragão Partido** — um machado fendendo um dragão ao meio, branco sobre azul de gelo, com os sinais de **Skjold, Krag, Vinter e Eisen** nos cantos. Cada guerreiro trança na barba ou no cabelo um anel de ferro por inverno passado longe de Thuria."
     },
     {
      "t": "campo",
      "rotulo": "Hierarquia",
      "texto": "Jarl > Casas Skjold, Krag, Vinter e Eisen > Berserkers e Mestres-Forjadores > Clã."
     }
    ]
   },
   {
    "titulo": "Resgate Histórico",
    "blocos": [
     {
      "t": "p",
      "texto": "Os **Dragões** chegaram à ilha gélida de **Thuria** em **144**; quase todos acreditaram que não eram perigo. Por séculos, só **batedores e guerreiros** thuriões cruzaram o mar para guerrear ou negociar em Tybar — e Zharkia, em **261**, ergueu o **Museu dos Guerreiros do Gelo** como quem encerra um sonho. **Erikar Dois-Machados**, o último Thurião de sangue puro da cidade, morreu em **310**."
     },
     {
      "t": "p",
      "texto": "Há **cerca de duas décadas**, as montanhas de Thuria caíram de vez sob as chamas dos **Dragões Anciões**. Os clãs construíram as **Drakka-Naus** e trouxeram para Tybar **todos os sobreviventes** da raça — pela primeira vez, mulheres e crianças de sangue puro."
     }
    ]
   },
   {
    "titulo": "Situação Atual — Ano 468",
    "blocos": [
     {
      "t": "p",
      "texto": "O **Grande Clã Skaldgard** une as quatro casas sobreviventes. Nos fiordes nasceu a **primeira geração de Thuriões de sangue puro nativos de Tybar**, criada sob a aurora boreal. Ninguém esqueceu a pátria: o clã mantém aceso o **Juramento do Dragão Partido** — voltar um dia, com frota maior, para purgar Thuria dos dragões."
     },
     {
      "t": "p",
      "texto": "O Jarl mantém o **Salão do Clã** dentro da cidadela dos **Rothenien**; juntos guardam a **Passagem de Prata** e a **Muralha Norte**. Com as rotas reabertas, Thuriões de sangue puro já vivem em Zharkia como guarda-costas, mestres de armas e ferreiros reais."
     }
    ]
   },
   {
    "titulo": "Relações",
    "blocos": [
     {
      "t": "campo",
      "rotulo": "Casa Rothenien",
      "texto": "Aliança de sangue e aço. Guerreiros em troca de suprimentos do sul."
     },
     {
      "t": "campo",
      "rotulo": "Zharkia",
      "texto": "Admiração antiga por sua palavra, força e ofício."
     },
     {
      "t": "campo",
      "rotulo": "Liga das Velas Livres",
      "texto": "Os únicos capitães que aceitam rumar ao norte. O Sal-Velho já mediu o casco das Drakka-Naus; o Jarl já mediu o preço do Sal-Velho."
     },
     {
      "t": "campo",
      "rotulo": "Dragões",
      "texto": "Juramento de sangue."
     }
    ]
   }
  ],
  "historias": [
   {
    "titulo": "A Segunda Grande Migração e a Queda de Thuria",
    "blocos": [
     {
      "t": "p",
      "texto": "**O Fim do Lar Ancestral.** Há cerca de duas décadas, as montanhas geladas de Thuria caíram definitivamente sob as chamas e a fúria dos **Dragões Anciões**. Numa última resistência desesperada, os clãs uniram seus melhores mestres-carpinteiros para construir as **Drakka-Naus** — embarcações gigantescas reforçadas em ferro e madeira gélida, capazes de suportar o mar tempestuoso e o inverno eterno."
     },
     {
      "t": "p",
      "texto": "**O Êxodo Completo.** Diferente dos primeiros batedores e guerreiros que navegaram séculos atrás apenas para guerrear ou negociar, esta frota trouxe todos os sobreviventes da raça: guerreiros, anciãos, mestres-forjadores e, pela primeira vez na história conhecida de Tybar, **mulheres e crianças Thuriãs de sangue puro**."
     },
     {
      "t": "p",
      "texto": "**O Desembarque no Norte Gélido.** Após meses enfrentando correntes mortais e tempestades no mar do norte, a frota avistou a costa gelada de Tybar. Desembarcou no extremo norte do continente, numa região de fiordes, montanhas nevadas e gelo perpétuo, onde fincou estandartes e ergueu as primeiras grandes vilas em solo continental."
     }
    ]
   },
   {
    "titulo": "O Grande Clã Skaldgard e as Tradições Mantidas",
    "blocos": [
     {
      "t": "p",
      "texto": "**A União das Famílias.** Os sobreviventes organizaram-se no **Grande Clã Skaldgard**, aliança que reúne as quatro principais casas nobres thuriãs: **Skjold, Krag, Vinter e Eisen**."
     },
     {
      "t": "p",
      "texto": "**O Despertar do Sangue Puro em Tybar.** Com a chegada das mulheres e a consolidação das vilas no norte ao longo destas duas décadas, nasceu a primeira geração de Thuriões de sangue puro nativos de Tybar. Essa geração cresce ouvindo as sagas e os cantos tradicionais sob as luzes da aurora boreal."
     },
     {
      "t": "p",
      "texto": "**O Juramento de Retorno.** Embora tenham construído um lar próspero no norte de Tybar, nenhum Thurião esqueceu sua pátria. O clã mantém aceso o **Juramento do Dragão Partido**: a promessa solene de reunir forças, erguer uma frota ainda maior e, um dia, navegar de volta para purgar Thuria dos dragões e retomar o que é seu por direito de sangue."
     }
    ]
   },
   {
    "titulo": "A Cidadela de Rothenien e a Grande Muralha",
    "blocos": [
     {
      "t": "p",
      "texto": "**A Passagem de Prata.** A cidadela dos **Rothenien** — a influente e nobre família de Rothen que protege as fronteiras do norte — guarda a passagem entre as terras de Zharkia e os picos congelados."
     },
     {
      "t": "p",
      "texto": "**Aliança de Sangue e Aço.** A relação entre o Clã Skaldgard e os Rothenien é de extrema confiança, honra e alto valor militar. Os Thuriões auxiliam nas patrulhas da nevasca, reforçam as defesas e enviam seus melhores berserkers e guerreiros para guarnecer os baluartes da **Muralha Norte** contra o inverno rigoroso e a fauna selvagem do gelo."
     },
     {
      "t": "p",
      "texto": "**Comércio de Caça e Recursos.** Em troca da cooperação militar, os Rothenien garantem que suprimentos, tecidos finos e produtos agrícolas do sul cheguem regularmente aos fiordes thuriões."
     }
    ]
   },
   {
    "titulo": "Difusão pelo Continente e Presença em Zharkia",
    "blocos": [
     {
      "t": "p",
      "texto": "**Pioneiros no Sul.** Com a reabertura das rotas entre o norte e a capital, diversos Thuriões de sangue puro deixaram os fiordes para viver nas grandes cidades, com destaque para a própria **Zharkia**."
     },
     {
      "t": "p",
      "texto": "**Respeito Ancestral.** A convivência dos Thuriões com os demais povos de Tybar segue como nos tempos de seus antepassados: são admirados pela palavra inabalável, pela honestidade brutal, pela força física impressionante e pela maestria em combate tático e metalurgia. Em Zharkia, ocupam postos de destaque como **chefes de guarda-costas, mestres de armas e ferreiros reais**."
     }
    ]
   },
   {
    "titulo": "Personagens e Figuras Relevantes do Clã",
    "blocos": [
     {
      "t": "pessoa",
      "nome": "Jarl Torstein Barba-de-Gelo",
      "titulo": "Líder do Clã Skaldgard",
      "texto": "O lendário chefe militar que comandou a frota de fuga durante a queda de Thuria. Homem de poucas palavras, olhos azul-gélidos e cicatrizes de garras draconianas no peito. É quem mantém o clã unido e negocia diretamente com a corte dos Rothenien."
     },
     {
      "t": "pessoa",
      "nome": "Kaelen Vinter",
      "titulo": "A Guardiã dos Cantos",
      "texto": "Uma das matronas de sangue puro mais respeitadas do continente. Conserva os tomos de sagas e cantos sagrados salvos do grande incêndio da capital de Thuria e ensina a história do povo às crianças nascidas no gelo de Tybar."
     },
     {
      "t": "pessoa",
      "nome": "Erikur Sangue-de-Neve",
      "titulo": "",
      "texto": "O primeiro Thurião de sangue puro nascido no extremo norte de Tybar após a chegada das Drakka-Naus. Jovem guerreiro prodígio, porta um machado duplo forjado em aço gélido e sonha ser o primeiro da nova geração a matar um dragão."
     }
    ]
   }
  ],
  "notas": [
   "Erikar Dois-Machados morreu em 310 certo de que levava para a cova o último sangue puro de Thuria em Tybar, e pediu que nenhum rito do sul fosse cantado sobre ele. Quase um século e meio depois, a primeira criança de sangue puro nascida no gelo recebeu dos skalds o nome do poeta, com uma letra trocada — *para que Erikar não precise voltar, e ainda assim volte*. Dizem que, no dia em que Erikur matar seu primeiro dragão, a lança do Museu será devolvida ao norte."
  ]
 }
]

export const LORE: PaginaLore[] = [
 {
  "id": "thuria",
  "titulo": "Thuria — O Gelo que Atravessou o Mar",
  "nota": "Por séculos, Thuria foi uma lenda contada por netos de guerreiros. Há cerca de duas décadas, voltou a ser um povo inteiro — sem terra, com um juramento.",
  "imagem": "/media/faccoes/grande-cla-skaldgard.webp",
  "faccoes": [
   "grande-cla-skaldgard"
  ],
  "capitulos": [
   {
    "titulo": "",
    "intro": [
     {
      "t": "p",
      "texto": "Os Thuriões vieram de uma ilha gélida ao norte, onde o inverno não termina. De porte massivo, acostumados ao gelo e à adversidade, valorizam a força, a coragem e a honra. Não buscam a guerra nem a estudam; quando ela chega, resolvem de frente. Durante quase toda a história de Tybar, porém, o continente só conheceu deles os batedores, os guerreiros e os poetas que cruzavam o mar."
     }
    ],
    "secoes": [
     {
      "titulo": "Ano 144 — Os Dragões em Thuria",
      "blocos": [
       {
        "t": "p",
        "texto": "Dragões chegam à ilha. Alguns Thuriões os tratam com superstição; a maioria acredita que não representam perigo."
       }
      ]
     },
     {
      "titulo": "Ano 214 — O Tremor",
      "blocos": [
       {
        "t": "p",
        "texto": "A explosão da Queda de Aquil é sentida até em Thuria."
       }
      ]
     },
     {
      "titulo": "Ano 261 — O Museu dos Guerreiros do Gelo",
      "blocos": [
       {
        "t": "p",
        "texto": "Zamordus ergue em Zharkia o **Museu dos Guerreiros do Gelo** — gesto de honra e, também, encerramento político do sonho de retorno. **Erikar Dois-Machados**, poeta e último Thurião de sangue puro em Zharkia, recusa-se a visitá-lo. Para ele, é um túmulo."
       }
      ]
     },
     {
      "titulo": "Ano 310 — Morte de Erikar",
      "blocos": [
       {
        "t": "p",
        "texto": "Erikar morre recusando qualquer rito que não fosse do norte. Serena manda erguer uma ala em sua homenagem. Por quase um século e meio, o sonho de Thuria é guardado por netos e bisnetos que nunca pisaram no gelo."
       }
      ]
     }
    ],
    "notas": []
   },
   {
    "titulo": "A Queda e a Segunda Grande Migração",
    "intro": [],
    "secoes": [
     {
      "titulo": "O Fim do Lar Ancestral",
      "blocos": [
       {
        "t": "p",
        "texto": "Há **cerca de duas décadas**, as montanhas geladas de Thuria caíram definitivamente sob as chamas e a fúria dos **Dragões Anciões**. Numa última resistência desesperada, os clãs uniram seus melhores mestres-carpinteiros para construir as **Drakka-Naus**: embarcações gigantescas reforçadas em ferro e madeira gélida, capazes de suportar o mar tempestuoso e o inverno eterno. A capital ardeu num grande incêndio; dele, Kaelen Vinter salvou os tomos de sagas e cantos sagrados."
       }
      ]
     },
     {
      "titulo": "O Êxodo Completo",
      "blocos": [
       {
        "t": "p",
        "texto": "Diferente dos batedores e guerreiros que navegaram séculos atrás apenas para guerrear ou negociar, esta frota trouxe **todos os sobreviventes** da raça: guerreiros, anciãos, mestres-forjadores e, pela primeira vez na história conhecida de Tybar, **mulheres e crianças Thuriãs de sangue puro**."
       }
      ]
     },
     {
      "titulo": "O Desembarque no Norte Gélido",
      "blocos": [
       {
        "t": "p",
        "texto": "Após meses de correntes mortais e tempestades no mar do norte, a frota avistou a costa gelada de Tybar e desembarcou no **extremo norte do continente** — fiordes, montanhas nevadas e gelo perpétuo. Ali fincaram estandartes e ergueram suas primeiras grandes vilas em solo continental."
       }
      ]
     },
     {
      "titulo": "O Grande Clã Skaldgard",
      "blocos": [
       {
        "t": "p",
        "texto": "Os sobreviventes organizaram-se no **Grande Clã Skaldgard**, aliança das quatro casas nobres thuriãs: **Skjold, Krag, Vinter e Eisen**. O povo vive e caça nos fiordes; o **Salão do Clã**, onde o Jarl reúne as casas, fica dentro da cidadela dos Rothenien. Nas vilas do norte nasceu a **primeira geração de Thuriões de sangue puro nativos de Tybar**, criada ouvindo as sagas sob a aurora boreal."
       }
      ]
     },
     {
      "titulo": "O Juramento do Dragão Partido",
      "blocos": [
       {
        "t": "p",
        "texto": "Nenhum Thurião esqueceu a pátria. O clã jurou reunir forças, erguer uma frota ainda maior e, um dia, navegar de volta para purgar Thuria dos dragões e retomar o que é seu por direito de sangue."
       }
      ]
     }
    ],
    "notas": []
   },
   {
    "titulo": "Thuria no Ano 468",
    "intro": [],
    "secoes": [
     {
      "titulo": "A Passagem de Prata e a Muralha Norte",
      "blocos": [
       {
        "t": "p",
        "texto": "A cidadela dos **Rothenien** — a influente família de Rothen que protege as fronteiras do norte, e onde hoje fica o **Salão do Clã Skaldgard** — guarda a **Passagem de Prata**, entre as terras de Zharkia e os picos congelados. Entre Skaldgard e Rothenien há uma **aliança de sangue e aço**: os Thuriões patrulham a nevasca, reforçam as defesas e mandam seus melhores berserkers guarnecer os baluartes da **Muralha Norte** contra o inverno e a fauna selvagem do gelo. Em troca, os Rothenien fazem chegar aos fiordes suprimentos, tecidos finos e produtos agrícolas do sul."
       }
      ]
     },
     {
      "titulo": "Thuriões em Zharkia",
      "blocos": [
       {
        "t": "p",
        "texto": "Com a reabertura das rotas entre o norte e a capital, Thuriões de sangue puro deixaram os fiordes para viver nas grandes cidades, sobretudo em **Zharkia**. São admirados como seus antepassados: palavra inabalável, honestidade brutal, força impressionante, maestria em combate tático e metalurgia. Ocupam postos de **chefes de guarda-costas, mestres de armas e ferreiros reais**. No Museu dos Guerreiros do Gelo, crianças nascidas no norte olham a última lança de Erikar e não entendem por que os zharkianos a chamavam de *última*."
       }
      ]
     },
     {
      "titulo": "Personagens",
      "blocos": [
       {
        "t": "pessoa",
        "nome": "Jarl Torstein Barba-de-Gelo",
        "titulo": "Líder do Clã Skaldgard",
        "texto": "Comandou a frota de fuga na queda de Thuria. Poucas palavras, olhos azul-gélidos, cicatrizes de garras draconianas no peito. Mantém o clã unido e negocia diretamente com a corte dos Rothenien."
       },
       {
        "t": "pessoa",
        "nome": "Kaelen Vinter",
        "titulo": "A Guardiã dos Cantos",
        "texto": "Matrona de sangue puro das mais respeitadas do continente. Guarda as sagas salvas do incêndio da capital e ensina a história do povo às crianças nascidas no gelo de Tybar."
       },
       {
        "t": "pessoa",
        "nome": "Erikur Sangue-de-Neve",
        "titulo": "",
        "texto": "O primeiro Thurião de sangue puro nascido no extremo norte após a chegada das Drakka-Naus, batizado pelos skalds com o nome de Erikar Dois-Machados e uma letra trocada. Prodígio do machado duplo de aço gélido, sonha ser o primeiro da nova geração a matar um dragão."
       }
      ]
     }
    ],
    "notas": [
     "*\"Minha avó dizia que, quando dois reis nascessem juntos, os dragões voltariam.\"* — dito ouvido por Franz Wissler na costa, ano 468. Em 468, dois reis nasceram juntos. Nos fiordes, ninguém riu."
    ]
   }
  ]
 },
 {
  "id": "asan",
  "titulo": "Asan — Da Cobiça ao Recomeço",
  "nota": "Nenhum deus de Tybar caiu tão fundo, nem voltou de tão longe. Este capítulo registra a história de Asan e de seu povo: a traição em Memmar, o Pacto Negro, o perdão do Panteão e o que os asanitas fazem dele no ano de 468.",
  "imagem": "/media/faccoes/casa-asanien.webp",
  "faccoes": [
   "casa-asanien",
   "o-veu-do-rancor"
  ],
  "capitulos": [
   {
    "titulo": "",
    "intro": [
     {
      "t": "p",
      "texto": "Durante séculos, dizer *asanita* em Zharkia era dizer *traidor*. O deus que vendera a pós-vida a Jarko, a cidade que abrigou piratas, os infiltrados do Ano Negro: tudo isso pesava sobre cada um que nascia com o sangue dos Ássios. Hoje Asan voltou ao Panteão, seus templos recebem zharkianos de todas as linhagens e uma casa nobre leva seu nome. Mas a cinza ainda guarda brasas."
     }
    ],
    "secoes": [
     {
      "titulo": "A Traição em Memmar",
      "blocos": [
       {
        "t": "p",
        "texto": "Os **Ássios**, seguidores de **Asan** — então o Deus da Cobiça —, impacientes com o governo de Hyvitorn, romperam o **Pacto Divino** e mergulharam Memmar na **Primeira Guerra Civil**. Expulso do Panteão, Asan viu seus servos vencidos. Quando os Zharkianos partiram, em **107 A.Z.**, os prisioneiros e os servos de Asan foram deixados na ilha devastada."
       }
      ]
     },
     {
      "titulo": "O Pacto Negro e a Cidade de Asan",
      "blocos": [
       {
        "t": "p",
        "texto": "Em **155**, depois de anos observando a corrupção de **Jarko**, Asan selou com o rei o **Pacto Negro**: poder em troca da pós-vida. Nasceu a **Mesum**. Derrotados na Segunda Guerra Civil, Jarko e os Mesumbeiros fugiram para o extremo oeste e fundaram a cidade de **Asan** (159–161), logo abrigo de criminosos e piratas. Em **169**, a cidade foi destruída e Jarko morreu em batalha."
       }
      ]
     },
     {
      "titulo": "O Ano Negro",
      "blocos": [
       {
        "t": "p",
        "texto": "Em **228**, Kristine foi assassinada e **asanitas infiltrados** tomaram Zharkia por um breve tempo. O Sumo-Sacerdote Lael Micarlin morreu; os Vigilantes Eternos foram dizimados. Zamordus retomou o reino — e o nome de Asan virou sinônimo de traição por gerações."
       }
      ]
     }
    ],
    "notas": []
   },
   {
    "titulo": "O Perdão do Panteão",
    "intro": [],
    "secoes": [
     {
      "titulo": "Ano 279 — O Arrebatamento dos Corrompidos",
      "blocos": [
       {
        "t": "p",
        "texto": "Numa única noite, todos os grandes mestres da Mesum desapareceram de Tybar — Shimorianos avançados, Mesumbeiros ilegais, três Vigilantes que flertaram com a arte proibida. O povo chamou a noite de **Arrebatamento dos Grandes Mestres**. O Templo a chama de **Arrebatamento dos Corrompidos**: foi o resultado de um **pacto secreto** entre Asan e os demais deuses. Em troca do expurgo das forças corrompidas e de uma nova chance para si e seus devotos, Asan foi perdoado pelos irmãos divinos. Os detalhes do acordo permanecem obscuros aos mortais. Raiz, que deveria ter sido levado, não foi."
       }
      ]
     },
     {
      "titulo": "Ano 281 — A Reintegração",
      "blocos": [
       {
        "t": "p",
        "texto": "O Sumo-Sacerdote e a alta hierarquia do Clero da época receberam a **revelação divina** e conduziram a plena reintegração do culto, em harmonia com as outras divindades. Fora do Templo, porém, o povo só soube que o culto de Asan voltava a Tybar \"por acordos nunca tornados públicos\". A nova doutrina pregava o arrependimento e a morte como redenção. A Mesum continuou existindo — mas enfraquecida, como chama sob chuva."
       }
      ]
     },
     {
      "titulo": "O Novo Dogma",
      "blocos": [
       {
        "t": "p",
        "texto": "Asan deixou para trás a cobiça e a ganância. Seu aspecto divino no Templo de Zhark é o da **Morte, da Redenção e do Recomeço**. Os templos de Asan deixaram de ser exclusivos da raça asanita: cidadãos de todas as linhagens frequentam seus altares e encontram ali reconforto para o luto, superação de erros passados e esperança de novos ciclos."
       }
      ]
     },
     {
      "titulo": "Os Séculos Difíceis",
      "blocos": [
       {
        "t": "p",
        "texto": "Nem toda a reconciliação desceu do Templo às ruas. Em **407**, o culto já tinha templos em quatro bairros de Zharkia, e nos fundos de alguns deles o Mesum fraco dos Sangue-Novos era vendido por moedas; o Clero protestou e o rei Tanvir arquivou o protesto. Em **421**, um Asanita foi o primeiro cidadão executado sem julgamento formal. Em **462**, o Capitão da Guarda foi executado por recusar-se a prender um Asanita sem provas. Para muitos zharkianos, o asanita ainda é suspeito até prova em contrário."
       }
      ]
     }
    ],
    "notas": []
   },
   {
    "titulo": "Asan no Ano 468",
    "intro": [],
    "secoes": [
     {
      "titulo": "A Casa Asanien e a Cidadela de Asan",
      "blocos": [
       {
        "t": "p",
        "texto": "Como as grandes casas nobres associadas aos deuses — **Rothenien, Zanshirden, Khumarin e Hyvithorian** —, Asan tem sua linhagem nobre: os **Asanien**. Como símbolo da reconciliação, a coroa de Zharkia entregou à Casa as **ruínas da antiga cidade de Asan**, a mesma que caiu em 169. Ali se ergue, ainda em reconstrução, a **Cidadela de Asan**: centro cultural, administrativo e espiritual dos asanitas leais, onde prosperam em paz, governam seu povo e mantêm a ordem em comunhão com o Trono."
       }
      ]
     },
     {
      "titulo": "A Mesum e o Abismo do Poder",
      "blocos": [
       {
        "t": "p",
        "texto": "A Mesum permanece em Tybar. O **Círculo Shimoria** estuda e pratica seus aspectos neutros com disciplina e rigor científico; fora dele, a energia profana continua a corromper quem busca atalhos para o poder absoluto sem medir consequências."
       }
      ]
     },
     {
      "titulo": "Os Leais e o Véu",
      "blocos": [
       {
        "t": "p",
        "texto": "A maioria da nobreza e do sacerdócio asanita — os **Leais de Asan** — serve a Zharkia como pilar de integridade e devoção. Mas nos subterrâneos opera o **Véu do Rancor**. Ninguém sabe quando nasceu, e ele nunca morreu: vive no rancor de alguns asanitas desde os séculos difíceis — a Mesum vendida nos templos em 407 pode ter sido um de seus rastros. O Véu vê no perdão uma humilhação histórica e quer destruir Zharkia por dentro, cultivando a Mesum negra e infiltrando-se na burocracia, na guarda e no comércio."
       },
       {
        "t": "p",
        "texto": "*\"Eles quebraram a corrente para nos alinhavar ao trono; nós afiamos os elos para degolar o rei.\"*"
       }
      ]
     },
     {
      "titulo": "Personagens",
      "blocos": [
       {
        "t": "pessoa",
        "nome": "Lady Vespera Asanien",
        "titulo": "Matriarca da Cidadela",
        "texto": "Líder da Casa Asanien. Firme, de diplomacia afiada e lealdade inabalável ao reino. Caça impiedosamente o Véu do Rancor em seus domínios."
       },
       {
        "t": "pessoa",
        "nome": "Sacerdote Cassian, o Guia da Penumbra",
        "titulo": "",
        "texto": "Alto-sacerdote do Templo de Asan em Zharkia. Consola os moribundos, guia criminosos arrependidos e é aliado próximo de **Aldras Mão-Branca**."
       },
       {
        "t": "pessoa",
        "nome": "Lorde Vane Asanien",
        "titulo": "O Infiltrado",
        "texto": "Diplomata impecável nos banquetes da Cidadela e do Castelo de Zharkia; em segredo, financia as células urbanas do Véu e os rituais proibidos."
       },
       {
        "t": "pessoa",
        "nome": "Mestre Malakor, o Mão-de-Cinza",
        "titulo": "",
        "texto": "Mesumbeiro radical das ruínas sob as cidades. Usa cobaias humanas e infiltra acólitos corrompidos nos templos."
       }
      ]
     }
    ],
    "notas": [
     "**A saudação da cinza.** — *\"O que a cinza guarda?\"* — *\"O fogo que há de queimar Zharkia.\"* Quem responde, pertence ao Véu."
    ]
   }
  ]
 }
]
