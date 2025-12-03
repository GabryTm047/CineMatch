export type GenreId =
  | `azione`
  | `avventura`
  | `commedia`
  | `dramma`
  | `fantascienza`
  | `horror`
  | `thriller`
  | `animazione`
  | `romantico`
  | `documentario`;

export interface QuizOption {
  readonly label: string;
  readonly genre: GenreId;
  readonly helper?: string;
}

export interface QuizQuestion {
  readonly id: number;
  readonly text: string;
  readonly options: QuizOption[];
}

export interface GenreInfo {
  readonly id: GenreId;
  readonly label: string;
  readonly color: string;
}

export interface QuizBreakdownEntry {
  readonly genre: GenreInfo;
  readonly count: number;
  readonly percentage: number;
}

export interface QuizResult {
  readonly answers: GenreId[];
  readonly breakdown: QuizBreakdownEntry[];
  readonly totalAnswers: number;
}

export const GENRES: GenreInfo[] = [
  { id: `azione`, label: `Azione`, color: `#ef4444` },
  { id: `avventura`, label: `Avventura`, color: `#f97316` },
  { id: `commedia`, label: `Commedia`, color: `#facc15` },
  { id: `dramma`, label: `Dramma`, color: `#60a5fa` },
  { id: `fantascienza`, label: `Fantascienza`, color: `#818cf8` },
  { id: `horror`, label: `Horror`, color: `#a855f7` },
  { id: `thriller`, label: `Thriller`, color: `#f472b6` },
  { id: `animazione`, label: `Animazione`, color: `#2dd4bf` },
  { id: `romantico`, label: `Romantico`, color: `#fb7185` },
  { id: `documentario`, label: `Documentario`, color: `#38bdf8` },
];

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: `La tua serata perfetta inizia con…`,
    options: [
      { label: `Un inseguimento adrenalinico`, genre: `azione` },
      { label: `Un viaggio verso terre inesplorate`, genre: `avventura` },
      { label: `Una chiacchierata divertente che fa ridere tutti`, genre: `commedia` },
      { label: `Un momento di pura emozione che ti coinvolge`, genre: `dramma` },
    ],
  },
  {
    id: 2,
    text: `Quale ambientazione ti intriga di più?`,
    options: [
      { label: `Un futuro tecnologico e visionario`, genre: `fantascienza` },
      { label: `Un castello gotico pieno di misteri`, genre: `horror` },
      { label: `Una città moderna dove niente è come sembra`, genre: `thriller` },
      { label: `Un luogo remoto dove la natura domina`, genre: `avventura` },
    ],
  },
  {
    id: 3,
    text: `Il tuo protagonista ideale è…`,
    options: [
      { label: `Coraggioso e pronto a tutto pur di salvare il mondo`, genre: `azione` },
      { label: `Intelligente e mosso da curiosità di scoprire la verità`, genre: `documentario` },
      { label: `Sensibile, con una storia personale profonda`, genre: `dramma` },
      { label: `Spiritoso, capace di trasformare tutto in un sorriso`, genre: `commedia` },
    ],
  },
  {
    id: 4,
    text: `Quale colonna sonora ti fa emozionare di più?`,
    options: [
      { label: `Orchestra epica che accompagna battaglie titaniche`, genre: `azione` },
      { label: `Melodie dolci che parlano d'amore`, genre: `romantico` },
      { label: `Synth futuristici che evocano galassie lontane`, genre: `fantascienza` },
      { label: `Pianoforte lento e introspettivo`, genre: `dramma` },
    ],
  },
  {
    id: 5,
    text: `Davanti a un finale sorprendente preferisci…`,
    options: [
      { label: `Restare senza fiato per un colpo di scena inaspettato`, genre: `thriller` },
      { label: `Versare una lacrima per la storia intensa`, genre: `dramma` },
      { label: `Sorridere per una chiusura romantica e positiva`, genre: `romantico` },
      { label: `Ridacchiare per un epilogo leggero e brillante`, genre: `commedia` },
    ],
  },
  {
    id: 6,
    text: `Che tipo di antagonista trovi più affascinante?`,
    options: [
      { label: `Un genio del crimine difficile da catturare`, genre: `thriller` },
      { label: `Una creatura sconosciuta che incarna le nostre paure`, genre: `horror` },
      { label: `Una calamità naturale che mette alla prova gli eroi`, genre: `avventura` },
      { label: `Un rivale carismatico che sfida il protagonista`, genre: `azione` },
    ],
  },
  {
    id: 7,
    text: `Quale ritmo narrativo preferisci?`,
    options: [
      { label: `Veloce, con molta azione e colpi di scena continui`, genre: `azione` },
      { label: `Costante, con esplorazioni e nuove scoperte`, genre: `avventura` },
      { label: `Riflessivo, per assaporare ogni emozione`, genre: `dramma` },
      { label: `Leggero, con momenti comici e spensierati`, genre: `commedia` },
    ],
  },
  {
    id: 8,
    text: `Scegli una bevanda da gustare durante il film:`,
    options: [
      { label: `Energy drink ghiacciato`, genre: `azione` },
      { label: `Cioccolata calda con panna`, genre: `animazione` },
      { label: `Tè profumato alle erbe`, genre: `documentario` },
      { label: `Bibita frizzante dolce`, genre: `commedia` },
    ],
  },
  {
    id: 9,
    text: `Il tuo scenario preferito è…`,
    options: [
      { label: `Le meraviglie della natura e degli animali`, genre: `documentario` },
      { label: `Un pianeta lontano tutto da esplorare`, genre: `fantascienza` },
      { label: `Una metropoli vivace piena di incontri inaspettati`, genre: `commedia` },
      { label: `Un villaggio remoto dove tutto può accadere`, genre: `avventura` },
    ],
  },
  {
    id: 10,
    text: `Come ti piace sentirti alla fine di un film?`,
    options: [
      { label: `Carico di adrenalina pronto per la prossima sfida`, genre: `azione` },
      { label: `Ispirato e con una nuova prospettiva sul mondo`, genre: `documentario` },
      { label: `Spensierato con il sorriso sulle labbra`, genre: `commedia` },
      { label: `Emotivamente toccato e riflessivo`, genre: `dramma` },
    ],
  },
  {
    id: 11,
    text: `Quale tipo di relazione ti coinvolge di più?`,
    options: [
      { label: `Un amore travagliato ma autentico`, genre: `romantico` },
      { label: `Un'amicizia indistruttibile nata da un'avventura`, genre: `avventura` },
      { label: `Una squadra improvvisata che diventa una famiglia`, genre: `animazione` },
      { label: `Un rapporto complesso che evolve nel tempo`, genre: `dramma` },
    ],
  },
  {
    id: 12,
    text: `Quale momento clou preferisci?`,
    options: [
      { label: `Una battaglia di ingegno per scoprire il colpevole`, genre: `thriller` },
      { label: `Un primo bacio destinato a cambiare tutto`, genre: `romantico` },
      { label: `Una risata contagiosa che stempera la tensione`, genre: `commedia` },
      { label: `Una scena emotiva che lascia il segno`, genre: `dramma` },
    ],
  },
  {
    id: 13,
    text: `Scegli un elemento scenografico:`,
    options: [
      { label: `Una giungla piena di insidie`, genre: `avventura` },
      { label: `Una navicella che attraversa un wormhole`, genre: `fantascienza` },
      { label: `Una casa isolata nel bosco`, genre: `horror` },
      { label: `Una grande città piena di luci e movimento`, genre: `commedia` },
    ],
  },
  {
    id: 14,
    text: `Il personaggio secondario che ami sempre è…`,
    options: [
      { label: `Il partner ironico che alleggerisce la scena`, genre: `commedia` },
      { label: `Il mentore saggio che guida il protagonista`, genre: `documentario` },
      { label: `L'amico fedele pronto al sacrificio`, genre: `dramma` },
      { label: `Il comprimario brillante che sorprende`, genre: `azione` },
    ],
  },
  {
    id: 15,
    text: `Quando pensi a un effetto speciale, immagini…`,
    options: [
      { label: `Un'esplosione spettacolare`, genre: `azione` },
      { label: `Creature immaginarie ultra realistiche`, genre: `fantascienza` },
      { label: `Ombre sinistre e porte che cigolano da sole`, genre: `horror` },
      { label: `Illuminazioni vivaci e mondi colorati`, genre: `animazione` },
    ],
  },
  {
    id: 16,
    text: `Che durata ideale ha il film per te?`,
    options: [
      { label: `Due ore intense, senza un attimo di pausa`, genre: `thriller` },
      { label: `Un'ora e mezza leggera e brillante`, genre: `commedia` },
      { label: `Un racconto lungo che ti fa vivere altre vite`, genre: `dramma` },
      { label: `Breve ma visivamente spettacolare`, genre: `animazione` },
    ],
  },
  {
    id: 17,
    text: `Quale valore dovrebbe trasmettere il film?`,
    options: [
      { label: `Coraggio e resilienza`, genre: `azione` },
      { label: `Curiosità verso il mondo e gli altri`, genre: `documentario` },
      { label: `L'importanza di ascoltare il cuore`, genre: `romantico` },
      { label: `La forza delle relazioni umane`, genre: `dramma` },
    ],
  },
  {
    id: 18,
    text: `Come reagisci alle scene spaventose?`,
    options: [
      { label: `Le adoro, più brividi ci sono meglio è`, genre: `horror` },
      { label: `Mi piace il mistero, ma preferisco non avere incubi`, genre: `thriller` },
      { label: `Preferisco scene tenere e rassicuranti`, genre: `animazione` },
      { label: `Cambio aria: preferisco ridere o emozionarmi`, genre: `commedia` },
    ],
  },
  {
    id: 19,
    text: `Quale tipo di storia vera ti ispira di più?`,
    options: [
      { label: `Impresa sportiva o umana straordinaria`, genre: `documentario` },
      { label: `Una storia d'amore che sfida il tempo`, genre: `romantico` },
      { label: `Una sopravvivenza al limite`, genre: `avventura` },
      { label: `Una testimonianza che fa riflettere`, genre: `dramma` },
    ],
  },
  {
    id: 20,
    text: `Alla fine, vuoi consigliare il film agli amici perché…`,
    options: [
      { label: `Li terrà incollati allo schermo`, genre: `thriller` },
      { label: `Li farà ridere fino alle lacrime`, genre: `commedia` },
      { label: `Li porterà a vedere il mondo con occhi nuovi`, genre: `documentario` },
      { label: `Li emozionerà profondamente`, genre: `dramma` },
    ],
  },
  {
    id: 21,
    text: `Che emozione cerchi più spesso in un film?`,
    options: [
      { label: `Intensità e sentimenti profondi`, genre: `dramma` },
      { label: `Allegria e leggerezza`, genre: `commedia` },
      { label: `Adrenalina e coinvolgimento`, genre: `azione` },
      { label: `Suspense e tensione`, genre: `horror` },
    ],
  },
  {
    id: 22,
    text: `Quale ambientazione ti intriga di più?`,
    options: [
      { label: `Realtà quotidiana e storie vere`, genre: `dramma` },
      { label: `Città moderne con situazioni divertenti`, genre: `commedia` },
      { label: `Futuro, spazio o mondi tecnologici`, genre: `fantascienza` },
      { label: `Mondi colorati, fiabeschi o fantasiosi`, genre: `animazione` },
    ],
  },
  {
    id: 23,
    text: `Che tipo di protagonista preferisci?`,
    options: [
      { label: `Una persona che affronta difficoltà interiori`, genre: `dramma` },
      { label: `Un personaggio simpatico e ottimista`, genre: `commedia` },
      { label: `Un eroe coraggioso e determinato`, genre: `azione` },
      { label: `Una persona che deve sopravvivere a un pericolo`, genre: `horror` },
    ],
  },
  {
    id: 24,
    text: `Quando vivi un'esperienza emotivamente intensa, come reagisci di solito?`,
    options: [
      { label: `Mi fermo a riflettere e cerco di capire cosa provo`, genre: `dramma` },
      { label: `Cerco di alleggerire la situazione con ironia o positività`, genre: `commedia` },
      { label: `Mi viene voglia di reagire e agire subito`, genre: `azione` },
      { label: `Divento più vigile e attento a tutto ciò che accade`, genre: `horror` },
    ],
  },
  {
    id: 25,
    text: `Qual è il tuo modo preferito di affrontare i problemi?`,
    options: [
      { label: `Analizzo ciò che sento e cerco una soluzione consapevole`, genre: `dramma` },
      { label: `Cerco supporto sociale e provo a sdrammatizzare`, genre: `commedia` },
      { label: `Agisco rapidamente per risolverli e andare avanti`, genre: `azione` },
      { label: `Raccolgo informazioni, osservo, valuto e poi mi muovo`, genre: `horror` },
    ],
  },
  {
    id: 26,
    text: `Che genere di mondi preferisci?`,
    options: [
      { label: `Realtà attuali o storiche plausibili`, genre: `dramma` },
      { label: `Luoghi quotidiani riconoscibili`, genre: `commedia` },
      { label: `Futuri possibili e innovativi`, genre: `fantascienza` },
      { label: `Mondi immaginari pieni di meraviglia`, genre: `animazione` },
    ],
  },
  {
    id: 27,
    text: `Cosa ti attira di più in una storia?`,
    options: [
      { label: `La profondità dei personaggi`, genre: `dramma` },
      { label: `Le situazioni comiche e i dialoghi brillanti`, genre: `commedia` },
      { label: `Le sfide e le imprese eroiche`, genre: `azione` },
      { label: `I misteri e l'atmosfera inquietante`, genre: `horror` },
    ],
  },
  {
    id: 28,
    text: `Scegli la frase che ti rappresenta:`,
    options: [
      { label: `Mi piace che un film mi faccia riflettere`, genre: `dramma` },
      { label: `Il cinema è fatto per divertirsi`, genre: `commedia` },
      { label: `Voglio provare forti emozioni`, genre: `azione` },
      { label: `Mi piace quando un film mi tiene sulle spine`, genre: `horror` },
    ],
  },
  {
    id: 29,
    text: `Quando conosci nuove persone, cosa noti per prima cosa?`,
    options: [
      { label: `Le loro emozioni e come si sentono davvero`, genre: `dramma` },
      {
        label: `Il loro senso dell'umorismo e la capacità di mettere a proprio agio`,
        genre: `commedia`,
      },
      { label: `La loro energia e determinazione`, genre: `azione` },
      { label: `I dettagli nascosti, come si muovono e osservano`, genre: `horror` },
    ],
  },
  {
    id: 30,
    text: `Che tipo di storia ti affascina di più?`,
    options: [
      { label: `Drammi personali e crescita interiore`, genre: `dramma` },
      { label: `Situazioni ironiche e buffe`, genre: `commedia` },
      { label: `Esplorazione di tecnologie e futuri alternativi`, genre: `fantascienza` },
      { label: `Avventure con personaggi teneri e immaginazione`, genre: `animazione` },
    ],
  },
];
