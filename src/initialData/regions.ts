import type { Region } from '../types';

export const INITIAL_REGIONS: Record<string, Region> = {
  reg_roma: {
    id: 'reg_roma',
    nome: 'Italia & Latium',
    nomeLatino: 'Italia et Latium Vetus',
    macroArea: 'Occidente Romano',
    descrizioneStorica: 'Il cuore politico e militare della Repubblica Romana all\'apice della 182ª Olimpiade. Campi di gara leggendari tra le sponde del Tevere, le fertili terre campane e la Gallia Cisalpina.',
    culturaDominante: 'Romana / Italica',
    reputazioneSportiva: 950,
    leagueIds: ['league_romana']
  },
  reg_gallia: {
    id: 'reg_gallia',
    nome: 'Gallia Transalpina',
    nomeLatino: 'Gallia Comata et Narbonensis',
    macroArea: 'Europa Continentale & Celtica',
    descrizioneStorica: 'Terre di fiere tribù celtiche prima della sottomissione cesariana. Arverni, Edui, Sequani e Parisii si affrontano con ardore guerriero e fisicità prorompente.',
    culturaDominante: 'Gallica / Celtica',
    reputazioneSportiva: 820,
    leagueIds: ['league_gallica']
  },
  reg_iberica: {
    id: 'reg_iberica',
    nome: 'Hispania',
    nomeLatino: 'Hispania Citerior et Ulterior',
    macroArea: 'Occidente Romano',
    descrizioneStorica: 'Dalle miniere d’argento della Baetica alle roccaforti celtibere di Numantia. Gioco rapido, tecnico e intriso di fiera determinazione indigena.',
    culturaDominante: 'Iberica / Celtibera',
    reputazioneSportiva: 840,
    leagueIds: ['league_iberica']
  },
  reg_cartaginese: {
    id: 'reg_cartaginese',
    nome: 'Cartagine & Zeugitana',
    nomeLatino: 'Carthago et Sinus Zeugitanus',
    macroArea: 'Nord Africa & Nilo',
    descrizioneStorica: 'L’antica metropoli punica risorta dalle ceneri. Scuole tattiche marittime con influenze fenicie e veterani della grande tradizione militare barcida.',
    culturaDominante: 'Punica',
    reputazioneSportiva: 870,
    leagueIds: ['league_cartaginese']
  },
  reg_africana: {
    id: 'reg_africana',
    nome: 'Africa Proconsolare',
    nomeLatino: 'Provincia Africa Proconsularis',
    macroArea: 'Nord Africa & Nilo',
    descrizioneStorica: 'Il granaio di Roma e le floride città costiere di Leptis Magna, Hadrumetum e Utica. Grandi stadi marittimi con atleti agili e resistenti al clima arido.',
    culturaDominante: 'Romano-Punica',
    reputazioneSportiva: 780,
    leagueIds: ['league_africana']
  },
  reg_greca: {
    id: 'reg_greca',
    nome: 'Grecia & Peloponneso',
    nomeLatino: 'Achaea et Peloponnesus',
    macroArea: 'Mediterraneo Orientale & Grecia',
    descrizioneStorica: 'La culla della filosofia, dei giochi atletici e della disciplina oplitica. Atene, Sparta e Corinto uniscono geometria di passaggi e rigore agonistico millenario.',
    culturaDominante: 'Greca / Ellenica',
    reputazioneSportiva: 880,
    leagueIds: ['league_greca']
  },
  reg_macedone: {
    id: 'reg_macedone',
    nome: 'Macedonia & Epiro',
    nomeLatino: 'Macedonia et Epirus',
    macroArea: 'Mediterraneo Orientale & Grecia',
    descrizioneStorica: 'Patria di Filippo II e Alessandro Magno. Tradizione guerriera della falange, con attacchi verticali fulminei e schieramenti compatti.',
    culturaDominante: 'Macedone',
    reputazioneSportiva: 800,
    leagueIds: ['league_macedone']
  },
  reg_anatolica: {
    id: 'reg_anatolica',
    nome: 'Anatolia & Ionia',
    nomeLatino: 'Asia Minor et Ionia',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'Metropoli cosmopolite come Efeso, Pergamo e Mileto. Harpastum spettacolare, ricco di inventiva tecnica e grandi investimenti aristocratici.',
    culturaDominante: 'Greco-Asiatica',
    reputazioneSportiva: 810,
    leagueIds: ['league_anatolica']
  },
  reg_siriana: {
    id: 'reg_siriana',
    nome: 'Siria & Fenicia',
    nomeLatino: 'Syria et Phoenice',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'Incantevole crocevia carovaniero e marittimo tra Antiochia, Damasco, Tiro e Sidone. Atleti dal dribbling imprevedibile e grande visione tattica.',
    culturaDominante: 'Siriana / Fenicia',
    reputazioneSportiva: 830,
    leagueIds: ['league_siriana']
  },
  reg_egizia: {
    id: 'reg_egizia',
    nome: 'Aegyptus & Delta del Nilo',
    nomeLatino: 'Regnum Ptolemaicum Aegypti',
    macroArea: 'Nord Africa & Nilo',
    descrizioneStorica: 'Il fastoso regno tolemaico di Cleopatra. La sontuosa Alessandria e le città lungo il sacro Nilo schierano formazioni tra le più ricche e tecniche del globo.',
    culturaDominante: 'Egizia / Tolemaica',
    reputazioneSportiva: 890,
    leagueIds: ['league_egizia']
  },
  reg_persiana: {
    id: 'reg_persiana',
    nome: 'Perside & Media',
    nomeLatino: 'Persis et Media Antiqua',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'L’antico cuore dell’impero achemenide con Persepoli e Susa. Grande orgoglio imperiale, arcieri della palla e atleti dal tiro potente da fuori area.',
    culturaDominante: 'Persiana',
    reputazioneSportiva: 820,
    leagueIds: ['league_persiana']
  },
  reg_partica: {
    id: 'reg_partica',
    nome: 'Partia & Mesopotamia',
    nomeLatino: 'Imperium Parthicum',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'Il grande rivale di Roma a oriente: Ctesifonte, Seleucia e le steppe mesopotamiche. Contropiedi letali ispirati alla famosa "freccia dei Parti".',
    culturaDominante: 'Partica',
    reputazioneSportiva: 860,
    leagueIds: ['league_partica']
  },
  reg_armena: {
    id: 'reg_armena',
    nome: 'Armenia Maior',
    nomeLatino: 'Regnum Armeniae Maioris',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'Il regno montuoso di Tigrane il Grande. Difesa d’acciaio abituata ai climi rigidi del Caucaso e ripartenze coraggiose.',
    culturaDominante: 'Armena',
    reputazioneSportiva: 790,
    leagueIds: ['league_armena']
  },
  reg_battriana: {
    id: 'reg_battriana',
    nome: 'Battriana & Sogdiana',
    nomeLatino: 'Graeco-Bactria et Sogdiana',
    macroArea: 'Terre Lontane & Confini',
    descrizioneStorica: 'L’avamposto ellenistico più remoto verso l’India e le vette dell’Hindu Kush. Connubio unico tra disciplina greca e cavalleria centroasiatica.',
    culturaDominante: 'Greco-Battriana',
    reputazioneSportiva: 770,
    leagueIds: ['league_battriana']
  },
  reg_arabica: {
    id: 'reg_arabica',
    nome: 'Arabia Felix',
    nomeLatino: 'Arabia Eudaemon et Saba',
    macroArea: 'Terre Lontane & Confini',
    descrizioneStorica: 'La leggendaria via dei profumi e delle spezie dei regni di Saba e Qataban. Squadre veloci, abituate a ritmi torridi e superfici dure.',
    culturaDominante: 'Araba / Sabea',
    reputazioneSportiva: 730,
    leagueIds: ['league_arabica']
  },
  reg_britannia: {
    id: 'reg_britannia',
    nome: 'Britannia Insulare',
    nomeLatino: 'Britannia Insularis',
    macroArea: 'Europa Continentale & Celtica',
    descrizioneStorica: 'L’isola avvolta dalle nebbie del nord: Trinovanti, Siluri e Briganti. Harpastum fangoso, aggressivo, basato sul contrasto ruvido e l’elevazione aerea.',
    culturaDominante: 'Britanna / Celtica',
    reputazioneSportiva: 740,
    leagueIds: ['league_britannica']
  },
  reg_germania: {
    id: 'reg_germania',
    nome: 'Germania Magna',
    nomeLatino: 'Germania Libera Trans-Rhenum',
    macroArea: 'Europa Continentale & Celtica',
    descrizioneStorica: 'Le fitte foreste della selva ercinica oltre il Reno. Guerrieri imponenti dotati di forza bruta, pressing feroce e resistenza instancabile.',
    culturaDominante: 'Germanica',
    reputazioneSportiva: 760,
    leagueIds: ['league_germanica']
  },
  reg_tracia: {
    id: 'reg_tracia',
    nome: 'Tracia',
    nomeLatino: 'Thracia Odrysia',
    macroArea: 'Mediterraneo Orientale & Grecia',
    descrizioneStorica: 'La terra dei gladiatori e di Spartaco. Squadre indomite, dal gioco fisico e spietato che non concede respiro agli avversari.',
    culturaDominante: 'Tracica',
    reputazioneSportiva: 750,
    leagueIds: ['league_tracica']
  },
  reg_dacia: {
    id: 'reg_dacia',
    nome: 'Dacia',
    nomeLatino: 'Regnum Daciae Burebistae',
    macroArea: 'Europa Continentale & Celtica',
    descrizioneStorica: 'Il formidabile regno carpatoc del re Burebista nel suo apogeo. Organizzazione solida e giocatori armati della caratteristica falx atletica.',
    culturaDominante: 'Dacica',
    reputazioneSportiva: 770,
    leagueIds: ['league_dacica']
  },
  reg_numidica: {
    id: 'reg_numidica',
    nome: 'Numidia',
    nomeLatino: 'Regnum Numidiae',
    macroArea: 'Nord Africa & Nilo',
    descrizioneStorica: 'La patria dei re Giuba e Massinissa. Famosa per la sua agilissima cavalleria, riflessa in ali scattanti e contropiedisti imprendibili.',
    culturaDominante: 'Numida / Berbera',
    reputazioneSportiva: 780,
    leagueIds: ['league_numidica']
  },
  reg_mauritana: {
    id: 'reg_mauritana',
    nome: 'Mauretania',
    nomeLatino: 'Regnum Mauretaniae Tingitanae',
    macroArea: 'Nord Africa & Nilo',
    descrizioneStorica: 'Sotto il governo del re Bocco e Bogud alle pendici dell’Atlante e sullo stretto d’Ercole. Squadre gagliarde e difese molto rocciose.',
    culturaDominante: 'Mauritana',
    reputazioneSportiva: 730,
    leagueIds: ['league_mauritana']
  },
  reg_cirenaica: {
    id: 'reg_cirenaica',
    nome: 'Cirenaica & Pentapoli',
    nomeLatino: 'Cyrenaica et Pentapolis',
    macroArea: 'Nord Africa & Nilo',
    descrizioneStorica: 'Le floride cinque città greche di Cirene, Apollonia, Barca, Teuchira e Berenice. Tradizione classica raffinata arricchita dalla ricchezza del silfio.',
    culturaDominante: 'Greco-Libica',
    reputazioneSportiva: 750,
    leagueIds: ['league_cirenaica']
  },
  reg_nubiana: {
    id: 'reg_nubiana',
    nome: 'Nubia & Kush',
    nomeLatino: 'Regnum Kushiticum Meroiticum',
    macroArea: 'Nord Africa & Nilo',
    descrizioneStorica: 'L’antico regno dei faraoni neri di Meroe a monte delle cateratte del Nilo. Arcieri prodigiosi e atleti dalla falcata possente.',
    culturaDominante: 'Kushita / Nubiana',
    reputazioneSportiva: 720,
    leagueIds: ['league_nubiana']
  },
  reg_etiopica: {
    id: 'reg_etiopica',
    nome: 'Etiopia & Axum',
    nomeLatino: 'Terra Punt et Axumis',
    macroArea: 'Terre Lontane & Confini',
    descrizioneStorica: 'I primi fasti del regno di Axum tra il Mar Rosso e l’altopiano etiopico. Resistenza prodigiosa all’altitudine e polmoni d’acciaio.',
    culturaDominante: 'Axumita',
    reputazioneSportiva: 710,
    leagueIds: ['league_etiopica']
  },
  reg_cilicia: {
    id: 'reg_cilicia',
    nome: 'Cilicia',
    nomeLatino: 'Cilicia Campestris et Trachea',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'Terra di Tarsus e celebri porti marittimi. Tradizione di audacia corsara, astuzia tattica e rapida transizione positiva.',
    culturaDominante: 'Cilicia / Ellenistica',
    reputazioneSportiva: 760,
    leagueIds: ['league_cilicia']
  },
  reg_cappadoce: {
    id: 'reg_cappadoce',
    nome: 'Cappadocia',
    nomeLatino: 'Regnum Cappadociae',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'L’altopiano anatolico di Mazaca ai piedi del Monte Argaeus. Famoso per i cavalli da corsa e una disciplina agonistica inflessibile.',
    culturaDominante: 'Cappadoce',
    reputazioneSportiva: 750,
    leagueIds: ['league_cappadoce']
  },
  reg_sarmatica: {
    id: 'reg_sarmatica',
    nome: 'Sarmatia & Scizia',
    nomeLatino: 'Sarmatia Asiatica et Scythia',
    macroArea: 'Terre Lontane & Confini',
    descrizioneStorica: 'Le sterminate pianure delle steppe a nord del Mar Nero. Popoli nomadi dall’agilità felina e attacchi a valanga a campo aperto.',
    culturaDominante: 'Sarmatica / Scita',
    reputazioneSportiva: 740,
    leagueIds: ['league_sarmatica']
  },
  reg_nabataea: {
    id: 'reg_nabataea',
    nome: 'Arabia Nabatea & Petra',
    nomeLatino: 'Regnum Nabataeae Petrae',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'La misteriosa e ricchissima città intagliata nella roccia arenaria rossa sotto re Malichus I. Maestria nell’amministrazione e grande compattezza difensiva.',
    culturaDominante: 'Nabatea',
    reputazioneSportiva: 770,
    leagueIds: ['league_nabatea']
  },
  reg_pontus: {
    id: 'reg_pontus',
    nome: 'Ponto Eussino',
    nomeLatino: 'Regnum Ponticum Euxini',
    macroArea: 'Oriente & Asia Anteriore',
    descrizioneStorica: 'L’antico regno di Mitridate il Grande affacciato sulle acque del Ponto. Spirito di rivalsa, tenacia tattica e grandi maestri di gioco.',
    culturaDominante: 'Pontica / Ellenistica',
    reputazioneSportiva: 800,
    leagueIds: ['league_pontica']
  },
  reg_illyricum: {
    id: 'reg_illyricum',
    nome: 'Illiria & Dalmazia',
    nomeLatino: 'Illyricum et Dalmatia',
    macroArea: 'Occidente Romano',
    descrizioneStorica: 'Le coste adriatiche e le montagne dei Dalmati e Liburni. Atleti fieri, grandi nuotatori e difensori rocciosi famosi per la loro tenacia.',
    culturaDominante: 'Illirica / Dalmata',
    reputazioneSportiva: 750,
    leagueIds: ['league_illirica']
  }
};
