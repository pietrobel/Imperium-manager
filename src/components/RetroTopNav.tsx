import React from 'react';
import { RetroButton } from './RetroButton';
import { Volume2, VolumeX, Save, ArrowLeft, Music } from 'lucide-react';
import { audio } from '../services/audioService';

export type ScreenId =
  | 'DASHBOARD'
  | 'SQUAD'
  | 'TRAINING'
  | 'LEAGUE'
  | 'FIXTURES'
  | 'NATIONALS'
  | 'TRANSFERS'
  | 'CUPS'
  | 'HISTORY'
  | 'SETTINGS';

interface RetroTopNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  dateText: string;
  treasuryHS: number;
  clubName: string;
  onAdvanceDay: () => void;
  isSimulating: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  musicEnabled?: boolean;
  onToggleMusic?: () => void;
  onQuickSave: () => void;
  onBackToMainMenu?: () => void;
  onGoBack?: () => void;
  hasActiveCareer?: boolean;
}

export const RetroTopNav: React.FC<RetroTopNavProps> = ({
  currentScreen,
  onNavigate,
  dateText,
  treasuryHS,
  clubName,
  onAdvanceDay,
  isSimulating,
  soundEnabled,
  onToggleSound,
  musicEnabled = true,
  onToggleMusic,
  onQuickSave,
  onBackToMainMenu,
  onGoBack,
  hasActiveCareer = true
}) => {
  const navItems: { id: ScreenId; label: string }[] = [
    { id: 'DASHBOARD', label: 'Tabularium' },
    { id: 'SQUAD', label: 'Coorte' },
    { id: 'TRAINING', label: 'Addestramento' },
    { id: 'LEAGUE', label: 'Campionato' },
    { id: 'NATIONALS', label: 'Nazionali' },
    { id: 'FIXTURES', label: 'Calendario' },
    { id: 'TRANSFERS', label: 'Foro Atleti' },
    { id: 'CUPS', label: 'Grandi Coppe' },
    { id: 'HISTORY', label: 'Fasti & Archivio' },
    { id: 'SETTINGS', label: 'Impostazioni' }
  ];

  // If no career is active, show only public archive and settings
  const visibleNavItems = hasActiveCareer
    ? navItems
    : navItems.filter(item => item.id === 'HISTORY' || item.id === 'SETTINGS');

  return (
    <header className="w-full bg-[#3d0b10] border-b border-[#731922] select-none text-xs shrink-0 z-40 shadow-xl">
      {/* Upper Status Ribbon */}
      <div className="bg-[#240507] border-b border-[#521016] px-3 sm:px-4 py-1 flex items-center justify-between text-[#cbd5e1] gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onGoBack && (
            <button
              onClick={onGoBack}
              title="Torna Indietro"
              className="flex items-center gap-1 font-roman text-[10px] font-bold px-2 py-0.5 bg-[#63141c] hover:bg-[#801b25] text-[#fef08a] border border-[#d4af37]/60 rounded-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft size={11} />
              <span>Indietro</span>
            </button>
          )}
          {onBackToMainMenu && (
            <button
              onClick={onBackToMainMenu}
              title="Torna al Menu Principale"
              className="flex items-center gap-1 font-roman text-[10px] font-bold px-2 py-0.5 bg-[#420d11] hover:bg-[#63141c] text-[#facc15] border border-[#d4af37]/40 rounded-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Menu</span>
            </button>
          )}
          <span className="text-[#d4af37] font-semibold font-roman tracking-wide truncate">{clubName}</span>
          <span className="text-[#64748b] hidden sm:inline">·</span>
          <span className="font-data text-[#e2e8f0] hidden md:inline truncate">{dateText}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {hasActiveCareer && (
            <div className="flex items-center gap-1.5 font-data whitespace-nowrap">
              <span className="text-[#94a3b8]">Erario:</span>
              <span className="text-[#facc15] font-bold">{treasuryHS.toLocaleString()} HS</span>
            </div>
          )}
          {hasActiveCareer && (
            <button
              onClick={onQuickSave}
              title="Salva Carriera nel Tabularium"
              className="flex items-center gap-1 text-[#cbd5e1] hover:text-[#d4af37] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Save size={13} />
              <span className="hidden sm:inline">Salva</span>
            </button>
          )}
          {onToggleMusic && (
            <button
              onClick={onToggleMusic}
              title={musicEnabled ? 'Disattiva Musica Antiqua' : 'Attiva Musica Antiqua'}
              className={`flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                musicEnabled && soundEnabled ? 'text-[#facc15] hover:text-white' : 'text-[#64748b] hover:text-[#cbd5e1]'
              }`}
            >
              <Music size={13} />
              <span className="hidden lg:inline text-[10px] font-roman">
                {musicEnabled && soundEnabled ? 'Musica ON' : 'Musica OFF'}
              </span>
            </button>
          )}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Disattiva Audio' : 'Attiva Audio'}
            className="text-[#cbd5e1] hover:text-[#d4af37] transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>

      {/* Main 3-Zone Navigation Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-5 px-3 sm:px-4 py-1.5 bg-gradient-to-b from-[#4d0f15] to-[#38090d]">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-roman text-sm sm:text-base font-black tracking-wider text-[#d4af37] drop-shadow-sm whitespace-nowrap">
            MAGISTER LUDORUM
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto py-0.5 min-w-0">
          {visibleNavItems.map(item => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClick();
                  onNavigate(item.id);
                }}
                className={`px-2.5 py-1 text-[11px] sm:text-xs font-roman font-bold rounded-xs whitespace-nowrap shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#63141c] text-[#facc15] border-[#d4af37] shadow-md font-semibold'
                    : 'text-[#cbd5e1] border-transparent hover:text-white hover:bg-[#521118]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveCareer ? (
            <RetroButton
              variant="crimson"
              size="sm"
              disabled={isSimulating}
              onClick={onAdvanceDay}
              className="font-bold tracking-wide uppercase px-3 py-1.5 shadow-lg border border-[#f87171] text-white whitespace-nowrap"
            >
              {isSimulating ? 'Agone in corso...' : 'Disputa Agone'}
            </RetroButton>
          ) : (
            <RetroButton
              variant="gold"
              size="sm"
              onClick={onBackToMainMenu}
              className="font-bold tracking-wide uppercase px-3 py-1.5 shadow-lg flex items-center gap-1 text-xs whitespace-nowrap"
            >
              <ArrowLeft size={13} />
              <span>Menu Principale</span>
            </RetroButton>
          )}
        </div>
      </div>
    </header>
  );
};
