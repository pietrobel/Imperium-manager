import React, { useState } from 'react';
import type { CareerSave, Match } from '../types';
import { INITIAL_COMPETITIONS, getParticipatingClubsForCompetition } from '../engines/cupEngine';
import { Trophy, Shield, Award, Users, Calendar, Flag, Sparkles, ArrowLeft } from 'lucide-react';
import { RetroButton } from '../components/RetroButton';

interface CompetitionsScreenProps {
  career: CareerSave;
  onBack?: () => void;
}

export const CompetitionsScreen: React.FC<CompetitionsScreenProps> = ({ career, onBack }) => {
  const competitions = Object.values(INITIAL_COMPETITIONS);
  const [selectedCompId, setSelectedCompId] = useState<string>(competitions[0].id);

  const currentComp = INITIAL_COMPETITIONS[selectedCompId] || competitions[0];
  const participantIds = getParticipatingClubsForCompetition(currentComp.id, career.clubs);
  const participatingClubs = participantIds.map(id => career.clubs[id]).filter(Boolean);

  // Filter actual matches belonging to this cup from career
  const cupMatches = career.matches.filter(m => m.competitionId === currentComp.id);

  return (
    <div className="space-y-4 select-none">
      {/* Competitions Selector Bar */}
      <div className="retro-box p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          {onBack && (
            <RetroButton
              variant="secondary"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-1 font-roman text-xs font-bold shrink-0 cursor-pointer border border-[#d4af37]/40"
            >
              <ArrowLeft size={14} />
              <span>Torna al Tabularium</span>
            </RetroButton>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <Trophy size={18} className="text-[#d4af37]" />
            <div>
              <h1 className="font-roman text-sm font-bold text-white tracking-wide">
                LE GRANDI COPPE DELL'IMPERO · 182ª OLIMPIADE
              </h1>
              <span className="text-[10px] text-[#94a3b8]">
                3 Coppe Internazionali e Tornei Nazionali a Eliminazione Diretta
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {competitions.map(c => {
            const isSelected = selectedCompId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompId(c.id)}
                className={`px-3 py-1.5 text-xs font-roman font-bold rounded-xs whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1e2738] text-[#d4af37] border-[#d4af37] shadow-sm'
                    : 'bg-[#111622] text-[#94a3b8] border-[#222b3d] hover:text-white'
                }`}
              >
                {c.nome.split('(')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Competition Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Knockout Bracket & Matches */}
        <div className="lg:col-span-2 retro-box p-4 space-y-4">
          <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-b border-[#252e42] -mx-4 -mt-4 mb-4">
            <div>
              <h2 className="font-roman text-xs font-bold tracking-wide text-white flex items-center gap-2">
                <Sparkles size={14} className="text-[#d4af37]" />
                {currentComp.nome.toUpperCase()}
              </h2>
              <span className="text-[10px] text-[#94a3b8] font-roman">
                Regione: {currentComp.regione} · Trofeo: {currentComp.trofeo}
              </span>
            </div>
            <span className="text-xs font-data text-[#d4af37] font-bold">Edizione indetta nell'anno 3 della 182ª Olimpiade</span>
          </div>

          <div className="text-xs text-[#94a3b8] leading-relaxed bg-[#111622] p-3 rounded-xs border border-[#232d3f]">
            {currentComp.id === 'cup_munus_caesarum' && (
              <p>
                Il <strong>Munus Caesarum</strong> è la massima competizione continentale dell'antichità: riunisce i 16 campioni e le legioni più gloriose di Roma, Grecia, Cartagine, Egitto, Gallia, Persia, Iberia e Britannia. Chi trionfa riceve l'Alloro d'Oro e l'immortalità sportiva.
              </p>
            )}
            {currentComp.id === 'cup_mare_nostrum' && (
              <p>
                La <strong>Corona Mare Nostrum</strong> vede affrontarsi le grandi potenze marittime del Mediterraneo: le triremi di Tiro, le flotte di Cartagine, Atene, Alessandria, Siracusa e Neapolis per il dominio delle acque sacre.
              </p>
            )}
            {currentComp.id === 'cup_scudo_province' && (
              <p>
                Lo <strong>Scudo delle Province e dei Confini</strong> celebra la forza indomita delle legioni di frontiera e dei popoli guerrieri di Gallia, Britannia, Germania, Dacia, Tracia, Partia e Sarmatia lungo il Vallo e il Danubio.
              </p>
            )}
            {currentComp.id === 'cup_consolare' && (
              <p>
                La <strong>Coppa Consolare di Roma</strong> è la storica contesa nazionale d'Italia e del Lazio istituita dai Consoli della Repubblica per incoronare la legione sferica regina della penisola.
              </p>
            )}
          </div>

          {/* Knockout Bracket Grid */}
          <div className="space-y-3 font-data text-xs">
            <h3 className="font-roman text-xs font-bold text-[#d4af37] border-b border-[#1b2333] pb-1 flex items-center justify-between">
              <span>TABELLONE DELLA COMPETIZIONE</span>
              <span className="text-[10px] text-[#94a3b8] font-sans">
                {participatingClubs.length} Club Qualificati
              </span>
            </h3>

            {/* Pairings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {participatingClubs.slice(0, 8).map((home, idx) => {
                const away = participatingClubs[participatingClubs.length - 1 - idx];
                if (!away || home.id === away.id) return null;

                // Check if match already has result in cup
                const matchRecord = cupMatches.find(
                  m => (m.clubCasaId === home.id && m.clubOspiteId === away.id) ||
                       (m.clubCasaId === away.id && m.clubOspiteId === home.id)
                );

                const hasResult = matchRecord && matchRecord.disputata && matchRecord.risultato;

                return (
                  <div
                    key={`${home.id}_${away.id}`}
                    className="retro-inset p-3 border-l-2 border-l-[#d4af37] hover:border-l-[#38bdf8] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#64748b] mb-1.5 font-roman">
                      <span>QUARTO DI FINALE {idx + 1}</span>
                      <span>Stadio {home.stadioNome}</span>
                    </div>

                    <div className="flex justify-between items-center font-semibold text-white">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: home.colori.primary }} />
                        <span className="truncate">{home.nome}</span>
                      </div>
                      <span className="text-[#d4af37] font-bold text-sm ml-2">
                        {hasResult ? matchRecord.risultato!.golCasa : '-'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#cbd5e1] mt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: away.colori.primary }} />
                        <span className="truncate">{away.nome}</span>
                      </div>
                      <span className="text-[#d4af37] font-bold text-sm ml-2">
                        {hasResult ? matchRecord.risultato!.golOspite : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Trophy Details & Participating Clubs List */}
        <div className="space-y-4">
          {/* Trophy Spotlight Card */}
          <div className="retro-box p-4 space-y-3">
            <div className="flex flex-col items-center justify-center p-4 bg-[#111622] rounded-xs border border-[#232d3f] text-center">
              <div className="w-16 h-16 rounded-full bg-[#1e2738] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] mb-2 shadow-inner">
                <Trophy size={28} />
              </div>
              <h3 className="font-roman text-xs font-bold text-white tracking-wide">
                {currentComp.trofeo}
              </h3>
              <span className="text-[11px] text-[#d4af37] font-roman">
                Premio per il Club Trionfatore
              </span>
              <p className="text-[10px] text-[#94a3b8] mt-2">
                1.500.000 Sesterzi (HS) in premio cassa, reputazione continentale +50 e iscrizione perenne negli Annali Senatorii.
              </p>
            </div>
          </div>

          {/* Qualified Clubs List */}
          <div className="retro-box p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#252e42] pb-2">
              <span className="font-roman text-xs font-bold text-white flex items-center gap-1.5">
                <Shield size={14} className="text-[#38bdf8]" />
                SQUADRE PARTECIPANTI ({participatingClubs.length})
              </span>
              <span className="text-[10px] text-[#94a3b8] font-data">Livello 1</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 font-data text-xs">
              {participatingClubs.map(c => (
                <div
                  key={c.id}
                  className="p-2 bg-[#111622] rounded-xs border border-[#1e2738] flex items-center justify-between hover:bg-[#1a2333] transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.colori.primary }} />
                    <span className="font-semibold text-white truncate font-sans text-xs">{c.nome}</span>
                  </div>
                  <span className="text-[10px] text-[#facc15] font-bold shrink-0 ml-2">
                    Rep. {c.reputazione}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
