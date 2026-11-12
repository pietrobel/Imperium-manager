import React from 'react';
import type { CareerSave, Player } from '../types';
import { RetroButton } from './RetroButton';
import { X, Coins, Landmark, Users, Hammer, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { ARENA_EXPANSION_TIERS, type ArenaExpansionTier } from '../engines/economyEngine';
import { formatContractExpiry } from '../engines/calendarEngine';

interface ErarioArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  career: CareerSave;
  onExpandArena: (tierId: ArenaExpansionTier['id']) => void;
  onSelectPlayerForRenewal: (player: Player) => void;
}

export const ErarioArenaModal: React.FC<ErarioArenaModalProps> = ({
  isOpen,
  onClose,
  career,
  onExpandArena,
  onSelectPlayerForRenewal
}) => {
  if (!isOpen) return null;

  const userClub = career.clubs[career.userClubId];
  if (!userClub) return null;

  const userSquad = Object.values(career.players).filter(p => p.clubId === userClub.id);
  const totalWeeklyWages = userSquad.reduce((sum, p) => sum + p.contratto.stipendioSettimanale, 0);
  const expiringPlayers = userSquad
    .filter(p => p.contratto.annoScadenza <= career.currentYear + 1)
    .sort((a, b) => a.contratto.annoScadenza - b.contratto.annoScadenza);

  const ledger = career.ultimoBilancio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2.5 sm:p-4 backdrop-blur-xs">
      <div className="retro-box w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[94dvh]">
        {/* Header */}
        <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-b border-[#731922] shrink-0">
          <div className="flex items-center gap-2">
            <Coins size={17} className="text-[#d4af37]" />
            <h2 className="font-roman text-sm font-bold tracking-wider text-[#facc15]">
              ERARIO DEL SODALIZIO & OPERE DELL'ARENA · {userClub.nome.toUpperCase()}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto space-y-3 text-xs">
          {/* Top Financial Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-data">
            <div className="retro-inset p-3 border border-[#d4af37]/40">
              <span className="text-[10px] font-roman text-[#94a3b8] block uppercase">Erario Disponibile</span>
              <span className={`text-base font-black ${userClub.saldoCassa >= 0 ? 'text-[#facc15]' : 'text-[#ef4444]'}`}>
                {userClub.saldoCassa.toLocaleString()} HS
              </span>
            </div>
            <div className="retro-inset p-3 border border-[#232d3f]">
              <span className="text-[10px] font-roman text-[#94a3b8] block uppercase">Monte Ingaggi / Sett.</span>
              <span className="text-base font-bold text-[#38bdf8]">
                {totalWeeklyWages.toLocaleString()} HS
              </span>
            </div>
            <div className="retro-inset p-3 border border-[#232d3f]">
              <span className="text-[10px] font-roman text-[#94a3b8] block uppercase">Capienza Arena</span>
              <span className="text-base font-bold text-white">
                {userClub.stadioCapienza.toLocaleString()} posti
              </span>
            </div>
            <div className="retro-inset p-3 border border-[#232d3f]">
              <span className="text-[10px] font-roman text-[#94a3b8] block uppercase">Contratti in Scadenza</span>
              <span className={`text-base font-bold ${expiringPlayers.length > 0 ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                {expiringPlayers.length} atleti
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weekly Ledger */}
            <div className="retro-inset p-4 space-y-3 border border-[#232d3f]">
              <div className="flex items-center justify-between border-b border-[#1b2333] pb-2">
                <div className="flex items-center gap-1.5">
                  <Landmark size={14} className="text-[#d4af37]" />
                  <h3 className="font-roman text-xs font-bold text-[#d4af37]">
                    RENDICONTO SETTIMANALE {ledger ? `(GIORNATA ${ledger.giornata})` : ''}
                  </h3>
                </div>
                {ledger && ledger.spettatori > 0 && (
                  <span className="font-data text-[10px] text-[#10b981]">
                    Pubblico: {ledger.spettatori.toLocaleString()} spett.
                  </span>
                )}
              </div>

              {ledger ? (
                <div className="space-y-1.5 font-data text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Incassi Biglietteria Arena</span>
                    <span className="text-[#10b981] font-semibold">+{ledger.entrateBiglietti.toLocaleString()} HS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Donazioni Patroni & Senatori</span>
                    <span className="text-[#10b981] font-semibold">+{ledger.entratePatroni.toLocaleString()} HS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Stipendi della Coorte</span>
                    <span className="text-[#f87171]">-{ledger.usciteStipendi.toLocaleString()} HS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Manutenzione Sabbia & Castra</span>
                    <span className="text-[#f87171]">-{ledger.usciteManutenzione.toLocaleString()} HS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#cbd5e1]">Medici del Valetudinarium</span>
                    <span className="text-[#f87171]">-{ledger.usciteMediche.toLocaleString()} HS</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#1b2333] flex justify-between font-bold text-sm">
                    <span className="font-roman text-white">Bilancio Netto Settimana</span>
                    <span className={ledger.saldoNettoSettimana >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
                      {ledger.saldoNettoSettimana >= 0 ? '+' : ''}
                      {ledger.saldoNettoSettimana.toLocaleString()} HS
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-[#94a3b8] italic py-4 text-center">
                  Disputa almeno una giornata per registrare il primo rendiconto dell'Erario.
                </p>
              )}

              {career.storicoFinanze && career.storicoFinanze.length > 1 && (
                <div className="pt-2 border-t border-[#1b2333]">
                  <span className="font-roman text-[10px] text-[#94a3b8] uppercase block mb-1.5">
                    Ultime Giornate
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-data text-[10px]">
                    {career.storicoFinanze.slice(-6).map((item, idx) => (
                      <div key={idx} className="px-2 py-1 bg-[#0a0d14] border border-[#1b2333] rounded-xs shrink-0 text-center">
                        <div className="text-[#64748b]">G.{item.giornata}</div>
                        <div className={item.saldoNettoSettimana >= 0 ? 'text-[#10b981] font-bold' : 'text-[#ef4444] font-bold'}>
                          {item.saldoNettoSettimana >= 0 ? '+' : ''}{Math.round(item.saldoNettoSettimana / 1000)}k
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Arena Expansions */}
            <div className="retro-inset p-4 space-y-3 border border-[#232d3f]">
              <div className="flex items-center justify-between border-b border-[#1b2333] pb-2">
                <div className="flex items-center gap-1.5">
                  <Hammer size={14} className="text-[#d4af37]" />
                  <h3 className="font-roman text-xs font-bold text-[#d4af37]">
                    AMPLIAMENTO ARENA ({userClub.stadioNome})
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {ARENA_EXPANSION_TIERS.map(tier => {
                  const canAfford = userClub.saldoCassa >= tier.costoHS;
                  return (
                    <div
                      key={tier.id}
                      className="p-2.5 bg-[#0e131d] border border-[#232d3f] rounded-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-roman font-bold text-white text-[11px] flex items-center gap-1.5">
                          <span>{tier.nome}</span>
                          <span className="text-[#10b981] font-data">+{tier.postiAggiuntivi.toLocaleString()} posti</span>
                        </div>
                        <p className="text-[10px] text-[#94a3b8] mt-0.5">{tier.descrizione}</p>
                      </div>
                      <RetroButton
                        variant={canAfford ? 'gold' : 'secondary'}
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => onExpandArena(tier.id)}
                        className="shrink-0 font-data text-[10px]"
                      >
                        {tier.costoHS.toLocaleString()} HS
                      </RetroButton>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Expiring Contracts Alert List */}
          <div className="retro-inset p-4 space-y-2 border border-[#232d3f]">
            <div className="flex items-center justify-between border-b border-[#1b2333] pb-2">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-[#f59e0b]" />
                <h3 className="font-roman text-xs font-bold text-[#facc15]">
                  ATLETI CON CONTRATTO IN SCADENZA O PROSSIMO AL TERMINE
                </h3>
              </div>
              <span className="text-[10px] text-[#94a3b8]">Clicca su un atleta per aprire il Tabularium Contratti</span>
            </div>

            {expiringPlayers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {expiringPlayers.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectPlayerForRenewal(p);
                    }}
                    className="p-2 bg-[#111622] hover:bg-[#1e2738] border border-[#f59e0b]/40 rounded-xs flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white text-[11px] flex items-center gap-1">
                        <AlertTriangle size={11} className="text-[#f59e0b]" />
                        <span>{p.nome} {p.cognome}</span>
                      </div>
                      <div className="text-[10px] font-data text-[#94a3b8]">
                        OVR {p.valoreGenerale} · {formatContractExpiry(p.contratto.annoScadenza)}
                      </div>
                    </div>
                    <ArrowUpRight size={13} className="text-[#d4af37] shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-[#10b981] py-2">
                Tutti gli atleti della coorte hanno un vincolo contrattuale sicuro oltre la stagione corrente.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="retro-panel-header px-4 py-2 flex justify-end border-t border-[#731922] shrink-0">
          <RetroButton variant="secondary" size="sm" onClick={onClose}>
            Chiudi Registro Erario
          </RetroButton>
        </div>
      </div>
    </div>
  );
};
