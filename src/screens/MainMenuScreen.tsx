import React from 'react';
import { RetroButton } from '../components/RetroButton';
import { Shield, Play, FolderOpen, Trophy, Settings, Scroll } from 'lucide-react';
import type { CareerSave } from '../types';

interface MainMenuScreenProps {
  onNewGame: () => void;
  onQuickStartRoma: () => void;
  onLoadGame: (career: CareerSave) => void;
  savedCareers: CareerSave[];
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onNewGame,
  onQuickStartRoma,
  onLoadGame,
  savedCareers,
  onOpenHistory,
  onOpenSettings
}) => {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Roman texture hint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#182030] via-[#0c0f16] to-[#06080b] opacity-80" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-xl retro-box p-6 sm:p-8 flex flex-col items-center shadow-2xl">
        {/* Imperial Eagle / SPQR Laurel Crest */}
        <div className="w-16 h-16 rounded-full border-2 border-[#d4af37] bg-[#1a1512] flex items-center justify-center mb-4 shadow-lg">
          <Shield size={32} className="text-[#d4af37]" />
        </div>

        {/* Title */}
        <h1 className="font-roman text-3xl sm:text-4xl font-black tracking-widest text-[#d4af37] text-center drop-shadow-md">
          IMPERIUM MANAGER
        </h1>
        <div className="font-roman text-xs tracking-widest text-[#cbd5e1] uppercase mt-1 mb-6 text-center">
          182ª OLIMPIADE · IL GRANDE MANAGERIALE CALCISTICO DELL’ANTICHITÀ
        </div>

        {/* Menu Buttons List */}
        <div className="w-full space-y-2.5 max-w-md">
          <RetroButton
            variant="crimson"
            size="lg"
            className="w-full py-3 text-sm font-bold tracking-wider font-roman uppercase shadow-md flex items-center justify-center gap-2"
            onClick={onQuickStartRoma}
          >
            <Play size={16} />
            <span>Carriera Rapida: SPQR Roma Caput Mundi</span>
          </RetroButton>

          <RetroButton
            variant="gold"
            size="lg"
            className="w-full py-2.5 text-sm font-bold tracking-wider font-roman uppercase shadow-sm flex items-center justify-center gap-2"
            onClick={onNewGame}
          >
            <Scroll size={16} />
            <span>Nuova Carriera Personalizzata</span>
          </RetroButton>

          {savedCareers.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] text-[#94a3b8] font-roman uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
                <FolderOpen size={12} />
                <span>Carica Salvataggio ({savedCareers.length})</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {savedCareers.map(career => (
                  <button
                    key={career.id}
                    onClick={() => onLoadGame(career)}
                    className="w-full text-left p-2 retro-inset hover:bg-[#1b2333] transition-colors border border-[#20293d] flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div>
                      <div className="font-semibold text-[#f8fafc] group-hover:text-[#d4af37]">
                        {career.saveName}
                      </div>
                      <div className="text-[10px] text-[#94a3b8] font-data">
                        {career.currentDateText} · {career.manager.nome} {career.manager.cognome}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#38bdf8] font-data">
                      Giornata {career.currentMatchday} &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <RetroButton
              variant="secondary"
              size="md"
              className="py-2 text-xs flex items-center justify-center gap-1.5"
              onClick={onOpenHistory}
            >
              <Trophy size={14} className="text-[#facc15]" />
              <span>Albo d'Oro</span>
            </RetroButton>

            <RetroButton
              variant="secondary"
              size="md"
              className="py-2 text-xs flex items-center justify-center gap-1.5"
              onClick={onOpenSettings}
            >
              <Settings size={14} />
              <span>Impostazioni</span>
            </RetroButton>
          </div>
        </div>

        {/* Footer notes */}
        <div className="mt-8 pt-4 border-t border-[#1b2333] w-full text-center text-[10px] text-[#64748b]">
          Simulatore gestionale calcistico storico · Sensible / Championship Manager Style · Nessuna dipendenza AI esterna
        </div>
      </div>
    </div>
  );
};
