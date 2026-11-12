import type { Player, Role, Foot, PlayerAttributes, Club } from '../types';

interface PlayerSeed {
  nome: string;
  cognome: string;
  soprannome?: string;
  ruolo: Role;
  eta: number;
  nazionalita: string;
  valoreGenerale: number;
  potenziale: number;
  piede: Foot;
  stipendio: number;
}

// Squad seeds for each club
const SQUAD_SEEDS: Record<string, PlayerSeed[]> = {
  club_roma: [
    { nome: 'Marcus', cognome: 'Valerius', soprannome: 'Il Baluardo', ruolo: 'POR', eta: 28, nazionalita: 'Romana', valoreGenerale: 86, potenziale: 88, piede: 'Destro', stipendio: 42000 },
    { nome: 'Lucius', cognome: 'Julius', ruolo: 'TD', eta: 24, nazionalita: 'Romana', valoreGenerale: 81, potenziale: 86, piede: 'Destro', stipendio: 30000 },
    { nome: 'Decimus', cognome: 'Brutus', soprannome: 'Il Tribuno', ruolo: 'DFC', eta: 29, nazionalita: 'Romana', valoreGenerale: 88, potenziale: 89, piede: 'Destro', stipendio: 48000 },
    { nome: 'Titus', cognome: 'Labienus', ruolo: 'DFC', eta: 27, nazionalita: 'Romana', valoreGenerale: 84, potenziale: 86, piede: 'Destro', stipendio: 38000 },
    { nome: 'Publius', cognome: 'Crassus', ruolo: 'TS', eta: 23, nazionalita: 'Romana', valoreGenerale: 79, potenziale: 85, piede: 'Sinistro', stipendio: 26000 },
    { nome: 'Gaius', cognome: 'Cassius', soprannome: 'Il Regista', ruolo: 'MED', eta: 26, nazionalita: 'Romana', valoreGenerale: 85, potenziale: 87, piede: 'Destro', stipendio: 40000 },
    { nome: 'Quintus', cognome: 'Cicero', ruolo: 'CC', eta: 25, nazionalita: 'Romana', valoreGenerale: 82, potenziale: 86, piede: 'Ambidestro', stipendio: 34000 },
    { nome: 'Aulus', cognome: 'Hirtius', ruolo: 'TRQ', eta: 22, nazionalita: 'Romana', valoreGenerale: 80, potenziale: 88, piede: 'Destro', stipendio: 28000 },
    { nome: 'Sextus', cognome: 'Pompeius', ruolo: 'AD', eta: 21, nazionalita: 'Romana', valoreGenerale: 83, potenziale: 90, piede: 'Destro', stipendio: 32000 },
    { nome: 'Marcus', cognome: 'Antonius', soprannome: 'Il Centurione', ruolo: 'ATT', eta: 27, nazionalita: 'Romana', valoreGenerale: 89, potenziale: 91, piede: 'Destro', stipendio: 55000 },
    { nome: 'Gaius', cognome: 'Trebonius', ruolo: 'AS', eta: 24, nazionalita: 'Romana', valoreGenerale: 81, potenziale: 85, piede: 'Sinistro', stipendio: 30000 },
    // Panchina
    { nome: 'Spurius', cognome: 'Lartius', ruolo: 'POR', eta: 20, nazionalita: 'Romana', valoreGenerale: 72, potenziale: 80, piede: 'Destro', stipendio: 12000 },
    { nome: 'Servius', cognome: 'Sulpicius', ruolo: 'DFC', eta: 22, nazionalita: 'Romana', valoreGenerale: 75, potenziale: 82, piede: 'Destro', stipendio: 18000 },
    { nome: 'Cnaeus', cognome: 'Domitius', ruolo: 'CC', eta: 21, nazionalita: 'Romana', valoreGenerale: 74, potenziale: 83, piede: 'Destro', stipendio: 16000 },
    { nome: 'Appius', cognome: 'Claudius', ruolo: 'ATT', eta: 19, nazionalita: 'Romana', valoreGenerale: 73, potenziale: 87, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Manlius', cognome: 'Torquatus', ruolo: 'TD', eta: 31, nazionalita: 'Romana', valoreGenerale: 76, potenziale: 76, piede: 'Destro', stipendio: 20000 }
  ],
  club_neapolis: [
    { nome: 'Spartaco', cognome: 'Campanus', soprannome: 'Il Trace', ruolo: 'POR', eta: 30, nazionalita: 'Romana', valoreGenerale: 83, potenziale: 83, piede: 'Destro', stipendio: 32000 },
    { nome: 'Statius', cognome: 'Gellius', ruolo: 'DFC', eta: 28, nazionalita: 'Romana', valoreGenerale: 82, potenziale: 83, piede: 'Destro', stipendio: 28000 },
    { nome: 'Numerius', cognome: 'Decidius', ruolo: 'DFC', eta: 25, nazionalita: 'Romana', valoreGenerale: 80, potenziale: 84, piede: 'Destro', stipendio: 24000 },
    { nome: 'Ovius', cognome: 'Paccius', ruolo: 'DFC', eta: 23, nazionalita: 'Romana', valoreGenerale: 78, potenziale: 83, piede: 'Sinistro', stipendio: 20000 },
    { nome: 'Vibius', cognome: 'Virius', ruolo: 'TD', eta: 26, nazionalita: 'Romana', valoreGenerale: 79, potenziale: 82, piede: 'Destro', stipendio: 22000 },
    { nome: 'Marius', cognome: 'Campanius', ruolo: 'MED', eta: 27, nazionalita: 'Romana', valoreGenerale: 83, potenziale: 84, piede: 'Destro', stipendio: 30000 },
    { nome: 'Parthenopeos', cognome: 'Sirenis', ruolo: 'CC', eta: 24, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 87, piede: 'Ambidestro', stipendio: 28000 },
    { nome: 'Nicias', cognome: 'Kymeus', ruolo: 'TS', eta: 22, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 84, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Vesuvio', cognome: 'Ignis', soprannome: 'Il Vulcano', ruolo: 'TRQ', eta: 25, nazionalita: 'Romana', valoreGenerale: 84, potenziale: 88, piede: 'Destro', stipendio: 35000 },
    { nome: 'Crixus', cognome: 'd’Ercolano', soprannome: 'Il Martello', ruolo: 'ATT', eta: 27, nazionalita: 'Gallica', valoreGenerale: 85, potenziale: 86, piede: 'Destro', stipendio: 38000 },
    { nome: 'Gennaro', cognome: 'Pausilypon', ruolo: 'ATT', eta: 22, nazionalita: 'Romana', valoreGenerale: 80, potenziale: 87, piede: 'Sinistro', stipendio: 25000 },
    { nome: 'Sebeto', cognome: 'Fluvius', ruolo: 'POR', eta: 21, nazionalita: 'Romana', valoreGenerale: 71, potenziale: 78, piede: 'Destro', stipendio: 10000 },
    { nome: 'Minio', cognome: 'Campanus', ruolo: 'DFC', eta: 21, nazionalita: 'Romana', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 14000 },
    { nome: 'Herakleitos', cognome: 'Dikaios', ruolo: 'CC', eta: 20, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 82, piede: 'Destro', stipendio: 12000 },
    { nome: 'Capys', cognome: 'Silvius', ruolo: 'ATT', eta: 19, nazionalita: 'Romana', valoreGenerale: 72, potenziale: 84, piede: 'Destro', stipendio: 11000 },
    { nome: 'Anxur', cognome: 'Volscus', ruolo: 'MED', eta: 29, nazionalita: 'Romana', valoreGenerale: 75, potenziale: 75, piede: 'Destro', stipendio: 16000 }
  ],
  club_mediolanum: [
    { nome: 'Insuber', cognome: 'Bellovesus', ruolo: 'POR', eta: 27, nazionalita: 'Gallica', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 26000 },
    { nome: 'Titus', cognome: 'Manlius', ruolo: 'TD', eta: 25, nazionalita: 'Romana', valoreGenerale: 78, potenziale: 82, piede: 'Destro', stipendio: 20000 },
    { nome: 'Segovax', cognome: 'Ticinus', ruolo: 'DFC', eta: 28, nazionalita: 'Gallica', valoreGenerale: 83, potenziale: 84, piede: 'Destro', stipendio: 29000 },
    { nome: 'Marcus', cognome: 'Curius', ruolo: 'DFC', eta: 26, nazionalita: 'Romana', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 25000 },
    { nome: 'Addua', cognome: 'Athesis', ruolo: 'TS', eta: 23, nazionalita: 'Gallica', valoreGenerale: 77, potenziale: 82, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Publius', cognome: 'Vergilius', ruolo: 'MED', eta: 20, nazionalita: 'Romana', valoreGenerale: 80, potenziale: 89, piede: 'Destro', stipendio: 24000 },
    { nome: 'Celtillus', cognome: 'Insubre', ruolo: 'CC', eta: 25, nazionalita: 'Gallica', valoreGenerale: 82, potenziale: 85, piede: 'Ambidestro', stipendio: 28000 },
    { nome: 'Lucius', cognome: 'Staberius', ruolo: 'AD', eta: 24, nazionalita: 'Romana', valoreGenerale: 80, potenziale: 84, piede: 'Destro', stipendio: 22000 },
    { nome: 'Commius', cognome: 'Atrebas', ruolo: 'AS', eta: 26, nazionalita: 'Gallica', valoreGenerale: 81, potenziale: 83, piede: 'Sinistro', stipendio: 25000 },
    { nome: 'Brixia', cognome: 'Ferox', soprannome: 'Il Cinghiale', ruolo: 'ATT', eta: 28, nazionalita: 'Gallica', valoreGenerale: 84, potenziale: 85, piede: 'Destro', stipendio: 34000 },
    { nome: 'Aulus', cognome: 'Plautius', ruolo: 'ATT', eta: 22, nazionalita: 'Romana', valoreGenerale: 78, potenziale: 85, piede: 'Destro', stipendio: 20000 },
    { nome: 'Boduo', cognome: 'Cis Alpinus', ruolo: 'POR', eta: 22, nazionalita: 'Gallica', valoreGenerale: 70, potenziale: 77, piede: 'Destro', stipendio: 9000 },
    { nome: 'Casticus', cognome: 'Sequanus', ruolo: 'DFC', eta: 21, nazionalita: 'Gallica', valoreGenerale: 73, potenziale: 80, piede: 'Destro', stipendio: 12000 },
    { nome: 'Gaius', cognome: 'Memmius', ruolo: 'CC', eta: 23, nazionalita: 'Romana', valoreGenerale: 75, potenziale: 81, piede: 'Destro', stipendio: 15000 },
    { nome: 'Dumnacus', cognome: 'Andecavus', ruolo: 'ATT', eta: 20, nazionalita: 'Gallica', valoreGenerale: 73, potenziale: 82, piede: 'Destro', stipendio: 13000 }
  ],
  club_capua: [
    { nome: 'Oenomaus', cognome: 'Gladius', soprannome: 'Il Gladiatore', ruolo: 'POR', eta: 29, nazionalita: 'Gallica', valoreGenerale: 80, potenziale: 81, piede: 'Destro', stipendio: 22000 },
    { nome: 'Gannicus', cognome: 'Il Celte', ruolo: 'DFC', eta: 28, nazionalita: 'Gallica', valoreGenerale: 85, potenziale: 86, piede: 'Destro', stipendio: 34000 },
    { nome: 'Batiatus', cognome: 'Secundus', ruolo: 'DFC', eta: 25, nazionalita: 'Romana', valoreGenerale: 78, potenziale: 81, piede: 'Destro', stipendio: 18000 },
    { nome: 'Castus', cognome: 'Lanista', ruolo: 'DFC', eta: 27, nazionalita: 'Romana', valoreGenerale: 80, potenziale: 81, piede: 'Sinistro', stipendio: 22000 },
    { nome: 'Barca', cognome: 'Numida', ruolo: 'TD', eta: 24, nazionalita: 'Numida', valoreGenerale: 79, potenziale: 83, piede: 'Destro', stipendio: 20000 },
    { nome: 'Agron', cognome: 'Il Germanico', ruolo: 'TS', eta: 26, nazionalita: 'Germanica', valoreGenerale: 80, potenziale: 82, piede: 'Sinistro', stipendio: 23000 },
    { nome: 'Varro', cognome: 'Campanus', ruolo: 'MED', eta: 23, nazionalita: 'Romana', valoreGenerale: 77, potenziale: 83, piede: 'Destro', stipendio: 17000 },
    { nome: 'Acro', cognome: 'Sabinus', ruolo: 'CC', eta: 25, nazionalita: 'Romana', valoreGenerale: 78, potenziale: 81, piede: 'Destro', stipendio: 19000 },
    { nome: 'Nasir', cognome: 'Syrius', ruolo: 'CC', eta: 22, nazionalita: 'Siriana', valoreGenerale: 78, potenziale: 85, piede: 'Ambidestro', stipendio: 19000 },
    { nome: 'Theokoles', cognome: 'L’Ombra', soprannome: 'Ombra della Morte', ruolo: 'ATT', eta: 31, nazionalita: 'Greca', valoreGenerale: 86, potenziale: 86, piede: 'Destro', stipendio: 38000 },
    { nome: 'Segovax', cognome: 'Velox', ruolo: 'ATT', eta: 21, nazionalita: 'Gallica', valoreGenerale: 77, potenziale: 86, piede: 'Destro', stipendio: 18000 },
    { nome: 'Pietros', cognome: 'Hoplomaco', ruolo: 'POR', eta: 22, nazionalita: 'Greca', valoreGenerale: 71, potenziale: 76, piede: 'Destro', stipendio: 9000 },
    { nome: 'Duro', cognome: 'Campano', ruolo: 'DFC', eta: 20, nazionalita: 'Romana', valoreGenerale: 72, potenziale: 80, piede: 'Destro', stipendio: 11000 },
    { nome: 'Kassandros', cognome: 'Sparthos', ruolo: 'ATT', eta: 19, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 84, piede: 'Destro', stipendio: 12000 }
  ],
  club_ravenna: [
    { nome: 'Navarchus', cognome: 'Gaius', ruolo: 'POR', eta: 26, nazionalita: 'Romana', valoreGenerale: 77, potenziale: 80, piede: 'Destro', stipendio: 16000 },
    { nome: 'Rostra', cognome: 'Classicus', ruolo: 'DFC', eta: 28, nazionalita: 'Romana', valoreGenerale: 78, potenziale: 79, piede: 'Destro', stipendio: 18000 },
    { nome: 'Triton', cognome: 'Hadriaticus', ruolo: 'DFC', eta: 24, nazionalita: 'Romana', valoreGenerale: 76, potenziale: 81, piede: 'Destro', stipendio: 15000 },
    { nome: 'Triremis', cognome: 'Velox', ruolo: 'TD', eta: 22, nazionalita: 'Romana', valoreGenerale: 75, potenziale: 82, piede: 'Destro', stipendio: 14000 },
    { nome: 'Portunus', cognome: 'Nauta', ruolo: 'TS', eta: 25, nazionalita: 'Romana', valoreGenerale: 76, potenziale: 79, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Boreas', cognome: 'Padanus', ruolo: 'MED', eta: 27, nazionalita: 'Romana', valoreGenerale: 77, potenziale: 78, piede: 'Destro', stipendio: 17000 },
    { nome: 'Liburna', cognome: 'Celer', ruolo: 'CC', eta: 23, nazionalita: 'Romana', valoreGenerale: 76, potenziale: 82, piede: 'Ambidestro', stipendio: 16000 },
    { nome: 'Actium', cognome: 'Spes', ruolo: 'AD', eta: 21, nazionalita: 'Romana', valoreGenerale: 75, potenziale: 83, piede: 'Destro', stipendio: 14000 },
    { nome: 'Ancona', cognome: 'Picenus', ruolo: 'AS', eta: 24, nazionalita: 'Romana', valoreGenerale: 76, potenziale: 80, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Classiarius', cognome: 'Primus', ruolo: 'ATT', eta: 26, nazionalita: 'Romana', valoreGenerale: 79, potenziale: 81, piede: 'Destro', stipendio: 21000 },
    { nome: 'Spina', cognome: 'Venetus', ruolo: 'ATT', eta: 20, nazionalita: 'Romana', valoreGenerale: 74, potenziale: 84, piede: 'Destro', stipendio: 13000 },
    { nome: 'Pharos', cognome: 'Hadria', ruolo: 'POR', eta: 19, nazionalita: 'Romana', valoreGenerale: 69, potenziale: 77, piede: 'Destro', stipendio: 8000 },
    { nome: 'Ariminum', cognome: 'Fidus', ruolo: 'DFC', eta: 22, nazionalita: 'Romana', valoreGenerale: 73, potenziale: 79, piede: 'Destro', stipendio: 11000 },
    { nome: 'Galeas', cognome: 'Remus', ruolo: 'CC', eta: 21, nazionalita: 'Romana', valoreGenerale: 72, potenziale: 79, piede: 'Destro', stipendio: 10000 }
  ],
  club_syracuse: [
    { nome: 'Archimede', cognome: 'Junior', soprannome: 'Il Geometra', ruolo: 'POR', eta: 27, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 82, piede: 'Destro', stipendio: 22000 },
    { nome: 'Dione', cognome: 'Aretuseo', ruolo: 'TD', eta: 24, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 82, piede: 'Destro', stipendio: 16000 },
    { nome: 'Gelone', cognome: 'Tirannus', ruolo: 'DFC', eta: 29, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 82, piede: 'Destro', stipendio: 24000 },
    { nome: 'Ierone', cognome: 'Siculus', ruolo: 'DFC', eta: 26, nazionalita: 'Greca', valoreGenerale: 79, potenziale: 82, piede: 'Destro', stipendio: 20000 },
    { nome: 'Trinacrios', cognome: 'Etna', ruolo: 'TS', eta: 23, nazionalita: 'Greca', valoreGenerale: 76, potenziale: 81, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Epaminonda', cognome: 'Dionisio', ruolo: 'MED', eta: 25, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 84, piede: 'Destro', stipendio: 22000 },
    { nome: 'Empedocle', cognome: 'Agrigentino', ruolo: 'CC', eta: 24, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 86, piede: 'Ambidestro', stipendio: 24000 },
    { nome: 'Gorgia', cognome: 'Leontino', ruolo: 'TRQ', eta: 22, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 88, piede: 'Sinistro', stipendio: 26000 },
    { nome: 'Ortigia', cognome: 'Celer', ruolo: 'AD', eta: 21, nazionalita: 'Greca', valoreGenerale: 78, potenziale: 85, piede: 'Destro', stipendio: 18000 },
    { nome: 'Teocrito', cognome: 'Bucolicus', ruolo: 'ATT', eta: 26, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 84, piede: 'Destro', stipendio: 28000 },
    { nome: 'Hybla', cognome: 'Melito', ruolo: 'AS', eta: 23, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 83, piede: 'Sinistro', stipendio: 17000 },
    { nome: 'Stesicoro', cognome: 'Vates', ruolo: 'POR', eta: 20, nazionalita: 'Greca', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 9000 },
    { nome: 'Eloro', cognome: 'Flumen', ruolo: 'DFC', eta: 21, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 80, piede: 'Destro', stipendio: 12000 },
    { nome: 'Acragas', cognome: 'Nobilis', ruolo: 'ATT', eta: 19, nazionalita: 'Greca', valoreGenerale: 74, potenziale: 85, piede: 'Destro', stipendio: 13000 }
  ],

  // --- LEGA CELTICA ---
  club_lutetia: [
    { nome: 'Vercingetorix', cognome: 'Avernus', soprannome: 'Il Condottiero', ruolo: 'ATT', eta: 25, nazionalita: 'Gallica', valoreGenerale: 88, potenziale: 92, piede: 'Destro', stipendio: 45000 },
    { nome: 'Sequano', cognome: 'Flumen', ruolo: 'POR', eta: 27, nazionalita: 'Gallica', valoreGenerale: 78, potenziale: 80, piede: 'Destro', stipendio: 18000 },
    { nome: 'Camulogeno', cognome: 'Il Vecchio', ruolo: 'DFC', eta: 30, nazionalita: 'Gallica', valoreGenerale: 82, potenziale: 82, piede: 'Destro', stipendio: 25000 },
    { nome: 'Gobannitio', cognome: 'Ferrum', ruolo: 'DFC', eta: 24, nazionalita: 'Gallica', valoreGenerale: 79, potenziale: 83, piede: 'Destro', stipendio: 19000 },
    { nome: 'Critognatus', cognome: 'Feroce', ruolo: 'TD', eta: 23, nazionalita: 'Gallica', valoreGenerale: 77, potenziale: 82, piede: 'Destro', stipendio: 16000 },
    { nome: 'Eporedorix', cognome: 'Equester', ruolo: 'TS', eta: 25, nazionalita: 'Gallica', valoreGenerale: 78, potenziale: 81, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Litaviccus', cognome: 'Aeduus', ruolo: 'MED', eta: 22, nazionalita: 'Gallica', valoreGenerale: 80, potenziale: 86, piede: 'Destro', stipendio: 22000 },
    { nome: 'Convictolitavis', cognome: 'Magistrato', ruolo: 'CC', eta: 26, nazionalita: 'Gallica', valoreGenerale: 81, potenziale: 83, piede: 'Ambidestro', stipendio: 24000 },
    { nome: 'Surus', cognome: 'Elephans', ruolo: 'AD', eta: 24, nazionalita: 'Gallica', valoreGenerale: 80, potenziale: 84, piede: 'Destro', stipendio: 22000 },
    { nome: 'Lucterius', cognome: 'Cadurcus', ruolo: 'AS', eta: 23, nazionalita: 'Gallica', valoreGenerale: 79, potenziale: 85, piede: 'Sinistro', stipendio: 20000 },
    { nome: 'Cotus', cognome: 'Aeduus', ruolo: 'ATT', eta: 21, nazionalita: 'Gallica', valoreGenerale: 76, potenziale: 84, piede: 'Destro', stipendio: 16000 },
    { nome: 'Caturix', cognome: 'Custos', ruolo: 'POR', eta: 20, nazionalita: 'Gallica', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 9000 },
    { nome: 'Sedullus', cognome: 'Lemovix', ruolo: 'DFC', eta: 21, nazionalita: 'Gallica', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 12000 },
    { nome: 'Viridomarus', cognome: 'Gallo', ruolo: 'CC', eta: 22, nazionalita: 'Gallica', valoreGenerale: 75, potenziale: 82, piede: 'Destro', stipendio: 14000 }
  ],
  club_lugdunum: [
    { nome: 'Allobrox', cognome: 'Fortis', ruolo: 'POR', eta: 28, nazionalita: 'Gallica', valoreGenerale: 80, potenziale: 81, piede: 'Destro', stipendio: 22000 },
    { nome: 'Dumnorix', cognome: 'Rex', ruolo: 'DFC', eta: 29, nazionalita: 'Gallica', valoreGenerale: 84, potenziale: 84, piede: 'Destro', stipendio: 30000 },
    { nome: 'Rhone', cognome: 'Rapidus', ruolo: 'DFC', eta: 25, nazionalita: 'Gallica', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 21000 },
    { nome: 'Lugus', cognome: 'Deus', ruolo: 'TD', eta: 24, nazionalita: 'Gallica', valoreGenerale: 78, potenziale: 83, piede: 'Destro', stipendio: 18000 },
    { nome: 'Arar', cognome: 'Riparius', ruolo: 'TS', eta: 23, nazionalita: 'Gallica', valoreGenerale: 77, potenziale: 82, piede: 'Sinistro', stipendio: 17000 },
    { nome: 'Teutatix', cognome: 'Sacro', ruolo: 'MED', eta: 27, nazionalita: 'Gallica', valoreGenerale: 81, potenziale: 82, piede: 'Destro', stipendio: 24000 },
    { nome: 'Taranis', cognome: 'Tonans', soprannome: 'Il Fulmine', ruolo: 'CC', eta: 24, nazionalita: 'Gallica', valoreGenerale: 83, potenziale: 87, piede: 'Ambidestro', stipendio: 28000 },
    { nome: 'Belenos', cognome: 'Sol', ruolo: 'TRQ', eta: 22, nazionalita: 'Gallica', valoreGenerale: 82, potenziale: 88, piede: 'Sinistro', stipendio: 26000 },
    { nome: 'Cernunnos', cognome: 'Cornutus', ruolo: 'AD', eta: 26, nazionalita: 'Gallica', valoreGenerale: 80, potenziale: 82, piede: 'Destro', stipendio: 22000 },
    { nome: 'Ambiorix', cognome: 'Eburon', soprannome: 'La Freccia', ruolo: 'ATT', eta: 27, nazionalita: 'Gallica', valoreGenerale: 86, potenziale: 87, piede: 'Destro', stipendio: 38000 },
    { nome: 'Catuvolcus', cognome: 'Rex', ruolo: 'ATT', eta: 21, nazionalita: 'Gallica', valoreGenerale: 76, potenziale: 84, piede: 'Destro', stipendio: 15000 },
    { nome: 'Isara', cognome: 'Custos', ruolo: 'POR', eta: 20, nazionalita: 'Gallica', valoreGenerale: 71, potenziale: 79, piede: 'Destro', stipendio: 9000 },
    { nome: 'Correus', cognome: 'Bellovacus', ruolo: 'DFC', eta: 22, nazionalita: 'Gallica', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 13000 },
    { nome: 'Teutomatus', cognome: 'Nitiobrox', ruolo: 'CC', eta: 23, nazionalita: 'Gallica', valoreGenerale: 75, potenziale: 81, piede: 'Destro', stipendio: 14000 }
  ],
  club_londinium: [
    { nome: 'Cunedag', cognome: 'Britannus', ruolo: 'POR', eta: 27, nazionalita: 'Britanna', valoreGenerale: 77, potenziale: 79, piede: 'Destro', stipendio: 16000 },
    { nome: 'Cassivellauno', cognome: 'Commius', ruolo: 'DFC', eta: 28, nazionalita: 'Britanna', valoreGenerale: 82, potenziale: 83, piede: 'Destro', stipendio: 25000 },
    { nome: 'Mandubracius', cognome: 'Trinovans', ruolo: 'DFC', eta: 24, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 83, piede: 'Destro', stipendio: 19000 },
    { nome: 'Tamesis', cognome: 'Vadum', ruolo: 'DFC', eta: 25, nazionalita: 'Britanna', valoreGenerale: 77, potenziale: 80, piede: 'Sinistro', stipendio: 16000 },
    { nome: 'Cantius', cognome: 'Ora', ruolo: 'TD', eta: 22, nazionalita: 'Britanna', valoreGenerale: 75, potenziale: 81, piede: 'Destro', stipendio: 14000 },
    { nome: 'Cenimagno', cognome: 'Silvester', ruolo: 'TS', eta: 23, nazionalita: 'Britanna', valoreGenerale: 76, potenziale: 81, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Segontiaci', cognome: 'Loricatus', ruolo: 'MED', eta: 26, nazionalita: 'Britanna', valoreGenerale: 78, potenziale: 80, piede: 'Destro', stipendio: 18000 },
    { nome: 'Ancalites', cognome: 'Sylvan', ruolo: 'CC', eta: 24, nazionalita: 'Britanna', valoreGenerale: 78, potenziale: 83, piede: 'Destro', stipendio: 18000 },
    { nome: 'Bibroci', cognome: 'Vigor', ruolo: 'TRQ', eta: 22, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 86, piede: 'Ambidestro', stipendio: 20000 },
    { nome: 'Togodumnus', cognome: 'Catuvellauno', ruolo: 'ATT', eta: 24, nazionalita: 'Britanna', valoreGenerale: 81, potenziale: 86, piede: 'Destro', stipendio: 25000 },
    { nome: 'Carataco', cognome: 'Il Giovane', soprannome: 'L’Indomito', ruolo: 'ATT', eta: 19, nazionalita: 'Britanna', valoreGenerale: 80, potenziale: 91, piede: 'Destro', stipendio: 22000 },
    { nome: 'Albion', cognome: 'Nebula', ruolo: 'POR', eta: 20, nazionalita: 'Britanna', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 8000 },
    { nome: 'Venta', cognome: 'Belga', ruolo: 'DFC', eta: 21, nazionalita: 'Britanna', valoreGenerale: 73, potenziale: 80, piede: 'Destro', stipendio: 11000 },
    { nome: 'Calleva', cognome: 'Atrebas', ruolo: 'CC', eta: 22, nazionalita: 'Britanna', valoreGenerale: 74, potenziale: 80, piede: 'Destro', stipendio: 12000 }
  ],
  club_carnutes: [
    { nome: 'Diviciacus', cognome: 'Il Druido', ruolo: 'POR', eta: 32, nazionalita: 'Gallica', valoreGenerale: 79, potenziale: 79, piede: 'Destro', stipendio: 20000 },
    { nome: 'Gutruatus', cognome: 'Sacerdos', ruolo: 'DFC', eta: 27, nazionalita: 'Gallica', valoreGenerale: 81, potenziale: 82, piede: 'Destro', stipendio: 23000 },
    { nome: 'Cotvatus', cognome: 'Carnutus', ruolo: 'DFC', eta: 25, nazionalita: 'Gallica', valoreGenerale: 78, potenziale: 81, piede: 'Destro', stipendio: 18000 },
    { nome: 'Genabum', cognome: 'Pons', ruolo: 'TD', eta: 23, nazionalita: 'Gallica', valoreGenerale: 76, potenziale: 81, piede: 'Destro', stipendio: 15000 },
    { nome: 'Liger', cognome: 'Flumen', ruolo: 'TS', eta: 24, nazionalita: 'Gallica', valoreGenerale: 76, potenziale: 80, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Autricum', cognome: 'Maurus', ruolo: 'MED', eta: 26, nazionalita: 'Gallica', valoreGenerale: 79, potenziale: 80, piede: 'Destro', stipendio: 19000 },
    { nome: 'Druis', cognome: 'Sapientia', ruolo: 'CC', eta: 28, nazionalita: 'Gallica', valoreGenerale: 80, potenziale: 81, piede: 'Ambidestro', stipendio: 22000 },
    { nome: 'Viscum', cognome: 'Aureum', ruolo: 'AD', eta: 21, nazionalita: 'Gallica', valoreGenerale: 77, potenziale: 85, piede: 'Destro', stipendio: 16000 },
    { nome: 'Quercus', cognome: 'Robur', ruolo: 'AS', eta: 23, nazionalita: 'Gallica', valoreGenerale: 77, potenziale: 82, piede: 'Sinistro', stipendio: 16000 },
    { nome: 'Conconnetodumnus', cognome: 'Caput', ruolo: 'ATT', eta: 26, nazionalita: 'Gallica', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 25000 },
    { nome: 'Celtus', cognome: 'Silva', ruolo: 'ATT', eta: 20, nazionalita: 'Gallica', valoreGenerale: 74, potenziale: 83, piede: 'Destro', stipendio: 12000 },
    { nome: 'Nemeton', cognome: 'Umbra', ruolo: 'POR', eta: 20, nazionalita: 'Gallica', valoreGenerale: 69, potenziale: 77, piede: 'Destro', stipendio: 8000 },
    { nome: 'Aulerce', cognome: 'Diablintes', ruolo: 'DFC', eta: 22, nazionalita: 'Gallica', valoreGenerale: 73, potenziale: 79, piede: 'Destro', stipendio: 11000 },
    { nome: 'Cenomano', cognome: 'Celer', ruolo: 'ATT', eta: 21, nazionalita: 'Gallica', valoreGenerale: 73, potenziale: 81, piede: 'Destro', stipendio: 12000 }
  ],
  club_massilia: [
    { nome: 'Pytheas', cognome: 'Phocaeus', ruolo: 'POR', eta: 27, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Euthymenes', cognome: 'Nauta', ruolo: 'DFC', eta: 28, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 83, piede: 'Destro', stipendio: 26000 },
    { nome: 'Aristoteles', cognome: 'Massiliensis', ruolo: 'DFC', eta: 25, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 84, piede: 'Destro', stipendio: 22000 },
    { nome: 'Lacydon', cognome: 'Portus', ruolo: 'TD', eta: 23, nazionalita: 'Greca', valoreGenerale: 78, potenziale: 83, piede: 'Destro', stipendio: 18000 },
    { nome: 'Rhodanus', cognome: 'Massa', ruolo: 'TS', eta: 24, nazionalita: 'Gallica', valoreGenerale: 78, potenziale: 82, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Prote', cognome: 'Sacerdos', ruolo: 'MED', eta: 26, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Gyptis', cognome: 'Princeps', ruolo: 'CC', eta: 22, nazionalita: 'Gallica', valoreGenerale: 82, potenziale: 89, piede: 'Ambidestro', stipendio: 26000 },
    { nome: 'Simos', cognome: 'Phocaea', ruolo: 'TRQ', eta: 25, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 86, piede: 'Destro', stipendio: 28000 },
    { nome: 'Nikaia', cognome: 'Celer', ruolo: 'AD', eta: 21, nazionalita: 'Greca', valoreGenerale: 79, potenziale: 86, piede: 'Destro', stipendio: 20000 },
    { nome: 'Antipolis', cognome: 'Sagitta', ruolo: 'ATT', eta: 26, nazionalita: 'Greca', valoreGenerale: 84, potenziale: 86, piede: 'Destro', stipendio: 32000 },
    { nome: 'Salyes', cognome: 'Furius', ruolo: 'AS', eta: 23, nazionalita: 'Gallica', valoreGenerale: 79, potenziale: 84, piede: 'Sinistro', stipendio: 20000 },
    { nome: 'Olbia', cognome: 'Insula', ruolo: 'POR', eta: 20, nazionalita: 'Greca', valoreGenerale: 71, potenziale: 79, piede: 'Destro', stipendio: 9000 },
    { nome: 'Taurois', cognome: 'Limen', ruolo: 'DFC', eta: 22, nazionalita: 'Greca', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 13000 },
    { nome: 'Athenopolis', cognome: 'Spes', ruolo: 'CC', eta: 20, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 82, piede: 'Destro', stipendio: 12000 }
  ],
  club_eburacum: [
    { nome: 'Venutius', cognome: 'Brigantis', ruolo: 'POR', eta: 28, nazionalita: 'Britanna', valoreGenerale: 76, potenziale: 78, piede: 'Destro', stipendio: 15000 },
    { nome: 'Cartimandua', cognome: 'Custos', ruolo: 'DFC', eta: 27, nazionalita: 'Britanna', valoreGenerale: 80, potenziale: 81, piede: 'Destro', stipendio: 22000 },
    { nome: 'Isurium', cognome: 'Saxum', ruolo: 'DFC', eta: 25, nazionalita: 'Britanna', valoreGenerale: 77, potenziale: 80, piede: 'Destro', stipendio: 17000 },
    { nome: 'Calcaria', cognome: 'Murus', ruolo: 'DFC', eta: 23, nazionalita: 'Britanna', valoreGenerale: 75, potenziale: 80, piede: 'Sinistro', stipendio: 14000 },
    { nome: 'Ouse', cognome: 'Fluvius', ruolo: 'TD', eta: 22, nazionalita: 'Britanna', valoreGenerale: 74, potenziale: 80, piede: 'Destro', stipendio: 13000 },
    { nome: 'Derventio', cognome: 'Riparius', ruolo: 'TS', eta: 24, nazionalita: 'Britanna', valoreGenerale: 75, potenziale: 79, piede: 'Sinistro', stipendio: 14000 },
    { nome: 'Brigantios', cognome: 'Torc', ruolo: 'MED', eta: 26, nazionalita: 'Britanna', valoreGenerale: 77, potenziale: 79, piede: 'Destro', stipendio: 17000 },
    { nome: 'Stanwick', cognome: 'Oppidum', ruolo: 'CC', eta: 25, nazionalita: 'Britanna', valoreGenerale: 76, potenziale: 80, piede: 'Ambidestro', stipendio: 16000 },
    { nome: 'Corieltavus', cognome: 'Silva', ruolo: 'CC', eta: 21, nazionalita: 'Britanna', valoreGenerale: 75, potenziale: 83, piede: 'Destro', stipendio: 14000 },
    { nome: 'Volisios', cognome: 'Dumnocoveros', ruolo: 'ATT', eta: 25, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 82, piede: 'Destro', stipendio: 21000 },
    { nome: 'Catuvelaunos', cognome: 'Ferox', ruolo: 'ATT', eta: 22, nazionalita: 'Britanna', valoreGenerale: 76, potenziale: 83, piede: 'Destro', stipendio: 15000 },
    { nome: 'Parixi', cognome: 'Borealis', ruolo: 'POR', eta: 19, nazionalita: 'Britanna', valoreGenerale: 68, potenziale: 76, piede: 'Destro', stipendio: 8000 },
    { nome: 'Vellocatus', cognome: 'Armiger', ruolo: 'DFC', eta: 21, nazionalita: 'Britanna', valoreGenerale: 72, potenziale: 79, piede: 'Destro', stipendio: 11000 },
    { nome: 'Eburac', cognome: 'Iuvenis', ruolo: 'ATT', eta: 18, nazionalita: 'Britanna', valoreGenerale: 71, potenziale: 82, piede: 'Destro', stipendio: 10000 }
  ],
  club_bri_camulodunum: [
    { nome: 'Cunobeline', cognome: 'Rex Trinovantum', soprannome: 'Il Signor di Camulodunum', ruolo: 'ATT', eta: 25, nazionalita: 'Britanna', valoreGenerale: 84, potenziale: 89, piede: 'Destro', stipendio: 32000 },
    { nome: 'Addedomarus', cognome: 'Trinovans', ruolo: 'POR', eta: 28, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 81, piede: 'Destro', stipendio: 20000 },
    { nome: 'Tasciovanus', cognome: 'Verulamius', ruolo: 'DFC', eta: 27, nazionalita: 'Britanna', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Adminius', cognome: 'Cantiacus', ruolo: 'TD', eta: 23, nazionalita: 'Britanna', valoreGenerale: 77, potenziale: 83, piede: 'Destro', stipendio: 17000 },
    { nome: 'Immanuentius', cognome: 'Custos', ruolo: 'DFC', eta: 26, nazionalita: 'Britanna', valoreGenerale: 78, potenziale: 80, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Colne', cognome: 'Riparius', ruolo: 'TS', eta: 24, nazionalita: 'Britanna', valoreGenerale: 76, potenziale: 81, piede: 'Sinistro', stipendio: 16000 },
    { nome: 'Camulos', cognome: 'Bellator', soprannome: 'Il Dio della Guerra', ruolo: 'MED', eta: 26, nazionalita: 'Britanna', valoreGenerale: 80, potenziale: 82, piede: 'Destro', stipendio: 22000 },
    { nome: 'Andate', cognome: 'Victrix', ruolo: 'CC', eta: 24, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 84, piede: 'Ambidestro', stipendio: 21000 },
    { nome: 'Dubnovellauno', cognome: 'Cantius', ruolo: 'TRQ', eta: 22, nazionalita: 'Britanna', valoreGenerale: 80, potenziale: 86, piede: 'Sinistro', stipendio: 22000 },
    { nome: 'Epaticcus', cognome: 'Sagitta', ruolo: 'AD', eta: 21, nazionalita: 'Britanna', valoreGenerale: 78, potenziale: 85, piede: 'Destro', stipendio: 18000 },
    { nome: 'Prasutagus', cognome: 'Icenus', ruolo: 'AS', eta: 23, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 85, piede: 'Sinistro', stipendio: 20000 }
  ],
  club_bri_verulamium: [
    { nome: 'Lugotorix', cognome: 'Cantii', ruolo: 'POR', eta: 27, nazionalita: 'Britanna', valoreGenerale: 77, potenziale: 79, piede: 'Destro', stipendio: 17000 },
    { nome: 'Taximagulus', cognome: 'Scutum', ruolo: 'DFC', eta: 29, nazionalita: 'Britanna', valoreGenerale: 80, potenziale: 80, piede: 'Destro', stipendio: 21000 },
    { nome: 'Segovax', cognome: 'Verulamii', ruolo: 'DFC', eta: 25, nazionalita: 'Britanna', valoreGenerale: 78, potenziale: 82, piede: 'Destro', stipendio: 18000 },
    { nome: 'Cingetorix', cognome: 'Britannus', ruolo: 'MED', eta: 26, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 81, piede: 'Destro', stipendio: 20000 },
    { nome: 'Verica', cognome: 'Atrebas', ruolo: 'CC', eta: 24, nazionalita: 'Britanna', valoreGenerale: 78, potenziale: 83, piede: 'Ambidestro', stipendio: 19000 },
    { nome: 'Tincomarus', cognome: 'Celer', ruolo: 'ATT', eta: 25, nazionalita: 'Britanna', valoreGenerale: 81, potenziale: 84, piede: 'Destro', stipendio: 24000 }
  ],
  club_bri_aquaesulis: [
    { nome: 'Sul', cognome: 'Minerva', ruolo: 'POR', eta: 26, nazionalita: 'Britanna', valoreGenerale: 76, potenziale: 79, piede: 'Destro', stipendio: 15000 },
    { nome: 'Bladud', cognome: 'Fontanus', ruolo: 'DFC', eta: 27, nazionalita: 'Britanna', valoreGenerale: 78, potenziale: 80, piede: 'Destro', stipendio: 18000 },
    { nome: 'Dobunnos', cognome: 'Corinius', ruolo: 'CC', eta: 24, nazionalita: 'Britanna', valoreGenerale: 77, potenziale: 83, piede: 'Ambidestro', stipendio: 17000 },
    { nome: 'Bodvoc', cognome: 'Aurum', ruolo: 'TRQ', eta: 22, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 86, piede: 'Sinistro', stipendio: 20000 },
    { nome: 'Dumnonos', cognome: 'Feroce', ruolo: 'ATT', eta: 25, nazionalita: 'Britanna', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 22000 }
  ],
  club_bri_monainsula: [
    { nome: 'Mona', cognome: 'Sacerdos', soprannome: 'Il Druido Bianco', ruolo: 'MED', eta: 28, nazionalita: 'Britanna', valoreGenerale: 80, potenziale: 81, piede: 'Ambidestro', stipendio: 21000 },
    { nome: 'Ordovix', cognome: 'Saxum', ruolo: 'DFC', eta: 26, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 81, piede: 'Destro', stipendio: 19000 },
    { nome: 'Siluros', cognome: 'Igneus', ruolo: 'ATT', eta: 23, nazionalita: 'Britanna', valoreGenerale: 81, potenziale: 87, piede: 'Destro', stipendio: 24000 },
    { nome: 'Calgacus', cognome: 'Borealis', soprannome: 'La Spada del Nord', ruolo: 'AD', eta: 21, nazionalita: 'Britanna', valoreGenerale: 79, potenziale: 88, piede: 'Destro', stipendio: 20000 }
  ],

  // --- LEGA ELLENICA ---
  club_sparta: [
    { nome: 'Leonidas', cognome: 'Herakleides', soprannome: 'Il Re Guerriero', ruolo: 'DFC', eta: 28, nazionalita: 'Greca', valoreGenerale: 89, potenziale: 90, piede: 'Destro', stipendio: 50000 },
    { nome: 'Brasidas', cognome: 'Eurotas', ruolo: 'POR', eta: 29, nazionalita: 'Greca', valoreGenerale: 85, potenziale: 86, piede: 'Destro', stipendio: 38000 },
    { nome: 'Pausanias', cognome: 'Spartiates', ruolo: 'DFC', eta: 26, nazionalita: 'Greca', valoreGenerale: 84, potenziale: 86, piede: 'Destro', stipendio: 36000 },
    { nome: 'Lysander', cognome: 'Nauarchos', ruolo: 'TD', eta: 24, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 87, piede: 'Destro', stipendio: 30000 },
    { nome: 'Agesilaos', cognome: 'Archidamos', ruolo: 'TS', eta: 25, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 85, piede: 'Sinistro', stipendio: 28000 },
    { nome: 'Chilon', cognome: 'Ephoros', ruolo: 'MED', eta: 27, nazionalita: 'Greca', valoreGenerale: 85, potenziale: 86, piede: 'Destro', stipendio: 38000 },
    { nome: 'Dienekes', cognome: 'Phalanx', ruolo: 'CC', eta: 25, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 86, piede: 'Destro', stipendio: 32000 },
    { nome: 'Alpheios', cognome: 'Maron', ruolo: 'CC', eta: 22, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 88, piede: 'Ambidestro', stipendio: 28000 },
    { nome: 'Kyros', cognome: 'Lakon', ruolo: 'TRQ', eta: 23, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 87, piede: 'Sinistro', stipendio: 30000 },
    { nome: 'Aristodemos', cognome: 'Tremas', soprannome: 'Il Redento', ruolo: 'ATT', eta: 26, nazionalita: 'Greca', valoreGenerale: 87, potenziale: 89, piede: 'Destro', stipendio: 46000 },
    { nome: 'Gorgo', cognome: 'Kyniska', ruolo: 'ATT', eta: 21, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 89, piede: 'Destro', stipendio: 30000 },
    { nome: 'Pleistoanax', cognome: 'Agis', ruolo: 'POR', eta: 20, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 81, piede: 'Destro', stipendio: 12000 },
    { nome: 'Eurybiades', cognome: 'Spartanos', ruolo: 'DFC', eta: 21, nazionalita: 'Greca', valoreGenerale: 76, potenziale: 83, piede: 'Destro', stipendio: 15000 },
    { nome: 'Teleklos', cognome: 'Iuvenis', ruolo: 'ATT', eta: 19, nazionalita: 'Greca', valoreGenerale: 74, potenziale: 85, piede: 'Destro', stipendio: 13000 }
  ],
  club_alexandria: [
    { nome: 'Ptolemaios', cognome: 'Soter', soprannome: 'Il Faro', ruolo: 'POR', eta: 28, nazionalita: 'Egizia', valoreGenerale: 87, potenziale: 89, piede: 'Destro', stipendio: 44000 },
    { nome: 'Sosigenes', cognome: 'Astronomo', ruolo: 'DFC', eta: 27, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 85, piede: 'Destro', stipendio: 34000 },
    { nome: 'Eratosthenes', cognome: 'Geometra', ruolo: 'DFC', eta: 26, nazionalita: 'Greca', valoreGenerale: 85, potenziale: 87, piede: 'Destro', stipendio: 38000 },
    { nome: 'Canopus', cognome: 'Nilus', ruolo: 'TD', eta: 24, nazionalita: 'Egizia', valoreGenerale: 82, potenziale: 87, piede: 'Destro', stipendio: 30000 },
    { nome: 'Rhakotis', cognome: 'Aegyptius', ruolo: 'TS', eta: 23, nazionalita: 'Egizia', valoreGenerale: 80, potenziale: 86, piede: 'Sinistro', stipendio: 26000 },
    { nome: 'Herophilos', cognome: 'Medicus', ruolo: 'MED', eta: 26, nazionalita: 'Greca', valoreGenerale: 84, potenziale: 86, piede: 'Destro', stipendio: 36000 },
    { nome: 'Apollonios', cognome: 'Rhodios', ruolo: 'CC', eta: 25, nazionalita: 'Greca', valoreGenerale: 85, potenziale: 88, piede: 'Ambidestro', stipendio: 40000 },
    { nome: 'Kallimachos', cognome: 'Cyrenaeus', ruolo: 'TRQ', eta: 24, nazionalita: 'Greca', valoreGenerale: 86, potenziale: 90, piede: 'Sinistro', stipendio: 42000 },
    { nome: 'Osiris', cognome: 'Khem', soprannome: 'Il Nilo d’Oro', ruolo: 'AD', eta: 22, nazionalita: 'Egizia', valoreGenerale: 84, potenziale: 91, piede: 'Destro', stipendio: 38000 },
    { nome: 'Anubis', cognome: 'Velox', ruolo: 'AS', eta: 23, nazionalita: 'Egizia', valoreGenerale: 83, potenziale: 89, piede: 'Sinistro', stipendio: 35000 },
    { nome: 'Khaemwaset', cognome: 'Pharaonicus', soprannome: 'La Sfinge', ruolo: 'ATT', eta: 27, nazionalita: 'Egizia', valoreGenerale: 89, potenziale: 91, piede: 'Destro', stipendio: 55000 },
    { nome: 'Ammon', cognome: 'Oasis', ruolo: 'POR', eta: 21, nazionalita: 'Egizia', valoreGenerale: 73, potenziale: 82, piede: 'Destro', stipendio: 13000 },
    { nome: 'Memphis', cognome: 'Apis', ruolo: 'DFC', eta: 22, nazionalita: 'Egizia', valoreGenerale: 76, potenziale: 83, piede: 'Destro', stipendio: 16000 },
    { nome: 'Theon', cognome: 'Junior', ruolo: 'ATT', eta: 19, nazionalita: 'Greca', valoreGenerale: 75, potenziale: 87, piede: 'Destro', stipendio: 15000 }
  ],
  club_athenae: [
    { nome: 'Plato', cognome: 'Akademos', soprannome: 'Il Filosofo', ruolo: 'POR', eta: 29, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 84, piede: 'Destro', stipendio: 32000 },
    { nome: 'Themistokles', cognome: 'Nauarchos', ruolo: 'DFC', eta: 27, nazionalita: 'Greca', valoreGenerale: 84, potenziale: 86, piede: 'Destro', stipendio: 35000 },
    { nome: 'Miltiades', cognome: 'Marathon', ruolo: 'DFC', eta: 28, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 84, piede: 'Destro', stipendio: 32000 },
    { nome: 'Kimon', cognome: 'Miltiadou', ruolo: 'TD', eta: 24, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 85, piede: 'Destro', stipendio: 25000 },
    { nome: 'Alkibiades', cognome: 'Nobilis', soprannome: 'L’Imprevedibile', ruolo: 'TS', eta: 22, nazionalita: 'Greca', valoreGenerale: 84, potenziale: 92, piede: 'Sinistro', stipendio: 36000 },
    { nome: 'Sokrates', cognome: 'Sophistes', ruolo: 'MED', eta: 31, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 82, piede: 'Destro', stipendio: 28000 },
    { nome: 'Aristoteles', cognome: 'Stagirites', ruolo: 'CC', eta: 26, nazionalita: 'Greca', valoreGenerale: 85, potenziale: 88, piede: 'Ambidestro', stipendio: 39000 },
    { nome: 'Demosthenes', cognome: 'Orator', ruolo: 'TRQ', eta: 25, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 87, piede: 'Destro', stipendio: 33000 },
    { nome: 'Pheidippides', cognome: 'Cursorius', ruolo: 'AD', eta: 23, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 87, piede: 'Destro', stipendio: 28000 },
    { nome: 'Theseus', cognome: 'Minotauros', soprannome: 'L’Eroe', ruolo: 'ATT', eta: 26, nazionalita: 'Greca', valoreGenerale: 86, potenziale: 88, piede: 'Destro', stipendio: 42000 },
    { nome: 'Aischylos', cognome: 'Tragicus', ruolo: 'AS', eta: 24, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 85, piede: 'Sinistro', stipendio: 25000 },
    { nome: 'Kritias', cognome: 'Archon', ruolo: 'POR', eta: 20, nazionalita: 'Greca', valoreGenerale: 71, potenziale: 79, piede: 'Destro', stipendio: 10000 },
    { nome: 'Thucydides', cognome: 'Historicus', ruolo: 'DFC', eta: 21, nazionalita: 'Greca', valoreGenerale: 75, potenziale: 82, piede: 'Destro', stipendio: 14000 },
    { nome: 'Epikouros', cognome: 'Hedone', ruolo: 'ATT', eta: 19, nazionalita: 'Greca', valoreGenerale: 74, potenziale: 86, piede: 'Destro', stipendio: 13000 }
  ],
  club_thebae: [
    { nome: 'Epaminondas', cognome: 'Strategos', soprannome: 'Il Grande Tebano', ruolo: 'DFC', eta: 28, nazionalita: 'Greca', valoreGenerale: 85, potenziale: 86, piede: 'Destro', stipendio: 35000 },
    { nome: 'Pelopidas', cognome: 'Sacros', ruolo: 'POR', eta: 27, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 82, piede: 'Destro', stipendio: 22000 },
    { nome: 'Gorgidas', cognome: 'Taxiarches', ruolo: 'DFC', eta: 26, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Ismenias', cognome: 'Boeotus', ruolo: 'DFC', eta: 24, nazionalita: 'Greca', valoreGenerale: 78, potenziale: 82, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Kadmilos', cognome: 'Kadmeus', ruolo: 'TD', eta: 22, nazionalita: 'Greca', valoreGenerale: 76, potenziale: 82, piede: 'Destro', stipendio: 15000 },
    { nome: 'Dirke', cognome: 'Fons', ruolo: 'TS', eta: 23, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 82, piede: 'Sinistro', stipendio: 16000 },
    { nome: 'Pindaros', cognome: 'Lyricus', ruolo: 'MED', eta: 25, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 21000 },
    { nome: 'Melissos', cognome: 'Thebanus', ruolo: 'CC', eta: 24, nazionalita: 'Greca', valoreGenerale: 79, potenziale: 84, piede: 'Ambidestro', stipendio: 20000 },
    { nome: 'Koroibos', cognome: 'Victor', ruolo: 'CC', eta: 22, nazionalita: 'Greca', valoreGenerale: 78, potenziale: 84, piede: 'Destro', stipendio: 18000 },
    { nome: 'Herakles', cognome: 'Thebaicus', soprannome: 'Il Semidio', ruolo: 'ATT', eta: 27, nazionalita: 'Greca', valoreGenerale: 87, potenziale: 88, piede: 'Destro', stipendio: 44000 },
    { nome: 'Amphion', cognome: 'Zethos', ruolo: 'ATT', eta: 21, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 85, piede: 'Sinistro', stipendio: 17000 },
    { nome: 'Kithairon', cognome: 'Mons', ruolo: 'POR', eta: 20, nazionalita: 'Greca', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 9000 },
    { nome: 'Leuctra', cognome: 'Trophaios', ruolo: 'DFC', eta: 21, nazionalita: 'Greca', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 13000 },
    { nome: 'Oedipos', cognome: 'Rex', ruolo: 'ATT', eta: 20, nazionalita: 'Greca', valoreGenerale: 74, potenziale: 83, piede: 'Destro', stipendio: 13000 }
  ],
  club_corinthus: [
    { nome: 'Bellerophontes', cognome: 'Pegasos', ruolo: 'POR', eta: 27, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Kypselos', cognome: 'Tyrannus', ruolo: 'DFC', eta: 28, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 83, piede: 'Destro', stipendio: 26000 },
    { nome: 'Periandros', cognome: 'Sapiens', ruolo: 'DFC', eta: 26, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Diolkos', cognome: 'Isthmicus', ruolo: 'TD', eta: 23, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 83, piede: 'Destro', stipendio: 17000 },
    { nome: 'Lechaion', cognome: 'Portus', ruolo: 'TS', eta: 24, nazionalita: 'Greca', valoreGenerale: 78, potenziale: 82, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Kenchreai', cognome: 'Nauta', ruolo: 'MED', eta: 25, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 82, piede: 'Destro', stipendio: 21000 },
    { nome: 'Akrokorinthos', cognome: 'Arx', ruolo: 'CC', eta: 24, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 85, piede: 'Ambidestro', stipendio: 23000 },
    { nome: 'Sisyphos', cognome: 'Petros', ruolo: 'CC', eta: 26, nazionalita: 'Greca', valoreGenerale: 79, potenziale: 81, piede: 'Destro', stipendio: 20000 },
    { nome: 'Arion', cognome: 'Kitharodos', ruolo: 'TRQ', eta: 22, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 88, piede: 'Destro', stipendio: 26000 },
    { nome: 'Glaukos', cognome: 'Potnieus', ruolo: 'ATT', eta: 25, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 85, piede: 'Destro', stipendio: 29000 },
    { nome: 'Medea', cognome: 'Jolcos', ruolo: 'ATT', eta: 21, nazionalita: 'Greca', valoreGenerale: 78, potenziale: 85, piede: 'Sinistro', stipendio: 19000 },
    { nome: 'Peirene', cognome: 'Fons', ruolo: 'POR', eta: 20, nazionalita: 'Greca', valoreGenerale: 71, potenziale: 79, piede: 'Destro', stipendio: 9000 },
    { nome: 'Poseidon', cognome: 'Isthmia', ruolo: 'DFC', eta: 21, nazionalita: 'Greca', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 12000 },
    { nome: 'Melikertes', cognome: 'Palaemon', ruolo: 'ATT', eta: 19, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 84, piede: 'Destro', stipendio: 12000 }
  ],
  club_rhodes: [
    { nome: 'Chares', cognome: 'Lindios', ruolo: 'POR', eta: 28, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 81, piede: 'Destro', stipendio: 22000 },
    { nome: 'Diagoras', cognome: 'Pugil', soprannome: 'Il Colosso', ruolo: 'DFC', eta: 27, nazionalita: 'Greca', valoreGenerale: 83, potenziale: 84, piede: 'Destro', stipendio: 27000 },
    { nome: 'Dorieus', cognome: 'Olympionikes', ruolo: 'DFC', eta: 25, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 21000 },
    { nome: 'Kameiros', cognome: 'Doris', ruolo: 'TD', eta: 23, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 82, piede: 'Destro', stipendio: 16000 },
    { nome: 'Ialysos', cognome: 'Zeus', ruolo: 'TS', eta: 24, nazionalita: 'Greca', valoreGenerale: 77, potenziale: 81, piede: 'Sinistro', stipendio: 16000 },
    { nome: 'Helios', cognome: 'Rhodos', ruolo: 'MED', eta: 26, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 82, piede: 'Destro', stipendio: 22000 },
    { nome: 'Panaitios', cognome: 'Stoicus', ruolo: 'CC', eta: 25, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 84, piede: 'Ambidestro', stipendio: 22000 },
    { nome: 'Poseidonios', cognome: 'Apameus', ruolo: 'CC', eta: 22, nazionalita: 'Greca', valoreGenerale: 81, potenziale: 87, piede: 'Destro', stipendio: 24000 },
    { nome: 'Lindos', cognome: 'Athena', ruolo: 'TRQ', eta: 23, nazionalita: 'Greca', valoreGenerale: 80, potenziale: 85, piede: 'Sinistro', stipendio: 22000 },
    { nome: 'Akousilaos', cognome: 'Victor', ruolo: 'ATT', eta: 26, nazionalita: 'Greca', valoreGenerale: 82, potenziale: 84, piede: 'Destro', stipendio: 27000 },
    { nome: 'Damagetos', cognome: 'Rhodios', ruolo: 'ATT', eta: 21, nazionalita: 'Greca', valoreGenerale: 76, potenziale: 84, piede: 'Destro', stipendio: 16000 },
    { nome: 'Atabyrios', cognome: 'Mons', ruolo: 'POR', eta: 19, nazionalita: 'Greca', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 9000 },
    { nome: 'Triremis', cognome: 'Rhodiaca', ruolo: 'DFC', eta: 22, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 80, piede: 'Destro', stipendio: 12000 },
    { nome: 'Kallipateira', cognome: 'Mater', ruolo: 'ATT', eta: 20, nazionalita: 'Greca', valoreGenerale: 73, potenziale: 83, piede: 'Destro', stipendio: 12000 }
  ],

  // --- LEGA PUNICO-IBERICA ---
  club_carthago: [
    { nome: 'Hamilcar', cognome: 'Barca Minor', soprannome: 'Il Fulmine Punico', ruolo: 'ATT', eta: 26, nazionalita: 'Punica', valoreGenerale: 89, potenziale: 92, piede: 'Destro', stipendio: 52000 },
    { nome: 'Maharbal', cognome: 'Numida', soprannome: 'Il Cavaliere', ruolo: 'AD', eta: 25, nazionalita: 'Numida', valoreGenerale: 86, potenziale: 88, piede: 'Destro', stipendio: 42000 },
    { nome: 'Hasdrubal', cognome: 'Gisco', ruolo: 'POR', eta: 29, nazionalita: 'Punica', valoreGenerale: 84, potenziale: 85, piede: 'Destro', stipendio: 36000 },
    { nome: 'Mago', cognome: 'Barca', ruolo: 'DFC', eta: 27, nazionalita: 'Punica', valoreGenerale: 85, potenziale: 87, piede: 'Destro', stipendio: 40000 },
    { nome: 'Hanno', cognome: 'Il Grande', ruolo: 'DFC', eta: 31, nazionalita: 'Punica', valoreGenerale: 82, potenziale: 82, piede: 'Destro', stipendio: 30000 },
    { nome: 'Baal', cognome: 'Hamon', ruolo: 'DFC', eta: 24, nazionalita: 'Punica', valoreGenerale: 81, potenziale: 85, piede: 'Sinistro', stipendio: 28000 },
    { nome: 'Bostar', cognome: 'Poenus', ruolo: 'TD', eta: 23, nazionalita: 'Punica', valoreGenerale: 80, potenziale: 85, piede: 'Destro', stipendio: 25000 },
    { nome: 'Melqart', cognome: 'Barid', ruolo: 'TS', eta: 24, nazionalita: 'Punica', valoreGenerale: 79, potenziale: 84, piede: 'Sinistro', stipendio: 24000 },
    { nome: 'Gisgo', cognome: 'Cannae', ruolo: 'MED', eta: 28, nazionalita: 'Punica', valoreGenerale: 84, potenziale: 85, piede: 'Destro', stipendio: 36000 },
    { nome: 'Tanit', cognome: 'Sacerdos', ruolo: 'CC', eta: 23, nazionalita: 'Punica', valoreGenerale: 83, potenziale: 88, piede: 'Ambidestro', stipendio: 32000 },
    { nome: 'Muttines', cognome: 'Libyphoenice', ruolo: 'TRQ', eta: 22, nazionalita: 'Punica', valoreGenerale: 82, potenziale: 89, piede: 'Destro', stipendio: 30000 },
    { nome: 'Malchus', cognome: 'Byrsa', ruolo: 'POR', eta: 20, nazionalita: 'Punica', valoreGenerale: 72, potenziale: 80, piede: 'Destro', stipendio: 11000 },
    { nome: 'Carthalo', cognome: 'Equester', ruolo: 'DFC', eta: 21, nazionalita: 'Punica', valoreGenerale: 75, potenziale: 82, piede: 'Destro', stipendio: 15000 },
    { nome: 'Adherbal', cognome: 'Navarchus', ruolo: 'ATT', eta: 19, nazionalita: 'Punica', valoreGenerale: 75, potenziale: 86, piede: 'Destro', stipendio: 15000 }
  ],
  club_gades: [
    { nome: 'Herakles', cognome: 'Gaditanus', ruolo: 'POR', eta: 27, nazionalita: 'Iberica', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Melqart', cognome: 'Tartessos', ruolo: 'DFC', eta: 28, nazionalita: 'Iberica', valoreGenerale: 82, potenziale: 83, piede: 'Destro', stipendio: 26000 },
    { nome: 'Arganthonios', cognome: 'Aureus', ruolo: 'DFC', eta: 26, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 22000 },
    { nome: 'Erytheia', cognome: 'Insula', ruolo: 'TD', eta: 23, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 84, piede: 'Destro', stipendio: 18000 },
    { nome: 'Kotinoussa', cognome: 'Sinus', ruolo: 'TS', eta: 24, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 82, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Garum', cognome: 'Piscis', ruolo: 'MED', eta: 25, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 21000 },
    { nome: 'Baetis', cognome: 'Argenteus', ruolo: 'CC', eta: 24, nazionalita: 'Iberica', valoreGenerale: 81, potenziale: 86, piede: 'Ambidestro', stipendio: 24000 },
    { nome: 'Gadir', cognome: 'Phoenissa', ruolo: 'TRQ', eta: 22, nazionalita: 'Punica', valoreGenerale: 82, potenziale: 88, piede: 'Sinistro', stipendio: 26000 },
    { nome: 'Calpe', cognome: 'Columna', ruolo: 'AD', eta: 23, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 85, piede: 'Destro', stipendio: 22000 },
    { nome: 'Abila', cognome: 'Africus', ruolo: 'ATT', eta: 26, nazionalita: 'Iberica', valoreGenerale: 83, potenziale: 85, piede: 'Destro', stipendio: 29000 },
    { nome: 'Tarf', cognome: 'Atlanticus', ruolo: 'AS', eta: 21, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 85, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Oceanus', cognome: 'Tide', ruolo: 'POR', eta: 19, nazionalita: 'Iberica', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 9000 },
    { nome: 'Turdetanus', cognome: 'Fidus', ruolo: 'DFC', eta: 22, nazionalita: 'Iberica', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 13000 },
    { nome: 'Conil', cognome: 'Velox', ruolo: 'ATT', eta: 20, nazionalita: 'Iberica', valoreGenerale: 74, potenziale: 83, piede: 'Destro', stipendio: 13000 }
  ],
  club_corduba: [
    { nome: 'Balbus', cognome: 'Cornelius', soprannome: 'Il Patrizio', ruolo: 'POR', eta: 27, nazionalita: 'Iberica', valoreGenerale: 82, potenziale: 84, piede: 'Destro', stipendio: 26000 },
    { nome: 'Cordubensis', cognome: 'Marcus', ruolo: 'DFC', eta: 28, nazionalita: 'Iberica', valoreGenerale: 83, potenziale: 84, piede: 'Destro', stipendio: 28000 },
    { nome: 'Seneca', cognome: 'Philosophus', soprannome: 'La Mente', ruolo: 'MED', eta: 24, nazionalita: 'Iberica', valoreGenerale: 84, potenziale: 89, piede: 'Ambidestro', stipendio: 32000 },
    { nome: 'Baetis', cognome: 'Riparius', ruolo: 'DFC', eta: 25, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 22000 },
    { nome: 'Lucanus', cognome: 'Poeta', ruolo: 'TD', eta: 22, nazionalita: 'Iberica', valoreGenerale: 79, potenziale: 86, piede: 'Destro', stipendio: 20000 },
    { nome: 'Gades', cognome: 'Vicus', ruolo: 'TS', eta: 24, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 82, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Hispalis', cognome: 'Oliva', ruolo: 'CC', eta: 26, nazionalita: 'Iberica', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Italica', cognome: 'Traianus', ruolo: 'CC', eta: 21, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 88, piede: 'Destro', stipendio: 22000 },
    { nome: 'Sierra', cognome: 'Morena', ruolo: 'AD', eta: 23, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 85, piede: 'Destro', stipendio: 22000 },
    { nome: 'Viriatus', cognome: 'Guerriero', soprannome: 'L’Inafferrabile', ruolo: 'ATT', eta: 26, nazionalita: 'Iberica', valoreGenerale: 85, potenziale: 87, piede: 'Destro', stipendio: 36000 },
    { nome: 'Iliberris', cognome: 'Granata', ruolo: 'AS', eta: 22, nazionalita: 'Iberica', valoreGenerale: 79, potenziale: 85, piede: 'Sinistro', stipendio: 20000 },
    { nome: 'Acinipo', cognome: 'Custos', ruolo: 'POR', eta: 20, nazionalita: 'Iberica', valoreGenerale: 71, potenziale: 79, piede: 'Destro', stipendio: 10000 },
    { nome: 'Urso', cognome: 'Legio', ruolo: 'DFC', eta: 21, nazionalita: 'Iberica', valoreGenerale: 75, potenziale: 82, piede: 'Destro', stipendio: 14000 },
    { nome: 'Carmo', cognome: 'Iuvenis', ruolo: 'ATT', eta: 19, nazionalita: 'Iberica', valoreGenerale: 73, potenziale: 84, piede: 'Destro', stipendio: 12000 }
  ],
  club_numidia: [
    { nome: 'Massinissa', cognome: 'Numida', soprannome: 'Il Re a Cavallo', ruolo: 'ATT', eta: 27, nazionalita: 'Numida', valoreGenerale: 86, potenziale: 88, piede: 'Destro', stipendio: 38000 },
    { nome: 'Micipsa', cognome: 'Cirta', ruolo: 'POR', eta: 28, nazionalita: 'Numida', valoreGenerale: 79, potenziale: 80, piede: 'Destro', stipendio: 20000 },
    { nome: 'Jugurtha', cognome: 'Rebellis', soprannome: 'L’Astuto', ruolo: 'TRQ', eta: 25, nazionalita: 'Numida', valoreGenerale: 85, potenziale: 89, piede: 'Ambidestro', stipendio: 36000 },
    { nome: 'Gauda', cognome: 'Princeps', ruolo: 'DFC', eta: 26, nazionalita: 'Numida', valoreGenerale: 80, potenziale: 82, piede: 'Destro', stipendio: 22000 },
    { nome: 'Hiempsal', cognome: 'Numida', ruolo: 'DFC', eta: 24, nazionalita: 'Numida', valoreGenerale: 78, potenziale: 82, piede: 'Destro', stipendio: 18000 },
    { nome: 'Bocchus', cognome: 'Mauretano', ruolo: 'TD', eta: 23, nazionalita: 'Numida', valoreGenerale: 79, potenziale: 84, piede: 'Destro', stipendio: 20000 },
    { nome: 'Zama', cognome: 'Campus', ruolo: 'TS', eta: 25, nazionalita: 'Numida', valoreGenerale: 78, potenziale: 81, piede: 'Sinistro', stipendio: 18000 },
    { nome: 'Hippo', cognome: 'Regius', ruolo: 'MED', eta: 26, nazionalita: 'Numida', valoreGenerale: 81, potenziale: 83, piede: 'Destro', stipendio: 24000 },
    { nome: 'Atlas', cognome: 'Mons', ruolo: 'CC', eta: 24, nazionalita: 'Numida', valoreGenerale: 80, potenziale: 84, piede: 'Destro', stipendio: 22000 },
    { nome: 'Gétulo', cognome: 'Velox', ruolo: 'AD', eta: 21, nazionalita: 'Numida', valoreGenerale: 81, potenziale: 88, piede: 'Destro', stipendio: 24000 },
    { nome: 'Bagradas', cognome: 'Flumen', ruolo: 'ATT', eta: 22, nazionalita: 'Numida', valoreGenerale: 78, potenziale: 85, piede: 'Destro', stipendio: 19000 },
    { nome: 'Rusicade', cognome: 'Portus', ruolo: 'POR', eta: 20, nazionalita: 'Numida', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 9000 },
    { nome: 'Theveste', cognome: 'Fortis', ruolo: 'DFC', eta: 21, nazionalita: 'Numida', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 13000 },
    { nome: 'Thugga', cognome: 'Celer', ruolo: 'ATT', eta: 19, nazionalita: 'Numida', valoreGenerale: 74, potenziale: 85, piede: 'Destro', stipendio: 13000 }
  ],
  club_tingis: [
    { nome: 'Bogud', cognome: 'Maurus', ruolo: 'POR', eta: 27, nazionalita: 'Iberica', valoreGenerale: 77, potenziale: 79, piede: 'Destro', stipendio: 16000 },
    { nome: 'Bocchus', cognome: 'Secundus', ruolo: 'DFC', eta: 28, nazionalita: 'Iberica', valoreGenerale: 79, potenziale: 80, piede: 'Destro', stipendio: 19000 },
    { nome: 'Lixus', cognome: 'Flumen', ruolo: 'DFC', eta: 25, nazionalita: 'Iberica', valoreGenerale: 77, potenziale: 81, piede: 'Destro', stipendio: 16000 },
    { nome: 'Volubilis', cognome: 'Aulicus', ruolo: 'DFC', eta: 24, nazionalita: 'Iberica', valoreGenerale: 76, potenziale: 80, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Tamuda', cognome: 'Castra', ruolo: 'TD', eta: 22, nazionalita: 'Iberica', valoreGenerale: 75, potenziale: 81, piede: 'Destro', stipendio: 14000 },
    { nome: 'Sala', cognome: 'Colonia', ruolo: 'TS', eta: 23, nazionalita: 'Iberica', valoreGenerale: 75, potenziale: 80, piede: 'Sinistro', stipendio: 14000 },
    { nome: 'Mauri', cognome: 'Sagittator', ruolo: 'MED', eta: 26, nazionalita: 'Iberica', valoreGenerale: 77, potenziale: 79, piede: 'Destro', stipendio: 17000 },
    { nome: 'Fretum', cognome: 'Gaditanum', ruolo: 'CC', eta: 24, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 82, piede: 'Ambidestro', stipendio: 18000 },
    { nome: 'Rif', cognome: 'Mons', ruolo: 'TRQ', eta: 22, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 85, piede: 'Destro', stipendio: 18000 },
    { nome: 'Tingitana', cognome: 'Ferox', ruolo: 'ATT', eta: 25, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 83, piede: 'Destro', stipendio: 22000 },
    { nome: 'Cotta', cognome: 'Maurus', ruolo: 'ATT', eta: 21, nazionalita: 'Iberica', valoreGenerale: 76, potenziale: 84, piede: 'Destro', stipendio: 15000 },
    { nome: 'Zilis', cognome: 'Custos', ruolo: 'POR', eta: 20, nazionalita: 'Iberica', valoreGenerale: 69, potenziale: 77, piede: 'Destro', stipendio: 8000 },
    { nome: 'Septem', cognome: 'Fratres', ruolo: 'DFC', eta: 21, nazionalita: 'Iberica', valoreGenerale: 73, potenziale: 80, piede: 'Destro', stipendio: 12000 },
    { nome: 'Banasa', cognome: 'Spes', ruolo: 'ATT', eta: 19, nazionalita: 'Iberica', valoreGenerale: 72, potenziale: 83, piede: 'Destro', stipendio: 11000 }
  ],
  club_caesaraugusta: [
    { nome: 'Viriatus', cognome: 'Saldubensis', ruolo: 'POR', eta: 27, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 80, piede: 'Destro', stipendio: 18000 },
    { nome: 'Hiberus', cognome: 'Riparius', ruolo: 'DFC', eta: 28, nazionalita: 'Iberica', valoreGenerale: 81, potenziale: 82, piede: 'Destro', stipendio: 23000 },
    { nome: 'Sedetanus', cognome: 'Scutum', ruolo: 'DFC', eta: 25, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 81, piede: 'Destro', stipendio: 18000 },
    { nome: 'Belsinum', cognome: 'Mons', ruolo: 'TD', eta: 23, nazionalita: 'Iberica', valoreGenerale: 76, potenziale: 82, piede: 'Destro', stipendio: 15000 },
    { nome: 'Salduvia', cognome: 'Ibera', ruolo: 'TS', eta: 24, nazionalita: 'Iberica', valoreGenerale: 76, potenziale: 80, piede: 'Sinistro', stipendio: 15000 },
    { nome: 'Edeta', cognome: 'Miles', ruolo: 'MED', eta: 26, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 80, piede: 'Destro', stipendio: 18000 },
    { nome: 'Moncayo', cognome: 'Ventus', ruolo: 'CC', eta: 24, nazionalita: 'Iberica', valoreGenerale: 79, potenziale: 83, piede: 'Ambidestro', stipendio: 20000 },
    { nome: 'Bilbilis', cognome: 'Ferrum', ruolo: 'TRQ', eta: 22, nazionalita: 'Iberica', valoreGenerale: 80, potenziale: 86, piede: 'Sinistro', stipendio: 22000 },
    { nome: 'Osca', cognome: 'Sertorius', ruolo: 'AD', eta: 23, nazionalita: 'Iberica', valoreGenerale: 78, potenziale: 83, piede: 'Destro', stipendio: 18000 },
    { nome: 'Numantia', cognome: 'Resistens', soprannome: 'L’Inconquistabile', ruolo: 'ATT', eta: 26, nazionalita: 'Iberica', valoreGenerale: 82, potenziale: 84, piede: 'Destro', stipendio: 26000 },
    { nome: 'Celtiber', cognome: 'Falx', ruolo: 'AS', eta: 21, nazionalita: 'Iberica', valoreGenerale: 77, potenziale: 85, piede: 'Sinistro', stipendio: 17000 },
    { nome: 'Gallicum', cognome: 'Custos', ruolo: 'POR', eta: 19, nazionalita: 'Iberica', valoreGenerale: 70, potenziale: 78, piede: 'Destro', stipendio: 9000 },
    { nome: 'Ilerda', cognome: 'Saxum', ruolo: 'DFC', eta: 22, nazionalita: 'Iberica', valoreGenerale: 74, potenziale: 81, piede: 'Destro', stipendio: 13000 },
    { nome: 'Turiaso', cognome: 'Moneta', ruolo: 'ATT', eta: 20, nazionalita: 'Iberica', valoreGenerale: 74, potenziale: 84, piede: 'Destro', stipendio: 13000 }
  ]
};

// Generates full Player object from seed with consistent mathematical attributes
export function createPlayerFromSeed(seed: PlayerSeed, clubId: string, index: number): Player {
  const baseAttr = Math.max(1, Math.min(20, Math.round((seed.valoreGenerale / 100) * 20)));
  const id = `player_${clubId}_${index}_${seed.cognome.toLowerCase().replace(/[^a-z]/g, '')}`;

  const isGK = seed.ruolo === 'POR';
  const isDef = ['DFC', 'TD', 'TS'].includes(seed.ruolo);
  const isMid = ['MED', 'CC', 'TRQ'].includes(seed.ruolo);
  const isAtt = ['ATT', 'AD', 'AS'].includes(seed.ruolo);

  const clamp20 = (val: number) => Math.max(1, Math.min(20, Math.round(val)));

  const attributi: PlayerAttributes = {
    // Fisici
    velocita: clamp20(baseAttr + (isAtt || seed.ruolo === 'TD' || seed.ruolo === 'TS' ? 2 : -1)),
    resistenza: clamp20(baseAttr + (isMid ? 2 : 0)),
    forza: clamp20(baseAttr + (isDef || seed.ruolo === 'ATT' ? 2 : -1)),
    elevazione: clamp20(baseAttr + (seed.ruolo === 'DFC' || isGK ? 2 : -1)),
    
    // Difensivi
    contrasto: clamp20(isDef ? baseAttr + 3 : isMid ? baseAttr : 6),
    marcatura: clamp20(isDef ? baseAttr + 3 : isMid ? baseAttr - 1 : 5),
    posizionamento: clamp20(baseAttr + (isDef || isGK ? 2 : 0)),
    
    // Tecnici / Offensivi
    passaggio: clamp20(isMid ? baseAttr + 3 : isAtt ? baseAttr : baseAttr - 2),
    visione: clamp20(isMid ? baseAttr + 3 : isAtt ? baseAttr : baseAttr - 2),
    tiro: clamp20(isAtt ? baseAttr + 3 : isMid ? baseAttr : 7),
    finalizzazione: clamp20(isAtt ? baseAttr + 4 : isMid ? baseAttr - 1 : 5),
    dribbling: clamp20(isAtt || seed.ruolo === 'TRQ' ? baseAttr + 3 : isMid ? baseAttr : 6),
    tecnica: clamp20(baseAttr + (isMid || isAtt ? 2 : -2)),
    
    // Portiere
    parata: clamp20(isGK ? baseAttr + 4 : 3),
    riflessi: clamp20(isGK ? baseAttr + 4 : 4),
    uscite: clamp20(isGK ? baseAttr + 3 : 2),
    
    // Mentali
    virtus: clamp20(baseAttr + (seed.eta > 26 ? 2 : 0)),
    disciplina: clamp20(baseAttr + (seed.eta > 27 ? 2 : -1))
  };

  const prezzoRichiesto = Math.round(
    seed.valoreGenerale * seed.valoreGenerale * 250 * (1 + (seed.potenziale - seed.valoreGenerale) * 0.05)
  );

  return {
    id,
    nome: seed.nome,
    cognome: seed.cognome,
    soprannome: seed.soprannome,
    annoNascita: -50 - seed.eta,
    eta: seed.eta,
    nazionalita: seed.nazionalita,
    regione: seed.nazionalita,
    ruoloPrimario: seed.ruolo,
    ruoliSecondari: [],
    piede: seed.piede,
    altezzaCm: isGK ? 188 : isDef ? 185 : 178,
    pesoKg: isGK ? 84 : isDef ? 82 : 75,
    valoreGenerale: seed.valoreGenerale,
    potenziale: seed.potenziale,
    attributi,
    condizione: 98,
    morale: 88,
    infortunato: false,
    giorniInfortunio: 0,
    squalificato: false,
    clubId,
    contratto: {
      clubId,
      stipendioSettimanale: seed.stipendio,
      annoScadenza: -47 // 3 anni di contratto
    },
    statisticheStagione: {
      seasonYear: -50,
      presenze: 0,
      gol: 0,
      assist: 0,
      cartelliniGialli: 0,
      cartelliniRossi: 0,
      mediaVoto: 0,
      minutiGiocati: 0
    },
    carrieraPassata: [],
    inListaTrasferimenti: index > 11, // I rincalzi sono spesso sul mercato
    prezzoRichiesto
  };
}

export function buildInitialPlayers(): Record<string, Player> {
  const players: Record<string, Player> = {};

  for (const [clubId, seeds] of Object.entries(SQUAD_SEEDS)) {
    seeds.forEach((seed, idx) => {
      const p = createPlayerFromSeed(seed, clubId, idx + 1);
      players[p.id] = p;
    });
  }

  return players;
}

const FIRST_NAMES_BY_CULTURE: Record<string, string[]> = {
  romana: ['Marcus', 'Lucius', 'Gaius', 'Publius', 'Quintus', 'Titus', 'Decimus', 'Aulus', 'Sextus', 'Servius', 'Tiberius', 'Cnaeus'],
  greca: ['Alexander', 'Demetrios', 'Aristoteles', 'Philoktetes', 'Nikias', 'Leonidas', 'Xenophon', 'Theon', 'Kallikrates', 'Parmenides', 'Straton', 'Krates'],
  gallica: ['Vercingetorix', 'Dumnorix', 'Diviciacus', 'Catuvolcus', 'Ambiorix', 'Segovax', 'Litaviccus', 'Eporedorix', 'Camulogenus', 'Brennus', 'Lugotorix'],
  iberica: ['Indibilis', 'Mandonio', 'Viriathus', 'Audax', 'Ditalco', 'Minuro', 'Tanginus', 'Corocotta', 'Carus', 'Retogenes', 'Olindicus'],
  punica: ['Hamilcar', 'Hasdrubal', 'Hannibal', 'Mago', 'Hanno', 'Himilco', 'Gisco', 'Bostar', 'Bomilcar', 'Maharbal', 'Adherbal'],
  egizia: ['Ptolemaios', 'Amenhotep', 'Imhotep', 'Senusret', 'Nekau', 'Psamtik', 'Harsiese', 'Ankhsheshonq', 'Horus', 'Osiris', 'Khamwaset'],
  persiana: ['Cyrus', 'Darius', 'Artaxerxes', 'Roxane', 'Mithridates', 'Tiridates', 'Spitamenes', 'Arsaces', 'Phraates', 'Surena', 'Mardonius'],
  germanica: ['Arminius', 'Ariovistus', 'Segestes', 'Flavus', 'Maroboduus', 'Inguiomerus', 'Chariomerus', 'Veleda', 'Boiorix', 'Teutobod', 'Mullo'],
  britannica: ['Cassivellaunus', 'Cunobeline', 'Togodumnus', 'Caratacus', 'Prasutagus', 'Adminius', 'Mandubracius', 'Tasgovanus', 'Addedomarus', 'Boduognatus'],
  sarmatica: ['Sauromates', 'Skiluros', 'Palakos', 'Eumelos', 'Aisapos', 'Inismeus', 'Farzoios', 'Spadines', 'Zorsines', 'Ablabius'],
  nabatea: ['Aretas', 'Obodas', 'Malichos', 'Rabbel', 'Syllaeus', 'Dushara', 'Shaudat', 'Wael', 'Qosnathan', 'Hani'],
  nubiana: ['Taharqa', 'Piankhi', 'Alara', 'Aspelta', 'Anlamani', 'Nastasen', 'Tanyidamani', 'Harsiotef', 'Amanislo', 'Teriteqas']
};

const LAST_NAMES_BY_CULTURE: Record<string, string[]> = {
  romana: ['Valerius', 'Julius', 'Cornelius', 'Claudius', 'Fabius', 'Aemilius', 'Sempronius', 'Pompeius', 'Tullius', 'Licinius', 'Antonius'],
  greca: ['Peloponnesios', 'Attikos', 'Korinthios', 'Spartiates', 'Rhodios', 'Makedon', 'Milesios', 'Thebanus', 'Delphikos', 'Sikyonios'],
  gallica: ['Arvernus', 'Aeduus', 'Senon', 'Parisios', 'Sequanus', 'Biturix', 'Carnute', 'Bellovacus', 'Allobrox', 'Trever'],
  iberica: ['Baeticus', 'Celtiber', 'Lusitanus', 'Cantaber', 'Astur', 'Vascon', 'Ilergetes', 'Turdetanus', 'Edetanus', 'Oretanus'],
  punica: ['Barca', 'Gisco', 'Sufetes', 'Melqart', 'Tanit', 'Carthaginiensis', 'Uticensis', 'Byrsa', 'Hesperus', 'Sidonius'],
  egizia: ['Niliotes', 'Memphites', 'Thebanus', 'Alexandrinus', 'Canopicus', 'Oasites', 'Lagides', 'Pharaonicus', 'Faiyum', 'Rosettanus'],
  persiana: ['Achaemenes', 'Suren', 'Karan', 'Spahbod', 'Bactrianus', 'Ecbatanus', 'Persepolites', 'Margianus', 'Sogdianus', 'Hyrkanus'],
  germanica: ['Cheruscus', 'Suebus', 'Chattus', 'Cimber', 'Teuton', 'Bructerus', 'Batavus', 'Frisius', 'Hermundurus', 'Marcomannus'],
  britannica: ['Catuvellaunus', 'Trinovans', 'Iceni', 'Brigante', 'Silure', 'Ordovice', 'Atrebates', 'Cantii', 'Dumnonius', 'Votadino'],
  sarmatica: ['Tanaïtes', 'Borysthenites', 'Bosporanus', 'Maeotis', 'Roxolan', 'Iazyx', 'Aorsus', 'Sirax', 'Scytha', 'Alanus'],
  nabatea: ['Petraeus', 'Hegrensis', 'Bostrenus', 'Decapolites', 'Avdatensis', 'Caravanus', 'Sinaiticus', 'Thamudenus', 'Nabataeus'],
  nubiana: ['Meroiticus', 'Kushita', 'Napataeus', 'Cataractes', 'Dongolan', 'Kermaeus', 'Aethiopus', 'Blemmye', 'Nubianus']
};

export function generateClubStarterSquad(club: Club): Player[] {
  const targetRating = Math.max(68, Math.min(88, Math.round(club.reputazione / 11)));
  const roles: Role[] = [
    'POR', 'POR',
    'TD', 'TS', 'DFC', 'DFC', 'DFC',
    'MED', 'CC', 'CC', 'TRQ', 'CC',
    'ATT', 'ATT', 'AS', 'AD'
  ];

  // Determine culture family
  const id = club.id.toLowerCase();
  let culture = 'romana';
  if (id.includes('gall') || id.includes('lut') || id.includes('lug')) culture = 'gallica';
  else if (id.includes('grec') || id.includes('ath') || id.includes('spa') || id.includes('cor') || id.includes('theb') || id.includes('rhod')) culture = 'greca';
  else if (id.includes('iber') || id.includes('his') || id.includes('cor') || id.includes('gad')) culture = 'iberica';
  else if (id.includes('cart') || id.includes('pun') || id.includes('afr')) culture = 'punica';
  else if (id.includes('egi') || id.includes('ale') || id.includes('mem')) culture = 'egizia';
  else if (id.includes('per') || id.includes('par') || id.includes('bac')) culture = 'persiana';
  else if (id.includes('ger')) culture = 'germanica';
  else if (id.includes('bri') || id.includes('lon') || id.includes('ebu')) culture = 'britannica';
  else if (id.includes('sar')) culture = 'sarmatica';
  else if (id.includes('nab') || id.includes('ara')) culture = 'nabatea';
  else if (id.includes('nub') || id.includes('eti') || id.includes('num') || id.includes('mau')) culture = 'nubiana';

  const firstPool = FIRST_NAMES_BY_CULTURE[culture] || FIRST_NAMES_BY_CULTURE.romana;
  const lastPool = LAST_NAMES_BY_CULTURE[culture] || LAST_NAMES_BY_CULTURE.romana;

  return roles.map((ruolo, index) => {
    const age = 19 + Math.floor(Math.random() * 12);
    const varRating = Math.floor(Math.random() * 7) - 3;
    const ovr = Math.max(64, Math.min(92, targetRating + varRating));
    const pot = Math.max(ovr, Math.min(95, ovr + Math.max(1, 30 - age)));
    const fname = firstPool[index % firstPool.length];
    const lname = lastPool[(index + Math.floor(Math.random() * 3)) % lastPool.length];
    const foot: Foot = index % 3 === 0 ? 'Sinistro' : index % 7 === 0 ? 'Ambidestro' : 'Destro';

    const seed: PlayerSeed = {
      nome: fname,
      cognome: `${lname} ${ruolo}`,
      ruolo,
      eta: age,
      nazionalita: club.regione || 'Romana',
      valoreGenerale: ovr,
      potenziale: pot,
      piede: foot,
      stipendio: Math.round(ovr * 320)
    };

    return createPlayerFromSeed(seed, club.id, index + 1);
  });
}

