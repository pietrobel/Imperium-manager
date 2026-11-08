import React, { useState, useEffect, useRef } from 'react';
import type { Match, MatchResult, Club, Player } from '../types';
import { RetroButton } from './RetroButton';
import { audio } from '../services/audioService';
import { getHarpastumRole, getHarpastumCategory } from '../engines/harpastumEngine';
import { Play, Pause, FastForward, RotateCcw, Volume2, Shield, Swords, Award, Info, RefreshCw } from 'lucide-react';

interface Harpastum2DSimulatorProps {
  userMatch: { match: Match; result: MatchResult };
  homeClub: Club;
  awayClub: Club;
  allPlayers: Record<string, Player>;
  onSimulationFinished?: () => void;
}

interface SimAthlete {
  id: string;
  name: string;
  team: 'HOME' | 'AWAY';
  category: 'CUSTOS' | 'LUCTATOR' | 'TRACTOR' | 'PRAEVENIENS';
  number: number;
  // Posizione in percentuale campo (x: 0-100, y: 0-100)
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  hasBall: boolean;
  tackledCooldown: number;
}

interface ArenaBall {
  x: number;
  y: number;
  holderId: string | null;
  carrierTeam: 'HOME' | 'AWAY' | null;
  isInAir: boolean;
  airArc: number;
}

export const Harpastum2DSimulator: React.FC<Harpastum2DSimulatorProps> = ({
  userMatch,
  homeClub,
  awayClub,
  allPlayers,
  onSimulationFinished
}) => {
  const [matchMinute, setMatchMinute] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [currentScoreHome, setCurrentScoreHome] = useState<number>(0);
  const [currentScoreAway, setCurrentScoreAway] = useState<number>(0);
  const [liveCommentary, setLiveCommentary] = useState<string>(
    `Inizia l'agone d'Harpastum tra ${homeClub.nome} e ${awayClub.nome}! I tribuni prendono posto!`
  );
  const [metaBanner, setMetaBanner] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize athletes from lineups (12 starters + bench)
  const allHome = Object.values(allPlayers).filter(p => p.clubId === homeClub.id);
  const allAway = Object.values(allPlayers).filter(p => p.clubId === awayClub.id);
  const homeLineup = allHome.slice(0, 12);
  const awayLineup = allAway.slice(0, 12);
  const homeBench = allHome.slice(12, 18);
  const awayBench = allAway.slice(12, 18);

  const [showRulesInfo, setShowRulesInfo] = useState<boolean>(false);
  const subHistoryRef = useRef<{ outAthlete: any; subAthlete: any; min: number; reentered: boolean }[]>([]);

  const athletesRef = useRef<SimAthlete[]>([]);
  const ballRef = useRef<ArenaBall>({
    x: 50,
    y: 50,
    holderId: null,
    carrierTeam: null,
    isInAir: false,
    airArc: 0
  });

  // Base formation positions on vertical sand pitch (12 contro 12):
  // 1 Custos + 4 Luctatores + 4 Tractores + 3 Praevenientes
  // Home attacks toward TOP (y: 0 is Opponent Meta Line), defends BOTTOM (y: 100)
  // Away attacks toward BOTTOM (y: 100 is Opponent Meta Line), defends TOP (y: 0)
  const initAthletes = () => {
    const list: SimAthlete[] = [];

    // Home Athletes (12 Primarii)
    const homeHomePositions = [
      { cat: 'CUSTOS', x: 50, y: 88 },
      { cat: 'LUCTATOR', x: 20, y: 72 },
      { cat: 'LUCTATOR', x: 40, y: 74 },
      { cat: 'LUCTATOR', x: 60, y: 74 },
      { cat: 'LUCTATOR', x: 80, y: 72 },
      { cat: 'TRACTOR', x: 22, y: 56 },
      { cat: 'TRACTOR', x: 40, y: 54 },
      { cat: 'TRACTOR', x: 60, y: 54 },
      { cat: 'TRACTOR', x: 78, y: 56 },
      { cat: 'PRAEVENIENS', x: 25, y: 38 },
      { cat: 'PRAEVENIENS', x: 50, y: 34 },
      { cat: 'PRAEVENIENS', x: 75, y: 38 }
    ];

    homeHomePositions.forEach((pos, idx) => {
      const p = homeLineup[idx];
      list.push({
        id: p ? p.id : `home_${idx}`,
        name: p ? p.cognome : `Legionario ${idx + 1}`,
        team: 'HOME',
        category: pos.cat as any,
        number: idx + 1,
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        color: homeClub.colori?.primary || '#b91c1c',
        hasBall: false,
        tackledCooldown: 0
      });
    });

    // Away Athletes (12 Primarii)
    const awayHomePositions = [
      { cat: 'CUSTOS', x: 50, y: 12 },
      { cat: 'LUCTATOR', x: 20, y: 28 },
      { cat: 'LUCTATOR', x: 40, y: 26 },
      { cat: 'LUCTATOR', x: 60, y: 26 },
      { cat: 'LUCTATOR', x: 80, y: 28 },
      { cat: 'TRACTOR', x: 22, y: 44 },
      { cat: 'TRACTOR', x: 40, y: 46 },
      { cat: 'TRACTOR', x: 60, y: 46 },
      { cat: 'TRACTOR', x: 78, y: 44 },
      { cat: 'PRAEVENIENS', x: 25, y: 62 },
      { cat: 'PRAEVENIENS', x: 50, y: 66 },
      { cat: 'PRAEVENIENS', x: 75, y: 62 }
    ];

    awayHomePositions.forEach((pos, idx) => {
      const p = awayLineup[idx];
      list.push({
        id: p ? p.id : `away_${idx}`,
        name: p ? p.cognome : `Guerriero ${idx + 1}`,
        team: 'AWAY',
        category: pos.cat as any,
        number: idx + 1,
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        color: awayClub.colori?.primary || '#1d4ed8',
        hasBall: false,
        tackledCooldown: 0
      });
    });

    athletesRef.current = list;
    ballRef.current = {
      x: 50,
      y: 50,
      holderId: list[6]?.id || null, // Center Tractor
      carrierTeam: 'HOME',
      isInAir: false,
      airArc: 0
    };
  };

  useEffect(() => {
    initAthletes();
    subHistoryRef.current = [];
  }, [userMatch]);


  // Simulation timer tick (advances minute 0 to 90)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMatchMinute(prev => {
        if (prev >= 90) {
          setIsPlaying(false);
          if (onSimulationFinished) onSimulationFinished();
          return 90;
        }

        const nextMin = prev + 1;

        // Harpastum Rule: Rotatio Libera cum Reitu (Sostituzioni libere e Rientro per contusione)
        if (nextMin === 28 && homeBench.length > 0) {
          const outAthlete = athletesRef.current.find(a => a.team === 'HOME' && a.category === 'LUCTATOR');
          const sub = homeBench[0];
          if (outAthlete && sub) {
            subHistoryRef.current.push({
              outAthlete: { ...outAthlete },
              subAthlete: sub,
              min: 28,
              reentered: false
            });
            outAthlete.name = sub.cognome;
            outAthlete.id = sub.id;
            audio.playWhistle();
            setMetaBanner(`ROTATIO D'HARPASTUM! Minuto 28': ${sub.cognome} rileva ${subHistoryRef.current[0].outAthlete.name} per contusione (ammesso rientro successivo).`);
            setLiveCommentary(`[28'] 🔄 Sostituzione d'emergenza: ${sub.cognome} entra nei Luctatores. L'atleta medicato potrà rientrare!`);
            setTimeout(() => setMetaBanner(null), 3000);
          }
        } else if (nextMin === 52 && awayBench.length > 0) {
          const outAway = athletesRef.current.find(a => a.team === 'AWAY' && a.category === 'TRACTOR');
          const subAway = awayBench[0];
          if (outAway && subAway) {
            outAway.name = subAway.cognome;
            outAway.id = subAway.id;
            setMetaBanner(`ROTATIO D'HARPASTUM! Minuto 52': ${awayClub.nome} ruota i Tractores con ${subAway.cognome}.`);
            setLiveCommentary(`[52'] 🔄 Rotazione libera avversaria: entra ${subAway.cognome} per sfiancamento.`);
            setTimeout(() => setMetaBanner(null), 2500);
          }
        } else if (nextMin === 68 && subHistoryRef.current.length > 0 && !subHistoryRef.current[0].reentered) {
          // Re-entry of the recovered athlete!
          const record = subHistoryRef.current[0];
          const targetAthlete = athletesRef.current.find(a => a.team === 'HOME' && a.category === 'TRACTOR');
          if (targetAthlete) {
            record.reentered = true;
            targetAthlete.name = record.outAthlete.name;
            targetAthlete.id = record.outAthlete.id;
            audio.playWhistle();
            setMetaBanner(`⭐ RIENTRO IN ARENA! Minuto 68': ${record.outAthlete.name} torna in campo dopo le cure mediche!`);
            setLiveCommentary(`[68'] 🔁 Rientro in Arena: ${record.outAthlete.name} è ristabilito e si getta di nuovo nella mischia!`);
            setTimeout(() => setMetaBanner(null), 3500);
          }
        }

        // Check if an event occurred at this minute
        const eventsThisMinute = userMatch.result.eventi.filter(e => e.minuto === nextMin);
        if (eventsThisMinute.length > 0) {
          const ev = eventsThisMinute[0];
          setLiveCommentary(`[Minuto ${nextMin}'] ${ev.dettaglio || `${ev.giocatoreNome} protagonista dell'azione!`}`);

          if (ev.tipo === 'META' || ev.tipo === 'GOL') {
            audio.playGoal();
            if (ev.squadra === 'CASA') {
              setCurrentScoreHome(h => h + 1);
              setMetaBanner(`META HARPASTICA! ${homeClub.nome} varca la linea di fondo!`);
            } else {
              setCurrentScoreAway(a => a + 1);
              setMetaBanner(`META HARPASTICA! ${awayClub.nome} sfonda la difesa!`);
            }
            setTimeout(() => setMetaBanner(null), 3500);
          } else if (ev.tipo === 'PLACCAGGIO') {
            setMetaBanner(`PLACCAGGIO NELLA SABBIA! Arrestata la corsa!`);
            setTimeout(() => setMetaBanner(null), 2000);
          }
        } else if (nextMin !== 28 && nextMin !== 52 && nextMin !== 68) {
          // Dynamic procedural sensory commentary
          if (nextMin % 8 === 0) {
            const ambientPhrases = [
              'Le due fazioni da 12 atleti lottano corpo a corpo lungo la mesê grammê!',
              'Lancio teso a due mani della palla di cuoio verso i 3 cursori d\'assalto!',
              'I 4 lottatori centrali sbarrano la corsa con un muro corporale spettacolare!',
              'Presa acrobatica al volo nella sabbia sollevata dagli schieramenti!',
              'Scatto bruciante sul corridoio di fondo, i lottatori accorrono in aiuto!'
            ];
            setLiveCommentary(`[${nextMin}'] ${ambientPhrases[(nextMin / 8) % ambientPhrases.length]}`);
          }
        }

        return nextMin;
      });
    }, 450 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, userMatch]);

  // Sensible Soccer retro canvas render loop (2D top-down retro sprites & physics)
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Sand Arena (Harpastum Pitch)
      ctx.fillStyle = '#8b5a2b'; // Pompeian sand brown
      ctx.fillRect(0, 0, w, h);

      // Sand textured speckles (Sensible Soccer retro grain)
      ctx.fillStyle = '#7a4e25';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 73) % w);
        const sy = ((i * 47) % h);
        ctx.fillRect(sx, sy, 3, 3);
      }

      // Outer Arena Wood Fence Border
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#3d1808';
      ctx.strokeRect(10, 10, w - 20, h - 20);

      // 2. Pitch Markings
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fef08a';

      // Meta Line Top (Castra Opposita - Opponent End Line)
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.moveTo(20, 24);
      ctx.lineTo(w - 20, 24);
      ctx.stroke();

      // Meta Line Bottom (Castra Propria - Friendly End Line)
      ctx.beginPath();
      ctx.moveTo(20, h - 24);
      ctx.lineTo(w - 20, h - 24);
      ctx.stroke();
      ctx.setLineDash([]);

      // Mesê Grammê (Center Line)
      ctx.beginPath();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.moveTo(10, h / 2);
      ctx.lineTo(w - 10, h / 2);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 36, 0, Math.PI * 2);
      ctx.stroke();

      // Meta Zone markers on wood
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = '10px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('META AVVERSARIA (CASTRA CAPTA)', w / 2, 18);
      ctx.fillText('LINEA DIFENSIVA AMICA', w / 2, h - 10);

      // 3. Update & Draw Athletes (Retro sprites with heads & directional bodies)
      const athletes = athletesRef.current;
      const ball = ballRef.current;

      // Determine which team holds ball
      const ballHolder = athletes.find(a => a.id === ball.holderId);
      const isHomeAttacking = ball.carrierTeam === 'HOME';

      athletes.forEach(a => {
        // AI Movement: Move towards target or ball
        if (a.tackledCooldown > 0) {
          a.tackledCooldown--;
        } else {
          // Dynamic wander & battle logic
          if (a.hasBall) {
            // Carry towards opponent meta
            const targetY = a.team === 'HOME' ? 18 : 82;
            a.y += (targetY - a.y) * 0.04;
            a.x += (Math.sin(Date.now() / 300) * 0.6);
          } else {
            // Support or tackle
            const distToBall = Math.hypot(a.x - ball.x, a.y - ball.y);
            if (distToBall < 18 && a.team !== ball.carrierTeam) {
              // Rush to tackle
              a.x += (ball.x - a.x) * 0.05;
              a.y += (ball.y - a.y) * 0.05;

              // Check tackle resolution
              if (distToBall < 5 && Math.random() < 0.08) {
                if (ballHolder) {
                  ballHolder.hasBall = false;
                  ballHolder.tackledCooldown = 25;
                  a.hasBall = true;
                  ball.holderId = a.id;
                  ball.carrierTeam = a.team;
                }
              }
            } else {
              // Return towards tactical zone
              a.x += (a.targetX - a.x) * 0.02;
              a.y += (a.targetY - a.y) * 0.02;
            }
          }
        }

        // Keep inside arena bounds
        a.x = Math.max(12, Math.min(88, a.x));
        a.y = Math.max(15, Math.min(85, a.y));

        const px = (a.x / 100) * w;
        const py = (a.y / 100) * h;

        // Sensible Soccer Drop Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(px + 2, py + 4, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Athlete Body (Tunic / Armor)
        ctx.fillStyle = a.team === 'HOME' ? '#b91c1c' : '#1e3a8a';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = a.team === 'HOME' ? '#d4af37' : '#e2e8f0';
        ctx.stroke();

        // Head (Skin tone retro dot)
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(px, py - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Athlete Name Tag (Sensible Soccer minimal retro label)
        ctx.fillStyle = a.team === 'HOME' ? '#fef08a' : '#cbd5e1';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(a.name.slice(0, 7), px, py + 12);
      });

      // 4. Update & Draw Harpastum Ball (Small hard leather sphere)
      if (ballHolder) {
        ball.x = ballHolder.x;
        ball.y = ballHolder.y + (ballHolder.team === 'HOME' ? -3 : 3);
      }

      const bx = (ball.x / 100) * w;
      const by = (ball.y / 100) * h;

      // Ball Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.arc(bx + 1.5, by + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Ball Body (Dark leather stitched)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="retro-box p-3 bg-gradient-to-b from-[#3d0b10] to-[#240507] border-2 border-[#85222b] shadow-2xl flex flex-col space-y-3">
      {/* Simulation Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#731922] gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Swords size={16} className="text-[#d4af37]" />
          <span className="font-roman font-bold text-white tracking-wide">
            SIMULAZIONE 2D SENSIBLE HARPASTUM · 12 CONTRO 12
          </span>
        </div>

        {/* Playback Controls & Info */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRulesInfo(!showRulesInfo)}
            className="px-2 py-1 bg-[#240507] hover:bg-[#3d0b10] text-[#d4af37] border border-[#d4af37]/50 rounded-xs cursor-pointer flex items-center gap-1 text-[11px] font-roman"
          >
            <Info size={12} />
            <span>Regole 12v12 & Sostituzioni</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2 py-1 bg-[#521118] hover:bg-[#6b161f] text-[#facc15] border border-[#731922] rounded-xs cursor-pointer flex items-center gap-1 text-[11px] font-roman"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Pausa' : 'Riprendi'}</span>
          </button>

          <button
            type="button"
            onClick={() => setPlaybackSpeed(s => (s === 1 ? 2 : s === 2 ? 4 : 1))}
            className="px-2 py-1 bg-[#521118] hover:bg-[#6b161f] text-white border border-[#731922] rounded-xs cursor-pointer text-[11px] font-data font-bold"
          >
            {playbackSpeed}x Velocità
          </button>
        </div>
      </div>

      {/* Rules Explanatory Dropdown */}
      {showRulesInfo && (
        <div className="p-3 bg-[#170305] border-2 border-[#d4af37] rounded-xs text-xs space-y-2 text-[#cbd5e1] font-roman">
          <div className="flex items-center justify-between border-b border-[#521016] pb-1">
            <span className="font-bold text-[#facc15] flex items-center gap-1.5">
              <Shield size={14} className="text-[#d4af37]" /> REGOLE CANONICHE DELL'HARPASTUM IMPERIALE (12 vs 12)
            </span>
            <button
              onClick={() => setShowRulesInfo(false)}
              className="text-[#94a3b8] hover:text-white text-xs cursor-pointer"
            >
              Chiudi &times;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div>
              <div className="text-[#d4af37] font-bold mb-1">I 12 Atleti in Campo (Duodecim Primarii):</div>
              <ul className="list-disc list-inside space-y-0.5 text-[#e2e8f0]">
                <li><strong className="text-[#fef08a]">1 Custos Castrorum</strong>: Guardiano dell'estrema linea di fondo.</li>
                <li><strong className="text-[#bfdbfe]">4 Luctatores</strong>: Muro difensivo e placcatori di sbarramento.</li>
                <li><strong className="text-[#a7f3d0]">4 Tractores</strong>: Apripista, mediani e registi di spinta sulla mesê grammê.</li>
                <li><strong className="text-[#fecaca]">3 Praevenientes</strong>: Cursori veloci d'assalto e arieti di meta.</li>
              </ul>
            </div>
            <div>
              <div className="text-[#d4af37] font-bold mb-1">Sostituzioni Libere & Possibilità di Rientro:</div>
              <p className="text-[#cbd5e1] leading-relaxed">
                A causa della violenza dei placcaggi a terra sulla sabbia, la tradizione legionaria e l'<strong>Harpastum moderno</strong> adottano la <em>Rotatio Libera cum Reitu</em>:
                un atleta infortunato o sfinito può uscire per ricevere le bende mediche sul bordo dell'arena, e <strong>può rientrare successivamente in campo</strong> per sostituire a sua volta un compagno!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Retro 90s Scoreboard Header */}
      <div className="grid grid-cols-3 items-center bg-[#190305] p-3 border-2 border-[#d4af37] rounded-xs shadow">
        <div className="text-right">
          <div className="font-roman font-black text-sm text-white drop-shadow-xs">{homeClub.nome}</div>
          <div className="text-[10px] text-[#cbd5e1] font-roman">Fazione di Casa</div>
        </div>

        {/* Center Timer & Score */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[11px] font-data font-bold text-[#facc15] tracking-widest bg-[#2b080b] px-3 py-0.5 rounded-xs border border-[#731922] mb-1">
            {matchMinute}' AGONE
          </div>
          <div className="flex items-center gap-3">
            <span className="font-data text-3xl font-black text-[#d4af37]">{currentScoreHome}</span>
            <span className="font-data text-lg text-[#cbd5e1]">-</span>
            <span className="font-data text-3xl font-black text-[#d4af37]">{currentScoreAway}</span>
          </div>
          <span className="text-[9px] font-roman text-[#94a3b8] tracking-widest uppercase">PUNCTA / METE</span>
        </div>

        <div className="text-left">
          <div className="font-roman font-black text-sm text-white drop-shadow-xs">{awayClub.nome}</div>
          <div className="text-[10px] text-[#cbd5e1] font-roman">Fazione Sfidante</div>
        </div>
      </div>

      {/* Meta Flash Banner Announcement */}
      {metaBanner && (
        <div className="bg-[#6b161f] border-2 border-[#d4af37] p-2 text-center text-[#fef08a] font-roman font-bold text-xs tracking-wider animate-bounce shadow-xl rounded-xs">
          ⭐ {metaBanner} ⭐
        </div>
      )}

      {/* 2D Canvas Arena Pitch */}
      <div className="flex justify-center items-center py-1">
        <canvas
          ref={canvasRef}
          width={420}
          height={380}
          className="rounded-xs shadow-2xl border-4 border-[#521118] cursor-crosshair max-w-full"
        />
      </div>

      {/* Live Sensory Commentary Feed */}
      <div className="retro-inset p-2.5 border border-[#521016] text-xs font-roman text-[#cbd5e1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[#facc15] font-semibold">{liveCommentary}</span>
        </div>
        <span className="text-[10px] text-[#94a3b8] font-data hidden sm:inline">Sensible Harpastum 96</span>
      </div>
    </div>
  );
};
