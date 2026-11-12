import React, { useState } from 'react';
import type { CareerSave, Player, MilitaryDrillId, TrainingIntensity, HarpastumTacticalDutyId, MedicalStaffTier } from '../types';
import { RetroButton } from '../components/RetroButton';
import { audio } from '../services/audioService';
import {
  MILITARY_DRILLS,
  TRAINING_INTENSITIES,
  HARPASTUM_TACTICAL_DUTIES,
  MEDICAL_STAFF_TIERS,
  calculateInjuryRisk,
  executeMilitaryTraining,
  advanceValetudinarium
} from '../engines/militaryTrainingEngine';
import { getHarpastumRole, getHarpastumCategory, getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import {
  Swords,
  Shield,
  HeartPulse,
  Flame,
  Activity,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Award,
  Sliders,
  ChevronRight,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface MilitaryTrainingScreenProps {
  career: CareerSave;
  onUpdateCareer: (updatedCareer: CareerSave) => void;
  onSelectPlayer: (player: Player) => void;
}

type TrainingTab = 'DRILLS' | 'DUTIES' | 'VALETUDINARIUM';

export const MilitaryTrainingScreen: React.FC<MilitaryTrainingScreenProps> = ({
  career,
  onUpdateCareer,
  onSelectPlayer
}) => {
  const userClub = career.clubs[career.userClubId];
  const squad = Object.values(career.players).filter(p => p.clubId === career.userClubId);

  const [activeTab, setActiveTab] = useState<TrainingTab>('DRILLS');
  const [selectedDrill, setSelectedDrill] = useState<MilitaryDrillId>(
    userClub?.impostazioniAllenamento?.dottrinaPrevalente || 'TAXIS_DECURSIO'
  );
  const [selectedIntensity, setSelectedIntensity] = useState<TrainingIntensity>(
    userClub?.impostazioniAllenamento?.intensitaGenerale || 'NORMALIS'
  );
  const [medicalTier, setMedicalTier] = useState<MedicalStaffTier>(
    userClub?.impostazioniAllenamento?.medicoAssegnato || 'ERBISTA_CASTRORUM'
  );
  const [sessionLogs, setSessionLogs] = useState<{ id: string; text: string; type: 'GROWTH' | 'INJURY' | 'RECOVERY' }[]>([]);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  // Save changes to general training settings
  const handleSaveSettings = (newDrill: MilitaryDrillId, newInt: TrainingIntensity, newMed: MedicalStaffTier) => {
    const updatedClub = {
      ...userClub,
      impostazioniAllenamento: {
        dottrinaPrevalente: newDrill,
        intensitaGenerale: newInt,
        medicoAssegnato: newMed
      }
    };
    const updated = {
      ...career,
      clubs: { ...career.clubs, [userClub.id]: updatedClub }
    };
    onUpdateCareer(updated);
    audio.playClick();
    showBanner('Dottrina militare e impostazioni del Valetudinarium ratificate dal Magister!');
  };

  // Run an immediate military training drill session
  const handleExecuteSession = () => {
    audio.playWhistle();
    const { updatedPlayers, events } = executeMilitaryTraining(squad, selectedDrill, selectedIntensity);

    const playersMap = { ...career.players };
    updatedPlayers.forEach(p => {
      playersMap[p.id] = p;
    });

    const updated = {
      ...career,
      players: playersMap
    };
    onUpdateCareer(updated);

    const newLogs = events.map(e => ({
      id: `log_${Date.now()}_${Math.random()}`,
      text: `${e.athleteName}: ${e.text}`,
      type: e.type
    }));
    setSessionLogs(newLogs);

    const injuriesCount = events.filter(e => e.type === 'INJURY').length;
    const growthCount = events.filter(e => e.type === 'GROWTH').length;

    if (injuriesCount > 0) {
      audio.playTone(300, 0.2);
      showBanner(`Seduta completata: ${growthCount} progressi atletici, ma ${injuriesCount} atleti sono finiti al Valetudinarium!`);
    } else {
      audio.playGoal();
      showBanner(`Seduta gloriosa: ${growthCount} atleti hanno temprato i propri attributi sotto la guida del Magister!`);
    }
  };

  // Assign specific tactical duty to an individual player
  const handleAssignDuty = (playerId: string, dutyId: HarpastumTacticalDutyId) => {
    const player = career.players[playerId];
    if (!player) return;
    const updatedPlayer = { ...player, ruoloTatticoSpecifico: dutyId };
    const updated = {
      ...career,
      players: { ...career.players, [playerId]: updatedPlayer }
    };
    onUpdateCareer(updated);
    audio.playClick();
    showBanner(`Incarico tattico [${HARPASTUM_TACTICAL_DUTIES[dutyId].italianTitle}] assegnato a ${player.nome} ${player.cognome}.`);
  };

  // Emergency medical treatment in Valetudinarium (costs HS)
  const handleEmergencyTreatment = (player: Player) => {
    if (userClub.saldoCassa < 50000) {
      showBanner('Fondi insufficienti nel tesoro del club per finanziare un trattamento d\'urto (50.000 HS richiesti).');
      return;
    }
    const daysReduced = Math.min(player.giorniInfortunio, 7);
    const updatedPlayer: Player = {
      ...player,
      giorniInfortunio: Math.max(0, player.giorniInfortunio - daysReduced),
      condizione: Math.min(100, player.condizione + 15)
    };
    if (updatedPlayer.giorniInfortunio === 0) {
      updatedPlayer.infortunato = false;
      updatedPlayer.tipoInfortunio = undefined;
    }

    const updatedClub = {
      ...userClub,
      saldoCassa: userClub.saldoCassa - 50000
    };

    const updated = {
      ...career,
      clubs: { ...career.clubs, [userClub.id]: updatedClub },
      players: { ...career.players, [player.id]: updatedPlayer }
    };
    onUpdateCareer(updated);
    audio.playTone(700, 0.15);
    showBanner(`Trattamento d'urto con unguenti egizi somministrato a ${player.cognome} (-${daysReduced} giorni di prognosi, -50.000 HS).`);
  };

  const injuredPlayers = squad.filter(p => p.infortunato);
  const healthyPlayers = squad.filter(p => !p.infortunato);

  return (
    <div className="h-full flex flex-col gap-3 min-h-0 overflow-hidden">
      {/* Top Banner & Header */}
      <div className="retro-box p-2.5 bg-gradient-to-r from-[#3d0b10] via-[#240507] to-[#170305] border-2 border-[#85222b] shadow-xl flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#800020] border border-[#d4af37] rounded-xs shadow shrink-0">
            <Swords size={18} className="text-[#d4af37]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-roman text-sm sm:text-base font-bold text-white tracking-wide">
                CASTRA EXERCITUS & VALETUDINARIUM · {userClub.nome.toUpperCase()}
              </h1>
              <span className="text-[10px] text-[#fef08a] font-roman font-bold hidden sm:inline">
                · Dottrina Legionaria
              </span>
            </div>
            <p className="text-[11px] text-[#cbd5e1] font-roman">
              Disciplina delle coorti, addestramento tattico dell'Harpastum e cura delle lesioni da combattimento.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0a0d14] p-1 border border-[#2d3748] rounded-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setActiveTab('DRILLS');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-roman font-bold transition-all rounded-xs cursor-pointer whitespace-nowrap ${
              activeTab === 'DRILLS'
                ? 'bg-[#800020] text-[#d4af37] border border-[#d4af37]/60 shadow-sm'
                : 'text-[#94a3b8] hover:text-[#e2e8f0]'
            }`}
          >
            <Flame size={14} />
            <span>Addestramento Militare</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setActiveTab('DUTIES');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-roman font-bold transition-all rounded-xs cursor-pointer whitespace-nowrap ${
              activeTab === 'DUTIES'
                ? 'bg-[#800020] text-[#d4af37] border border-[#d4af37]/60 shadow-sm'
                : 'text-[#94a3b8] hover:text-[#e2e8f0]'
            }`}
          >
            <Sliders size={14} />
            <span>Ruoli & Tattica Harpastum</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClick();
              setActiveTab('VALETUDINARIUM');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-roman font-bold transition-all rounded-xs cursor-pointer relative whitespace-nowrap ${
              activeTab === 'VALETUDINARIUM'
                ? 'bg-[#800020] text-[#d4af37] border border-[#d4af37]/60 shadow-sm'
                : 'text-[#94a3b8] hover:text-[#e2e8f0]'
            }`}
          >
            <HeartPulse size={14} />
            <span>Valetudinarium ({injuredPlayers.length})</span>
            {injuredPlayers.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping absolute -top-1 -right-1" />
            )}
          </button>
        </div>
      </div>

      {feedbackBanner && (
        <div className="bg-[#6b161f] border-2 border-[#d4af37] p-2 text-center text-[#fef08a] font-roman font-bold text-xs tracking-wider shadow-xl rounded-xs shrink-0">
          ⭐ {feedbackBanner} ⭐
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MILITARY DRILLS & TRAINING REGIME                                  */}
      {/* ========================================================================= */}
      {activeTab === 'DRILLS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Drill Selector & Controls */}
          <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
            {/* General Doctrine Settings */}
            <div className="retro-box p-3 border border-[#731922] bg-[#1a0507] space-y-2.5 shrink-0">
              <div className="flex items-center justify-between border-b border-[#521016] pb-2">
                <span className="font-roman font-bold text-sm text-[#d4af37]">COMANDO DELLA COORTE</span>
                <span className="text-[10px] text-[#94a3b8] font-data">Legio Harpastica</span>
              </div>

              {/* Intensity Picker */}
              <div className="space-y-1.5">
                <label className="font-roman text-[11px] text-[#cbd5e1] uppercase tracking-wider flex items-center gap-1">
                  <Activity size={12} className="text-[#facc15]" /> Grado d'Intensità dell'Addestramento:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(TRAINING_INTENSITIES) as TrainingIntensity[]).map(intKey => {
                    const intDef = TRAINING_INTENSITIES[intKey];
                    const isSelected = selectedIntensity === intKey;
                    return (
                      <button
                        key={intKey}
                        type="button"
                        onClick={() => {
                          setSelectedIntensity(intKey);
                          handleSaveSettings(selectedDrill, intKey, medicalTier);
                        }}
                        className={`p-2 rounded-xs border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#800020] border-[#d4af37] text-white font-bold shadow-md'
                            : 'bg-[#111622] border-[#252e42] text-[#94a3b8] hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] font-roman truncate">{intDef.latinName.split(' ')[0]}</div>
                        <div className="text-[9px] text-[#cbd5e1] truncate">{intKey === 'SPARTANA' ? '+100% Sviluppo' : intKey === 'CLEMENTIA' ? 'Zero Fatica' : 'Equilibrato'}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#94a3b8] italic">
                  {TRAINING_INTENSITIES[selectedIntensity].description}
                </p>
              </div>

              {/* Action: Execute Drill Session */}
              <div className="pt-2 border-t border-[#521016]">
                <RetroButton
                  variant="gold"
                  size="md"
                  onClick={handleExecuteSession}
                  className="w-full font-bold uppercase tracking-wider flex items-center justify-center gap-2 py-2.5"
                >
                  <Swords size={16} />
                  <span>Ordina Esercitazione d'Arena</span>
                </RetroButton>
                <div className="text-[10px] text-[#94a3b8] text-center mt-1">
                  Esercita immediatamente gli atleti sani applicando la dottrina selezionata.
                </div>
              </div>
            </div>

            {/* List of 6 Roman Legionary Drills */}
            <div className="retro-box p-3 border border-[#731922] bg-[#1a0507] flex flex-col flex-1 min-h-0 overflow-hidden gap-2">
              <div className="text-[11px] font-roman font-bold text-[#d4af37] uppercase tracking-wider pb-1 border-b border-[#521016] shrink-0">
                DOTTRINE D'ADDESTRAMENTO LEGIONARIO (SELEZIONA)
              </div>
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
                {(Object.keys(MILITARY_DRILLS) as MilitaryDrillId[]).map(dId => {
                  const drill = MILITARY_DRILLS[dId];
                  const isSelected = selectedDrill === dId;
                  return (
                    <div
                      key={dId}
                      onClick={() => {
                        setSelectedDrill(dId);
                        handleSaveSettings(dId, selectedIntensity, medicalTier);
                      }}
                      className={`p-2.5 rounded-xs border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#3b0b10] border-[#d4af37] shadow-lg'
                          : 'bg-[#111622] border-[#252e42] hover:bg-[#1a2333]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-roman font-bold text-white text-xs">{drill.latinName}</div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-xs border font-data ${drill.badgeColor}`}>
                          {drill.focusAttributes[0]}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#d4af37] italic mt-0.5">{drill.italianName}</div>
                      <div className="text-[10px] text-[#94a3b8] line-clamp-2 mt-1">{drill.description}</div>
                      <div className="flex items-center justify-between text-[9px] text-[#64748b] mt-1.5 pt-1 border-t border-[#1f293d]">
                        <span>Fatica: {drill.fatigueCost > 0 ? `+${drill.fatigueCost}` : `${drill.fatigueCost} (Riposo)`}</span>
                        <span>Rischio Infortunio: {drill.baseInjuryRisk}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (2 cols wide): Squad Readiness & Drill Feedback */}
          <div className="lg:col-span-2 flex flex-col gap-3 min-h-0 overflow-hidden">
            {/* Active Drill Spotlight Card */}
            <div className="retro-box p-3 border-2 border-[#d4af37] bg-gradient-to-r from-[#2b080b] to-[#170305] shadow-xl shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-[#521016]">
                <div>
                  <span className="text-[10px] text-[#d4af37] font-roman uppercase tracking-widest">
                    Dottrina Attiva della Coorte
                  </span>
                  <h2 className="font-roman text-base font-bold text-white">
                    {MILITARY_DRILLS[selectedDrill].latinName} · {MILITARY_DRILLS[selectedDrill].italianName}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#94a3b8] font-roman italic">Motto del Centurione:</span>
                  <div className="text-xs font-roman font-bold text-[#fef08a]">"{MILITARY_DRILLS[selectedDrill].motto}"</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-[11px]">
                <div className="p-2.5 retro-inset bg-[#0d1117] border border-[#232d3f]">
                  <div className="text-[#94a3b8] text-[10px] uppercase font-roman">Attributi Esercitati</div>
                  <div className="font-bold text-[#38bdf8] mt-1">
                    {MILITARY_DRILLS[selectedDrill].focusAttributes.join(' · ')}
                  </div>
                </div>
                <div className="p-2.5 retro-inset bg-[#0d1117] border border-[#232d3f]">
                  <div className="text-[#94a3b8] text-[10px] uppercase font-roman">Carico di Fatica</div>
                  <div className="font-bold text-[#facc15] mt-1">
                    {MILITARY_DRILLS[selectedDrill].fatigueCost > 0 ? `+${MILITARY_DRILLS[selectedDrill].fatigueCost} Punti` : 'Rigenerazione Completa (-30)'}
                  </div>
                </div>
                <div className="p-2.5 retro-inset bg-[#0d1117] border border-[#232d3f]">
                  <div className="text-[#94a3b8] text-[10px] uppercase font-roman">Rischio Lesione Base</div>
                  <div className="font-bold text-[#ef4444] mt-1">
                    {MILITARY_DRILLS[selectedDrill].baseInjuryRisk}% per atleta
                  </div>
                </div>
              </div>
            </div>

            {/* Session Logs / Report Feed */}
            {sessionLogs.length > 0 && (
              <div className="retro-box p-2.5 border border-[#731922] bg-[#140305] shrink-0">
                <div className="font-roman text-xs font-bold text-[#d4af37] uppercase tracking-wider pb-1 border-b border-[#521016] mb-1.5 flex items-center justify-between">
                  <span>RESOCONTO DELL'ULTIMA SEDUTA D'ADDESTRAMENTO</span>
                  <button onClick={() => setSessionLogs([])} className="text-[#94a3b8] hover:text-white text-[10px] cursor-pointer">
                    Pulisci
                  </button>
                </div>
                <div className="space-y-1 max-h-28 overflow-y-auto font-data text-[11px] pr-1">
                  {sessionLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-1 rounded-xs flex items-center gap-2 ${
                        log.type === 'INJURY'
                          ? 'bg-[#450a0a] text-[#fca5a5] border-l-2 border-l-[#ef4444]'
                          : log.type === 'GROWTH'
                          ? 'bg-[#064e3b] text-[#6ee7b7] border-l-2 border-l-[#10b981]'
                          : 'bg-[#172554] text-[#93c5fd] border-l-2 border-l-[#3b82f6]'
                      }`}
                    >
                      <span className="font-bold">{log.type === 'INJURY' ? '⚠️' : log.type === 'GROWTH' ? '⭐' : '💧'}</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Squad Condition & Injury Risk Table */}
            <div className="retro-box p-3 border border-[#252e42] bg-[#111622] flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-2 shrink-0">
                <span className="font-roman font-bold text-xs text-white">
                  STATO ATLETICO DELLA COORTE ({squad.length} ATLETI)
                </span>
                <span className="text-[10px] text-[#94a3b8]">
                  {injuredPlayers.length} Infortunati · {healthyPlayers.length} Pronti all'Agone
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="retro-panel-header text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42]">
                      <th className="py-1.5 px-2">RUOLO</th>
                      <th className="py-1.5 px-2">ATLETA</th>
                      <th className="py-1.5 px-2 text-center">CONDIZIONE</th>
                      <th className="py-1.5 px-2 text-center">FATICA</th>
                      <th className="py-1.5 px-2 text-center">RISCHIO INFORTUNIO</th>
                      <th className="py-1.5 px-2 text-right">STATO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {squad.map(player => {
                      const roleBadge = getHarpastumRoleBadgeStyle(player.ruoloPrimario);
                      const { percentage, riskLevel } = calculateInjuryRisk(player, selectedIntensity, selectedDrill);
                      const isInjured = player.infortunato;

                      return (
                        <tr
                          key={player.id}
                          className="border-b border-[#1b2333] hover:bg-[#1a2233] transition-colors"
                        >
                          <td className="py-1.5 px-2">
                            <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-roman font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                              {roleBadge.label}
                            </span>
                          </td>
                          <td className="py-1.5 px-2">
                            <button
                              onClick={() => onSelectPlayer(player)}
                              className="font-bold text-white hover:text-[#d4af37] text-left cursor-pointer"
                            >
                              {player.nome} {player.cognome}
                            </button>
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="w-12 h-1.5 bg-[#232d3f] rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${player.condizione > 80 ? 'bg-[#10b981]' : player.condizione > 60 ? 'bg-[#facc15]' : 'bg-[#ef4444]'}`}
                                  style={{ width: `${player.condizione}%` }}
                                />
                              </div>
                              <span className="font-data text-[10px]">{player.condizione}%</span>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-center font-data text-[10px] text-[#cbd5e1]">
                            {player.caricoFatica || 0}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold ${
                                riskLevel === 'CRITICO'
                                  ? 'bg-[#7f1d1d] text-[#fecaca]'
                                  : riskLevel === 'ALTO'
                                  ? 'bg-[#78350f] text-[#fef08a]'
                                  : riskLevel === 'MEDIO'
                                  ? 'bg-[#854d0e] text-[#fde047]'
                                  : 'bg-[#064e3b] text-[#a7f3d0]'
                              }`}
                            >
                              {percentage}% ({riskLevel})
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-right">
                            {isInjured ? (
                              <span className="px-1.5 py-0.5 bg-[#7f1d1d] text-[#fca5a5] rounded-xs text-[9px] font-bold">
                                {player.tipoInfortunio ? player.tipoInfortunio.split(' ')[0] : 'INFORTUNATO'} ({player.giorniInfortunio}gg)
                              </span>
                            ) : (
                              <span className="text-[#10b981] font-semibold text-[10px]">Arruolabile</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HARPASTUM SPECIFIC TACTICAL DUTIES                                 */}
      {/* ========================================================================= */}
      {activeTab === 'DUTIES' && (
        <div className="flex flex-col gap-3 text-xs flex-1 min-h-0 overflow-hidden">
          <div className="retro-box p-3 border border-[#731922] bg-[#1a0507] shrink-0">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#521016]">
              <div>
                <h2 className="font-roman text-sm font-bold text-[#d4af37]">
                  DISPOSIZIONI TATTICHE DEI RUOLI STORICI (TAXIS D'HARPASTUM)
                </h2>
                <p className="text-[11px] text-[#cbd5e1]">
                  Assegna istruzioni tattiche specifiche a ciascun atleta della coorte: queste scelte alterano direttamente la simulazione della partita (probabilità mete, placcaggi, intercetti, consumo fatica e resistenza infortuni).
                </p>
              </div>
            </div>

            {/* Tactical Duty Explanatory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2.5">
              {/* Custodes */}
              <div className="p-2.5 retro-inset bg-[#0c1017] border-t-2 border-[#ca8a04]">
                <div className="font-roman font-bold text-[#fef08a] text-xs">CUSTODI DI META</div>
                <div className="text-[10px] text-[#94a3b8] mt-1 space-y-0.5">
                  <div><strong className="text-white">Baluardo Stazionario:</strong> +15 Difesa Meta, +5 Placcaggio Estremo.</div>
                  <div><strong className="text-white">Libero Intercettore:</strong> +16 Intercetto Volante, +5 Contropiede Meta.</div>
                </div>
              </div>

              {/* Luctatores */}
              <div className="p-2.5 retro-inset bg-[#0c1017] border-t-2 border-[#3b82f6]">
                <div className="font-roman font-bold text-[#bfdbfe] text-xs">LOTTATORI & MURA</div>
                <div className="text-[10px] text-[#94a3b8] mt-1 space-y-0.5">
                  <div><strong className="text-white">Muro da Mischia:</strong> +20 Placcaggi alla Vita, +18 Difesa Centrale.</div>
                  <div><strong className="text-white">Cacciatore di Fascia:</strong> +14 Placcaggi Ali, +8 Intercetti Laterali.</div>
                </div>
              </div>

              {/* Tractores */}
              <div className="p-2.5 retro-inset bg-[#0c1017] border-t-2 border-[#10b981]">
                <div className="font-roman font-bold text-[#a7f3d0] text-xs">TRATTORI MEDIANI</div>
                <div className="text-[10px] text-[#94a3b8] mt-1 space-y-0.5">
                  <div><strong className="text-white">Ariete Apripista:</strong> +10 Varchi Meta, +12 Blocchi Corporali.</div>
                  <div><strong className="text-white">Regista Phaininda:</strong> +18 Intercetti / Finte, +8 Assist Meta.</div>
                </div>
              </div>

              {/* Praevenientes */}
              <div className="p-2.5 retro-inset bg-[#0c1017] border-t-2 border-[#ef4444]">
                <div className="font-roman font-bold text-[#fecaca] text-xs">CURSORI & ARIETI</div>
                <div className="text-[10px] text-[#94a3b8] mt-1 space-y-0.5">
                  <div><strong className="text-white">Freccia Elusiva:</strong> +18 Scatto a Meta, +10 Dribbling Volante.</div>
                  <div><strong className="text-white">Embolon Sfondatore:</strong> +22 Mete da Sfondamento Fisico.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Assignment Table */}
          <div className="retro-box p-3 border border-[#252e42] bg-[#111622] flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="font-roman font-bold text-xs text-white pb-2 border-b border-[#252e42] mb-2 flex items-center justify-between shrink-0">
              <span>ASSEGNAZIONE INCARICHI SPECIFICI ALLA COORTE ({squad.length} ATLETI)</span>
              <span className="text-[10px] text-[#94a3b8]">Modifica l'incarico dal menu a tendina</span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="retro-panel-header text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42]">
                    <th className="py-2 px-2">RUOLO</th>
                    <th className="py-2 px-2">ATLETA</th>
                    <th className="py-2 px-2">CLASSE HARPASTUM</th>
                    <th className="py-2 px-3">INCARICO TATTICO SPECIFICO</th>
                    <th className="py-2 px-2 text-right">EFFETTO PRINCIPALE</th>
                  </tr>
                </thead>
                <tbody>
                  {squad.map(player => {
                    const cat = getHarpastumCategory(player);
                    const roleBadge = getHarpastumRoleBadgeStyle(player.ruoloPrimario);

                    // Options matching this category
                    const availableDuties = Object.values(HARPASTUM_TACTICAL_DUTIES).filter(d => d.category === cat);
                    const currentDutyId = player.ruoloTatticoSpecifico || availableDuties[0]?.id;
                    const currentDuty = HARPASTUM_TACTICAL_DUTIES[currentDutyId];

                    return (
                      <tr key={player.id} className="border-b border-[#1b2333] hover:bg-[#1a2233] transition-colors">
                        <td className="py-2 px-2">
                          <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-roman font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-bold text-white">
                          {player.nome} {player.cognome}
                        </td>
                        <td className="py-2 px-2 text-[10px] text-[#94a3b8] font-roman">
                          {cat}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={currentDutyId}
                            onChange={e => handleAssignDuty(player.id, e.target.value as HarpastumTacticalDutyId)}
                            className="bg-[#0b0e14] border border-[#2d3748] text-white text-xs px-2 py-1 rounded-xs outline-none focus:border-[#d4af37] font-roman cursor-pointer w-full max-w-xs"
                          >
                            {availableDuties.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.italianTitle} ({d.latinTitle})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right font-data text-[11px] text-[#d4af37]">
                          {currentDuty ? (
                            cat === 'PRAEVENIENS'
                              ? `+${currentDuty.simulationModifiers.metaBonus} Meta`
                              : cat === 'LUCTATOR'
                              ? `+${currentDuty.simulationModifiers.placcaggiBonus} Placcaggi`
                              : cat === 'TRACTOR'
                              ? `+${currentDuty.simulationModifiers.intercettoBonus} Intercetti`
                              : `+${currentDuty.simulationModifiers.defenseBonus} Difesa`
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VALETUDINARIUM & MEDICAL WARD                                      */}
      {/* ========================================================================= */}
      {activeTab === 'VALETUDINARIUM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs flex-1 min-h-0 overflow-hidden">
          {/* Left Column: Medical Staff & Upgrades */}
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            <div className="retro-box p-3.5 border border-[#731922] bg-[#1a0507] space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#521016] pb-2">
                <span className="font-roman font-bold text-sm text-[#d4af37]">CORPO MEDICO DELL'ACCAMPAMENTO</span>
                <HeartPulse size={16} className="text-[#ef4444]" />
              </div>
              <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                Ingaggia cerusici e medici di scuola alessandrina per accelerare la guarigione delle lesioni muscolari e scheletriche derivanti dagli scontri nell'arena.
              </p>

              <div className="space-y-2">
                {(Object.keys(MEDICAL_STAFF_TIERS) as MedicalStaffTier[]).map(mTier => {
                  const staff = MEDICAL_STAFF_TIERS[mTier];
                  const isSelected = medicalTier === mTier;
                  return (
                    <div
                      key={mTier}
                      onClick={() => {
                        setMedicalTier(mTier);
                        handleSaveSettings(selectedDrill, selectedIntensity, mTier);
                      }}
                      className={`p-2.5 rounded-xs border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#3b0b10] border-[#d4af37] shadow-lg'
                          : 'bg-[#111622] border-[#252e42] hover:bg-[#1a2333]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-roman font-bold text-white text-xs">{staff.italianName}</div>
                        <span className="font-data font-bold text-[#d4af37] text-[10px]">
                          {staff.weeklyCostHS > 0 ? `${staff.weeklyCostHS.toLocaleString()} HS/sett.` : 'Gratuito'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#cbd5e1] mt-1">{staff.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats on Valetudinarium */}
            <div className="retro-box p-3 border border-[#252e42] bg-[#111622] space-y-2">
              <div className="font-roman text-xs font-bold text-white border-b border-[#252e42] pb-1">
                BILANCIO SANITARIO
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#94a3b8]">Atleti attualmente degenti:</span>
                <span className="font-bold text-[#ef4444] font-data">{injuredPlayers.length}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#94a3b8]">Velocità di riabilitazione:</span>
                <span className="font-bold text-[#10b981] font-data">
                  +{Math.round((MEDICAL_STAFF_TIERS[medicalTier].recoverySpeedMultiplier - 1) * 100)}% al giorno
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Degenti & Emergency Treatment */}
          <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
            <div className="retro-box p-3.5 border border-[#731922] bg-[#1a0507] flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#521016] shrink-0">
                <div>
                  <h2 className="font-roman text-sm font-bold text-[#d4af37]">
                    DEGENTI NELLE TENDE DEL VALETUDINARIUM
                  </h2>
                  <p className="text-[10px] text-[#94a3b8]">
                    Atleti che hanno subito contusioni, traumi o lussazioni e non possono scendere nell'arena.
                  </p>
                </div>
                <span className="text-xs font-data text-[#facc15] font-bold">
                  {injuredPlayers.length} Degenti
                </span>
              </div>

              {injuredPlayers.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-[#94a3b8] flex-1 flex flex-col justify-center">
                  <Award size={36} className="text-[#10b981] mx-auto opacity-75" />
                  <div className="font-roman text-sm text-white font-bold">Nessun atleta in infermeria!</div>
                  <p className="text-xs">
                    Tutti i legionari sono in forze e pronti alla contesa dell'Harpastum.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 mt-3 flex-1 min-h-0 overflow-y-auto pr-1">
                  {injuredPlayers.map(player => {
                    const roleBadge = getHarpastumRoleBadgeStyle(player.ruoloPrimario);
                    return (
                      <div
                        key={player.id}
                        className="p-3 retro-inset bg-[#111622] border border-[#7f1d1d] flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-roman font-bold border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                              {roleBadge.label}
                            </span>
                            <span className="font-roman font-bold text-sm text-white">
                              {player.nome} {player.cognome}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-xs bg-[#7f1d1d] text-[#fca5a5] font-bold uppercase">
                              {player.gravitaInfortunio || 'MODERATO'}
                            </span>
                          </div>
                          <div className="text-xs font-roman text-[#fef08a] mt-1 font-semibold">
                            🩺 Diagnosi: {player.tipoInfortunio || 'Lesione da impatto nella sabbia'}
                          </div>
                          <div className="text-[10px] text-[#94a3b8] mt-0.5">
                            Prognosi residua: <strong className="text-white font-data">{player.giorniInfortunio} giorni</strong> prima del ritorno agli agoni.
                          </div>
                        </div>

                        {/* Emergency Quick Action */}
                        <div className="flex items-center gap-2">
                          <RetroButton
                            variant="crimson"
                            size="sm"
                            onClick={() => handleEmergencyTreatment(player)}
                            className="text-[11px] font-bold cursor-pointer"
                          >
                            <Sparkles size={12} className="inline mr-1" />
                            Trattamento d'Urto (-7gg / 50.000 HS)
                          </RetroButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
