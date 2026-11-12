import React from 'react';
import { RetroButton } from '../components/RetroButton';
import { Shield, Play, FolderOpen, Trophy, Settings, Scroll, Globe, Swords, Music } from 'lucide-react';
import type { CareerSave } from '../types';

interface MainMenuScreenProps {
  onNewGame: () => void;
  onQuickStartRoma: () => void;
  onLoadGame: (career: CareerSave) => void;
  savedCareers: CareerSave[];
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  musicEnabled?: boolean;
  onToggleMusic?: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onNewGame,
  onQuickStartRoma,
  onLoadGame,
  savedCareers,
  onOpenHistory,
  onOpenSettings,
  musicEnabled = true,
  onToggleMusic
}) => {
  return (
    <div className="h-dvh w-full bg-[#0a0d14] flex items-center justify-center p-2.5 sm:p-4 relative overflow-hidden select-none">
      {/* Background atmospheric lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2b090e] via-[#0e0a0e] to-[#06080b] opacity-90 pointer-events-none" />

      {/* Main 16:9 Adaptive Frame */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92dvh] retro-box p-4 sm:p-6 flex flex-col justify-between shadow-2xl overflow-hidden">
        {onToggleMusic && (
          <div className="flex justify-end pb-1 shrink-0">
            <button
              type="button"
              onClick={onToggleMusic}
              className={`px-2.5 py-1 rounded-xs border text-[11px] font-roman flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                musicEnabled
                  ? 'bg-[#2b080b] border-[#d4af37]/60 text-[#facc15] hover:bg-[#3d0b10]'
                  : 'bg-[#141720] border-[#2d3748] text-[#94a3b8] hover:text-white'
              }`}
            >
              <Music size={12} />
              <span>{musicEnabled ? 'Musica Antiqua: ON' : 'Musica Antiqua: OFF'}</span>
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch flex-1 min-h-0">
          {/* Left Column: Title Crest & Primary Actions */}
          <div className="md:col-span-6 flex flex-col items-center justify-center text-center space-y-3 py-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#d4af37] bg-[#1a1512] flex items-center justify-center shadow-lg shrink-0">
              <Shield size={26} className="text-[#d4af37]" />
            </div>

            <div>
              <h1 className="font-roman text-2xl sm:text-3xl font-black tracking-widest text-[#d4af37] drop-shadow-md text-balance">
                MAGISTER LUDORUM
              </h1>
              <div className="font-roman text-[11px] tracking-widest text-[#cbd5e1] uppercase mt-1">
                182ª Olimpiade · Harpastum dell’Antichità (50 a.C.)
              </div>
            </div>

            <div className="w-full max-w-sm space-y-2 pt-1">
              <RetroButton
                variant="crimson"
                size="lg"
                className="w-full py-2.5 text-xs sm:text-sm font-bold tracking-wider font-roman uppercase shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={onQuickStartRoma}
              >
                <Play size={15} />
                <span>Carriera Rapida: SPQR Roma</span>
              </RetroButton>

              <RetroButton
                variant="gold"
                size="lg"
                className="w-full py-2 text-xs sm:text-sm font-bold tracking-wider font-roman uppercase shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={onNewGame}
              >
                <Scroll size={15} />
                <span>Nuova Carriera Personalizzata</span>
              </RetroButton>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <RetroButton
                  variant="secondary"
                  size="md"
                  className="py-2 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                  onClick={onOpenHistory}
                >
                  <Trophy size={14} className="text-[#facc15]" />
                  <span>Albo d'Oro</span>
                </RetroButton>

                <RetroButton
                  variant="secondary"
                  size="md"
                  className="py-2 text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                  onClick={onOpenSettings}
                >
                  <Settings size={14} />
                  <span>Impostazioni</span>
                </RetroButton>
              </div>
            </div>
          </div>

          {/* Right Column: Saved Careers OR World Overview */}
          <div className="md:col-span-6 retro-inset p-3.5 sm:p-4 border border-[#521016] flex flex-col min-h-0 overflow-hidden">
            {savedCareers.length > 0 ? (
              <>
                <div className="text-[11px] text-[#d4af37] font-roman font-bold uppercase tracking-wider pb-2 mb-2 border-b border-[#420d11] flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen size={14} />
                    <span>Tabularium Salvataggi</span>
                  </span>
                  <span className="font-data text-[#94a3b8]">{savedCareers.length} archiviati</span>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
                  {savedCareers.map(career => (
                    <button
                      key={career.id}
                      onClick={() => onLoadGame(career)}
                      className="w-full text-left p-2.5 bg-[#1b0508] hover:bg-[#320a0e] transition-colors border border-[#521016] hover:border-[#d4af37]/70 flex items-center justify-between text-xs cursor-pointer group rounded-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-[#f8fafc] group-hover:text-[#d4af37] truncate">
                          {career.saveName}
                        </div>
                        <div className="text-[10px] text-[#94a3b8] font-data truncate">
                          {career.currentDateText} · {career.manager.nome} {career.manager.cognome}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#38bdf8] font-data shrink-0 whitespace-nowrap">
                        Giornata {career.currentMatchday} &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-2.5 text-xs">
                <div className="text-[11px] text-[#d4af37] font-roman font-bold uppercase tracking-wider pb-1.5 border-b border-[#420d11] flex items-center gap-1.5">
                  <Globe size={14} />
                  <span>Compendio del Mondo Antico</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-data">
                  <div className="p-2.5 bg-[#190406] border border-[#420d11] rounded-xs">
                    <div className="text-[10px] font-roman text-[#94a3b8]">Campionati & Leghe</div>
                    <div className="text-base font-bold text-[#facc15]">30 Leghe · 450 Club</div>
                  </div>
                  <div className="p-2.5 bg-[#190406] border border-[#420d11] rounded-xs">
                    <div className="text-[10px] font-roman text-[#94a3b8]">Database Atleti</div>
                    <div className="text-base font-bold text-[#38bdf8]">12.750 Gladiatori</div>
                  </div>
                  <div className="p-2.5 bg-[#190406] border border-[#420d11] rounded-xs">
                    <div className="text-[10px] font-roman text-[#94a3b8]">Coppe & Nazionali</div>
                    <div className="text-base font-bold text-[#10b981]">4 Coppe · 16 Nazioni</div>
                  </div>
                  <div className="p-2.5 bg-[#190406] border border-[#420d11] rounded-xs">
                    <div className="text-[10px] font-roman text-[#94a3b8]">Arena 2D Tattica</div>
                    <div className="text-base font-bold text-white flex items-center gap-1">
                      <Swords size={14} className="text-[#f87171]" />
                      <span>12 vs 12 Mete</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-snug font-roman">
                  Assumi il comando di una legione sferica, gestisci erario, contratti e mercato delle offerte, schiera i Duodecim Primarii e guida il tuo sodalizio al trionfo nell'Impero.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer notes */}
        <div className="mt-3 pt-2.5 border-t border-[#420d11] w-full text-center text-[10px] text-[#94a3b8] shrink-0">
          Simulatore gestionale storico dell'Harpastum · Adattato a schermi 16:9 PC e Tablet · Salvataggio locale offline
        </div>
      </div>
    </div>
  );
};
