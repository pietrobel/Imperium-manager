import React, { useState } from 'react';
import type { CareerSave, Player } from '../types';
import { RetroButton } from '../components/RetroButton';
import { calculateLeagueTable } from '../engines/leagueEngine';
import { computeTribuneFavor } from '../engines/economyEngine';
import { Calendar, Users, Trophy, Newspaper, ArrowRight, Shield, Coins } from 'lucide-react';
import type { ScreenId } from '../components/RetroTopNav';
import { getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import { resolveMatchKits } from '../engines/kitColorEngine';
import { AthleteJerseyBadge } from '../components/AthleteJerseyBadge';
import { TacticalSlate } from '../components/TacticalSlate';

interface ManagerDashboardScreenProps {
  career: CareerSave;
  onNavigate: (screen: ScreenId) => void;
  onSelectPlayer: (player: Player) => void;
  onAdvanceDay: () => void;
  onSwapStarters?: (newStartersIds: string[]) => void;
  onOpenErarioModal?: () => void;
}

/**
 * TABULARIUM IMPERIALE
 * Cruscotto 16:9 a schermata singola senza scorrimento esterno di pagina.
 */
export const ManagerDashboardScreen: React.FC<ManagerDashboardScreenProps> = ({
  career,
  onNavigate,
  onSelectPlayer,
  onAdvanceDay,
  onSwapStarters,
  onOpenErarioModal
}) => {
  const [rightPanelTab, setRightPanelTab] = useState<'CLASSIFICA' | 'ATLETI' | 'GAZZETTA'>('CLASSIFICA');

  const userClub = career.clubs[career.userClubId];
  const userPlayers = Object.values(career.players).filter(p => p.clubId === career.userClubId);
  const tribuneFavor = computeTribuneFavor(career);
  const expiringContractsCount = userPlayers.filter(p => p.contratto.annoScadenza <= career.currentYear + 1).length;
  const league = career.leagues[userClub?.leagueId || 'league_romana'];

  const table = calculateLeagueTable(league.id, career.clubs, career.matches);
  const userPosition = table.findIndex(r => r.clubId === career.userClubId) + 1;
  const userRow = table.find(r => r.clubId === career.userClubId);

  const nextMatch = career.matches.find(
    m => !m.disputata && (m.clubCasaId === career.userClubId || m.clubOspiteId === career.userClubId)
  );

  const isHome = nextMatch?.clubCasaId === career.userClubId;
  const opponentId = isHome ? nextMatch?.clubOspiteId : nextMatch?.clubCasaId;
  const opponent = opponentId ? career.clubs[opponentId] : null;

  const avgCondition = Math.round(
    userPlayers.reduce((sum, p) => sum + p.condizione, 0) / (userPlayers.length || 1)
  );

  const keyPlayers = [...userPlayers]
    .sort((a, b) => b.valoreGenerale - a.valoreGenerale)
    .slice(0, 8);

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0 overflow-hidden">
      {/* Top Command Row: Prossimo Agone (8 col) + Tribuna Magister (4 col) */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
        {/* Next Match & Club Bar */}
        <div className="md:col-span-8 retro-box px-3.5 py-2.5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between border-b border-[#731922] pb-1.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar size={14} className="text-[#d4af37] shrink-0" />
              <span className="font-roman text-xs font-bold tracking-wider text-[#d4af37] truncate">
                PROSSIMO AGONE · GIORNATA {career.currentMatchday}
              </span>
              <span className="text-[10px] text-[#cbd5e1] hidden sm:inline truncate">
                · {league?.nome}
              </span>
            </div>
            <span className="font-data text-[11px] text-[#facc15] shrink-0 whitespace-nowrap">
              {career.currentDateText}
            </span>
          </div>

          {nextMatch && opponent ? (() => {
            const homePreviewClub = isHome ? userClub : opponent;
            const awayPreviewClub = isHome ? opponent : userClub;
            const kitsPreview = resolveMatchKits(homePreviewClub, awayPreviewClub);
            return (
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <AthleteJerseyBadge
                    primary={kitsPreview.homeKit.primary}
                    secondary={kitsPreview.homeKit.secondary}
                    outline={kitsPreview.homeKit.outline}
                    size="sm"
                    title={`Divisa ${homePreviewClub.nome}`}
                  />
                  <div className="min-w-0">
                    <div className="font-roman text-sm font-bold text-white truncate">
                      {homePreviewClub.nome}
                    </div>
                    <div className="text-[10px] text-[#facc15] font-data truncate">
                      Casa · {homePreviewClub.stadioNome}
                    </div>
                  </div>
                </div>

                <div className="px-2.5 py-1 bg-[#2b080b] border border-[#d4af37] rounded-xs text-center shrink-0">
                  <span className="text-xs font-black text-[#d4af37] font-roman">VS</span>
                  <div className="text-[9px] text-[#cbd5e1] font-data leading-none">
                    {isHome ? 'IN CASA' : 'TRASFERTA'}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-end gap-2 text-right min-w-0">
                  <div className="min-w-0">
                    <div className="font-roman text-sm font-bold text-white truncate">
                      {awayPreviewClub.nome}
                    </div>
                    <div className={`text-[10px] truncate ${kitsPreview.awayKit.isReserveKit ? 'text-[#facc15]' : 'text-[#cbd5e1]'}`}>
                      {awayPreviewClub.citta} · {kitsPreview.awayKit.kitLabel}
                    </div>
                  </div>
                  <AthleteJerseyBadge
                    primary={kitsPreview.awayKit.primary}
                    secondary={kitsPreview.awayKit.secondary}
                    outline={kitsPreview.awayKit.outline}
                    size="sm"
                    title={`Divisa ${awayPreviewClub.nome}`}
                  />
                </div>
              </div>
            );
          })() : (
            <div className="py-1 text-center text-[#cbd5e1] italic text-xs">
              Stagione terminata o turno in preparazione.
            </div>
          )}

          <div className="pt-1.5 border-t border-[#731922] flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[#cbd5e1] truncate">
              Tattica: <strong className="text-[#facc15] font-data">{userClub.formazioneTattica}</strong> · Condizione media <strong className="text-[#10b981] font-data">{avgCondition}%</strong>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <RetroButton variant="secondary" size="sm" onClick={() => onNavigate('SQUAD')} className="whitespace-nowrap">
                Coorte
              </RetroButton>
              <RetroButton variant="crimson" size="sm" onClick={onAdvanceDay} className="whitespace-nowrap">
                Disputa Agone &rarr;
              </RetroButton>
            </div>
          </div>
        </div>

        {/* Manager Dossier & Erario */}
        <div className="md:col-span-4 retro-box px-3.5 py-2.5 flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between border-b border-[#731922] pb-1.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Shield size={14} className="text-[#d4af37] shrink-0" />
              <span className="font-roman text-xs font-bold text-white truncate">
                {career.manager.nome} {career.manager.cognome}
              </span>
            </div>
            <span className="text-[10px] text-[#facc15] font-data font-bold shrink-0">
              {career.manager.puntiReputazione} pt
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 retro-inset p-1.5 text-center font-data">
            <div>
              <span className="text-[9px] text-[#94a3b8] block">V</span>
              <span className="text-xs font-bold text-[#10b981]">{career.manager.vittorie}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#94a3b8] block">P</span>
              <span className="text-xs font-bold text-[#facc15]">{career.manager.pareggi}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#94a3b8] block">S</span>
              <span className="text-xs font-bold text-[#f87171]">{career.manager.sconfitte}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#94a3b8] block">POS</span>
              <span className="text-xs font-bold text-white">{userPosition}°</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="text-[#cbd5e1] truncate">
              Tribuni: <strong className="text-[#facc15]">{tribuneFavor.label} ({tribuneFavor.percentage}%)</strong>
            </span>
            {onOpenErarioModal && (
              <RetroButton
                variant="gold"
                size="sm"
                onClick={onOpenErarioModal}
                className="flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 whitespace-nowrap shrink-0"
              >
                <Coins size={12} />
                <span>
                  Erario{expiringContractsCount > 0 ? ` (${expiringContractsCount})` : ''}
                </span>
              </RetroButton>
            )}
          </div>
        </div>
      </div>

      {/* Main 16:9 Workspace: Tactical Slate (Left 7 cols) + Tabbed League/Squad/News Panel (Right 5 cols) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
        <div className="md:col-span-7 h-full min-h-0">
          {userClub && (
            <TacticalSlate
              compact
              userClub={userClub}
              squad={userPlayers}
              onSwapStarters={onSwapStarters}
              onSelectPlayer={onSelectPlayer}
            />
          )}
        </div>

        {/* Right Intelligence & Standings Panel */}
        <div className="md:col-span-5 h-full min-h-0 retro-box p-2.5 flex flex-col overflow-hidden">
          {/* Sub-navigation Tabs */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#731922] shrink-0">
            <div className="flex items-center bg-[#2b080b] p-0.5 border border-[#521016] rounded-xs text-[11px] font-roman">
              <button
                type="button"
                onClick={() => setRightPanelTab('CLASSIFICA')}
                className={`px-2.5 py-1 rounded-xs flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                  rightPanelTab === 'CLASSIFICA' ? 'bg-[#6b161f] text-[#facc15] font-bold' : 'text-[#cbd5e1] hover:text-white'
                }`}
              >
                <Trophy size={12} />
                <span>Classifica</span>
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('ATLETI')}
                className={`px-2.5 py-1 rounded-xs flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                  rightPanelTab === 'ATLETI' ? 'bg-[#6b161f] text-[#facc15] font-bold' : 'text-[#cbd5e1] hover:text-white'
                }`}
              >
                <Users size={12} />
                <span>Atleti d'Elite</span>
              </button>
              <button
                type="button"
                onClick={() => setRightPanelTab('GAZZETTA')}
                className={`px-2.5 py-1 rounded-xs flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                  rightPanelTab === 'GAZZETTA' ? 'bg-[#6b161f] text-[#facc15] font-bold' : 'text-[#cbd5e1] hover:text-white'
                }`}
              >
                <Newspaper size={12} />
                <span>Gazzetta</span>
              </button>
            </div>

            {rightPanelTab === 'CLASSIFICA' && (
              <button
                type="button"
                onClick={() => onNavigate('LEAGUE')}
                className="text-[10px] text-[#facc15] hover:underline flex items-center gap-0.5 cursor-pointer font-roman whitespace-nowrap"
              >
                <span>Dettagli</span>
                <ArrowRight size={11} />
              </button>
            )}
            {rightPanelTab === 'ATLETI' && (
              <button
                type="button"
                onClick={() => onNavigate('SQUAD')}
                className="text-[10px] text-[#facc15] hover:underline flex items-center gap-0.5 cursor-pointer font-roman whitespace-nowrap"
              >
                <span>Rosa ({userPlayers.length})</span>
                <ArrowRight size={11} />
              </button>
            )}
          </div>

          {/* Active Tab Content (Internal scroll if needed) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
            {rightPanelTab === 'CLASSIFICA' && (
              <div className="space-y-0.5 font-data text-[11px]">
                <div className="grid grid-cols-12 text-[10px] text-[#cbd5e1] pb-1 border-b border-[#731922] px-1 font-semibold sticky top-0 bg-[#3d0c10]">
                  <span className="col-span-1">#</span>
                  <span className="col-span-6 font-roman">Sodalizio</span>
                  <span className="col-span-1 text-center">PG</span>
                  <span className="col-span-2 text-center">DM</span>
                  <span className="col-span-2 text-right">PT</span>
                </div>
                {table.map((row, idx) => {
                  const isUser = row.clubId === career.userClubId;
                  const c = career.clubs[row.clubId];
                  return (
                    <div
                      key={row.clubId}
                      className={`grid grid-cols-12 py-1 px-1 rounded-xs items-center ${
                        isUser ? 'bg-[#6b161f] text-[#facc15] font-bold' : 'text-[#e2e8f0] hover:bg-[#4c1016]'
                      }`}
                    >
                      <span className="col-span-1 text-[10px] text-[#cbd5e1]">{idx + 1}</span>
                      <div className="col-span-6 flex items-center gap-1.5 min-w-0 pr-1">
                        {c?.colori && (
                          <AthleteJerseyBadge
                            primary={c.colori.primary}
                            secondary={c.colori.secondary}
                            outline={c.colori.text}
                            size="xs"
                          />
                        )}
                        <span className="font-roman truncate text-[11px]">{row.clubNome}</span>
                      </div>
                      <span className="col-span-1 text-center">{row.partiteGiocate}</span>
                      <span className="col-span-2 text-center">
                        {row.differenzaReti > 0 ? `+${row.differenzaReti}` : row.differenzaReti}
                      </span>
                      <span className="col-span-2 text-right font-bold text-white">{row.punti}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {rightPanelTab === 'ATLETI' && (
              <div className="space-y-1.5 text-xs">
                {keyPlayers.map(p => {
                  const badge = getHarpastumRoleBadgeStyle(p.ruoloPrimario);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="w-full text-left p-2 retro-inset hover:bg-[#3d0b10] transition-colors flex items-center justify-between group cursor-pointer border border-[#4d0f15]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-xs font-roman shrink-0 ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <span className="font-medium text-white group-hover:text-[#facc15] truncate">
                          {p.nome} {p.cognome}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 font-data text-[11px] shrink-0">
                        <span className="text-[#10b981]">{p.condizione}%</span>
                        <span className="font-bold text-[#d4af37]">{p.valoreGenerale} OVR</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {rightPanelTab === 'GAZZETTA' && (
              <div className="space-y-2 text-xs">
                {career.news.slice(0, 6).map(item => (
                  <div key={item.id} className="p-2 retro-inset border border-[#521016]">
                    <div className="flex items-center justify-between text-[10px] text-[#cbd5e1] mb-0.5 font-data">
                      <span className="text-[#facc15] font-semibold">{item.categoria}</span>
                      <span>{item.data}</span>
                    </div>
                    <h4 className="font-semibold text-white mb-0.5 font-roman text-[11px]">
                      {item.titolo}
                    </h4>
                    <p className="text-[11px] text-[#cbd5e1] leading-snug line-clamp-2">
                      {item.corpo}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="mt-2 pt-1.5 border-t border-[#731922] text-[10px] text-[#cbd5e1] flex justify-between shrink-0 font-roman">
            <span>Posizione: <strong className="text-[#facc15]">{userPosition}° / {table.length}</strong></span>
            <span>Punti: <strong className="text-white font-data">{userRow?.punti || 0} PT</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
