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


  // Simulation timer tick (50-minute Harpastum canonical match duration)
  // Diviso in due tempi da 25' d'arena (come nell'Harpastum antico e moderno)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMatchMinute(prev => {
        if (prev >= 50) {
          setIsPlaying(false);
          audio.playWhistle();
          setLiveCommentary("Triplice squillo di bucina! L'agone d'Harpastum è giunto al termine dei 50 minuti!");
          if (onSimulationFinished) onSimulationFinished();
          return 50;
        }

        const nextMin = prev + 1;

        // Harpastum Rule: Rotatio Libera cum Reitu (Sostituzioni libere e Rientro per contusione)
        if (nextMin === 16 && homeBench.length > 0) {
          const outAthlete = athletesRef.current.find(a => a.team === 'HOME' && a.category === 'LUCTATOR');
          const sub = homeBench[0];
          if (outAthlete && sub) {
            subHistoryRef.current.push({
              outAthlete: { ...outAthlete },
              subAthlete: sub,
              min: 16,
              reentered: false
            });
            outAthlete.name = sub.cognome;
            outAthlete.id = sub.id;
            audio.playWhistle();
            setMetaBanner(`ROTATIO D'HARPASTUM! 16': ${sub.cognome} rileva ${subHistoryRef.current[0].outAthlete.name} per contusione (ammesso rientro successivo).`);
            setLiveCommentary(`[16'] 🔄 Sostituzione per trauma: entra ${sub.cognome}. L'atleta medicato potrà rientrare!`);
            setTimeout(() => setMetaBanner(null), 3000);
          }
        } else if (nextMin === 25) {
          // Half-time marker in the 50-minute match
          audio.playWhistle();
          setMetaBanner(`INTERVALLO (25'): I tribuni invertono i lati della sabbia!`);
          setLiveCommentary(`[25'] ⏸️ Metà agone completata: 25 minuti di scontro fisico feroce nella sabbia!`);
          setTimeout(() => setMetaBanner(null), 2500);
        } else if (nextMin === 32 && awayBench.length > 0) {
          const outAway = athletesRef.current.find(a => a.team === 'AWAY' && a.category === 'TRACTOR');
          const subAway = awayBench[0];
          if (outAway && subAway) {
            outAway.name = subAway.cognome;
            outAway.id = subAway.id;
            setMetaBanner(`ROTATIO D'HARPASTUM! 32': ${awayClub.nome} ruota i Tractores con ${subAway.cognome}.`);
            setLiveCommentary(`[32'] 🔄 Rotazione libera avversaria: entra ${subAway.cognome} per sfiancamento.`);
            setTimeout(() => setMetaBanner(null), 2500);
          }
        } else if (nextMin === 41 && subHistoryRef.current.length > 0 && !subHistoryRef.current[0].reentered) {
          // Re-entry of the recovered athlete!
          const record = subHistoryRef.current[0];
          const targetAthlete = athletesRef.current.find(a => a.team === 'HOME' && a.category === 'TRACTOR');
          if (targetAthlete) {
            record.reentered = true;
            targetAthlete.name = record.outAthlete.name;
            targetAthlete.id = record.outAthlete.id;
            audio.playWhistle();
            setMetaBanner(`⭐ RIENTRO IN ARENA! 41': ${record.outAthlete.name} torna in campo dopo le cure del cerusico!`);
            setLiveCommentary(`[41'] 🔁 Rientro in Arena: ${record.outAthlete.name} è ristabilito e si getta di nuovo nella mischia!`);
            setTimeout(() => setMetaBanner(null), 3500);
          }
        }

        // Check if a match event occurred around this minute (scaled to 50' Harpastum clock)
        const eventsThisMinute = userMatch.result.eventi.filter(e => {
          const scaledMin = Math.max(1, Math.min(50, Math.round((e.minuto / 90) * 50)));
          return scaledMin === nextMin;
        });

        if (eventsThisMinute.length > 0) {
          const ev = eventsThisMinute[0];
          setLiveCommentary(`[Minuto ${nextMin}'] ${ev.dettaglio || `${ev.giocatoreNome} protagonista dell'azione!`}`);

          if (ev.tipo === 'META' || ev.tipo === 'GOL') {
            audio.playGoal();
            // Trigger visual flash and celebration
            metaFlashRef.current = 1.0;

            if (ev.squadra === 'CASA') {
              setCurrentScoreHome(h => h + 1);
              setMetaBanner(`⭐⭐ META D'HARPASTUM! PUNCTUM CONSEGUITO DA ${homeClub.nome.toUpperCase()}! ⭐⭐`);
            } else {
              setCurrentScoreAway(a => a + 1);
              setMetaBanner(`⭐⭐ META D'HARPASTUM! PUNCTUM CONSEGUITO DA ${awayClub.nome.toUpperCase()}! ⭐⭐`);
            }
            setTimeout(() => setMetaBanner(null), 4000);
          } else if (ev.tipo === 'PLACCAGGIO') {
            setMetaBanner(`💥 PLACCAGGIO ALLA VITA NELLA SABBIA!`);
            setTimeout(() => setMetaBanner(null), 2000);
          }
        } else if (nextMin !== 16 && nextMin !== 25 && nextMin !== 32 && nextMin !== 41) {
          // Dynamic procedural sensory commentary for 50-minute match
          if (nextMin % 5 === 0) {
            const ambientPhrases = [
              'Le due fazioni da 12 atleti lottano corpo a corpo lungo la mesê grammê!',
              'Lancio teso a due mani verso i cursori: contesa acrobatica nella polvere!',
              'I 4 lottatori centrali abbattono il portatore con un doppio placcaggio alla vita!',
              'Scatto bruciante sul corridoio di meta, i difensori si tuffano nella sabbia!',
              'Mischia furibonda a terra per il possesso della piccola sfera di cuoio!'
            ];
            setLiveCommentary(`[${nextMin}'] ${ambientPhrases[(nextMin / 5) % ambientPhrases.length]}`);
          }
        }

        return nextMin;
      });
    }, 450 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, userMatch]);

  // Visual effects refs for 60fps canvas animation
  const metaFlashRef = useRef<number>(0);
  const impactEffectsRef = useRef<{ x: number; y: number; life: number; maxLife: number; text?: string; color: string }[]>([]);

  // Top-down arena canvas render loop (continuous 24-player motion & visible Harpastum clashes)
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const now = Date.now();

      // Fade meta flash
      if (metaFlashRef.current > 0) {
        metaFlashRef.current = Math.max(0, metaFlashRef.current - 0.025);
      }

      // 1. Draw Sand Arena (Harpastum Pitch)
      ctx.fillStyle = '#8f5c2c'; // Pompeian arena sand
      ctx.fillRect(0, 0, w, h);

      // Sand textured grain
      ctx.fillStyle = '#7a4e25';
      for (let i = 0; i < 50; i++) {
        const sx = ((i * 73) % w);
        const sy = ((i * 47) % h);
        ctx.fillRect(sx, sy, 3, 3);
      }

      // Outer Arena Wood Fence Border (heavy roman timbers)
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#381607';
      ctx.strokeRect(10, 10, w - 20, h - 20);

      // 2. Pitch Markings: Castra Opposita & Castra Propria
      ctx.lineWidth = 2.5;

      // Meta Line Top (Castra Opposita - Opponent End Line)
      ctx.strokeStyle = metaFlashRef.current > 0 ? '#ffffff' : '#fef08a';
      ctx.beginPath();
      ctx.setLineDash([8, 4]);
      ctx.moveTo(18, 28);
      ctx.lineTo(w - 18, 28);
      ctx.stroke();

      // Meta Line Bottom (Castra Propria - Friendly End Line)
      ctx.beginPath();
      ctx.moveTo(18, h - 28);
      ctx.lineTo(w - 18, h - 28);
      ctx.stroke();
      ctx.setLineDash([]);

      // Mesê Grammê (Center Line)
      ctx.beginPath();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.moveTo(12, h / 2);
      ctx.lineTo(w - 12, h / 2);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 42, 0, Math.PI * 2);
      ctx.stroke();

      // Meta Zone Roman lettering on sand
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = 'bold 9px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('CASTRA OPPOSITA · LINEA DI META (AVVERSARIA)', w / 2, 22);
      ctx.fillText('CASTRA PROPRIA · LINEA DI FONDO DIFESA', w / 2, h - 14);

      // 3. Update & Draw All 24 Athletes (Continuous organic movement & wrestling clashes)
      const athletes = athletesRef.current;
      const ball = ballRef.current;
      const ballHolder = athletes.find(a => a.id === ball.holderId);

      athletes.forEach((a, idx) => {
        // Continuous footwork & running animation for EVERY player
        const runCycle = Math.sin((now / 110) + idx * 0.85);
        const wanderX = Math.cos((now / 350) + idx * 1.2) * 0.5;
        const wanderY = Math.sin((now / 400) + idx * 1.5) * 0.4;

        if (a.tackledCooldown > 0) {
          a.tackledCooldown--;
          // Laying down on sand struggling
        } else {
          if (a.hasBall) {
            // Ball carrier sprints towards opponent meta with body feints
            const targetY = a.team === 'HOME' ? 22 : 78;
            a.y += (targetY - a.y) * 0.045;
            a.x += Math.sin(now / 220) * 0.9;
          } else {
            // Defending or supporting: continuous active tracking
            const distToBall = Math.hypot(a.x - ball.x, a.y - ball.y);
            const isOpponent = a.team !== ball.carrierTeam;

            if (isOpponent && distToBall < 25) {
              // Charge towards ball carrier to deliver a brutal tackle
              a.x += (ball.x - a.x) * 0.055 + wanderX * 0.3;
              a.y += (ball.y - a.y) * 0.055 + wanderY * 0.3;

              // Physical Tackle Collision Resolution
              if (distToBall < 6.5) {
                // Scontro corpo a corpo! Spawns sand dust and grapple effect
                impactEffectsRef.current.push({
                  x: (a.x / 100) * w,
                  y: (a.y / 100) * h,
                  life: 20,
                  maxLife: 20,
                  text: '💥 PLACCAGGIO!',
                  color: '#fef08a'
                });

                if (ballHolder && Math.random() < 0.12) {
                  // Ball stripped / carrier brought down to the sand!
                  ballHolder.hasBall = false;
                  ballHolder.tackledCooldown = 35;
                  a.hasBall = true;
                  ball.holderId = a.id;
                  ball.carrierTeam = a.team;
                }
              }
            } else {
              // Continuous active repositioning in formation zone
              a.x += (a.targetX - a.x) * 0.03 + wanderX;
              a.y += (a.targetY - a.y) * 0.03 + wanderY;
            }
          }
        }

        // Constrain strictly inside arena fencing
        a.x = Math.max(12, Math.min(88, a.x));
        a.y = Math.max(16, Math.min(84, a.y));

        const px = (a.x / 100) * w;
        const py = (a.y / 100) * h + (a.tackledCooldown > 0 ? 0 : runCycle * 1.5);

        // A. Retro Drop Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        if (a.tackledCooldown > 0) {
          // Flat elongated shadow on sand
          ctx.ellipse(px + 2, py + 3, 9, 4, 0, 0, Math.PI * 2);
        } else {
          ctx.ellipse(px + 2, py + 5, 6, 3, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // B. Athlete Body (Tunic / Armor in social colors)
        if (a.tackledCooldown > 0) {
          // Down on the sand (turned horizontal sprite)
          ctx.fillStyle = a.team === 'HOME' ? '#7f1d1d' : '#1e3a8a';
          ctx.beginPath();
          ctx.ellipse(px, py, 9, 5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Small dust puff around fallen athlete
          ctx.fillStyle = 'rgba(180, 130, 80, 0.5)';
          ctx.beginPath();
          ctx.arc(px - 4, py + 2, 4, 0, Math.PI * 2);
          ctx.arc(px + 5, py - 2, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Upright running athlete with directional shoulder width
          ctx.fillStyle = a.team === 'HOME' ? (homeClub.colori?.primary || '#b91c1c') : (awayClub.colori?.primary || '#1e3a8a');
          ctx.beginPath();
          ctx.arc(px, py, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = a.team === 'HOME' ? '#fef08a' : '#e2e8f0';
          ctx.stroke();

          // Head (Retro pinkish skin tone dot)
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.arc(px, py - 4.5, 3.2, 0, Math.PI * 2);
          ctx.fill();

          // If carrying ball, render golden halo / possession aura
          if (a.hasBall) {
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 9.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // C. Minimal Retro Name Label
        ctx.fillStyle = a.team === 'HOME' ? '#fef08a' : '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(a.name.slice(0, 7), px, py + 13);
      });

      // 4. Update & Draw Harpastum Ball (Small hard leather sphere)
      if (ballHolder) {
        ball.x = ballHolder.x;
        ball.y = ballHolder.y + (ballHolder.team === 'HOME' ? -3.5 : 3.5);
      }

      const bx = (ball.x / 100) * w;
      const by = (ball.y / 100) * h;

      // Ball Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.arc(bx + 1.5, by + 2.5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Ball Body (Hard stitched leather sphere)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5. Render Physical Impact Clouds & Clash Texts
      const impacts = impactEffectsRef.current;
      for (let i = impacts.length - 1; i >= 0; i--) {
        const imp = impacts[i];
        imp.life--;

        const progress = 1 - (imp.life / imp.maxLife);
        const radius = 5 + progress * 14;
        const alpha = Math.max(0, imp.life / imp.maxLife);

        // Expanding Sand Dust Cloud
        ctx.fillStyle = `rgba(210, 165, 110, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, radius, 0, Math.PI * 2);
        ctx.arc(imp.x - radius * 0.4, imp.y + 2, radius * 0.7, 0, Math.PI * 2);
        ctx.arc(imp.x + radius * 0.4, imp.y - 2, radius * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Text banner above clash
        if (imp.text && imp.life > 6) {
          ctx.fillStyle = imp.color;
          ctx.font = 'bold 9px Cinzel, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(imp.text, imp.x, imp.y - 12 - (progress * 6));
        }

        if (imp.life <= 0) {
          impacts.splice(i, 1);
        }
      }

      // 6. Meta / Punctum Glorious Flash & Screen Celebration
      if (metaFlashRef.current > 0) {
        // Brilliant Gold Screen Flash
        ctx.fillStyle = `rgba(254, 240, 138, ${metaFlashRef.current * 0.45})`;
        ctx.fillRect(0, 0, w, h);

        // Giant On-Canvas Meta Triumph Banner
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(20, h / 2 - 28, w - 40, 56);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#d4af37';
        ctx.strokeRect(20, h / 2 - 28, w - 40, 56);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 15px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐⭐ META CONSEGUITA! PUNCTUM! ⭐⭐', w / 2, h / 2 - 4);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('LA PALLA HA VARCATO LA LINEA DELLE CASTRA!', w / 2, h / 2 + 16);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [homeClub, awayClub]);

  return (
    <div className="retro-box p-3 bg-gradient-to-b from-[#3d0b10] to-[#240507] border-2 border-[#85222b] shadow-2xl flex flex-col space-y-3">
      {/* Simulation Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#731922] gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Swords size={16} className="text-[#d4af37]" />
          <span className="font-roman font-bold text-white tracking-wide">
            SIMULAZIONE 2D ARENA D'HARPASTUM · 12 CONTRO 12 (50 MINUTI)
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
        <span className="text-[10px] text-[#94a3b8] font-data hidden sm:inline">Arena Harpastum 50 a.C.</span>
      </div>
    </div>
  );
};
