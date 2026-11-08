import type { CareerSave } from '../types';
import { convertBCToOlympicEra } from './calendarEngine';

export interface HallOfFameEntry {
  anno: number;
  eraOlimpica: string;
  consolato: string;
  competizione: string;
  vincitoreNome: string;
  capocannoniereNome: string;
  golCapocannoniere: number;
}

export const INITIAL_HALL_OF_FAME: HallOfFameEntry[] = [
  {
    anno: 54,
    eraOlimpica: '181ª Olimpiade, anno 3',
    consolato: 'Sotto il consolato di Lucio Domizio Enobarbo e Appio Claudio Pulcro',
    competizione: 'Prima Divisio Romana',
    vincitoreNome: 'SPQR Roma Caput Mundi',
    capocannoniereNome: 'Marcus Antonius',
    golCapocannoniere: 18
  },
  {
    anno: 53,
    eraOlimpica: '181ª Olimpiade, anno 4',
    consolato: 'Sotto il consolato di Cneo Domizio Calvino e Marco Valerio Messalla Rufo',
    competizione: 'Prima Divisio Romana',
    vincitoreNome: 'Neapolis Gladiatores',
    capocannoniereNome: 'Spartaco Campanus',
    golCapocannoniere: 16
  },
  {
    anno: 52,
    eraOlimpica: '182ª Olimpiade, anno 1',
    consolato: 'Sotto il consolato di Cneo Pompeo Magno e Quinto Cecilio Metello Scipione',
    competizione: 'Prima Divisio Romana',
    vincitoreNome: 'SPQR Roma Caput Mundi',
    capocannoniereNome: 'Marcus Antonius',
    golCapocannoniere: 20
  },
  {
    anno: 51,
    eraOlimpica: '182ª Olimpiade, anno 2',
    consolato: 'Sotto il consolato di Servio Sulpicio Rufo e Marco Claudio Marcello',
    competizione: 'Prima Divisio Romana',
    vincitoreNome: 'SPQR Roma Caput Mundi',
    capocannoniereNome: 'Decimus Brutus',
    golCapocannoniere: 15
  },
  {
    anno: 52,
    eraOlimpica: '182ª Olimpiade, anno 1',
    consolato: 'Sotto il consolato di Cneo Pompeo Magno e Quinto Cecilio Metello Scipione',
    competizione: 'Campionato Celtico',
    vincitoreNome: 'Lugdunum Allobroges',
    capocannoniereNome: 'Vercingetorix Avernus',
    golCapocannoniere: 19
  },
  {
    anno: 51,
    eraOlimpica: '182ª Olimpiade, anno 2',
    consolato: 'Sotto il consolato di Servio Sulpicio Rufo e Marco Claudio Marcello',
    competizione: 'Campionato Celtico',
    vincitoreNome: 'Lutetia Parisii',
    capocannoniereNome: 'Vercingetorix Avernus',
    golCapocannoniere: 22
  },
  {
    anno: 53,
    eraOlimpica: '181ª Olimpiade, anno 4',
    consolato: 'Sotto il consolato di Cneo Domizio Calvino e Marco Valerio Messalla Rufo',
    competizione: 'Lega Ellenica d’Oriente',
    vincitoreNome: 'Sparta Hoplitae',
    capocannoniereNome: 'Leonidas Herakleides',
    golCapocannoniere: 17
  },
  {
    anno: 52,
    eraOlimpica: '182ª Olimpiade, anno 1',
    consolato: 'Sotto il consolato di Cneo Pompeo Magno e Quinto Cecilio Metello Scipione',
    competizione: 'Lega Ellenica d’Oriente',
    vincitoreNome: 'Alexandria Phari',
    capocannoniereNome: 'Khaemwaset Pharaonicus',
    golCapocannoniere: 21
  },
  {
    anno: 53,
    eraOlimpica: '181ª Olimpiade, anno 4',
    consolato: 'Sotto il consolato di Cneo Domizio Calvino e Marco Valerio Messalla Rufo',
    competizione: 'Lega Punico-Iberica',
    vincitoreNome: 'Carthago Poeni',
    capocannoniereNome: 'Hamilcar Barca Minor',
    golCapocannoniere: 24
  }
];

export function recordSeasonWinner(
  career: CareerSave,
  competitionName: string,
  winnerClubName: string,
  topScorerName: string,
  goals: number
): CareerSave {
  const updated = { ...career };
  if (!updated.trofeiAlboDOro[competitionName]) {
    updated.trofeiAlboDOro[competitionName] = [];
  }
  updated.trofeiAlboDOro[competitionName].push({
    anno: career.currentYear,
    vincitoreNome: winnerClubName
  });
  return updated;
}
