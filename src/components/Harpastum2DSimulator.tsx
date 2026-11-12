import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Match, MatchResult, Club, Player } from '../types';
import { audio } from '../services/audioService';
import { resolveMatchKits } from '../engines/kitColorEngine';
import { AthleteJerseyBadge } from './AthleteJerseyBadge';
import { Play, Pause, Shield, Swords, Info, Mic, MicOff, Film } from 'lucide-react';

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
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hasBall: boolean;
  tackledCooldown: number;
}

interface ArenaBall {
  x: number;
  y: number;
  holderId: string | null;
  carrierTeam: 'HOME' | 'AWAY' | null;
}

interface HighlightAction {
  id: string;
  type: 'KICKOFF' | 'META' | 'PLACCAGGIO' | 'INTERCETTO' | 'HALFTIME';
  minute: number;
  team: 'HOME' | 'AWAY';
  actorId?: string;
  actorName: string;
  laneX: number;
  durationSec: number;
}

interface ActiveActionScript {
  action: HighlightAction;
  elapsedSec: number;
  buildupSpoken: boolean;
  climaxTriggered: boolean;
  carrierId: string | null;
  actorId: string | null;
  targetX: number;
  targetY: number;
}

const TOP_META_LINE_PCT = 13;
const BOTTOM_META_LINE_PCT = 87;

export const Harpastum2DSimulator: React.FC<Harpastum2DSimulatorProps> = ({
  userMatch,
  homeClub,
  awayClub,
  allPlayers,
  onSimulationFinished
}) => {
  const [simMode, setSimMode] = useState<'HIGHLIGHTS' | 'FULL'>(audio.simModePreference);
  const [matchMinute, setMatchMinute] = useState<number>(0);
  const [matchPhase, setMatchPhase] = useState<'PLAYING' | 'EXITING' | 'FINISHED'>('PLAYING');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(audio.simSpeedMultiplier);
  const [currentScoreHome, setCurrentScoreHome] = useState<number>(0);
  const [currentScoreAway, setCurrentScoreAway] = useState<number>(0);
  const [liveCommentary, setLiveCommentary] = useState<string>(
    `Benvenuti nell'arena per ${homeClub.nome} contro ${awayClub.nome}. Le due coorti sono schierate lungo la mesê grammê.`
  );
  const [metaBanner, setMetaBanner] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(audio.voiceCommentaryEnabled);
  const [crowdEnabled, setCrowdEnabled] = useState<boolean>(audio.crowdEnabled);
  const [showRulesInfo, setShowRulesInfo] = useState<boolean>(false);
  const [highlightCounter, setHighlightCounter] = useState<{ current: number; total: number }>({
    current: 1,
    total: 1
  });
  const lastCrowdUpdateRef = useRef<number>(0);

  // Resolve jersey clash & away reserve colors deterministically
  const { homeKit, awayKit } = useMemo(
    () => resolveMatchKits(homeClub, awayClub),
    [homeClub, awayClub]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;
  const simModeRef = useRef(simMode);
  simModeRef.current = simMode;
  const matchPhaseRef = useRef(matchPhase);
  matchPhaseRef.current = matchPhase;

  const exitPhaseRef = useRef<{ active: boolean; finishedTriggered: boolean }>({
    active: false,
    finishedTriggered: false
  });
  const onSimulationFinishedRef = useRef(onSimulationFinished);
  onSimulationFinishedRef.current = onSimulationFinished;

  const { homeLineup, awayLineup, homeBench, awayBench } = useMemo(() => {
    const buildClubLineupAndBench = (club: Club) => {
      const clubPlayers = Object.values(allPlayers).filter(p => p.clubId === club.id);
      const playerMap = new Map(clubPlayers.map(p => [p.id, p]));
      const starters: Player[] = [];
      const starterIds = new Set<string>();

      for (const id of club.titolariIds || []) {
        const p = playerMap.get(id);
        if (p && !p.infortunato && !p.squalificato && !starterIds.has(id)) {
          starters.push(p);
          starterIds.add(id);
          if (starters.length >= 12) break;
        }
      }
      if (starters.length < 12) {
        const sorted = [...clubPlayers]
          .filter(p => !starterIds.has(p.id) && !p.infortunato && !p.squalificato)
          .sort((a, b) => b.valoreGenerale - a.valoreGenerale);
        for (const p of sorted) {
          starters.push(p);
          starterIds.add(p.id);
          if (starters.length >= 12) break;
        }
      }
      const bench = clubPlayers
        .filter(p => !starterIds.has(p.id) && !p.infortunato && !p.squalificato)
        .sort((a, b) => b.valoreGenerale - a.valoreGenerale)
        .slice(0, 6);
      return { starters, bench };
    };

    const h = buildClubLineupAndBench(homeClub);
    const a = buildClubLineupAndBench(awayClub);
    return {
      homeLineup: h.starters,
      homeBench: h.bench,
      awayLineup: a.starters,
      awayBench: a.bench
    };
  }, [homeClub, awayClub, allPlayers]);

  // Build deterministic chronological Highlight Queue from already-simulated match result
  const highlightPlaylist = useMemo<HighlightAction[]>(() => {
    const actions: HighlightAction[] = [
      {
        id: 'hl_kickoff',
        type: 'KICKOFF',
        minute: 1,
        team: 'HOME',
        actorName: homeLineup[6]?.cognome || 'Centurion',
        laneX: 50,
        durationSec: 4.0
      }
    ];

    const metas = userMatch.result.eventi.filter(e => e.tipo === 'META' || e.tipo === 'GOL');
    const tacklesAndIntercepts = userMatch.result.eventi
      .filter(e => e.tipo === 'PLACCAGGIO' || e.tipo === 'INTERCETTO')
      .slice(0, 3);

    const combined = [...metas, ...tacklesAndIntercepts].sort((a, b) => a.minuto - b.minuto);
    let halftimeInserted = false;

    combined.forEach((ev, idx) => {
      const scaledMin = Math.max(3, Math.min(49, Math.round((ev.minuto / 90) * 49)));
      if (!halftimeInserted && scaledMin >= 25) {
        halftimeInserted = true;
        actions.push({
          id: 'hl_halftime',
          type: 'HALFTIME',
          minute: 25,
          team: 'AWAY',
          actorName: awayLineup[6]?.cognome || 'Princeps',
          laneX: 50,
          durationSec: 3.4
        });
      }

      const team: 'HOME' | 'AWAY' = ev.squadra === 'CASA' ? 'HOME' : 'AWAY';
      const evType: HighlightAction['type'] =
        ev.tipo === 'PLACCAGGIO' ? 'PLACCAGGIO' : ev.tipo === 'INTERCETTO' ? 'INTERCETTO' : 'META';

      actions.push({
        id: `hl_ev_${idx}`,
        type: evType,
        minute: scaledMin,
        team,
        actorId: ev.giocatoreId,
        actorName: ev.giocatoreNome || (team === 'HOME' ? homeClub.sigla : awayClub.sigla),
        laneX: 24 + ((idx * 19 + ev.minuto * 7) % 52),
        durationSec: evType === 'META' ? 7.6 : 5.4
      });
    });

    if (!halftimeInserted) {
      actions.push({
        id: 'hl_halftime',
        type: 'HALFTIME',
        minute: 25,
        team: 'AWAY',
        actorName: awayLineup[6]?.cognome || 'Princeps',
        laneX: 50,
        durationSec: 3.2
      });
    }

    // Ensure non-empty tactical action even on 0-0 draws
    if (combined.length === 0) {
      actions.push({
        id: 'hl_default_tackle',
        type: 'PLACCAGGIO',
        minute: 18,
        team: 'HOME',
        actorName: homeLineup[2]?.cognome || 'Luctator',
        laneX: 42,
        durationSec: 5.2
      });
      actions.push({
        id: 'hl_default_intercept',
        type: 'INTERCETTO',
        minute: 38,
        team: 'AWAY',
        actorName: awayLineup[6]?.cognome || 'Tractor',
        laneX: 60,
        durationSec: 5.2
      });
    }

    return actions;
  }, [userMatch, homeLineup, awayLineup, homeClub.sigla, awayClub.sigla]);

  const athletesRef = useRef<SimAthlete[]>([]);
  const ballRef = useRef<ArenaBall>({
    x: 50,
    y: 50,
    holderId: null,
    carrierTeam: null
  });
  const activeScriptRef = useRef<ActiveActionScript | null>(null);
  const playlistIndexRef = useRef<number>(0);
  const metaFlashRef = useRef<number>(0);
  const impactEffectsRef = useRef<{ x: number; y: number; life: number; maxLife: number; text?: string; color: string }[]>([]);
  const triggeredFullModeEventsRef = useRef<Set<number>>(new Set());

  const initAthletes = (kickoffTeam: 'HOME' | 'AWAY' = 'HOME') => {
    const list: SimAthlete[] = [];

    const homeHomePositions = [
      { cat: 'CUSTOS', x: 50, y: 82 },
      { cat: 'LUCTATOR', x: 20, y: 70 },
      { cat: 'LUCTATOR', x: 40, y: 72 },
      { cat: 'LUCTATOR', x: 60, y: 72 },
      { cat: 'LUCTATOR', x: 80, y: 70 },
      { cat: 'TRACTOR', x: 22, y: 56 },
      { cat: 'TRACTOR', x: 42, y: 53 },
      { cat: 'TRACTOR', x: 58, y: 53 },
      { cat: 'TRACTOR', x: 78, y: 56 },
      { cat: 'PRAEVENIENS', x: 25, y: 41 },
      { cat: 'PRAEVENIENS', x: 50, y: 38 },
      { cat: 'PRAEVENIENS', x: 75, y: 41 }
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
        hasBall: kickoffTeam === 'HOME' && idx === 6,
        tackledCooldown: 0
      });
    });

    const awayHomePositions = [
      { cat: 'CUSTOS', x: 50, y: 18 },
      { cat: 'LUCTATOR', x: 20, y: 30 },
      { cat: 'LUCTATOR', x: 40, y: 28 },
      { cat: 'LUCTATOR', x: 60, y: 28 },
      { cat: 'LUCTATOR', x: 80, y: 30 },
      { cat: 'TRACTOR', x: 22, y: 44 },
      { cat: 'TRACTOR', x: 42, y: 47 },
      { cat: 'TRACTOR', x: 58, y: 47 },
      { cat: 'TRACTOR', x: 78, y: 44 },
      { cat: 'PRAEVENIENS', x: 25, y: 59 },
      { cat: 'PRAEVENIENS', x: 50, y: 62 },
      { cat: 'PRAEVENIENS', x: 75, y: 59 }
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
        hasBall: kickoffTeam === 'AWAY' && idx === 6,
        tackledCooldown: 0
      });
    });

    athletesRef.current = list;
    const starterHolder = list.find(a => a.hasBall) || list[6];
    ballRef.current = {
      x: starterHolder?.x || 50,
      y: starterHolder?.y || 50,
      holderId: starterHolder?.id || null,
      carrierTeam: kickoffTeam
    };
  };

  // Setup choreographed script for a specific highlight action
  const beginHighlightAction = (action: HighlightAction, idx: number) => {
    setMatchMinute(action.minute);
    setHighlightCounter({ current: idx + 1, total: highlightPlaylist.length });

    initAthletes(action.team);
    const athletes = athletesRef.current;

    let actor =
      (action.actorId && athletes.find(a => a.id === action.actorId && a.team === action.team)) ||
      (action.type === 'META'
        ? athletes.find(a => a.team === action.team && a.category === 'PRAEVENIENS')
        : athletes.find(a => a.team === action.team && a.category === 'LUCTATOR')) ||
      athletes.find(a => a.team === action.team) ||
      null;

    let carrier: SimAthlete | null = null;

    if (action.type === 'META' && actor) {
      athletes.forEach(a => (a.hasBall = false));
      actor.x = action.laneX;
      actor.y = action.team === 'HOME' ? 50 : 50;
      actor.hasBall = true;
      carrier = actor;
      ballRef.current = { x: actor.x, y: actor.y, holderId: actor.id, carrierTeam: action.team };
    } else if ((action.type === 'PLACCAGGIO' || action.type === 'INTERCETTO') && actor) {
      const oppTeam = action.team === 'HOME' ? 'AWAY' : 'HOME';
      const oppRunner =
        athletes.find(a => a.team === oppTeam && a.category === 'PRAEVENIENS') ||
        athletes.find(a => a.team === oppTeam) ||
        null;
      if (oppRunner) {
        athletes.forEach(a => (a.hasBall = false));
        oppRunner.x = action.laneX;
        oppRunner.y = oppTeam === 'HOME' ? 42 : 58;
        oppRunner.hasBall = true;
        carrier = oppRunner;
        actor.x = Math.max(18, Math.min(82, action.laneX + 12));
        actor.y = action.team === 'HOME' ? 34 : 66;
        ballRef.current = { x: oppRunner.x, y: oppRunner.y, holderId: oppRunner.id, carrierTeam: oppTeam };
      }
    }

    const goalTargetY = action.team === 'HOME' ? 6.0 : 94.0;
    activeScriptRef.current = {
      action,
      elapsedSec: 0,
      buildupSpoken: false,
      climaxTriggered: false,
      carrierId: carrier?.id || null,
      actorId: actor?.id || null,
      targetX: action.laneX,
      targetY: goalTargetY
    };

    // Predictive speech BEFORE action completes — zero cutoffs!
    const teamName = action.team === 'HOME' ? homeClub.nome : awayClub.nome;
    const isExtendedVoice = audio.commentaryDetail !== 'SOLO_GOL';
    if (action.type === 'KICKOFF') {
      audio.playWhistle();
      const msg = `Calcio d'inizio nell'arena tra ${homeClub.nome} e ${awayClub.nome}. Tutto pronto lungo la linea mediana.`;
      setLiveCommentary(msg);
      audio.speakCommentary(msg, { priority: 'HIGH', interrupt: true, rate: 0.9 });
    } else if (action.type === 'HALFTIME') {
      audio.playWhistle();
      const msg = `Intervallo al venticinquesimo minuto. Le coorti si scambiano il lato della sabbia.`;
      setMetaBanner(`INTERVALLO (25'): Cambio di campo delle coorti!`);
      setLiveCommentary(`[25'] ${msg}`);
      audio.speakCommentary(msg, { priority: 'HIGH', interrupt: true, rate: 0.9 });
      setTimeout(() => setMetaBanner(null), 2600);
    } else if (action.type === 'META') {
      const msg = `Minuto ${action.minute}: ${action.actorName} riceve palla per ${teamName}, elude la guardia e scatta verso la linea di meta!`;
      setLiveCommentary(`[${action.minute}'] ${msg}`);
      audio.speakCommentary(msg, { priority: 'HIGH', interrupt: true, rate: 0.9 });
    } else if (action.type === 'PLACCAGGIO') {
      const msg = `Minuto ${action.minute}: affondo pericoloso nella sabbia, ma ${action.actorName} chiude la traiettoria pronto al placcaggio!`;
      setLiveCommentary(`[${action.minute}'] ${msg}`);
      if (isExtendedVoice) {
        audio.speakCommentary(msg, { priority: 'HIGH', interrupt: true, rate: 0.9 });
      }
    } else if (action.type === 'INTERCETTO') {
      const msg = `Minuto ${action.minute}: lancio lungo a due mani verso l'ala, ${action.actorName} legge il passaggio a mezz'aria!`;
      setLiveCommentary(`[${action.minute}'] ${msg}`);
      if (isExtendedVoice) {
        audio.speakCommentary(msg, { priority: 'HIGH', interrupt: true, rate: 0.9 });
      }
    }

    if (activeScriptRef.current) {
      activeScriptRef.current.buildupSpoken = true;
    }
  };

  const triggerMatchFinishSequence = () => {
    setIsPlaying(false);
    setMatchMinute(50);
    setCurrentScoreHome(userMatch.result.golCasa);
    setCurrentScoreAway(userMatch.result.golOspite);
    setMatchPhase('EXITING');
    exitPhaseRef.current.active = true;
    audio.playWhistle();
    const finalMsg = `Triplice squillo di bucina! Risultato finale, ${homeClub.nome} ${userMatch.result.golCasa}, ${awayClub.nome} ${userMatch.result.golOspite}. Gli atleti escono dall'arena.`;
    setMetaBanner(`FINE DELL'AGONE (${userMatch.result.golCasa} - ${userMatch.result.golOspite}) · GLI ATLETI ESCONO DALL'ARENA`);
    setLiveCommentary(finalMsg);
    audio.speakCommentary(finalMsg, { priority: 'HIGH', interrupt: true, rate: 0.88, pitch: 1.02 });
  };

  // Initialize match state on mount / userMatch change
  useEffect(() => {
    setMatchMinute(0);
    setMatchPhase('PLAYING');
    setCurrentScoreHome(0);
    setCurrentScoreAway(0);
    setIsPlaying(true);
    setMetaBanner(null);
    metaFlashRef.current = 0;
    impactEffectsRef.current = [];
    triggeredFullModeEventsRef.current = new Set();
    exitPhaseRef.current = { active: false, finishedTriggered: false };
    playlistIndexRef.current = 0;

    audio.startArenaCrowd();

    if (simModeRef.current === 'HIGHLIGHTS' && highlightPlaylist.length > 0) {
      beginHighlightAction(highlightPlaylist[0], 0);
    } else {
      initAthletes('HOME');
      audio.speakCommentary(`Inizia l'agone tra ${homeClub.nome} e ${awayClub.nome}.`, {
        priority: 'HIGH',
        interrupt: true,
        rate: 0.9
      });
    }

    return () => {
      audio.stopArenaCrowd();
      if (!exitPhaseRef.current.finishedTriggered) {
        audio.stopSpeech();
      }
    };
  }, [userMatch]);

  // Auto-transition timer once EXITING begins
  useEffect(() => {
    if (matchPhase !== 'EXITING') return;
    exitPhaseRef.current.active = true;
    const finishTimer = setTimeout(() => {
      if (!exitPhaseRef.current.finishedTriggered) {
        exitPhaseRef.current.finishedTriggered = true;
        setMatchPhase('FINISHED');
        onSimulationFinishedRef.current?.();
      }
    }, 3600);
    return () => clearTimeout(finishTimer);
  }, [matchPhase]);

  // Full-Match mode gentle minute timer (~1.15s/min at 1x)
  useEffect(() => {
    if (simMode !== 'FULL' || !isPlaying || matchPhase !== 'PLAYING') return;

    const interval = setInterval(() => {
      setMatchMinute(prev => {
        if (prev >= 50) {
          triggerMatchFinishSequence();
          return 50;
        }
        const nextMin = prev + 1;

        if (nextMin === 16 && homeBench.length > 0) {
          const outAthlete = athletesRef.current.find(a => a.team === 'HOME' && a.category === 'LUCTATOR');
          const sub = homeBench[0];
          if (outAthlete && sub) {
            outAthlete.name = sub.cognome;
            outAthlete.id = sub.id;
            audio.playWhistle();
            const msg = `Rotatio d'Harpastum al sedicesimo: entra ${sub.cognome}.`;
            setMetaBanner(`ROTATIO (16'): Entra ${sub.cognome}`);
            setLiveCommentary(`[16'] ${msg}`);
            audio.speakCommentary(msg, { priority: 'NORMAL', rate: 0.9 });
            setTimeout(() => setMetaBanner(null), 2400);
          }
        } else if (nextMin === 25) {
          audio.playWhistle();
          const msg = `Intervallo al venticinquesimo minuto.`;
          setMetaBanner(`INTERVALLO (25')`);
          setLiveCommentary(`[25'] ${msg}`);
          audio.speakCommentary(msg, { priority: 'HIGH', rate: 0.9 });
          setTimeout(() => setMetaBanner(null), 2200);
        }

        // Predictive launch: match event begins smoothly in canvas with anticipatory commentary
        userMatch.result.eventi.forEach((ev, evIdx) => {
          if (triggeredFullModeEventsRef.current.has(evIdx)) return;
          const scaledMin = Math.max(2, Math.min(48, Math.round((ev.minuto / 90) * 48)));
          if (scaledMin <= nextMin) {
            triggeredFullModeEventsRef.current.add(evIdx);
            const team: 'HOME' | 'AWAY' = ev.squadra === 'CASA' ? 'HOME' : 'AWAY';
            if ((ev.tipo === 'META' || ev.tipo === 'GOL') && !activeScriptRef.current) {
              beginHighlightAction(
                {
                  id: `full_meta_${evIdx}`,
                  type: 'META',
                  minute: nextMin,
                  team,
                  actorId: ev.giocatoreId,
                  actorName: ev.giocatoreNome || 'Incursore',
                  laneX: 25 + Math.random() * 50,
                  durationSec: 6.5
                },
                0
              );
            }
          }
        });

        return nextMin;
      });
    }, 1150 / playbackSpeed);

    return () => clearInterval(interval);
  }, [simMode, isPlaying, matchPhase, playbackSpeed, userMatch]);

  // Delta-time normalized 60fps Arena Render & Choreography Loop
  useEffect(() => {
    let animId: number;
    let lastFrameTime = performance.now();

    const render = (nowPerf: number) => {
      const rawDt = (nowPerf - lastFrameTime) / 1000;
      lastFrameTime = nowPerf;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));
      const speedMul = playbackSpeedRef.current;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const now = Date.now();

      const topMetaY = (TOP_META_LINE_PCT / 100) * h;
      const bottomMetaY = (BOTTOM_META_LINE_PCT / 100) * h;

      if (metaFlashRef.current > 0) {
        metaFlashRef.current = Math.max(0, metaFlashRef.current - dt * 1.4);
      }

      // 1. Draw Sand Arena
      ctx.fillStyle = '#8f5c2c';
      ctx.fillRect(0, 0, w, h);

      // Meta Zones beyond Linee di Fondo
      ctx.fillStyle = 'rgba(69, 26, 3, 0.35)';
      ctx.fillRect(10, 10, w - 20, topMetaY - 10);
      ctx.fillRect(10, bottomMetaY, w - 20, h - 10 - bottomMetaY);

      ctx.strokeStyle = 'rgba(250, 204, 21, 0.14)';
      ctx.lineWidth = 1;
      for (let x = -20; x < w + 20; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x + 22, topMetaY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, bottomMetaY);
        ctx.lineTo(x + 22, h - 10);
        ctx.stroke();
      }

      // Sand grains
      ctx.fillStyle = '#7a4e25';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 73) % w;
        const sy = (i * 47) % h;
        ctx.fillRect(sx, sy, 3, 3);
      }

      // Timber fence + Porta Exit Gates
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#381607';
      ctx.strokeRect(10, 10, w - 20, h - 20);

      ctx.fillStyle = '#1a0a04';
      ctx.fillRect(4, h * 0.72 - 22, 10, 44);
      ctx.fillRect(w - 14, h * 0.28 - 22, 10, 44);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, h * 0.72 - 22, 10, 44);
      ctx.strokeRect(w - 14, h * 0.28 - 22, 10, 44);

      // Dashed Meta Lines & Straight Mesê Grammê (NO center circle!)
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = metaFlashRef.current > 0 ? '#ffffff' : '#fef08a';
      ctx.beginPath();
      ctx.setLineDash([8, 4]);
      ctx.moveTo(12, topMetaY);
      ctx.lineTo(w - 12, topMetaY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(12, bottomMetaY);
      ctx.lineTo(w - 12, bottomMetaY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.moveTo(12, h / 2);
      ctx.lineTo(w - 12, h / 2);
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.fillRect(w / 2 - 4, h / 2 - 4, 8, 8);

      // Arena Zone Labels
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(w / 2 - 118, 16, 236, 15);
      ctx.fillRect(w / 2 - 118, h - 31, 236, 15);
      ctx.fillRect(w / 2 - 48, h / 2 - 17, 96, 12);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8.5px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`ZONA META · ${homeClub.sigla} ATTACCA QUI`, w / 2, 26);
      ctx.fillText(`ZONA META · ${awayClub.sigla} ATTACCA QUI`, w / 2, h - 21);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 7.5px Cinzel, serif';
      ctx.fillText('MESÊ GRAMMÊ', w / 2, h / 2 - 8);

      // 2. Advance Scripted Choreography (Highlights Mode or Active Full-Mode Meta)
      const athletes = athletesRef.current;
      const ball = ballRef.current;
      const script = activeScriptRef.current;
      const isPaused = !isPlayingRef.current && matchPhaseRef.current === 'PLAYING';
      const isExitingArena = exitPhaseRef.current.active;

      if (script && !isPaused && !isExitingArena) {
        script.elapsedSec += dt * speedMul;

        if (script.action.type === 'META') {
          const runner = athletes.find(a => a.id === script.carrierId);
          if (runner) {
            if (!script.climaxTriggered) {
              // Phase 1 & 2: steady human sprint across midline and BEYOND the Linea di Fondo!
              const goalY = script.action.team === 'HOME' ? 6.0 : 94.0;
              const dy = goalY - runner.y;
              const dx = script.targetX - runner.x;
              const sprintSpeedPctPerSec = 11.5; // Slow, clearly readable sprint (~4.5s across half pitch)
              runner.y += Math.sign(dy) * Math.min(Math.abs(dy), sprintSpeedPctPerSec * dt * speedMul);
              runner.x += dx * Math.min(1, 1.4 * dt * speedMul);

              const crossed =
                (script.action.team === 'HOME' && runner.y <= TOP_META_LINE_PCT - 2.2) ||
                (script.action.team === 'AWAY' && runner.y >= BOTTOM_META_LINE_PCT + 2.2);

              if (crossed) {
                script.climaxTriggered = true;
                metaFlashRef.current = 1.0;
                audio.playGoal();
                impactEffectsRef.current.push({
                  x: (runner.x / 100) * w,
                  y: (runner.y / 100) * h,
                  life: 1.4,
                  maxLife: 1.4,
                  text: '⭐ META! LINEA SUPERATA!',
                  color: '#facc15'
                });

                const scoringTeamName = script.action.team === 'HOME' ? homeClub.nome : awayClub.nome;
                if (script.action.team === 'HOME') {
                  setCurrentScoreHome(s => Math.min(userMatch.result.golCasa, s + 1));
                } else {
                  setCurrentScoreAway(s => Math.min(userMatch.result.golOspite, s + 1));
                }
                const metaMsg = `Meta! ${script.action.actorName} supera la linea di fondo per ${scoringTeamName}!`;
                setMetaBanner(metaMsg.toUpperCase());
                setLiveCommentary(`[${script.action.minute}'] ${metaMsg}`);
                // priority HIGH with interrupt:false queues smoothly behind buildup commentary with zero cutoffs!
                audio.speakCommentary(metaMsg, { priority: 'HIGH', interrupt: false, rate: 0.91, pitch: 1.06 });
                setTimeout(() => setMetaBanner(null), 2800);
              }
            }
          }
        } else if (
          (script.action.type === 'PLACCAGGIO' || script.action.type === 'INTERCETTO') &&
          !script.climaxTriggered
        ) {
          const defender = athletes.find(a => a.id === script.actorId);
          const runner = athletes.find(a => a.id === script.carrierId);
          if (defender && runner) {
            // Calm pursuit toward ball carrier
            const advY = runner.team === 'HOME' ? 28 : 72;
            runner.y += Math.sign(advY - runner.y) * 5.2 * dt * speedMul;
            const dx = runner.x - defender.x;
            const dy = runner.y - defender.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 3.2) {
              const chaseSpeed = 10.5 * dt * speedMul;
              defender.x += (dx / dist) * chaseSpeed;
              defender.y += (dy / dist) * chaseSpeed;
            } else {
              script.climaxTriggered = true;
              runner.hasBall = false;
              defender.hasBall = true;
              ball.holderId = defender.id;
              ball.carrierTeam = defender.team;
              if (script.action.type === 'PLACCAGGIO') {
                runner.tackledCooldown = 2.0;
                audio.playTackleOrIntercept('PLACCAGGIO');
                impactEffectsRef.current.push({
                  x: (defender.x / 100) * w,
                  y: (defender.y / 100) * h,
                  life: 1.1,
                  maxLife: 1.1,
                  text: 'PLACCAGGIO!',
                  color: '#fef08a'
                });
                const msg = `Placcaggio perfetto di ${script.action.actorName} nella sabbia!`;
                setMetaBanner(`PLACCAGGIO DECISIVO DI ${script.action.actorName.toUpperCase()}!`);
                setLiveCommentary(`[${script.action.minute}'] ${msg}`);
                audio.speakCommentary(msg, { priority: 'HIGH', interrupt: false, rate: 0.91 });
              } else {
                audio.playTackleOrIntercept('INTERCETTO');
                impactEffectsRef.current.push({
                  x: (defender.x / 100) * w,
                  y: (defender.y / 100) * h,
                  life: 1.1,
                  maxLife: 1.1,
                  text: 'INTERCETTO!',
                  color: '#34d399'
                });
                const msg = `Intercetto al volo di ${script.action.actorName}! Ribaltamento di fronte!`;
                setMetaBanner(`INTERCETTO AL VOLO DI ${script.action.actorName.toUpperCase()}!`);
                setLiveCommentary(`[${script.action.minute}'] ${msg}`);
                audio.speakCommentary(msg, { priority: 'HIGH', interrupt: false, rate: 0.91 });
              }
              setTimeout(() => setMetaBanner(null), 2200);
            }
          }
        }

        // Advance to next highlight when duration finishes
        if (script.elapsedSec >= script.action.durationSec) {
          activeScriptRef.current = null;
          if (simModeRef.current === 'HIGHLIGHTS') {
            const nextIdx = playlistIndexRef.current + 1;
            if (nextIdx < highlightPlaylist.length) {
              playlistIndexRef.current = nextIdx;
              beginHighlightAction(highlightPlaylist[nextIdx], nextIdx);
            } else {
              triggerMatchFinishSequence();
            }
          }
        }
      }

      // 3. Calm, delta-time normalized background movement & Arena Exit walk
      const ballHolder = athletes.find(a => a.id === ball.holderId);
      let allExited = isExitingArena && athletes.length > 0;

      athletes.forEach((a, idx) => {
        const runCycle = isPaused ? 0 : Math.sin((now / 260) + idx * 0.9);
        const gentleSwayX = Math.cos((now / 950) + idx * 1.1) * 1.6;
        const gentleSwayY = Math.sin((now / 1100) + idx * 1.4) * 1.2;

        if (isExitingArena) {
          a.hasBall = false;
          a.tackledCooldown = 0;
          const gateX = a.team === 'HOME' ? 1.5 : 98.5;
          const gateY = a.team === 'HOME' ? 72 + ((idx % 3) - 1) * 2.5 : 28 + ((idx % 3) - 1) * 2.5;
          const dx = gateX - a.x;
          const dy = gateY - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1.8) {
            const walkSpeed = 24 * dt; // Calm walk to the exit gate (~2.2-3.0s)
            a.x += (dx / dist) * walkSpeed;
            a.y += (dy / dist) * walkSpeed;
            allExited = false;
          } else {
            a.x = gateX;
            a.y = gateY;
          }
        } else if (!isPaused) {
          if (a.tackledCooldown > 0) {
            a.tackledCooldown = Math.max(0, a.tackledCooldown - dt);
          } else if (
            activeScriptRef.current &&
            (a.id === activeScriptRef.current.carrierId || a.id === activeScriptRef.current.actorId)
          ) {
            // Protagonist trajectory already handled cleanly above
          } else if (activeScriptRef.current && activeScriptRef.current.action.type === 'META') {
            // Teammates move gently forward/chase carrier at calm speed
            const isAttack = a.team === activeScriptRef.current.action.team;
            const shiftY = isAttack ? (a.team === 'HOME' ? -10 : 10) : 0;
            const tx = isAttack ? a.targetX + gentleSwayX : (a.targetX * 0.65 + ball.x * 0.35);
            const ty = isAttack ? a.targetY + shiftY + gentleSwayY : (a.targetY * 0.6 + ball.y * 0.4);
            a.x += (tx - a.x) * Math.min(1, 1.3 * dt * speedMul);
            a.y += (ty - a.y) * Math.min(1, 1.3 * dt * speedMul);
          } else if (simModeRef.current === 'FULL') {
            // Calm drift in Full Match mode
            if (a.hasBall) {
              const advanceY = a.team === 'HOME' ? 20 : 80;
              a.y += Math.sign(advanceY - a.y) * 5.5 * dt * speedMul;
              a.x += Math.sin(now / 700) * 6 * dt * speedMul;
            } else {
              const distToBall = Math.hypot(a.x - ball.x, a.y - ball.y);
              if (a.team !== ball.carrierTeam && distToBall < 22) {
                a.x += (ball.x - a.x) * 1.4 * dt * speedMul;
                a.y += (ball.y - a.y) * 1.4 * dt * speedMul;
                if (distToBall < 5.5 && ballHolder && Math.random() < 0.08) {
                  ballHolder.hasBall = false;
                  ballHolder.tackledCooldown = 1.6;
                  a.hasBall = true;
                  ball.holderId = a.id;
                  ball.carrierTeam = a.team;
                }
              } else {
                a.x += ((a.targetX + gentleSwayX) - a.x) * 1.5 * dt * speedMul;
                a.y += ((a.targetY + gentleSwayY) - a.y) * 1.5 * dt * speedMul;
              }
            }
          } else {
            // Highlights idle formation breathing (kickoff / halftime)
            a.x += ((a.targetX + gentleSwayX) - a.x) * 1.4 * dt * speedMul;
            a.y += ((a.targetY + gentleSwayY) - a.y) * 1.4 * dt * speedMul;
          }
        }

        if (!isExitingArena) {
          a.x = Math.max(8, Math.min(92, a.x));
          a.y = Math.max(5.5, Math.min(94.5, a.y));
        }

        const gateAlpha = isExitingArena
          ? a.team === 'HOME'
            ? Math.max(0, Math.min(1, (a.x - 2.5) / 8))
            : Math.max(0, Math.min(1, (97.5 - a.x) / 8))
          : 1;

        if (gateAlpha <= 0.02) return;

        ctx.save();
        ctx.globalAlpha = gateAlpha;

        const kit = a.team === 'HOME' ? homeKit : awayKit;
        const px = (a.x / 100) * w;
        const py = (a.y / 100) * h + (a.tackledCooldown > 0 ? 0 : runCycle * 1.1);

        // Drop Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.beginPath();
        ctx.ellipse(px + 2, py + 5.5, a.tackledCooldown > 0 ? 9 : 7, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        if (a.tackledCooldown > 0) {
          ctx.fillStyle = kit.primary;
          ctx.beginPath();
          ctx.ellipse(px, py, 9, 5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = kit.outline;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // Jersey circle in resolved Home or Reserve Away Kit
          ctx.fillStyle = kit.primary;
          ctx.beginPath();
          ctx.arc(px, py, 7.2, 0, Math.PI * 2);
          ctx.fill();

          // Distinctive Roman tunic stripe (clavus) using kit.secondary
          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, 7.0, 0, Math.PI * 2);
          ctx.clip();
          ctx.fillStyle = kit.secondary;
          ctx.fillRect(px - 2.1, py - 7.5, 4.2, 15);
          ctx.restore();

          // Crisp high-contrast outline
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = kit.outline;
          ctx.beginPath();
          ctx.arc(px, py, 7.6, 0, Math.PI * 2);
          ctx.stroke();

          // Jersey Number centered on torso
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.arc(px, py + 1.5, 4.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 6.5px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(String(a.number), px, py + 3.7);

          // Head
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(px, py - 5.6, 3.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.45)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Ball carrier golden halo
          if (a.hasBall) {
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(px, py, 10.8, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Crisp team-tinted name pill
        const shortName = a.name.slice(0, 7);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(px - 20, py + 8, 40, 10);
        ctx.fillStyle = a.team === 'HOME' ? '#fef08a' : '#f8fafc';
        ctx.font = 'bold 7.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(shortName, px, py + 15.5);

        ctx.restore();
      });

      if (allExited && !exitPhaseRef.current.finishedTriggered) {
        exitPhaseRef.current.finishedTriggered = true;
        setTimeout(() => {
          setMatchPhase('FINISHED');
          onSimulationFinishedRef.current?.();
        }, 450);
      }

      // 4. Harpastum Ball
      if (!isExitingArena) {
        if (ballHolder) {
          ball.x = ballHolder.x;
          ball.y = ballHolder.y + (ballHolder.team === 'HOME' ? -3.2 : 3.2);
        }

        const bx = (ball.x / 100) * w;
        const by = (ball.y / 100) * h;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(bx + 1.5, by + 2.5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(bx, by, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Modulate stadium crowd chants based on ball & carrier scoring proximity
        if (now - lastCrowdUpdateRef.current > 150) {
          lastCrowdUpdateRef.current = now;
          if (isPaused) {
            audio.updateArenaCrowdIntensity(0.14);
          } else if (script && script.action.type === 'META' && !script.climaxTriggered) {
            // Escalate stadium chants sharply as runner crosses half-pitch toward Linea di Fondo
            const progress =
              script.action.team === 'HOME'
                ? Math.max(0, Math.min(1, (54 - ball.y) / (54 - TOP_META_LINE_PCT)))
                : Math.max(0, Math.min(1, (ball.y - 46) / (BOTTOM_META_LINE_PCT - 46)));
            audio.updateArenaCrowdIntensity(0.45 + progress * 0.53);
          } else if (script && (script.action.type === 'PLACCAGGIO' || script.action.type === 'INTERCETTO') && !script.climaxTriggered) {
            audio.updateArenaCrowdIntensity(0.58);
          } else if (ball.carrierTeam) {
            const attackDepth =
              ball.carrierTeam === 'HOME'
                ? Math.max(0, Math.min(1, (65 - ball.y) / (65 - TOP_META_LINE_PCT)))
                : Math.max(0, Math.min(1, (ball.y - 35) / (BOTTOM_META_LINE_PCT - 35)));
            audio.updateArenaCrowdIntensity(0.2 + attackDepth * 0.58);
          } else {
            audio.updateArenaCrowdIntensity(0.22);
          }
        }
      } else if (now - lastCrowdUpdateRef.current > 220) {
        lastCrowdUpdateRef.current = now;
        audio.updateArenaCrowdIntensity(0.18);
      }

      // 5. Impact Clouds
      const impacts = impactEffectsRef.current;
      for (let i = impacts.length - 1; i >= 0; i--) {
        const imp = impacts[i];
        imp.life -= dt;
        const progress = 1 - Math.max(0, imp.life / imp.maxLife);
        const radius = 5 + progress * 14;
        const alpha = Math.max(0, imp.life / imp.maxLife);

        ctx.fillStyle = `rgba(210, 165, 110, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (imp.text && imp.life > 0.15) {
          ctx.fillStyle = imp.color;
          ctx.font = 'bold 9.5px Cinzel, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(imp.text, imp.x, imp.y - 12 - progress * 8);
        }

        if (imp.life <= 0) {
          impacts.splice(i, 1);
        }
      }

      // 6. Meta Screen Celebration Overlay
      if (metaFlashRef.current > 0) {
        ctx.fillStyle = `rgba(254, 240, 138, ${metaFlashRef.current * 0.28})`;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(24, h / 2 - 26, w - 48, 52);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#d4af37';
        ctx.strokeRect(24, h / 2 - 26, w - 48, 52);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 14px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText('META CONSEGUITA! PUNCTUM!', w / 2, h / 2 - 3);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9.5px monospace';
        ctx.fillText("ATLETA OLTRE LA LINEA DI FONDO CON L'HARPASTUM!", w / 2, h / 2 + 15);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [homeClub, awayClub, userMatch, homeKit, awayKit, highlightPlaylist]);

  const handleToggleMode = () => {
    const nextMode = simMode === 'HIGHLIGHTS' ? 'FULL' : 'HIGHLIGHTS';
    setSimMode(nextMode);
    audio.simModePreference = nextMode;
    audio.savePreferences();
    setMatchMinute(0);
    setCurrentScoreHome(0);
    setCurrentScoreAway(0);
    setMatchPhase('PLAYING');
    setIsPlaying(true);
    setMetaBanner(null);
    metaFlashRef.current = 0;
    impactEffectsRef.current = [];
    activeScriptRef.current = null;
    triggeredFullModeEventsRef.current = new Set();
    exitPhaseRef.current = { active: false, finishedTriggered: false };
    playlistIndexRef.current = 0;

    if (nextMode === 'HIGHLIGHTS' && highlightPlaylist.length > 0) {
      beginHighlightAction(highlightPlaylist[0], 0);
    } else {
      initAthletes('HOME');
      audio.speakCommentary(
        `Modalità partita completa avviata, ${homeClub.nome} contro ${awayClub.nome}.`,
        { priority: 'HIGH', interrupt: true, rate: 0.9 }
      );
    }
  };

  return (
    <div className="retro-box p-2.5 bg-gradient-to-b from-[#3d0b10] to-[#240507] border-2 border-[#85222b] shadow-2xl flex flex-col space-y-2">
      {/* Simulation Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-1.5 border-b border-[#731922] gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Swords size={15} className="text-[#d4af37]" />
          <span className="font-roman font-bold text-white tracking-wide">
            ARENA D'HARPASTUM · {simMode === 'HIGHLIGHTS' ? `AZIONI SALIENTI (${highlightCounter.current}/${highlightCounter.total})` : 'GARA COMPLETA (50 MIN)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleMode}
            className="px-2 py-1 bg-[#1e2738] hover:bg-[#2d3748] text-[#fef08a] border border-[#d4af37]/50 rounded-xs cursor-pointer flex items-center gap-1 text-[11px] font-roman whitespace-nowrap"
            title="Alterna tra Azioni Salienti guidate o Partita Completa"
          >
            <Film size={12} />
            <span>{simMode === 'HIGHLIGHTS' ? 'Modo: Azioni Salienti' : 'Modo: Gara Intera'}</span>
          </button>

          {audio.isSpeechSupported() && (
            <button
              type="button"
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                audio.voiceCommentaryEnabled = next;
                audio.savePreferences();
                if (!next) audio.stopSpeech();
                else audio.speakCommentary('Telecronaca vocale attivata.', { priority: 'HIGH', interrupt: true, rate: 0.9 });
              }}
              className={`px-2 py-1 rounded-xs cursor-pointer flex items-center gap-1 text-[11px] font-roman border transition-colors whitespace-nowrap ${
                voiceEnabled
                  ? 'bg-[#63141c] text-[#fef08a] border-[#d4af37]'
                  : 'bg-[#240507] text-[#94a3b8] border-[#521016]'
              }`}
            >
              {voiceEnabled ? <Mic size={12} /> : <MicOff size={12} />}
              <span>Voce: {voiceEnabled ? 'ON' : 'OFF'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const next = !crowdEnabled;
              setCrowdEnabled(next);
              audio.setCrowdEnabled(next);
              if (next && matchPhase === 'PLAYING') {
                audio.startArenaCrowd();
              }
            }}
            className={`px-2 py-1 rounded-xs cursor-pointer flex items-center gap-1 text-[11px] font-roman border transition-colors whitespace-nowrap ${
              crowdEnabled
                ? 'bg-[#63141c] text-[#fef08a] border-[#d4af37]'
                : 'bg-[#240507] text-[#94a3b8] border-[#521016]'
            }`}
            title="Attiva o silenzia i cori dell'arena"
          >
            <span>Cori: {crowdEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRulesInfo(!showRulesInfo)}
            className="px-2 py-1 bg-[#240507] hover:bg-[#3d0b10] text-[#d4af37] border border-[#d4af37]/50 rounded-xs cursor-pointer flex items-center gap-1 text-[11px] font-roman whitespace-nowrap"
          >
            <Info size={12} />
            <span>Regole</span>
          </button>

          {matchPhase === 'PLAYING' && (
            <>
              <button
                type="button"
                onClick={() => {
                  const nextPlay = !isPlaying;
                  setIsPlaying(nextPlay);
                  if (!nextPlay) audio.stopSpeech();
                }}
                className="px-2 py-1 bg-[#521118] hover:bg-[#6b161f] text-[#facc15] border border-[#731922] rounded-xs cursor-pointer flex items-center gap-1 text-[11px] font-roman whitespace-nowrap"
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                <span>{isPlaying ? 'Pausa' : 'Riprendi'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPlaybackSpeed(s => {
                    const next: 1 | 1.5 | 2 = s === 1 ? 1.5 : s === 1.5 ? 2 : 1;
                    audio.simSpeedMultiplier = next;
                    audio.savePreferences();
                    return next;
                  })
                }
                className="px-2 py-1 bg-[#521118] hover:bg-[#6b161f] text-white border border-[#731922] rounded-xs cursor-pointer text-[11px] font-data font-bold whitespace-nowrap"
              >
                {playbackSpeed}x Ritmo
              </button>

              <button
                type="button"
                onClick={() => {
                  activeScriptRef.current = null;
                  triggerMatchFinishSequence();
                }}
                className="px-2 py-1 bg-[#1e2738] hover:bg-[#2d3748] text-[#fef08a] border border-[#d4af37]/50 rounded-xs cursor-pointer text-[11px] font-roman whitespace-nowrap"
              >
                Fine Rapida &rarr;
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rules Explanatory Dropdown */}
      {showRulesInfo && (
        <div className="p-2.5 bg-[#170305] border-2 border-[#d4af37] rounded-xs text-xs space-y-1.5 text-[#cbd5e1] font-roman">
          <div className="flex items-center justify-between border-b border-[#521016] pb-1">
            <span className="font-bold text-[#facc15] flex items-center gap-1.5">
              <Shield size={14} className="text-[#d4af37]" /> REGOLE CANONICHE DELL'HARPASTUM (12 vs 12)
            </span>
            <button onClick={() => setShowRulesInfo(false)} className="text-[#94a3b8] hover:text-white text-xs cursor-pointer">
              Chiudi &times;
            </button>
          </div>
          <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
            Ogni squadra schiera 12 atleti con colori distintivi (inclusa la <strong>Maglia di Riserva</strong> automatica in caso di divise simili). Per segnare un <em>punctum</em> (Meta) l'atleta deve superare fisicamente la linea di fondo avversaria con l'harpastum.
          </p>
        </div>
      )}

      {/* Scoreboard with Explicit Home & Away Athlete Jersey Badges */}
      <div className="grid grid-cols-3 items-center bg-[#190305] p-2 border-2 border-[#d4af37] rounded-xs shadow gap-2">
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="font-roman font-black text-xs sm:text-sm text-white drop-shadow-xs">{homeClub.nome}</span>
            <AthleteJerseyBadge
              primary={homeKit.primary}
              secondary={homeKit.secondary}
              outline={homeKit.outline}
              textColor={homeKit.textColor}
              size="md"
              title={`Maglia ${homeClub.nome}`}
            />
          </div>
          <div className="text-[10px] text-[#cbd5e1] font-roman">
            {homeKit.kitLabel} · Attacca in Alto &uarr;
          </div>
        </div>

        {/* Center Timer & Score */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[10px] font-data font-bold text-[#facc15] tracking-widest bg-[#2b080b] px-2.5 py-0.5 rounded-xs border border-[#731922] mb-0.5">
            {matchMinute}' AGONE
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-data text-2xl sm:text-3xl font-black text-[#d4af37] tabular-nums">{currentScoreHome}</span>
            <span className="font-data text-base text-[#cbd5e1]">-</span>
            <span className="font-data text-2xl sm:text-3xl font-black text-[#d4af37] tabular-nums">{currentScoreAway}</span>
          </div>
          <span className="text-[9px] font-roman text-[#94a3b8] tracking-widest uppercase">PUNCTA / METE</span>
        </div>

        <div className="text-left flex flex-col items-start">
          <div className="flex items-center gap-2">
            <AthleteJerseyBadge
              primary={awayKit.primary}
              secondary={awayKit.secondary}
              outline={awayKit.outline}
              textColor={awayKit.textColor}
              size="md"
              title={`Maglia ${awayClub.nome}`}
            />
            <span className="font-roman font-black text-xs sm:text-sm text-white drop-shadow-xs">{awayClub.nome}</span>
          </div>
          <div className={`text-[10px] font-roman ${awayKit.isReserveKit ? 'text-[#facc15] font-semibold' : 'text-[#cbd5e1]'}`}>
            {awayKit.kitLabel} · Attacca in Basso &darr;
          </div>
        </div>
      </div>

      {/* Meta Flash Banner Announcement */}
      {metaBanner && (
        <div className="bg-[#6b161f] border-2 border-[#d4af37] p-1.5 text-center text-[#fef08a] font-roman font-bold text-xs tracking-wider shadow-xl rounded-xs">
          ⭐ {metaBanner} ⭐
        </div>
      )}

      {/* 2D Canvas Arena Pitch */}
      <div className="flex justify-center items-center py-0.5">
        <canvas
          ref={canvasRef}
          width={420}
          height={380}
          className="rounded-xs shadow-2xl border-4 border-[#521118] cursor-crosshair max-w-full max-h-[45dvh] w-auto h-auto object-contain"
        />
      </div>

      {/* Live Predictive Commentary Feed */}
      <div className="retro-inset p-2 border border-[#521016] text-xs font-roman text-[#cbd5e1] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
          <span className="text-[#facc15] font-semibold">{liveCommentary}</span>
        </div>
        <span className="text-[10px] text-[#94a3b8] font-data hidden sm:inline shrink-0 ml-2">
          Arena Harpastum 50 a.C.
        </span>
      </div>
    </div>
  );
};
