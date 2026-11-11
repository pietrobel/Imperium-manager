/**
 * IMPERIUM MANAGER (50 a.C.)
 * Core Type Definitions & Data Models
 */

export type Role = 'POR' | 'TD' | 'TS' | 'DFC' | 'MED' | 'CC' | 'TRQ' | 'AD' | 'AS' | 'ATT';

export type RoleCategory = 'POR' | 'DIF' | 'CEN' | 'ATT';

export type Foot = 'Destro' | 'Sinistro' | 'Ambidestro';

export interface PlayerAttributes {
  // Fisici
  velocita: number;      // 1-20
  resistenza: number;    // 1-20
  forza: number;         // 1-20
  elevazione: number;    // 1-20
  
  // Difensivi
  contrasto: number;     // 1-20
  marcatura: number;     // 1-20
  posizionamento: number;// 1-20
  
  // Tecnici / Offensivi
  passaggio: number;     // 1-20
  visione: number;       // 1-20
  tiro: number;          // 1-20
  finalizzazione: number;// 1-20
  dribbling: number;     // 1-20
  tecnica: number;       // 1-20
  
  // Portiere (rilevante solo se POR)
  parata: number;        // 1-20
  riflessi: number;      // 1-20
  uscite: number;        // 1-20
  
  // Mentali / Carattere
  virtus: number;        // 1-20 (determinazione/grinta romana)
  disciplina: number;    // 1-20
}

export interface PlayerSeasonStats {
  seasonYear: number;
  presenze: number;
  gol: number;
  assist: number;
  cartelliniGialli: number;
  cartelliniRossi: number;
  mediaVoto: number;
  minutiGiocati: number;
}

export interface PlayerHistoryEntry {
  seasonYear: number;
  clubId: string;
  clubName: string;
  presenze: number;
  gol: number;
  mediaVoto: number;
  trofeiVinti: string[];
}

export interface Player {
  id: string;
  nome: string;
  cognome: string;
  soprannome?: string;
  annoNascita: number; // e.g. -75 (significa 75 a.C., per età in 50 a.C. = 25 anni)
  eta: number;
  nazionalita: string; // e.g. "Romana", "Gallica", "Greca", "Iberica", "Egizia", "Punica", "Britanna", "Germanica"
  regione: string;
  ruoloPrimario: Role;
  ruoliSecondari: Role[];
  piede: Foot;
  altezzaCm: number;
  pesoKg: number;
  valoreGenerale: number; // Overall 1-99
  potenziale: number;     // Potenziale 1-99
  attributi: PlayerAttributes;
  condizione: number;     // 0-100%
  morale: number;         // 0-100%
  infortunato: boolean;
  giorniInfortunio: number;
  tipoInfortunio?: string;
  gravitaInfortunio?: 'LIEVE' | 'MODERATO' | 'GRAVE';
  caricoFatica?: number;  // 0-100 (accumulatore di fatica da match recenti e allenamenti)
  allenamentoAssegnato?: MilitaryDrillId;
  ruoloTatticoSpecifico?: HarpastumTacticalDutyId;
  squalificato: boolean;
  clubId: string;
  contratto: Contract;
  statisticheStagione: PlayerSeasonStats;
  carrieraPassata: PlayerHistoryEntry[];
  inListaTrasferimenti: boolean;
  prezzoRichiesto: number; // In Sesterzi (HS)
}

export type MilitaryDrillId =
  | 'CURSUS_CUM_SARCINA' // Marcia forzata con fardello legionario (Velocità + Resistenza)
  | 'ARMATURA_LIGNEA'    // Scherma con gladio ligneo e scudo pesante (Forza + Placcaggio)
  | 'PALAESTRA_LUCTA'    // Lotta greco-romana nella sabbia (Presa + Contrasto + Virtus)
  | 'TAXIS_DECURSIO'     // Movimenti di coorte e testuggine tattica (Disciplina + Posizionamento)
  | 'PHAININDA_SPHAIRA'  // Finte ottiche, lanci tesi e acrobazia (Agilità + Passaggio + Dribbling)
  | 'THERMAE_OTIUM';     // Riposo alle terme, unzioni con strigile (Rigenerazione totale fatica)

export type TrainingIntensity =
  | 'CLEMENTIA' // Bassa intensità: fatica 0, rischio infortunio 0%, progresso lieve
  | 'NORMALIS'  // Standard legionario: fatica moderata, rischio infortunio 3%, progresso equilibrato
  | 'SPARTANA'; // Estrema / Decimatio: fatica alta, rischio infortunio 12%, progresso doppio

export type HarpastumTacticalDutyId =
  // Custos
  | 'BALUARDO_FISSO'      // Presidio rigido linea di meta, bonus parata e uscite
  | 'LIBERO_INTERCETTORE' // Uscite proattive sulle parabole aeree, rapido rilancio
  // Luctator
  | 'MURO_DA_MISCHIA'     // Sbarramento fisico brutale al centro, sfianca gli avversari
  | 'CACCIATORE_DI_FASCIA'// Insegue e atterra le ali veloci sulle linee laterali
  // Tractor
  | 'ARIETE_APRIPISTA'    // Scorta e blocchi corporali per aprire varchi
  | 'REGISTA_PHAININDA'   // Lanci tesi a due mani, cambi di fronte e finte visive
  // Praeveniens
  | 'FRECCIA_ELUSIVA'     // Scatti in profondità e tuffi acrobatici oltre la linea
  | 'EMBOLON_SFONDATORE'; // Ariete da mischia a peso morto contro la linea di meta

export type MedicalStaffTier =
  | 'ERBISTA_CASTRORUM'   // Bende di lino e decotti campali (Standard)
  | 'MEDICUS_GRAECUS'     // Medico di scuola alessandrina (+35% velocità guarigione, 1.500 HS/sett.)
  | 'ARCHIATRA_IMPERIALE';// Medico dei Cesari con balsami rari (+70% velocità guarigione, 4.000 HS/sett.)

export interface ClubTrainingSettings {
  intensitaGenerale: TrainingIntensity;
  dottrinaPrevalente: MilitaryDrillId;
  medicoAssegnato: MedicalStaffTier;
}

export interface Contract {
  clubId: string;
  stipendioSettimanale: number; // Sesterzi / settimana
  annoScadenza: number;         // Anno a.C. (es. -48 = 48 a.C.)
  clausolaRescissoria?: number;
}

export interface ClubColors {
  primary: string;   // Hex
  secondary: string; // Hex
  text: string;      // Hex
}

export interface ClubHistoryEntry {
  seasonYear: number;
  leagueId: string;
  posizione: number;
  punti: number;
  golFatti: number;
  golSubiti: number;
  trofei: string[];
}

export interface ClubHeraldryData {
  iconType: 'AQUILA' | 'LUPA' | 'TORO' | 'CINGHIALE' | 'ELEFANTE' | 'LEONE' | 'FULMINE' | 'GLADIO' | 'FALCO' | 'PEGASO';
  motto: string;
  paletteName?: string;
  primaryColor: string;
  secondaryColor: string;
  goldTrim?: boolean;
}

export interface Club {
  id: string;
  nome: string;
  sigla: string; // 3 caratteri (es. "ROM", "SPA", "CAR")
  citta: string;
  regione: string;
  regionId?: string;
  leagueId: string;
  reputazione: number; // 1-1000
  colori: ClubColors;
  araldica?: ClubHeraldryData;
  stadioNome: string;
  stadioCapienza: number;
  budgetTrasferimenti: number; // Sesterzi (HS)
  budgetStipendi: number;      // Sesterzi / sett.
  saldoCassa: number;          // Sesterzi
  formazioneTattica: '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1' | '3-4-3' | '5-4-1' | '4-5-1';
  titolariIds: string[];       // 11 o 12 IDs
  panchinaIds: string[];       // 7 IDs
  storiaTrofei: string[];
  storicoCampionati: ClubHistoryEntry[];
  allenatoreNome?: string;
  isUserControlled: boolean;
  impostazioniAllenamento?: ClubTrainingSettings;
}

export interface Region {
  id: string;
  nome: string;
  nomeLatino: string;
  macroArea: 'Occidente Romano' | 'Europa Continentale & Celtica' | 'Mediterraneo Orientale & Grecia' | 'Oriente & Asia Anteriore' | 'Nord Africa & Nilo' | 'Terre Lontane & Confini';
  descrizioneStorica: string;
  culturaDominante: string;
  reputazioneSportiva: number; // 1-1000
  leagueIds: string[];
}

export interface League {
  id: string;
  nome: string;
  nomeLatino: string;
  regione: string;
  regionId?: string;
  livello: number; // 1 = Prima divisione
  clubIds: string[];
  reputazione: number;
  retrocessioni: number;
  promozioni: number;
  qualificazioniCoppe: number;
  cultura?: string;
  paeseCapitale?: string;
}

export interface LeagueTableRow {
  clubId: string;
  clubNome: string;
  clubSigla: string;
  partiteGiocate: number;
  vittorie: number;
  pareggi: number;
  sconfitte: number;
  golFatti: number;
  golSubiti: number;
  differenzaReti: number;
  punti: number;
  forma: ('V' | 'P' | 'S')[]; // Ultimi 5 risultati
}

export interface MatchEvent {
  minuto: number;
  tipo: 'META' | 'PLACCAGGIO' | 'INTERCETTO' | 'GOL' | 'RIGORE' | 'AUTOGOL' | 'GIALLO' | 'ROSSO' | 'INFORTUNIO' | 'SOSTITUZIONE' | 'OCCASIONE';
  squadra: 'CASA' | 'OSPITE';
  giocatoreId?: string;
  giocatoreNome: string;
  dettaglio?: string;
}

export interface MatchStats {
  possessoCasa: number;   // %
  possessoOspite: number; // %
  tiriCasa: number;       // In Harpastum: Tentativi di Incursione / Sfondamenti
  tiriOspite: number;
  tiriInPortaCasa: number;// In Harpastum: Incursioni in Meta / Assalti a fondo campo
  tiriInPortaOspite: number;
  falliCasa: number;      // Placcaggi irregolari / Scontri proibiti
  falliOspite: number;
  angoliCasa: number;     // Rilanci dalla linea di fondo / Rimesse al volo
  angoliOspite: number;
  placcaggiVintiCasa?: number;
  placcaggiVintiOspite?: number;
  intercettiCasa?: number;
  intercettiOspite?: number;
}

export interface PlayerMatchRating {
  playerId: string;
  voto: number; // 4.0 - 10.0
  gol: number;
  assist: number;
  minuti: number;
}

export interface MatchResult {
  golCasa: number;
  golOspite: number;
  marcatoriCasa: { minuto: number; nome: string }[];
  marcatoriOspite: { minuto: number; nome: string }[];
  eventi: MatchEvent[];
  statistiche: MatchStats;
  pagelle: Record<string, PlayerMatchRating>;
}

export interface Match {
  id: string;
  competitionId: string;
  competitionType: 'LEAGUE' | 'CUP';
  stagioneAnno: number;
  giornata: number;
  dataCalendario: string; // Formato romano: es. "Idus Martiae 50 a.C."
  dataNumero: number;     // 1, 2, 3... per ordinamento cronologico
  clubCasaId: string;
  clubOspiteId: string;
  disputata: boolean;
  risultato?: MatchResult;
}

export interface Competition {
  id: string;
  nome: string;
  tipo: 'LEAGUE' | 'CUP';
  formato: 'ROUND_ROBIN' | 'KNOCKOUT';
  regione: string;
  trofeo: string;
  stagioneAttuale: number;
}

export interface Transfer {
  id: string;
  playerId: string;
  playerNome: string;
  daClubId: string;
  daClubNome: string;
  aClubId: string;
  aClubNome: string;
  cifraTrasferimento: number; // Sesterzi
  data: string;
  stagioneAnno: number;
}

export interface NationalTeam {
  id: string;
  nome: string;
  regione: string;
  cultura: string;
  sigla: string;
  stemmaColore: string;
  reputazione: number;
  giocatoriConvocatiIds: string[]; // IDs dei 18 migliori atleti selezionati
  commissarioTecnico?: string;
  partiteGiocate: number;
  vittorie: number;
  pareggi: number;
  sconfitte: number;
  trofeiVinti: string[];
}

export interface NationalMatch {
  id: string;
  torneo: string;
  stagioneAnno: number;
  dataCalendario: string;
  nazionaleCasaId: string;
  nazionaleOspiteId: string;
  disputata: boolean;
  meteCasa?: number;
  meteOspite?: number;
  migliorAtleta?: string;
}

export interface Manager {
  id: string;
  nome: string;
  cognome: string;
  soprannome?: string;
  nazionalita: string; // 'Romana', 'Greca', 'Egizia', 'Gallica', 'Punica', ecc.
  culturaOrigine?: 'ROMANA' | 'GRECA' | 'EGIZIA' | 'GALLICA' | 'PUNICA' | 'PERSICA' | 'GERMANICA';
  famigliaOrigine: string; // Es. "Gens Claudia", "Dinastia Tolemaica", "Famiglia di Pericle"
  clubId: string;
  nazionaleId?: string; // Se allena anche una selezione nazionale
  puntiReputazione: number;
  partiteGestite: number;
  vittorie: number;
  pareggi: number;
  sconfitte: number;
  trofeiVinti: string[];
  dataIngaggio: string;
}

export interface NewsItem {
  id: string;
  titolo: string;
  corpo: string;
  data: string;
  categoria: 'PARTITA' | 'MERCATO' | 'SOCIETA' | 'IMPERO';
  clubCoinvolti?: string[];
}

export interface IncomingTransferOffer {
  id: string;
  playerId: string;
  playerNome: string;
  playerRuolo: Role;
  playerOvr: number;
  playerEta: number;
  offeringClubId: string;
  offeringClubNome: string;
  offeredFee: number; // Sesterzi offerti al club utente
  data: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  expiresMatchday: number;
}

export interface CareerSave {
  id: string;
  saveName: string;
  createdAt: number;
  updatedAt: number;
  currentYear: number;       // -50 (50 a.C.)
  currentMatchday: number;   // 1 .. N
  currentDateText: string;   // e.g. "Idus Martiae, 50 a.C."
  manager: Manager;
  userClubId: string;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
  leagues: Record<string, League>;
  regions?: Record<string, Region>;
  matches: Match[];
  nationalTeams?: Record<string, NationalTeam>;
  nationalMatches?: NationalMatch[];
  transfers: Transfer[];
  incomingOffers?: IncomingTransferOffer[];
  news: NewsItem[];
  trofeiAlboDOro: Record<string, { anno: number; vincitoreNome: string }[]>;
}
