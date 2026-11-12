import React, { useState } from 'react';
import type { Player } from '../types';
import { RetroButton } from './RetroButton';
import { X, Shield, FileSignature, History } from 'lucide-react';
import { audio } from '../services/audioService';
import { formatPlayerBirthYear, formatContractExpiry } from '../engines/calendarEngine';
import { getHarpastumRole, getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import { calculateRenewalTerms } from '../engines/economyEngine';

interface PlayerCardModalProps {
  player: Player | null;
  onClose: () => void;
  onToggleTransferList?: (player: Player) => void;
  onMakeOffer?: (player: Player) => void;
  onRenewContract?: (player: Player, extraYears: number) => void;
  currentYear?: number;
  isUserPlayer?: boolean;
}

export const PlayerCardModal: React.FC<PlayerCardModalProps> = ({
  player,
  onClose,
  onToggleTransferList,
  onMakeOffer,
  onRenewContract,
  currentYear = -50,
  isUserPlayer = false
}) => {
  const [renewalYears, setRenewalYears] = useState<number>(2);
  if (!player) return null;

  const isExpiringSoon = player.contratto.annoScadenza <= currentYear + 1;
  const renewalTerms = calculateRenewalTerms(player, renewalYears);

  const getAttrColor = (val: number) => {
    if (val >= 16) return 'text-[#facc15] font-bold'; // Gold
    if (val >= 13) return 'text-[#38bdf8] font-semibold'; // Cyan
    if (val >= 9) return 'text-[#cbd5e1]'; // Neutral
    return 'text-[#f87171]'; // Low
  };

  const hRole = getHarpastumRole(player.ruoloPrimario);
  const badge = getHarpastumRoleBadgeStyle(player.ruoloPrimario);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2.5 sm:p-4 backdrop-blur-xs">
      <div className="retro-box w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[94dvh]">
        {/* Header bar */}
        <div className="retro-panel-header px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#d4af37]" />
            <h2 className="font-roman text-sm font-bold tracking-wide text-[#f8fafc]">
              DOSSIER ATLETA · {player.nome.toUpperCase()} {player.cognome.toUpperCase()}
            </h2>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label} · {hRole.latinName}
            </span>
            {player.soprannome && (
              <span className="text-[#94a3b8] text-xs italic">"{player.soprannome}"</span>
            )}
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto space-y-3 text-xs">
          {/* Top bio row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 retro-inset">
            <div className="flex flex-col items-center justify-center p-2 border-r border-[#1b2333]">
              <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center mb-2 font-roman shadow ${badge.bg} ${badge.border}`}>
                <span className="text-sm font-black text-white">{badge.label}</span>
                <span className="text-[8px] text-[#cbd5e1]">{hRole.category}</span>
              </div>
              <span className="font-data text-xs text-[#94a3b8]">Valore Generale</span>
              <span className="font-data text-xl font-black text-[#d4af37]">
                {player.valoreGenerale}
              </span>
              <span className="text-[10px] text-[#64748b]">Potenziale: {player.potenziale}</span>
            </div>

            <div className="col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-[#64748b] block">Ruolo Harpastum</span>
                <span className="font-medium text-[#facc15] font-roman">
                  {hRole.italianName}
                </span>
                <span className="text-[10px] text-[#94a3b8] block">({hRole.latinName})</span>
              </div>
              <div>
                <span className="text-[#64748b] block">Età / Generazione</span>
                <span className="font-medium text-[#e2e8f0]">
                  {player.eta} anni · <span className="text-[#d4af37] text-xs">{formatPlayerBirthYear(player.annoNascita)}</span>
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block">Nazionalità</span>
                <span className="font-medium text-[#e2e8f0]">{player.nazionalita}</span>
              </div>
              <div>
                <span className="text-[#64748b] block">Piede</span>
                <span className="font-medium text-[#e2e8f0]">{player.piede}</span>
              </div>
              <div>
                <span className="text-[#64748b] block">Fisico</span>
                <span className="font-medium text-[#e2e8f0] font-data">
                  {player.altezzaCm} cm · {player.pesoKg} kg
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block">Condizione / Morale</span>
                <span className="font-medium text-[#10b981] font-data">
                  {player.condizione}% · {player.morale}%
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block">Stipendio Settimanale</span>
                <span className="font-medium text-[#38bdf8] font-data">
                  {player.contratto.stipendioSettimanale.toLocaleString()} HS
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block">Scadenza Contratto</span>
                <span className="font-medium text-[#e2e8f0] font-data text-xs">
                  {formatContractExpiry(player.contratto.annoScadenza)}
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block">Valutazione Mercato</span>
                <span className="font-medium text-[#f59e0b] font-data">
                  {player.prezzoRichiesto.toLocaleString()} HS
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block">Stato Mercato</span>
                <span className={player.inListaTrasferimenti ? 'text-[#f87171] font-bold' : 'text-[#94a3b8]'}>
                  {player.inListaTrasferimenti ? 'In Lista Trasferimenti' : 'Incedibile / Normale'}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Fisici */}
            <div className="retro-inset p-3">
              <h3 className="font-roman text-[11px] font-bold text-[#d4af37] border-b border-[#1b2333] pb-1 mb-2">
                ATTRIBUTI FISICI
              </h3>
              <div className="space-y-1.5 font-data">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Velocità</span>
                  <span className={getAttrColor(player.attributi.velocita)}>{player.attributi.velocita}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Resistenza</span>
                  <span className={getAttrColor(player.attributi.resistenza)}>{player.attributi.resistenza}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Forza</span>
                  <span className={getAttrColor(player.attributi.forza)}>{player.attributi.forza}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Elevazione</span>
                  <span className={getAttrColor(player.attributi.elevazione)}>{player.attributi.elevazione}</span>
                </div>
              </div>
            </div>

            {/* Difensivi */}
            <div className="retro-inset p-3">
              <h3 className="font-roman text-[11px] font-bold text-[#d4af37] border-b border-[#1b2333] pb-1 mb-2">
                DIFENSIVI & TATTICA
              </h3>
              <div className="space-y-1.5 font-data">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Contrasto</span>
                  <span className={getAttrColor(player.attributi.contrasto)}>{player.attributi.contrasto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Marcatura</span>
                  <span className={getAttrColor(player.attributi.marcatura)}>{player.attributi.marcatura}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Posizionamento</span>
                  <span className={getAttrColor(player.attributi.posizionamento)}>{player.attributi.posizionamento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Virtus (Grinta)</span>
                  <span className={getAttrColor(player.attributi.virtus)}>{player.attributi.virtus}</span>
                </div>
              </div>
            </div>

            {/* Tecnici */}
            <div className="retro-inset p-3">
              <h3 className="font-roman text-[11px] font-bold text-[#d4af37] border-b border-[#1b2333] pb-1 mb-2">
                TECNICI & TIRO
              </h3>
              <div className="space-y-1.5 font-data">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Passaggio</span>
                  <span className={getAttrColor(player.attributi.passaggio)}>{player.attributi.passaggio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Visione</span>
                  <span className={getAttrColor(player.attributi.visione)}>{player.attributi.visione}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Dribbling</span>
                  <span className={getAttrColor(player.attributi.dribbling)}>{player.attributi.dribbling}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Tiro & Finalizz.</span>
                  <span className={getAttrColor(player.attributi.finalizzazione)}>{player.attributi.finalizzazione}</span>
                </div>
              </div>
            </div>

            {/* Custos o Carattere */}
            <div className="retro-inset p-3">
              <h3 className="font-roman text-[11px] font-bold text-[#d4af37] border-b border-[#1b2333] pb-1 mb-2">
                {player.ruoloPrimario === 'POR' ? 'CUSTOS (LINEA DI FONDO)' : 'MENTALI & DISCIPLINA'}
              </h3>
              <div className="space-y-1.5 font-data">
                {player.ruoloPrimario === 'POR' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Parata</span>
                      <span className={getAttrColor(player.attributi.parata)}>{player.attributi.parata}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Riflessi</span>
                      <span className={getAttrColor(player.attributi.riflessi)}>{player.attributi.riflessi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Uscite</span>
                      <span className={getAttrColor(player.attributi.uscite)}>{player.attributi.uscite}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Disciplina</span>
                      <span className={getAttrColor(player.attributi.disciplina)}>{player.attributi.disciplina}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Tecnica Pura</span>
                      <span className={getAttrColor(player.attributi.tecnica)}>{player.attributi.tecnica}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Potenza Tiro</span>
                      <span className={getAttrColor(player.attributi.tiro)}>{player.attributi.tiro}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#94a3b8]">Disciplina</span>
                      <span className={getAttrColor(player.attributi.disciplina)}>{player.attributi.disciplina}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Ruolo Alt.</span>
                      <span className="text-[#cbd5e1]">{player.ruoliSecondari.join(', ') || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Season Stats Row */}
          <div className="p-3 retro-inset flex items-center justify-around font-data text-center">
            <div>
              <span className="text-[#64748b] block text-[10px]">PRESENZE</span>
              <span className="text-sm font-bold text-white">{player.statisticheStagione.presenze}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px]">METE FATTE</span>
              <span className="text-sm font-bold text-[#10b981]">{player.statisticheStagione.gol}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px]">PASSAGGI DEC.</span>
              <span className="text-sm font-bold text-[#38bdf8]">{player.statisticheStagione.assist}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px]">AMMONIZIONI</span>
              <span className="text-sm font-bold text-[#facc15]">{player.statisticheStagione.cartelliniGialli}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px]">ESPULSIONI</span>
              <span className="text-sm font-bold text-[#ef4444]">{player.statisticheStagione.cartelliniRossi}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px]">MEDIA VOTO</span>
              <span className="text-sm font-bold text-[#d4af37]">
                {player.statisticheStagione.mediaVoto > 0 ? player.statisticheStagione.mediaVoto.toFixed(2) : '-'}
              </span>
            </div>
          </div>

          {/* Rinnovo Contratto (only for user players) */}
          {isUserPlayer && onRenewContract && (
            <div className="p-3 retro-inset border border-[#d4af37]/40 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <FileSignature size={14} className="text-[#d4af37]" />
                  <span className="font-roman text-[11px] font-bold text-[#d4af37] uppercase tracking-wider">
                    TABULARIUM CONTRATTI · RINNOVO INGAGGIO
                  </span>
                  {isExpiringSoon && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#7f1d1d] text-[#fecaca] border border-[#f87171]/40 rounded-xs">
                      SCADENZA IMMINENTE
                    </span>
                  )}
                </div>
                <span className="font-data text-[10px] text-[#94a3b8]">
                  Scadenza attuale: {formatContractExpiry(player.contratto.annoScadenza)}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setRenewalYears(yr)}
                      className={`px-2.5 py-1 text-[10px] font-roman font-bold rounded-xs border cursor-pointer transition-colors ${
                        renewalYears === yr
                          ? 'bg-[#800020] text-[#facc15] border-[#d4af37]'
                          : 'bg-[#111622] text-[#cbd5e1] border-[#252e42] hover:text-white'
                      }`}
                    >
                      +{yr} {yr === 1 ? 'Anno' : 'Anni'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 font-data text-[11px]">
                  <div>
                    <span className="text-[#94a3b8]">Nuovo Ingaggio: </span>
                    <strong className="text-[#38bdf8]">{renewalTerms.newWageHS.toLocaleString()} HS/sett.</strong>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Premio Firma: </span>
                    <strong className="text-[#facc15]">{renewalTerms.signingBonusHS.toLocaleString()} HS</strong>
                  </div>
                  <RetroButton
                    variant="gold"
                    size="sm"
                    onClick={() => onRenewContract(player, renewalYears)}
                  >
                    Ratifica Rinnovo
                  </RetroButton>
                </div>
              </div>
            </div>
          )}

          {/* Carriera Storica (Stagioni Concluse) */}
          {player.carrieraPassata && player.carrieraPassata.length > 0 && (
            <div className="p-3 retro-inset space-y-2">
              <div className="flex items-center gap-1.5 border-b border-[#1b2333] pb-1">
                <History size={13} className="text-[#d4af37]" />
                <h3 className="font-roman text-[11px] font-bold text-[#d4af37] uppercase tracking-wider">
                  ANNALI DI CARRIERA ({player.carrieraPassata.length} stagioni)
                </h3>
              </div>
              <div className="space-y-1 font-data text-[11px] max-h-32 overflow-y-auto">
                {player.carrieraPassata.slice().reverse().map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between py-0.5 border-b border-[#111622] last:border-b-0">
                    <span className="text-[#facc15]">{Math.abs(h.seasonYear)} a.C.</span>
                    <span className="text-white font-roman truncate max-w-[180px]">{h.clubName}</span>
                    <span className="text-[#cbd5e1]">{h.presenze} pres. · {h.gol} mete</span>
                    <span className="text-[#38bdf8]">Voto {h.mediaVoto > 0 ? h.mediaVoto.toFixed(1) : '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-t border-[#252e42] shrink-0">
          <div className="flex items-center gap-2">
            {isUserPlayer && onToggleTransferList && (
              <RetroButton
                variant={player.inListaTrasferimenti ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => onToggleTransferList(player)}
              >
                {player.inListaTrasferimenti ? 'Togli da Lista Trasferimenti' : 'Inserisci in Lista Trasferimenti'}
              </RetroButton>
            )}
            {!isUserPlayer && onMakeOffer && (
              <RetroButton
                variant="gold"
                size="sm"
                onClick={() => onMakeOffer(player)}
              >
                Avvia Trattativa d’Acquisto
              </RetroButton>
            )}
          </div>
          <RetroButton variant="secondary" size="sm" onClick={onClose}>
            Chiudi Scheda
          </RetroButton>
        </div>
      </div>
    </div>
  );
};
