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
  { slotIndex: 0, label: 'CUS', category: 'CUSTOS', xPercent: 50, yPercent: 88 },
  // 4 Luctatores (Lotta & Vallo difensivo)
  { slotIndex: 1, label: 'LUC-S', category: 'LUCTATOR', xPercent: 18, yPercent: 72 },
  { slotIndex: 2, label: 'LUC-C1', category: 'LUCTATOR', xPercent: 38, yPercent: 74 },
  { slotIndex: 3, label: 'LUC-C2', category: 'LUCTATOR', xPercent: 62, yPercent: 74 },
  { slotIndex: 4, label: 'LUC-D', category: 'LUCTATOR', xPercent: 82, yPercent: 72 },
  // 4 Tractores (Mediani e Apripista di centrocampo)
  { slotIndex: 5, label: 'TRA-M1', category: 'TRACTOR', xPercent: 20, yPercent: 54 },
  { slotIndex: 6, label: 'TRA-C1', category: 'TRACTOR', xPercent: 40, yPercent: 52 },
  { slotIndex: 7, label: 'TRA-C2', category: 'TRACTOR', xPercent: 60, yPercent: 52 },
  { slotIndex: 8, label: 'TRA-M2', category: 'TRACTOR', xPercent: 80, yPercent: 54 },
  // 3 Praevenientes (Cursori d'Assalto & Arieti)
  { slotIndex: 9, label: 'CUR-S', category: 'PRAEVENIENS', xPercent: 24, yPercent: 34 },
  { slotIndex: 10, label: 'CUR-C', category: 'PRAEVENIENS', xPercent: 50, yPercent: 28 },
  { slotIndex: 11, label: 'CUR-D', category: 'PRAEVENIENS', xPercent: 76, yPercent: 34 }
];

export const TacticalSlate: React.FC<TacticalSlateProps> = ({
  userClub,
  squad,
  onSwapStarters,
  onSelectPlayer
}) => {
  // Sort players: starters are top 12
  const sorted = [...squad].sort((a, b) => b.valoreGenerale - a.valoreGenerale);
  const [startersOrder, setStartersOrder] = useState<string[]>(
    sorted.slice(0, 12).map(p => p.id)
  );

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
      // Swap two starters
      const newOrder = [...startersOrder];
      const temp = newOrder[draggedSlot];
      newOrder[draggedSlot] = newOrder[targetSlot];
      newOrder[targetSlot] = temp;
      setStartersOrder(newOrder);
      audio.playClick();
      if (onSwapStarters) onSwapStarters(newOrder);
    } else if (draggedBenchId) {
      // Swap bench player with starter slot
      const newOrder = [...startersOrder];
      newOrder[targetSlot] = draggedBenchId;
      setStartersOrder(newOrder);
      audio.playClick();
      if (onSwapStarters) onSwapStarters(newOrder);
    }

    setDraggedSlot(null);
    setDraggedBenchId(null);
  };

  // Click-to-swap support for touch devices or quick clicking
  const handleSlotClick = (slot: number) => {
    if (selectedTokenSlot === null) {
      setSelectedTokenSlot(slot);
      audio.playClick();
    } else if (selectedTokenSlot === slot) {
      setSelectedTokenSlot(null);
    } else {
      // Swap selected with clicked
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
    <div className="retro-box p-3.5 bg-gradient-to-b from-[#2a0609] via-[#1a0406] to-[#0e0203] border-2 border-[#85222b] shadow-2xl space-y-3 select-none">
      {/* Slate Header */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#731922] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#800020] border border-[#d4af37] rounded-xs shadow">
            <Move size={15} className="text-[#d4af37]" />
          </div>
          <div>
            <h2 className="font-roman text-xs font-bold text-[#d4af37] tracking-wider uppercase">
              BACHECA TATTICA D'HARPASTUM (TABULA CERATA)
            </h2>
            <div className="text-[10px] text-[#94a3b8] font-roman">
              Trascina o tocca i gettoni per scambiare posizioni e impostare la strategia dell'agone
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoOptimize}
            className="px-2.5 py-1 bg-[#190305] hover:bg-[#3d0b10] text-[#facc15] border border-[#d4af37]/40 rounded-xs text-[10px] font-roman flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Sparkles size={11} />
            <span>Miglior 12 Titolari</span>
          </button>
        </div>
      </div>

      {/* The Sand Arena Slate */}
      <div className="relative w-full aspect-4/3 max-w-2xl mx-auto bg-[#8b5a2b] border-4 border-[#3d1808] rounded-sm overflow-hidden shadow-2xl p-2">
        {/* Sand texture pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#6b401b_1px,transparent_1px)] [background-size:14px_14px] opacity-40 pointer-events-none" />

        {/* Arena Markings: Top Meta (Castra Opposita) */}
        <div className="absolute inset-x-2 top-2 h-1 bg-[#fef08a] border-t border-dashed border-[#d4af37]" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] font-roman uppercase tracking-widest text-[#fef08a] bg-black/60 px-2 py-0.5 rounded-xs pointer-events-none">
          CASTRA OPPOSITA (LINEA DI META AVVERSARIA)
        </div>

        {/* Mesê Grammê (Middle contest line) */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[#fef08a]/60" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#fef08a]/40 flex items-center justify-center pointer-events-none">
          <span className="text-[7px] font-roman text-[#fef08a]/80 uppercase tracking-widest">
            Mesê Grammê
          </span>
        </div>

        {/* Bottom Meta (Castra Propria) */}
        <div className="absolute inset-x-2 bottom-2 h-1 bg-[#fef08a] border-b border-dashed border-[#d4af37]" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-roman uppercase tracking-widest text-[#fef08a] bg-black/60 px-2 py-0.5 rounded-xs pointer-events-none">
          CASTRA PROPRIA (LINEA DI FONDO AMICA)
        </div>

        {/* 12 Interactive Drag-and-Drop Tokens */}
        {SLATE_POSITIONS.map(pos => {
          const player = starters[pos.slotIndex];
          const isSelected = selectedTokenSlot === pos.slotIndex;
          const isDragTarget = dragOverSlot === pos.slotIndex;
          const roleBadge = player ? getHarpastumRoleBadgeStyle(player.ruoloPrimario) : null;

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
              className={`absolute cursor-pointer transition-all z-20 flex flex-col items-center group ${
                isDragTarget
                  ? 'scale-125 ring-4 ring-[#d4af37]'
                  : isSelected
                  ? 'scale-115 ring-2 ring-[#fef08a] animate-pulse'
                  : 'hover:scale-110'
              }`}
            >
              {/* Token Shield Icon */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 shadow-xl flex flex-col items-center justify-center ${
                  pos.category === 'CUSTOS'
                    ? 'bg-[#78350f] border-[#ca8a04]'
                    : pos.category === 'LUCTATOR'
                    ? 'bg-[#1e3a8a] border-[#3b82f6]'
                    : pos.category === 'TRACTOR'
                    ? 'bg-[#064e3b] border-[#10b981]'
                    : 'bg-[#7f1d1d] border-[#ef4444]'
                }`}
              >
                <span className="text-[8px] font-roman font-bold text-white tracking-tighter">
                  {pos.label}
                </span>
                <span className="text-[9px] font-data font-black text-[#facc15] leading-none">
                  {player ? player.valoreGenerale : '--'}
                </span>
              </div>

              {/* Player Name Banner */}
              <div className="bg-black/85 border border-[#d4af37]/60 text-white px-1.5 py-0.5 rounded-xs text-[9px] font-roman font-bold truncate max-w-[80px] sm:max-w-[90px] text-center mt-0.5 shadow-md">
                {player ? player.cognome : 'Vacante'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bench / Riserve Quick-Swap Row */}
      <div className="p-2.5 retro-inset bg-[#140203] border border-[#521016] rounded-xs space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-roman">
          <span className="text-[#d4af37] font-bold uppercase tracking-wider flex items-center gap-1">
            <Shield size={12} /> RISERVE & SUCCENTURIATI DELLA COORTE (TRASCINA NEL CAMPO)
          </span>
          <span className="text-[#94a3b8]">{bench.length} Atleti a Disposizione</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {bench.map(bp => {
            const rBadge = getHarpastumRoleBadgeStyle(bp.ruoloPrimario);
            return (
              <div
                key={bp.id}
                draggable
                onDragStart={e => handleDragStartBench(e, bp.id)}
                onClick={() => handleBenchClick(bp.id)}
                className="shrink-0 p-1.5 bg-[#200407] hover:bg-[#3d0b10] border border-[#521016] hover:border-[#d4af37] rounded-xs cursor-grab active:cursor-grabbing text-left transition-all flex items-center gap-2 text-xs"
              >
                <span className={`px-1 py-0.5 rounded-xs text-[8px] font-bold font-roman border ${rBadge.bg} ${rBadge.text} ${rBadge.border}`}>
                  {rBadge.label}
                </span>
                <div>
                  <div className="font-roman font-bold text-white text-[11px] truncate max-w-[90px]">
                    {bp.cognome}
                  </div>
                  <div className="text-[9px] font-data text-[#facc15]">{bp.valoreGenerale} OVR</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
