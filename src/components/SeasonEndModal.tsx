import React from 'react';
import type { Club } from '../types';
import type { SeasonEndReport } from '../engines/seasonEndEngine';
import { PYRAMID_LEAGUE_PAIRS } from '../engines/promotionRelegationEngine';
import { RetroButton } from './RetroButton';
import { AthleteJerseyBadge } from './AthleteJerseyBadge';
import { Trophy, Award, Sparkles, ArrowUpRight, ArrowDownRight, Users, ScrollText, X } from 'lucide-react';

interface SeasonEndModalProps {
  isOpen: boolean;
  report: SeasonEndReport | null;
  userClubId: string;
  clubs: Record<string, Club>;
  onClose: () => void;
}

export const SeasonEndModal: React.FC<SeasonEndModalProps> = ({
  isOpen,
  report,
  userClubId,
  clubs,
  onClose
}) => {
  if (!isOpen || !report) return null;

  const userSummary = report.userSummary;
  const userYouth = report.youthPromoted.filter(y => y.clubId === userClubId);
  const userRetired = report.retiredPlayers.filter(r => r.clubId === userClubId);

  const userPair = userSummary
    ? PYRAMID_LEAGUE_PAIRS.find(
        p => p.topLeagueId === userSummary.leagueId || p.subLeagueId === userSummary.leagueId
      )
    : undefined;

  const circuitMovements = userPair
    ? report.movements.filter(
        m =>
          m.fromLeagueId === userPair.topLeagueId ||
          m.fromLeagueId === userPair.subLeagueId ||
          m.toLeagueId === userPair.topLeagueId ||
          m.toLeagueId === userPair.subLeagueId
      )
    : report.movements.slice(0, 4);

  const totalPromotions = report.movements.filter(m => m.type === 'PROMOTION').length;
  const totalRelegations = report.movements.filter(m => m.type === 'RELEGATION').length;

  const outcomeConfig = (() => {
    switch (userSummary?.outcome) {
      case 'CHAMPION':
        return {
          headline: 'TRIONFO SENATORIO · CAMPIONE DELLA LEGA',
          accent: 'text-[#facc15]',
          border: 'border-[#facc15]',
          bg: 'bg-gradient-to-r from-[#422006]/80 via-[#6b161f]/90 to-[#422006]/80'
        };
      case 'PROMOTED':
        return {
          headline: 'ASCESA TRIONFALE · PROMOSSO IN PRIMA DIVISIO',
          accent: 'text-[#34d399]',
          border: 'border-[#10b981]',
          bg: 'bg-[#064e3b]/40'
        };
      case 'RELEGATED':
        return {
          headline: 'VERDETTO D’ARENA · RETROCESSIONE IN SECUNDA DIVISIO',
          accent: 'text-[#fca5a5]',
          border: 'border-[#ef4444]',
          bg: 'bg-[#450a0a]/60'
        };
      default:
        return {
          headline: 'STAGIONE CONCLUSA · PERMANENZA CONFERMATA',
          accent: 'text-[#fef08a]',
          border: 'border-[#d4af37]/60',
          bg: 'bg-[#2b080b]/80'
        };
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2.5 sm:p-4 backdrop-blur-xs">
      <div className="retro-box w-full max-w-5xl max-h-[94dvh] flex flex-col overflow-hidden shadow-2xl border-2 border-[#d4af37]">
        {/* Header */}
        <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-b border-[#731922] shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ScrollText size={18} className="text-[#d4af37] shrink-0" />
            <div className="min-w-0">
              <h2 className="font-roman text-sm sm:text-base font-bold text-[#facc15] tracking-wide truncate">
                FASTI CONSOLARI · CONCLUSIONE DELL’{report.eraDisplayText.toUpperCase()}
              </h2>
              <p className="text-[11px] text-[#cbd5e1] truncate">
                Prossimo ciclo: {report.nextEraDisplayText} · Consolato di {report.nextConsuls}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi Fasti Consolari"
            className="text-[#94a3b8] hover:text-white transition-colors cursor-pointer shrink-0 p-1"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3.5 sm:p-4 flex-1 min-h-0 overflow-y-auto space-y-3 text-xs">
          {/* User Club Verdict Banner */}
          {userSummary && (
            <div className={`p-3.5 rounded-xs border ${outcomeConfig.border} ${outcomeConfig.bg} flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}>
              <div className="space-y-1 min-w-0">
                <div className={`font-roman text-xs font-black tracking-wider ${outcomeConfig.accent}`}>
                  {outcomeConfig.headline}
                </div>
                <div className="font-roman text-base font-bold text-white truncate">
                  {userSummary.clubNome} · {userSummary.leagueName}
                </div>
                <div className="text-[11px] text-[#e2e8f0] font-data tabular-nums flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <span>Posizione: <strong className="text-[#facc15]">{userSummary.posizione}° / {userSummary.totalTeams}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Punti: <strong className="text-white">{userSummary.punti} PT</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Mete: <strong>{userSummary.golFatti} fatte / {userSummary.golSubiti} subite</strong></span>
                  {userSummary.topScorer && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Miglior Cursore: <strong className="text-[#facc15]">{userSummary.topScorer.nome} {userSummary.topScorer.cognome} ({userSummary.topScorer.gol})</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-data tabular-nums border-t md:border-t-0 md:border-l border-[#d4af37]/30 pt-2 md:pt-0 md:pl-4">
                <div className="text-right">
                  <span className="text-[10px] font-roman text-[#cbd5e1] block">Premio Erario</span>
                  <span className={`text-sm font-black ${userSummary.prizeHS > 0 ? 'text-[#10b981]' : 'text-[#94a3b8]'}`}>
                    {userSummary.prizeHS > 0 ? `+${userSummary.prizeHS.toLocaleString()} HS` : '0 HS'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-roman text-[#cbd5e1] block">Reputazione</span>
                  <span className={`text-sm font-black ${userSummary.reputationDelta > 0 ? 'text-[#facc15]' : userSummary.reputationDelta < 0 ? 'text-[#f87171]' : 'text-[#94a3b8]'}`}>
                    {userSummary.reputationDelta > 0 ? `+${userSummary.reputationDelta}` : userSummary.reputationDelta} pt
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Imperial Golden Boot Line */}
          {report.capocannoniereImperiale && (
            <div className="retro-inset px-3 py-2 border border-[#521016] flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="font-roman font-bold text-[#d4af37] flex items-center gap-1.5">
                <Award size={14} />
                ALLORO DEI MARCATORI IMPERIALI
              </span>
              <span className="text-white font-sans">
                <strong>{report.capocannoniereImperiale.nome} {report.capocannoniereImperiale.cognome}</strong>
                <span className="text-[#94a3b8]"> · {report.capocannoniereImperiale.clubNome} · </span>
                <strong className="text-[#facc15] font-data tabular-nums">{report.capocannoniereImperiale.gol} mete</strong>
              </span>
            </div>
          )}

          {/* 3-Column Fasti Consolari Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
            {/* Column 1: Pyramid Promotions & Relegations */}
            <div className="retro-inset p-3 border border-[#521016] flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#420d11] pb-1.5">
                <h3 className="font-roman text-xs font-bold text-[#d4af37]">
                  {userPair ? userPair.name : 'Circuito Piramidale'}
                </h3>
                <span className="text-[10px] font-data tabular-nums text-[#94a3b8]">
                  {totalPromotions} prom. / {totalRelegations} retr.
                </span>
              </div>

              <div className="space-y-1.5 flex-1">
                {circuitMovements.length > 0 ? (
                  circuitMovements.map(mv => {
                    const isPromo = mv.type === 'PROMOTION';
                    const isUser = mv.clubId === userClubId;
                    return (
                      <div
                        key={`${mv.clubId}_${mv.type}`}
                        className={`p-2 rounded-xs border text-[11px] flex items-center justify-between gap-2 ${
                          isUser
                            ? 'bg-[#4d0f15] border-[#d4af37]'
                            : 'bg-[#140203] border-[#3d0b10]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate flex items-center gap-1">
                            {isPromo ? (
                              <ArrowUpRight size={13} className="text-[#10b981] shrink-0" />
                            ) : (
                              <ArrowDownRight size={13} className="text-[#ef4444] shrink-0" />
                            )}
                            <span className="truncate">{mv.clubNome}</span>
                          </div>
                          <div className="text-[10px] text-[#94a3b8] truncate">
                            {isPromo ? `Promosso in ${mv.toLeagueName}` : `Retrocesso in ${mv.toLeagueName}`}
                          </div>
                        </div>
                        <span className={`font-data tabular-nums text-[10px] font-bold shrink-0 ${isPromo ? 'text-[#10b981]' : 'text-[#f87171]'}`}>
                          {mv.pos}°
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-[#94a3b8] py-2">
                    Nessun movimento registrato nel circuito.
                  </p>
                )}
              </div>
            </div>

            {/* Column 2: Youth Academy & Retirements */}
            <div className="retro-inset p-3 border border-[#521016] flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#420d11] pb-1.5">
                <h3 className="font-roman text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Accademia &amp; Congedi</span>
                </h3>
                <span className="text-[10px] font-data tabular-nums text-[#94a3b8]">
                  {report.youthPromoted.length} leve / {report.retiredPlayers.length} ritiri
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <div>
                  <div className="text-[10px] font-roman text-[#10b981] font-bold mb-1">
                    NUOVE LEVE DELLA TUA ACCADEMIA ({userYouth.length})
                  </div>
                  {userYouth.length > 0 ? (
                    <div className="space-y-1">
                      {userYouth.map(y => (
                        <div key={y.playerId} className="p-2 bg-[#140203] border border-[#065f46] rounded-xs flex items-center justify-between gap-2 text-[11px]">
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate">{y.nome} {y.cognome}</div>
                            <div className="text-[10px] text-[#94a3b8]">{y.eta} anni</div>
                          </div>
                          <div className="font-data tabular-nums text-right shrink-0">
                            <span className="text-[#facc15] font-bold">{y.ovr} OVR</span>
                            <span className="text-[#34d399] block text-[10px]">POT {y.pot}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#94a3b8]">Nessun nuovo innesto assegnato.</p>
                  )}
                </div>

                <div className="pt-1 border-t border-[#420d11]">
                  <div className="text-[10px] font-roman text-[#f87171] font-bold mb-1 flex items-center gap-1">
                    <Users size={11} />
                    <span>VETERANI RITIRATI DALLA COORTE ({userRetired.length})</span>
                  </div>
                  {userRetired.length > 0 ? (
                    <div className="space-y-1">
                      {userRetired.map(r => (
                        <div key={r.playerId} className="p-1.5 bg-[#140203] border border-[#3d0b10] rounded-xs flex items-center justify-between text-[11px]">
                          <span className="text-[#e2e8f0] truncate">{r.nome} {r.cognome}</span>
                          <span className="text-[#94a3b8] font-data tabular-nums text-[10px] shrink-0">
                            {r.eta} anni · {r.presenzeTotali} pres.
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#94a3b8]">
                      Nessun atleta della tua coorte ha deposto i calzari quest'anno.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: Crowned Champions across the Ancient World */}
            <div className="retro-inset p-3 border border-[#521016] flex flex-col gap-2 min-h-0">
              <div className="flex items-center justify-between border-b border-[#420d11] pb-1.5 shrink-0">
                <h3 className="font-roman text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                  <Trophy size={13} />
                  <span>Campioni delle Leghe</span>
                </h3>
                <span className="text-[10px] font-data tabular-nums text-[#94a3b8]">
                  {report.leagueChampions.length} leghe
                </span>
              </div>

              <div className="space-y-1 max-h-[210px] overflow-y-auto pr-1">
                {report.leagueChampions.map(ch => {
                  const club = clubs[ch.championClubId];
                  const isUser = ch.championClubId === userClubId;
                  return (
                    <div
                      key={ch.leagueId}
                      className={`px-2 py-1.5 rounded-xs border flex items-center justify-between gap-2 text-[11px] ${
                        isUser ? 'bg-[#4d0f15] border-[#facc15]' : 'bg-[#140203] border-[#3d0b10]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {club?.colori && (
                          <AthleteJerseyBadge
                            primary={club.colori.primary}
                            secondary={club.colori.secondary}
                            outline={club.colori.text}
                            size="xs"
                          />
                        )}
                        <div className="min-w-0">
                          <div className={`font-semibold truncate ${isUser ? 'text-[#facc15]' : 'text-white'}`}>
                            {ch.championClubNome}
                          </div>
                          <div className="text-[9px] text-[#94a3b8] truncate">{ch.leagueName}</div>
                        </div>
                      </div>
                      <Trophy size={12} className="text-[#d4af37] shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-t border-[#731922] shrink-0 gap-3">
          <span className="text-[11px] text-[#cbd5e1] font-roman truncate">
            Albo d’Oro ratificato e calendari della nuova stagione generati.
          </span>
          <RetroButton
            variant="gold"
            size="sm"
            onClick={onClose}
            className="whitespace-nowrap shrink-0 font-bold"
          >
            Inizia {report.nextEraDisplayText} &rarr;
          </RetroButton>
        </div>
      </div>
    </div>
  );
};
