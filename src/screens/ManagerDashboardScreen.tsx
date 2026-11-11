import React from 'react';
import type { CareerSave, Player } from '../types';
import { RetroButton } from '../components/RetroButton';
import { calculateLeagueTable } from '../engines/leagueEngine';
import { Calendar, Users, Trophy, Newspaper, ArrowRight, Shield } from 'lucide-react';
import type { ScreenId } from '../components/RetroTopNav';
import { getHarpastumRole, getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import { TacticalSlate } from '../components/TacticalSlate';

interface ManagerDashboardScreenProps {
  career: CareerSave;
  onNavigate: (screen: ScreenId) => void;
  onSelectPlayer: (player: Player) => void;
  onAdvanceDay: () => void;
}

/**
 * TABULARIUM IMPERIALE (Ex Dashboard)
 * Schermata di comando generale in stile Rosso Pompeiano con iscrizioni in Oro e Argento.
 */
export const ManagerDashboardScreen: React.FC<ManagerDashboardScreenProps> = ({
  career,
  onNavigate,
  onSelectPlayer,
  onAdvanceDay
}) => {
  const userClub = career.clubs[career.userClubId];
  const userPlayers = Object.values(career.players).filter(p => p.clubId === career.userClubId);
  const league = career.leagues[userClub?.leagueId || 'league_romana'];

  // Current League Table
  const table = calculateLeagueTable(league.id, career.clubs, career.matches);
  const userPosition = table.findIndex(r => r.clubId === career.userClubId) + 1;
  const userRow = table.find(r => r.clubId === career.userClubId);

  // Next fixture
  const nextMatch = career.matches.find(
    m => !m.disputata && (m.clubCasaId === career.userClubId || m.clubOspiteId === career.userClubId)
  );

  const isHome = nextMatch?.clubCasaId === career.userClubId;
  const opponentId = isHome ? nextMatch?.clubOspiteId : nextMatch?.clubCasaId;
  const opponent = opponentId ? career.clubs[opponentId] : null;

  // Squad condition
  const avgCondition = Math.round(
    userPlayers.reduce((sum, p) => sum + p.condizione, 0) / (userPlayers.length || 1)
  );

  // Top players
  const keyPlayers = [...userPlayers]
    .sort((a, b) => b.valoreGenerale - a.valoreGenerale)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Intestazione del Tabularium */}
      <div className="retro-box p-3 border-l-4 border-l-[#d4af37] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#66151d] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="font-roman text-base font-black tracking-widest text-[#d4af37] drop-shadow-sm">
              TABULARIUM IMPERIALE · QUADRO DI COMANDO
            </h1>
            <span className="text-[11px] text-[#cbd5e1] font-roman">
              Sede Magistrale di <strong className="text-white">{userClub?.nome}</strong> · {league?.nome}
            </span>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[10px] text-[#cbd5e1] block uppercase font-roman">Consolato & Fasti</span>
          <span className="font-data text-xs text-[#facc15] font-semibold">{career.currentDateText}</span>
        </div>
      </div>

      {/* Top Banner / Match Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Next Match Card */}
        <div className="lg:col-span-2 retro-box p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#731922] mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-[#d4af37]" />
                <span className="font-roman text-xs font-bold tracking-wider text-[#d4af37]">
                  PROSSIMO AGONE D'HARPASTUM · GIORNATA {career.currentMatchday}
                </span>
              </div>
              <span className="font-data text-[11px] text-[#cbd5e1]">
                {career.currentDateText}
              </span>
            </div>

            {nextMatch && opponent ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="text-center sm:text-left flex-1">
                  <div className="text-[10px] text-[#cbd5e1] uppercase font-roman">Fazione di Casa</div>
                  <div className="font-roman text-base font-bold text-white drop-shadow-xs">
                    {isHome ? userClub.nome : opponent.nome}
                  </div>
                  <div className="text-[11px] text-[#facc15] font-data">
                    {isHome ? userClub.stadioNome : opponent.stadioNome}
                  </div>
                </div>

                <div className="px-4 py-2 bg-[#2b080b] border-2 border-[#d4af37] rounded-xs text-center shadow">
                  <span className="text-sm font-black text-[#d4af37] font-roman">AGONE</span>
                  <div className="text-[10px] text-[#cbd5e1] font-data mt-0.5">
                    {isHome ? 'IN ARENA PROPRIA' : 'IN ARENA ESTERNA'}
                  </div>
                </div>

                <div className="text-center sm:text-right flex-1">
                  <div className="text-[10px] text-[#cbd5e1] uppercase font-roman">Fazione Sfidante</div>
                  <div className="font-roman text-base font-bold text-white drop-shadow-xs">
                    {isHome ? opponent.nome : userClub.nome}
                  </div>
                  <div className="text-[11px] text-[#cbd5e1]">{opponent.citta}</div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-[#cbd5e1] italic">
                Nessun incontro programmato per questo turno o stagione conclusa.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#731922] flex items-center justify-between">
            <span className="text-[11px] text-[#cbd5e1]">
              Disposizione coorte: <strong className="text-[#facc15] font-data">{userClub.formazioneTattica}</strong>
            </span>
            <div className="flex items-center gap-2">
              <RetroButton variant="secondary" size="sm" onClick={() => onNavigate('SQUAD')}>
                Schiera Coorte
              </RetroButton>
              <RetroButton variant="crimson" size="sm" onClick={onAdvanceDay}>
                Disputa Agone &rarr;
              </RetroButton>
            </div>
          </div>
        </div>

        {/* Manager Dossier Card */}
        <div className="retro-box p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-[#731922] mb-3">
              <Shield size={15} className="text-[#d4af37]" />
              <span className="font-roman text-xs font-bold tracking-wider text-[#d4af37]">
                TRIBUNA DEL MAGISTER
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#cbd5e1] block text-[10px] font-roman">MAGISTER / CONDOTTIERO</span>
                <span className="font-roman font-bold text-sm text-white">
                  {career.manager.nome} {career.manager.cognome}
                </span>
                <span className="text-[11px] text-[#d4af37] block font-roman">Gens {career.manager.famigliaOrigine}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2 retro-inset text-center font-data">
                <div>
                  <span className="text-[10px] text-[#cbd5e1] block">TRIONFI</span>
                  <span className="text-xs font-bold text-[#10b981]">{career.manager.vittorie}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#cbd5e1] block">PAREGGI</span>
                  <span className="text-xs font-bold text-[#facc15]">{career.manager.pareggi}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#cbd5e1] block">SCONFITTE</span>
                  <span className="text-xs font-bold text-[#f87171]">{career.manager.sconfitte}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-[#cbd5e1]">Reputazione Magistrale:</span>
                <span className="font-data font-bold text-[#facc15]">{career.manager.puntiReputazione} pt</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#731922] flex justify-between items-center text-[11px]">
            <span className="text-[#cbd5e1]">Favore dei Tribuni:</span>
            <span className="text-[#facc15] font-bold">ALTO (88%)</span>
          </div>
        </div>
      </div>

      {/* Bacheca Tattica Drag & Drop dell'Harpastum */}
      {userClub && (
        <TacticalSlate
          userClub={userClub}
          squad={userPlayers}
          onSelectPlayer={onSelectPlayer}
        />
      )}

      {/* Main Grid: Standings Preview + Squad Snapshot + World News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* League Table Preview */}
        <div className="retro-box p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#731922] mb-3">
              <div className="flex items-center gap-1.5">
                <Trophy size={14} className="text-[#d4af37]" />
                <span className="font-roman text-xs font-bold text-[#d4af37]">
                  {league.nome.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => onNavigate('LEAGUE')}
                className="text-[11px] text-[#facc15] hover:underline flex items-center gap-0.5 cursor-pointer font-roman"
              >
                <span>Tavola Completa</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-1 font-data text-xs">
              <div className="grid grid-cols-12 text-[10px] text-[#cbd5e1] pb-1 border-b border-[#731922] px-1 font-semibold">
                <span className="col-span-1">#</span>
                <span className="col-span-6 font-roman">Club</span>
                <span className="col-span-1 text-center">PG</span>
                <span className="col-span-2 text-center">DM</span>
                <span className="col-span-2 text-right">PT</span>
              </div>

              {table.map((row, idx) => {
                const isUser = row.clubId === career.userClubId;
                return (
                  <div
                    key={row.clubId}
                    className={`grid grid-cols-12 py-1 px-1 rounded-xs items-center ${
                      isUser
                        ? 'bg-[#6b161f] text-[#facc15] font-bold border-l-2 border-l-[#d4af37]'
                        : 'text-[#e2e8f0]'
                    }`}
                  >
                    <span className="col-span-1 text-[11px] text-[#cbd5e1]">{idx + 1}</span>
                    <span className="col-span-6 font-roman truncate text-[11px]">{row.clubNome}</span>
                    <span className="col-span-1 text-center">{row.partiteGiocate}</span>
                    <span className="col-span-2 text-center">{row.differenzaReti > 0 ? `+${row.differenzaReti}` : row.differenzaReti}</span>
                    <span className="col-span-2 text-right font-bold text-white">{row.punti}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#731922] text-[11px] text-[#cbd5e1] flex justify-between">
            <span>Posizione attuale: <strong className="text-[#facc15]">{userPosition}° posto</strong></span>
            <span>Punti: <strong className="text-white">{userRow?.punti || 0}</strong></span>
          </div>
        </div>

        {/* Squad Key Gladiators */}
        <div className="retro-box p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#731922] mb-3">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-[#d4af37]" />
                <span className="font-roman text-xs font-bold text-[#d4af37]">
                  ATLETI D'ELITE DELLA COORTE
                </span>
              </div>
              <button
                onClick={() => onNavigate('SQUAD')}
                className="text-[11px] text-[#facc15] hover:underline flex items-center gap-0.5 cursor-pointer font-roman"
              >
                <span>Coorte ({userPlayers.length})</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {keyPlayers.map(p => {
                const badge = getHarpastumRoleBadgeStyle(p.ruoloPrimario);
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlayer(p)}
                    className="w-full text-left p-1.5 retro-inset hover:bg-[#3d0b10] transition-colors flex items-center justify-between group cursor-pointer border border-[#4d0f15]"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-xs font-roman ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      <span className="font-medium text-white group-hover:text-[#facc15]">
                        {p.nome} {p.cognome}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-data text-[11px]">
                      <span className="text-[#10b981]">{p.condizione}% cond</span>
                      <span className="font-bold text-[#d4af37]">{p.valoreGenerale} OVR</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#731922] flex items-center justify-between text-[11px] text-[#cbd5e1]">
            <span>Forma fisica coorte: <strong className="text-[#10b981]">{avgCondition}%</strong></span>
            <span>Atleti pronti: <strong className="text-white">{userPlayers.length}</strong></span>
          </div>
        </div>

        {/* World News & Decrees */}
        <div className="retro-box p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 pb-2 border-b border-[#731922] mb-3">
              <Newspaper size={14} className="text-[#d4af37]" />
              <span className="font-roman text-xs font-bold text-[#d4af37]">
                GAZZETTA DELL'IMPERO · FASTI E DISPACCI
              </span>
            </div>

            <div className="space-y-2 text-xs max-h-56 overflow-y-auto pr-1">
              {career.news.slice(0, 4).map(item => (
                <div key={item.id} className="p-2 retro-inset border border-[#521016]">
                  <div className="flex items-center justify-between text-[10px] text-[#cbd5e1] mb-0.5 font-data">
                    <span className="text-[#facc15] font-semibold">{item.categoria}</span>
                    <span>{item.data}</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1 font-roman text-[11px]">
                    {item.titolo}
                  </h4>
                  <p className="text-[11px] text-[#cbd5e1] leading-relaxed line-clamp-2">
                    {item.corpo}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#731922] text-[10px] text-[#cbd5e1] text-center font-roman">
            Dispacci imperiali sigillati e ratificati dal Senato
          </div>
        </div>
      </div>
    </div>
  );
};
