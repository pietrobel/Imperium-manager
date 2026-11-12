import React, { useState } from 'react';
import type { Player, Club } from '../types';
import { getHarpastumRole, getHarpastumCategory, getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import { audio } from '../services/audioService';
import { Shield, Move, Sparkles, RefreshCw, Info } from 'lucide-react';

interface TacticalSlateProps {
  userClub: Club;
  squad: Player[];
  onSwapStarters?: (newStartersIds: string[]) => void;
  onSelectPlayer?: (player: Player) => void;
  compact?: boolean;
}

interface SlatePosition {
  slotIndex: number;
  label: string;
  category: 'CUSTOS' | 'LUCTATOR' | 'TRACTOR' | 'PRAEVENIENS';
  xPercent: number; // 0-100
  yPercent: number; // 0-100
}

// 12 canonical positions on the Roman Harpastum Slate (attacks Top, defends Bottom)
const SLATE_POSITIONS: SlatePosition[] = [
  // 1 Custos Castrorum
  { slotIndex: 0, label: 'CUS', category: 'CUSTOS', xPercent: 50, yPercent: 87 },
  // 4 Luctatores (Lotta & Vallo difensivo)
  { slotIndex: 1, label: 'LUC-S', category: 'LUCTATOR', xPercent: 17, yPercent: 70 },
  { slotIndex: 2, label: 'LUC-C1', category: 'LUCTATOR', xPercent: 38, yPercent: 72 },
  { slotIndex: 3, label: 'LUC-C2', category: 'LUCTATOR', xPercent: 62, yPercent: 72 },
  { slotIndex: 4, label: 'LUC-D', category: 'LUCTATOR', xPercent: 83, yPercent: 70 },
  // 4 Tractores (Mediani e Apripista di centrocampo)
  { slotIndex: 5, label: 'TRA-M1', category: 'TRACTOR', xPercent: 18, yPercent: 51 },
  { slotIndex: 6, label: 'TRA-C1', category: 'TRACTOR', xPercent: 39, yPercent: 49 },
  { slotIndex: 7, label: 'TRA-C2', category: 'TRACTOR', xPercent: 61, yPercent: 49 },
  { slotIndex: 8, label: 'TRA-M2', category: 'TRACTOR', xPercent: 82, yPercent: 51 },
  // 3 Praevenientes (Cursori d'Assalto & Arieti)
  { slotIndex: 9, label: 'CUR-S', category: 'PRAEVENIENS', xPercent: 22, yPercent: 29 },
  { slotIndex: 10, label: 'CUR-C', category: 'PRAEVENIENS', xPercent: 50, yPercent: 23 },
  { slotIndex: 11, label: 'CUR-D', category: 'PRAEVENIENS', xPercent: 78, yPercent: 29 }
];

export const TacticalSlate: React.FC<TacticalSlateProps> = ({
  userClub,
  squad,
  onSwapStarters,
  onSelectPlayer,
  compact = false
}) => {
  const computeInitialStarters = (): string[] => {
    const squadMap = new Map(squad.map(p => [p.id, p]));
    const picked: string[] = [];
    const seen = new Set<string>();

    for (const id of userClub.titolariIds || []) {
      const p = squadMap.get(id);
      if (p && !p.infortunato && !p.squalificato && !seen.has(id)) {
        picked.push(id);
        seen.add(id);
        if (picked.length >= 12) break;
      }
    }

    if (picked.length < 12) {
      const fallback = [...squad]
        .filter(p => !seen.has(p.id))
        .sort((a, b) => {
          const aPen = a.infortunato || a.squalificato ? -1000 : 0;
          const bPen = b.infortunato || b.squalificato ? -1000 : 0;
          return (b.valoreGenerale + bPen) - (a.valoreGenerale + aPen);
        });
      for (const p of fallback) {
        picked.push(p.id);
        seen.add(p.id);
        if (picked.length >= 12) break;
      }
    }

    return picked;
  };

  const [startersOrder, setStartersOrder] = useState<string[]>(computeInitialStarters);

  React.useEffect(() => {
    setStartersOrder(computeInitialStarters());
  }, [userClub.id, (userClub.titolariIds || []).join(','), squad.length]);

  // Drag and drop state
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [draggedBenchId, setDraggedBenchId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [selectedTokenSlot, setSelectedTokenSlot] = useState<number | null>(null);

  const starters = startersOrder.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
  const bench = squad.filter(p => !startersOrder.includes(p.id)).sort((a, b) => b.valoreGenerale - a.valoreGenerale);

  const handleDragStartSlot = (e: React.DragEvent, slot: number) => {
    setDraggedSlot(slot);
    setDraggedBenchId(null);
    e.dataTransfer.setData('text/plain', `slot:${slot}`);
  };

  const handleDragStartBench = (e: React.DragEvent, pId: string) => {
    setDraggedBenchId(pId);
    setDraggedSlot(null);
    e.dataTransfer.setData('text/plain', `bench:${pId}`);
  };

  const handleDragOver = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    setDragOverSlot(targetSlot);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (draggedSlot !== null && draggedSlot !== targetSlot) {
      const newOrder = [...startersOrder];
      const temp = newOrder[draggedSlot];
      newOrder[draggedSlot] = newOrder[targetSlot];
      newOrder[targetSlot] = temp;
      setStartersOrder(newOrder);
      audio.playClick();
      if (onSwapStarters) onSwapStarters(newOrder);
    } else if (draggedBenchId) {
      const newOrder = [...startersOrder];
      newOrder[targetSlot] = draggedBenchId;
      setStartersOrder(newOrder);
      audio.playClick();
      if (onSwapStarters) onSwapStarters(newOrder);
    }

    setDraggedSlot(null);
    setDraggedBenchId(null);
  };

  const handleSlotClick = (slot: number) => {
    if (selectedTokenSlot === null) {
      setSelectedTokenSlot(slot);
      audio.playClick();
    } else if (selectedTokenSlot === slot) {
      setSelectedTokenSlot(null);
    } else {
      const newOrder = [...startersOrder];
      const temp = newOrder[selectedTokenSlot];
      newOrder[selectedTokenSlot] = newOrder[slot];
      newOrder[slot] = temp;
      setStartersOrder(newOrder);
      setSelectedTokenSlot(null);
      audio.playTone(800, 0.1);
      if (onSwapStarters) onSwapStarters(newOrder);
    }
  };

  const handleBenchClick = (bPlayerId: string) => {
    if (selectedTokenSlot !== null) {
      const newOrder = [...startersOrder];
      newOrder[selectedTokenSlot] = bPlayerId;
      setStartersOrder(newOrder);
      setSelectedTokenSlot(null);
      audio.playTone(800, 0.1);
      if (onSwapStarters) onSwapStarters(newOrder);
    }
  };

  const handleAutoOptimize = () => {
    const best = [...squad].sort((a, b) => b.valoreGenerale - a.valoreGenerale).slice(0, 12).map(p => p.id);
    setStartersOrder(best);
    setSelectedTokenSlot(null);
    audio.playGoal();
    if (onSwapStarters) onSwapStarters(best);
  };

  return (
    <div
      className={`retro-box bg-gradient-to-b from-[#2a0609] via-[#1a0406] to-[#0e0203] border border-[#85222b] shadow-2xl select-none flex flex-col min-h-0 overflow-hidden ${
        compact ? 'h-full p-2.5 gap-2' : 'h-full p-3 gap-2.5'
      }`}
    >
      {/* Slate Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-[#731922] gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 bg-[#800020] border border-[#d4af37] rounded-xs shadow shrink-0">
            <Move size={13} className="text-[#d4af37]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-roman text-xs font-bold text-[#d4af37] tracking-wider uppercase truncate">
              BACHECA TATTICA (TABULA CERATA)
            </h2>
            {!compact && (
              <div className="text-[10px] text-[#94a3b8] font-roman truncate">
                Trascina o tocca i gettoni per scambiare posizioni tra i 12 titolari e le riserve
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoOptimize}
          className="px-2.5 py-1 bg-[#190305] hover:bg-[#3d0b10] text-[#facc15] border border-[#d4af37]/40 rounded-xs text-[10px] font-roman flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles size={11} />
          <span>Miglior 12 Titolari</span>
        </button>
      </div>

      {/* Main Arena + Bench Split (Fits 16:9 screens vertically) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-stretch">
        {/* The Sand Arena Slate */}
        <div className="sm:col-span-8 h-full min-h-[240px] flex items-center justify-center">
          <div className="relative w-full h-full bg-[#8b5a2b] border-3 border-[#3d1808] rounded-sm overflow-hidden shadow-2xl">
            {/* Sand texture pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#6b401b_1px,transparent_1px)] [background-size:14px_14px] opacity-40 pointer-events-none" />

            {/* Top Meta (Castra Opposita) */}
            <div className="absolute inset-x-2 top-1.5 h-0.5 bg-[#fef08a] border-t border-dashed border-[#d4af37]" />
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[7.5px] font-roman uppercase tracking-widest text-[#fef08a] bg-black/60 px-2 py-0.5 rounded-xs pointer-events-none whitespace-nowrap">
              CASTRA OPPOSITA (META AVVERSARIA)
            </div>

            {/* Mesê Grammê (Middle contest line - no center circle) */}
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-[#fef08a]/75" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6b401b]/90 border border-[#fef08a]/60 px-2 py-0.5 rounded-xs pointer-events-none">
              <span className="text-[7px] font-roman text-[#fef08a] uppercase tracking-widest whitespace-nowrap">
                Mesê Grammê
              </span>
            </div>

            {/* Bottom Meta (Castra Propria) */}
            <div className="absolute inset-x-2 bottom-1.5 h-0.5 bg-[#fef08a] border-b border-dashed border-[#d4af37]" />
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[7.5px] font-roman uppercase tracking-widest text-[#fef08a] bg-black/60 px-2 py-0.5 rounded-xs pointer-events-none whitespace-nowrap">
              CASTRA PROPRIA (FONDO AMICO)
            </div>

            {/* 12 Interactive Drag-and-Drop Tokens */}
            {SLATE_POSITIONS.map(pos => {
              const player = starters[pos.slotIndex];
              const isSelected = selectedTokenSlot === pos.slotIndex;
              const isDragTarget = dragOverSlot === pos.slotIndex;

              return (
                <div
                  key={pos.slotIndex}
                  style={{
                    left: `${pos.xPercent}%`,
                    top: `${pos.yPercent}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  draggable={!!player}
                  onDragStart={e => handleDragStartSlot(e, pos.slotIndex)}
                  onDragOver={e => handleDragOver(e, pos.slotIndex)}
                  onDrop={e => handleDrop(e, pos.slotIndex)}
                  onClick={() => handleSlotClick(pos.slotIndex)}
                  onDoubleClick={() => player && onSelectPlayer?.(player)}
                  title={player ? `${player.nome} ${player.cognome} (${player.valoreGenerale} OVR) — Clic per scambiare, doppio clic per Dossier` : 'Slot vacante'}
                  className={`absolute cursor-pointer transition-all z-20 flex flex-col items-center group ${
                    isDragTarget
                      ? 'scale-120 ring-2 ring-[#d4af37]'
                      : isSelected
                      ? 'scale-110 ring-2 ring-[#fef08a] animate-pulse'
                      : 'hover:scale-108'
                  }`}
                >
                  <div
                    className={`rounded-full border-2 shadow-xl flex flex-col items-center justify-center relative overflow-hidden ${
                      compact ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-10 sm:h-10'
                    }`}
                    style={{
                      backgroundColor: userClub.colori?.primary || '#800020',
                      borderColor:
                        pos.category === 'CUSTOS'
                          ? '#facc15'
                          : pos.category === 'LUCTATOR'
                          ? '#60a5fa'
                          : pos.category === 'TRACTOR'
                          ? '#34d399'
                          : '#f87171'
                    }}
                  >
                    <span
                      className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-2 opacity-90 pointer-events-none"
                      style={{ backgroundColor: userClub.colori?.secondary || '#d4af37' }}
                    />
                    <span className="relative z-10 text-[7px] font-roman font-black text-white bg-black/70 px-1 rounded-xs leading-tight tracking-tighter">
                      {pos.label}
                    </span>
                    <span className="relative z-10 text-[8.5px] font-data font-black text-[#facc15] bg-black/70 px-1 rounded-xs leading-none mt-0.5">
                      {player ? player.valoreGenerale : '--'}
                    </span>
                  </div>

                  <div className="bg-black/85 border border-[#d4af37]/60 text-white px-1 py-0.2 rounded-xs text-[8px] sm:text-[9px] font-roman font-bold truncate max-w-[74px] text-center mt-0.5 shadow-md">
                    {player ? player.cognome : 'Vacante'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bench / Riserve Side Panel */}
        <div className="sm:col-span-4 h-full min-h-0 p-2 retro-inset bg-[#140203] border border-[#521016] rounded-xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-roman pb-1.5 mb-1.5 border-b border-[#420d11] shrink-0">
            <span className="text-[#d4af37] font-bold uppercase tracking-wider flex items-center gap-1 truncate">
              <Shield size={11} />
              <span>Riserve ({bench.length})</span>
            </span>
            <span className="text-[9px] text-[#94a3b8] shrink-0">Trascina o clicca</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5">
            {bench.map(bp => {
              const rBadge = getHarpastumRoleBadgeStyle(bp.ruoloPrimario);
              return (
                <div
                  key={bp.id}
                  draggable
                  onDragStart={e => handleDragStartBench(e, bp.id)}
                  onClick={() => handleBenchClick(bp.id)}
                  onDoubleClick={() => onSelectPlayer?.(bp)}
                  title="Trascina su un titolare o clicca uno slot attivo per scambiare"
                  className="p-1.5 bg-[#200407] hover:bg-[#3d0b10] border border-[#521016] hover:border-[#d4af37] rounded-xs cursor-grab active:cursor-grabbing text-left transition-all flex items-center justify-between gap-1.5 text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`px-1 py-0.5 rounded-xs text-[8px] font-bold font-roman border shrink-0 ${rBadge.bg} ${rBadge.text} ${rBadge.border}`}>
                      {rBadge.label}
                    </span>
                    <span className="font-roman font-bold text-white text-[11px] truncate">
                      {bp.cognome}
                    </span>
                  </div>
                  <span className="text-[10px] font-data font-bold text-[#facc15] shrink-0">
                    {bp.valoreGenerale}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
