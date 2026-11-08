import type { NewsItem } from '../types';
import { getRomanDateString, convertBCToOlympicEra, getSeasonPhase } from './calendarEngine';

export function createWeeklyWorldNews(
  matchday: number,
  yearBC: number,
  userClubName: string,
  topMatchResult?: string
): NewsItem[] {
  const items: NewsItem[] = [];
  const era = convertBCToOlympicEra(yearBC);
  const phase = getSeasonPhase(matchday);
  const dateFormatted = getRomanDateString(matchday, yearBC);

  const historicalEvents = [
    {
      titolo: `Dispacci da Ravenna: Giulio Cesare e la ${phase.phaseName}`,
      corpo: `Dalla Gallia Cisalpina giungono dispacci imperiali: Giulio Cesare passa in rassegna le legioni veterane, congratulandosi con i magistrati per l'ardore delle contese disputate nell'${era.displayText} sotto il consolato di ${era.consuls}.`,
      cat: 'IMPERO' as const
    },
    {
      titolo: `Il Senato di Roma delibera sulle arene per la ${phase.phaseName}`,
      corpo: `In occasione delle celebrazioni per i ${phase.romanFestival}, i magistrati curuli hanno sancito nuove norme per l'ordine pubblico nel Foro Boario e attorno al Circus Maximus in vista delle prossime sfide di campionato.`,
      cat: 'IMPERO' as const
    },
    {
      titolo: `Fervore panellenico nella ${phase.phaseName} dei Giochi`,
      corpo: `A Sparta, Atene e Corinto le scuole di atletica registrano il tutto esaurito. La gioventù dell'Ellade si addestra secondo i sacri canoni dell'Olimpismo per primeggiare nei ludi dell'${era.displayText}.`,
      cat: 'SOCIETA' as const
    },
    {
      titolo: `La flotta di Alessandria pronta per i tornei continentali`,
      corpo: `I Tolomei investono cento talenti d'argento per rinforzare i campioni del Faro. I mercanti fenici e punici riferiscono di trattative febbrile per accaparrarsi i migliori frombolieri dell'area di rigore.`,
      cat: 'MERCATO' as const
    }
  ];

  const chosenEvent = historicalEvents[(matchday - 1) % historicalEvents.length];
  items.push({
    id: `news_hist_${Date.now()}_${matchday}`,
    titolo: chosenEvent.titolo,
    corpo: chosenEvent.corpo,
    data: dateFormatted,
    categoria: chosenEvent.cat
  });

  if (topMatchResult) {
    items.push({
      id: `news_res_${Date.now()}_${matchday}`,
      titolo: `Resoconto ${matchday}ª Giornata: Battaglie nell'Arena (${phase.phaseName})`,
      corpo: `Oggi, nel corso dei ${phase.romanFestival} dell'${era.displayText}, si sono concluse le contese della ${matchday}ª giornata. ${topMatchResult}. Il pubblico acclama i vincitori e onora i caduti sportivi!`,
      data: dateFormatted,
      categoria: 'PARTITA',
      clubCoinvolti: [userClubName]
    });
  }

  return items;
}
