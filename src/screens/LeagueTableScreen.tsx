import React, { useState } from 'react';
import type { CareerSave, Player } from '../types';
import { calculateLeagueTable } from '../engines/leagueEngine';
import { PYRAMID_LEAGUE_PAIRS } from '../engines/promotionRelegationEngine';
import { Trophy, Award, ArrowUpCircle, ArrowDownCircle, ShieldCheck, Layers } from 'lucide-react';

interface LeagueTableScreenProps {
  career: CareerSave;
  onSelectPlayer: (player: Player) => void;
}

export const LeagueTableScreen: React.FC<LeagueTableScreenProps> = ({
  career,
  onSelectPlayer
}) => {
  const userClub = career.clubs[career.userClubId];
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(
    userClub?.leagueId || 'league_romana'
  );
  const [showPyramidView, setShowPyramidView] = useState<boolean>(false);

  const leagues = Object.values(career.leagues);
  const currentLeague = career.leagues[selectedLeagueId];
  const table = calculateLeagueTable(selectedLeagueId, career.clubs, career.matches);

  // Find linked pyramid circuit pair
  const pyramidPair = PYRAMID_LEAGUE_PAIRS.find(
    p => p.topLeagueId === selectedLeagueId || p.subLeagueId === selectedLeagueId
  );
  const isTopTier = pyramidPair?.topLeagueId === selectedLeagueId;
  const linkedLeagueId = isTopTier ? pyramidPair?.subLeagueId : pyramidPair?.topLeagueId;
  const linkedLeague = linkedLeagueId ? career.leagues[linkedLeagueId] : null;

  // Top scorers in this league
  const leagueClubIds = new Set(currentLeague?.clubIds || []);
  const leaguePlayers = Object.values(career.players).filter(p => leagueClubIds.has(p.clubId));
  const topScorers = [...leaguePlayers]
    .filter(p => p.statisticheStagione.gol > 0)
    .sort((a, b) => b.statisticheStagione.gol - a.statisticheStagione.gol)
    .slice(0, 10);

  return (
    <div className="space-y-4">
      {/* League Selection Header */}
      <div className="retro-box p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-[#d4af37]">
        <div className="flex items-center gap-3">
          <Trophy size={18} className="text-[#d4af37]" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-roman text-xs font-bold text-[#d4af37]">CAMPIONATO:</span>
              <select
                value={selectedLeagueId}
                onChange={e => setSelectedLeagueId(e.target.value)}
                className="bg-[#2b080b] border border-[#521016] text-[#f8fafc] text-xs font-roman font-bold px-3 py-1 rounded-xs focus:border-[#d4af37] outline-none cursor-pointer"
              >
                {leagues.map(l => {
                  const pair = PYRAMID_LEAGUE_PAIRS.find(p => p.topLeagueId === l.id || p.subLeagueId === l.id);
                  const isL1 = pair?.topLeagueId === l.id;
                  return (
                    <option key={l.id} value={l.id}>
                      {l.nome} ({isL1 ? 'Prima Divisio · L1' : 'Secunda Divisio · L2'}) — {l.regione}
                    </option>
                  );
                })}
              </select>

              <span className={`px-2 py-0.5 text-[10px] font-roman font-bold rounded-xs border ${
                isTopTier
                  ? 'bg-[#ca8a04] text-[#fef08a] border-[#eab308]'
                  : 'bg-[#2563eb] text-[#bfdbfe] border-[#3b82f6]'
              }`}>
                {isTopTier ? 'PRIMA DIVISIO (LIVELLO 1)' : 'SECUNDA DIVISIO (LIVELLO 2 - CADETTA)'}
              </span>
            </div>

            {currentLeague && (
              <span className="text-[10px] text-[#cbd5e1] italic block mt-0.5 font-roman">
                {currentLeague.nomeLatino} · Capitale: {currentLeague.paeseCapitale || currentLeague.regione} · Reputazione: {currentLeague.reputazione} pt
              </span>
            )}
          </div>
        </div>

        {/* Linked Pyramid Circuit Quick Switch */}
        {linkedLeague && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLeagueId(linkedLeague.id)}
              className="px-2.5 py-1 text-xs font-roman font-bold rounded-xs bg-[#420d11] hover:bg-[#6b161f] text-[#facc15] border border-[#731922] cursor-pointer transition-colors flex items-center gap-1.5 shadow"
            >
              <Layers size={13} />
              <span>
                {isTopTier ? `Vai alla Cadetta (${linkedLeague.nome})` : `Vai alla Prima (${linkedLeague.nome})`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Circuit Info Banner */}
      {pyramidPair && (
        <div className="retro-inset p-2.5 border border-[#521016] flex items-center justify-between text-xs text-[#cbd5e1]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#facc15]" />
            <span className="font-roman text-[11px]">
              Circuito Territoriale: <strong className="text-white">{pyramidPair.name}</strong> · Scambio annuale: <strong>2 Squadre</strong>
            </span>
          </div>
          <span className="text-[10px] font-roman text-[#facc15]">
            {isTopTier ? 'Ultime 2 retrocedono nella Secunda Divisio' : 'Prime 2 vengono promosse nella Prima Divisio'}
          </span>
        </div>
      )}

      {/* Main Table and Side Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* League Table Standings (3 Cols) */}
        <div className="lg:col-span-3 retro-box overflow-hidden">
          <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-b border-[#731922]">
            <h2 className="font-roman text-xs font-bold text-white tracking-wide flex items-center gap-2">
              <Trophy size={14} className="text-[#d4af37]" />
              <span>TAVOLA UFFICIALE · {currentLeague?.nome.toUpperCase()}</span>
            </h2>
            <span className="text-xs font-data text-[#cbd5e1]">
              15 Squadre · 30 Giornate
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[10px] text-[#cbd5e1] uppercase font-roman border-b border-[#521016] bg-[#2b080b]">
                  <th className="py-2 px-3 w-8 text-center">POS</th>
                  <th className="py-2 px-3">SQUADRA D'HARPASTUM</th>
                  <th className="py-2 px-2 text-center">PG</th>
                  <th className="py-2 px-2 text-center">V</th>
                  <th className="py-2 px-2 text-center">P</th>
                  <th className="py-2 px-2 text-center">S</th>
                  <th className="py-2 px-2 text-center">METE F.</th>
                  <th className="py-2 px-2 text-center">METE S.</th>
                  <th className="py-2 px-2 text-center">DM</th>
                  <th className="py-2 px-3 text-center font-bold">PT</th>
                  <th className="py-2 px-3 text-center">FORMA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#420d11] font-data text-xs">
                {table.map((row, idx) => {
                  const isUser = row.clubId === career.userClubId;
                  const isChampions = isTopTier && idx < (currentLeague?.qualificazioniCoppe || 2);
                  const isPromotion = !isTopTier && idx < (currentLeague?.promozioni || 2);
                  const isRelegation = isTopTier && idx >= table.length - (currentLeague?.retrocessioni || 2);

                  return (
                    <tr
                      key={row.clubId}
                      className={`hover:bg-[#3d0b10] transition-colors ${
                        isUser ? 'bg-[#6b161f] font-bold text-[#facc15]' : 'text-[#cbd5e1]'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-xs text-[10px] font-bold ${
                            isChampions
                              ? 'bg-[#854d0e] text-[#fef08a] border border-[#eab308]'
                              : isPromotion
                              ? 'bg-[#15803d] text-[#bbf7d0] border border-[#22c55e]'
                              : isRelegation
                              ? 'bg-[#7f1d1d] text-[#fecaca] border border-[#ef4444]'
                              : 'text-[#94a3b8]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <span>{row.clubNome}</span>
                          {isUser && <span className="text-[10px] text-[#facc15] font-roman">(Tua Fazione)</span>}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">{row.partiteGiocate}</td>
                      <td className="py-2.5 px-2 text-center text-[#10b981]">{row.vittorie}</td>
                      <td className="py-2.5 px-2 text-center text-[#cbd5e1]">{row.pareggi}</td>
                      <td className="py-2.5 px-2 text-center text-[#ef4444]">{row.sconfitte}</td>
                      <td className="py-2.5 px-2 text-center text-white">{row.golFatti}</td>
                      <td className="py-2.5 px-2 text-center text-[#94a3b8]">{row.golSubiti}</td>
                      <td className="py-2.5 px-2 text-center font-semibold">
                        {row.differenzaReti > 0 ? `+${row.differenzaReti}` : row.differenzaReti}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-sm text-[#facc15]">
                        {row.punti}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {row.forma.map((res, i) => (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded-xs text-[9px] font-bold flex items-center justify-center ${
                                res === 'V'
                                  ? 'bg-[#065f46] text-[#a7f3d0]'
                                  : res === 'P'
                                  ? 'bg-[#334155] text-[#cbd5e1]'
                                  : 'bg-[#991b1b] text-[#fecaca]'
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                          {row.forma.length === 0 && <span className="text-[#64748b]">-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legenda Zone Classifica */}
          <div className="p-3 bg-[#240507] border-t border-[#731922] flex flex-wrap items-center justify-between text-[11px] text-[#cbd5e1] gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {isTopTier ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#854d0e] border border-[#eab308] rounded-xs inline-block" />
                    <span>Qualificazione Munus Caesarum (1°-2°)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#fca5a5]">
                    <ArrowDownCircle size={13} className="text-[#ef4444]" />
                    <span>Retrocessione in Secunda Divisio (14°-15°)</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-[#86efac]">
                    <ArrowUpCircle size={13} className="text-[#22c55e]" />
                    <span>Promozione in Prima Divisio (1°-2°)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#334155] rounded-xs inline-block" />
                    <span>Permanenza nella Lega Cadetta (3°-15°)</span>
                  </span>
                </>
              )}
            </div>
            <span className="font-roman text-[10px] text-[#facc15]">Fasti Consolari ratificati dal Senato</span>
          </div>
        </div>

        {/* Top Scorer Leaderboard (1 Col) */}
        <div className="retro-box p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 pb-2 border-b border-[#731922] mb-3">
              <Award size={14} className="text-[#d4af37]" />
              <h3 className="font-roman text-xs font-bold text-[#d4af37]">
                MIGLIORI MARCATORI DI META
              </h3>
            </div>

            <div className="space-y-1.5 font-data text-xs max-h-[400px] overflow-y-auto pr-1">
              {topScorers.map((p, idx) => {
                const club = career.clubs[p.clubId];
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlayer(p)}
                    className="w-full text-left p-1.5 retro-inset hover:bg-[#3d0b10] transition-colors flex items-center justify-between group cursor-pointer border border-[#420d11]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#cbd5e1] w-4 font-bold">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-white group-hover:text-[#facc15]">
                          {p.nome} {p.cognome}
                        </div>
                        <div className="text-[9px] text-[#94a3b8] font-roman truncate max-w-[120px]">
                          {club?.sigla} · {p.nazionalita}
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-sm text-[#facc15] font-data">
                      {p.statisticheStagione.gol}
                    </span>
                  </button>
                );
              })}
              {topScorers.length === 0 && (
                <div className="text-center py-8 text-[#94a3b8] italic">
                  Nessuna meta registrata in questo campionato.
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#731922] text-[10px] text-[#cbd5e1] text-center font-roman">
            L'Alloro del Capocannoniere viene assegnato alle Idi d'Estate
          </div>
        </div>
      </div>
    </div>
  );
};
