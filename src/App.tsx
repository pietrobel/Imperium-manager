/**
 * MAGISTER LUDORUM (50 a.C.)
 * Master Application Root Component
 */

import React, { useState, useEffect } from 'react';
import type { CareerSave, Club, Match, MatchResult, Player } from './types';
import { RetroTopNav, type ScreenId } from './components/RetroTopNav';
import { RetroButton } from './components/RetroButton';
import { PlayerCardModal } from './components/PlayerCardModal';
import { MatchSimulationModal } from './components/MatchSimulationModal';
import { ErarioArenaModal } from './components/ErarioArenaModal';
import { SeasonEndModal } from './components/SeasonEndModal';
import type { SeasonEndReport } from './engines/seasonEndEngine';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { NewGameScreen } from './screens/NewGameScreen';
import { ManagerDashboardScreen } from './screens/ManagerDashboardScreen';
import { SquadScreen } from './screens/SquadScreen';
import { LeagueTableScreen } from './screens/LeagueTableScreen';
import { FixturesScreen } from './screens/FixturesScreen';
import { TransferMarketScreen } from './screens/TransferMarketScreen';
import { CompetitionsScreen } from './screens/CompetitionsScreen';
import { NationalTeamsScreen } from './screens/NationalTeamsScreen';
import { MilitaryTrainingScreen } from './screens/MilitaryTrainingScreen';
import { HistoryArchiveScreen } from './screens/HistoryArchiveScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { createNewCareer, advanceMatchday, type CreateCareerParams } from './services/careerService';
import { refreshNationalTeamsRosters } from './engines/nationalTeamsEngine';
import { reconcileCupMatches } from './engines/cupEngine';
import { getClubReserveColors } from './engines/kitColorEngine';
import { expandArenaCapacity, renewPlayerContract, type ArenaExpansionTier } from './engines/economyEngine';
import { careerRepository } from './repositories/DexieCareerRepository';
import { audio } from './services/audioService';

interface SimulationModalPayload {
  simulatedMatches: { match: Match; result: MatchResult }[];
  userMatch?: { match: Match; result: MatchResult };
  clubsOverride?: Record<string, Club>;
  playersOverride?: Record<string, Player>;
}

export default function App() {
  const [activeCareer, setActiveCareer] = useState<CareerSave | null>(null);
  const [savedCareers, setSavedCareers] = useState<CareerSave[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('DASHBOARD');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);
  const [appState, setAppState] = useState<'MAIN_MENU' | 'NEW_GAME' | 'IN_CAREER'>('MAIN_MENU');
  
  // Modals
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [offerTargetPlayer, setOfferTargetPlayer] = useState<Player | null>(null);
  const [isErarioModalOpen, setIsErarioModalOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastSimulationResult, setLastSimulationResult] = useState<SimulationModalPayload | null>(null);
  const [pendingSeasonEndReport, setPendingSeasonEndReport] = useState<SeasonEndReport | null>(null);
  const [activeSeasonEndReport, setActiveSeasonEndReport] = useState<SeasonEndReport | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(audio.enabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(audio.musicEnabled);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved careers on mount, keep 16:9 scale, and unlock ancient music on first user gesture
  useEffect(() => {
    audio.applyDisplayScale();
    const handleResize = () => audio.applyDisplayScale();
    const handleFirstGesture = () => {
      audio.ensureAudioStarted();
    };
    const unsubscribeAudio = audio.subscribeMusicState(() => {
      setSoundEnabled(audio.enabled);
      setMusicEnabled(audio.musicEnabled);
    });

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    careerRepository.getAllCareers().then(careers => {
      setSavedCareers(careers);
    });
    return () => {
      unsubscribeAudio();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Dynamically switch ancient soundtrack mood based on active experience
  useEffect(() => {
    if (activeSeasonEndReport) {
      audio.setMusicContext('TRIUMPH');
    } else if (lastSimulationResult) {
      audio.setMusicContext('ARENA');
    } else {
      audio.setMusicContext('MENU');
    }
  }, [activeSeasonEndReport, lastSimulationResult, appState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.setGlobalEnabled(next);
    if (next) audio.playClick();
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    audio.setMusicEnabled(next);
    if (next) {
      audio.playClick();
      showToast('Musica dell’Antichità attivata');
    } else {
      showToast('Musica dell’Antichità in pausa');
    }
  };

  const refreshSavedCareers = async () => {
    const careers = await careerRepository.getAllCareers();
    setSavedCareers(careers);
  };

  const navigateToScreen = (nextScreen: ScreenId) => {
    if (nextScreen === currentScreen) return;
    setScreenHistory(prev => [...prev.slice(-15), currentScreen]);
    setCurrentScreen(nextScreen);
  };

  const handleNavigateBack = () => {
    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setCurrentScreen(prevScreen);
      return;
    }
    if (activeCareer && currentScreen !== 'DASHBOARD') {
      setCurrentScreen('DASHBOARD');
      return;
    }
    refreshSavedCareers();
    setAppState('MAIN_MENU');
  };

  const handleReturnToMainMenu = () => {
    setScreenHistory([]);
    refreshSavedCareers();
    setAppState('MAIN_MENU');
  };

  const handleStartCareer = async (params: CreateCareerParams) => {
    const newSave = createNewCareer(params);
    await careerRepository.saveCareer(newSave);
    setActiveCareer(newSave);
    setScreenHistory([]);
    setAppState('IN_CAREER');
    setCurrentScreen('DASHBOARD');
    refreshSavedCareers();
    showToast(`Carriera avviata con ${newSave.clubs[params.userClubId]?.nome}!`);
  };

  const handleQuickStartRoma = async () => {
    const newSave = createNewCareer({
      managerName: 'Marcus',
      managerCognome: 'Aurelius',
      originFamily: 'Julia',
      userClubId: 'club_roma'
    });
    await careerRepository.saveCareer(newSave);
    setActiveCareer(newSave);
    setScreenHistory([]);
    setAppState('IN_CAREER');
    setCurrentScreen('DASHBOARD');
    refreshSavedCareers();
    showToast('Carriera avviata con SPQR Roma Caput Mundi!');
  };

  const reconcileLoadedCareer = (career: CareerSave): CareerSave => {
    const reconciledClubs: Record<string, Club> = {};
    for (const [id, club] of Object.entries(career.clubs || {})) {
      if (club.colori?.reservePrimary && club.colori?.reserveSecondary) {
        reconciledClubs[id] = club;
      } else {
        const reserve = getClubReserveColors(club);
        reconciledClubs[id] = {
          ...club,
          colori: {
            primary: club.colori?.primary || '#b91c1c',
            secondary: club.colori?.secondary || '#fef08a',
            text: club.colori?.text || '#ffffff',
            reservePrimary: club.colori?.reservePrimary || reserve.primary,
            reserveSecondary: club.colori?.reserveSecondary || reserve.secondary
          }
        };
      }
    }
    return {
      ...career,
      clubs: reconciledClubs,
      nationalTeams: refreshNationalTeamsRosters(career.nationalTeams, career.players),
      matches: reconcileCupMatches(career.matches, reconciledClubs, career.currentYear)
    };
  };

  const handleLoadGame = (career: CareerSave) => {
    const reconciled = reconcileLoadedCareer(career);
    setActiveCareer(reconciled);
    setScreenHistory([]);
    setAppState('IN_CAREER');
    setCurrentScreen('DASHBOARD');
    showToast(`Carriera "${career.saveName}" caricata con successo!`);
  };

  const handleQuickSave = async () => {
    if (!activeCareer) return;
    try {
      await careerRepository.saveCareer(activeCareer);
      audio.playTone(800, 0.1);
      showToast('Salvataggio completato in locale (IndexedDB)!');
    } catch (err) {
      showToast('Errore durante il salvataggio.');
    }
  };

  const handleAdvanceDay = () => {
    if (!activeCareer || isSimulating) return;

    setIsSimulating(true);
    audio.playClick();

    setTimeout(() => {
      const result = advanceMatchday(activeCareer);
      setActiveCareer(result.updatedCareer);
      setLastSimulationResult(result);
      if (result.seasonEndReport) {
        setPendingSeasonEndReport(result.seasonEndReport);
      }
      setIsSimulating(false);
    }, 400);
  };

  const handleCloseMatchSimulation = (returnToDashboard: boolean) => {
    setLastSimulationResult(null);
    if (returnToDashboard) {
      setCurrentScreen('DASHBOARD');
    }
    if (pendingSeasonEndReport) {
      setActiveSeasonEndReport(pendingSeasonEndReport);
      setPendingSeasonEndReport(null);
    }
  };

  const handleUpdateFormation = (formation: '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1' | '3-4-3' | '5-4-1' | '4-5-1') => {
    if (!activeCareer) return;
    const userClub = activeCareer.clubs[activeCareer.userClubId];
    if (!userClub) return;

    const updatedClub = { ...userClub, formazioneTattica: formation };
    const updatedCareer = {
      ...activeCareer,
      clubs: { ...activeCareer.clubs, [userClub.id]: updatedClub }
    };
    setActiveCareer(updatedCareer);
    careerRepository.saveCareer(updatedCareer);
    showToast(`Modulo tattico aggiornato a ${formation}!`);
  };

  const handleTogglePlayerTransferList = (player: Player) => {
    if (!activeCareer) return;
    const updated = { ...player, inListaTrasferimenti: !player.inListaTrasferimenti };
    const updatedPlayers = { ...activeCareer.players, [player.id]: updated };
    const updatedCareer = { ...activeCareer, players: updatedPlayers };
    setActiveCareer(updatedCareer);
    setSelectedPlayer(updated);
    careerRepository.saveCareer(updatedCareer);
    showToast(
      updated.inListaTrasferimenti
        ? `${player.nome} ${player.cognome} inserito in lista trasferimenti.`
        : `${player.nome} ${player.cognome} rimosso dalla lista trasferimenti.`
    );
  };

  const handleSwapStarters = (newStartersIds: string[]) => {
    if (!activeCareer) return;
    const userClub = activeCareer.clubs[activeCareer.userClubId];
    if (!userClub) return;

    const starterSet = new Set(newStartersIds);
    const squadIds = Object.values(activeCareer.players)
      .filter(p => p.clubId === userClub.id)
      .map(p => p.id);
    const benchIds = squadIds.filter(id => !starterSet.has(id));

    const updatedClub = {
      ...userClub,
      titolariIds: newStartersIds,
      panchinaIds: benchIds
    };
    const updatedCareer = {
      ...activeCareer,
      clubs: { ...activeCareer.clubs, [userClub.id]: updatedClub },
      updatedAt: Date.now()
    };
    setActiveCareer(updatedCareer);
    careerRepository.saveCareer(updatedCareer);
    showToast('Schieramento dei 12 Primarii salvato per il prossimo agone!');
  };

  const handleExpandArena = (tierId: ArenaExpansionTier['id']) => {
    if (!activeCareer) return;
    const userClub = activeCareer.clubs[activeCareer.userClubId];
    if (!userClub) return;

    const { success, updatedClub, message } = expandArenaCapacity(userClub, tierId);
    if (!success) {
      showToast(message);
      return;
    }

    const updatedCareer: CareerSave = {
      ...activeCareer,
      clubs: { ...activeCareer.clubs, [userClub.id]: updatedClub },
      updatedAt: Date.now()
    };
    setActiveCareer(updatedCareer);
    careerRepository.saveCareer(updatedCareer);
    audio.playGoal();
    showToast(message);
  };

  const handleRenewContract = (player: Player, extraYears: number) => {
    if (!activeCareer) return;
    const userClub = activeCareer.clubs[activeCareer.userClubId];
    if (!userClub) return;

    const { success, updatedClub, updatedPlayer, message } = renewPlayerContract(
      userClub,
      player,
      extraYears,
      activeCareer.currentYear
    );
    if (!success) {
      showToast(message);
      return;
    }

    const updatedCareer: CareerSave = {
      ...activeCareer,
      clubs: { ...activeCareer.clubs, [userClub.id]: updatedClub },
      players: { ...activeCareer.players, [player.id]: updatedPlayer },
      updatedAt: Date.now()
    };
    setActiveCareer(updatedCareer);
    setSelectedPlayer(updatedPlayer);
    careerRepository.saveCareer(updatedCareer);
    audio.playTone(850, 0.12);
    showToast(message);
  };

  // 1. Main Menu State
  if (appState === 'MAIN_MENU') {
    return (
      <MainMenuScreen
        onNewGame={() => setAppState('NEW_GAME')}
        onQuickStartRoma={handleQuickStartRoma}
        onLoadGame={handleLoadGame}
        savedCareers={savedCareers}
        onOpenHistory={() => {
          setScreenHistory([]);
          setAppState('IN_CAREER');
          setCurrentScreen('HISTORY');
        }}
        onOpenSettings={() => {
          setScreenHistory([]);
          setAppState('IN_CAREER');
          setCurrentScreen('SETTINGS');
        }}
        musicEnabled={musicEnabled && soundEnabled}
        onToggleMusic={handleToggleMusic}
      />
    );
  }

  // 2. New Game Setup
  if (appState === 'NEW_GAME') {
    return (
      <NewGameScreen
        onStartCareer={handleStartCareer}
        onBack={() => setAppState('MAIN_MENU')}
      />
    );
  }

  const userClub = activeCareer?.clubs[activeCareer.userClubId];

  // 3. Active In-Career State (Viewport-Locked 16:9 Shell)
  return (
    <div className="h-dvh w-full bg-[#2a0709] text-[#e2e8f0] flex flex-col font-sans select-none overflow-hidden">
      {/* Toast feedback banner */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#420d11] border border-[#d4af37] text-[#d4af37] px-4 py-1.5 text-xs font-semibold rounded-xs shadow-xl animate-fade-in font-roman">
          {toastMessage}
        </div>
      )}

      {/* Retro 3-Zone Top Bar */}
      <RetroTopNav
        currentScreen={currentScreen}
        onNavigate={navigateToScreen}
        dateText={activeCareer?.currentDateText || 'Ludi Romani Magni · anno 3 della 182ª Olimpiade'}
        treasuryHS={userClub?.saldoCassa || 0}
        clubName={userClub?.nome || 'Magister Ludorum'}
        onAdvanceDay={handleAdvanceDay}
        isSimulating={isSimulating}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        musicEnabled={musicEnabled}
        onToggleMusic={handleToggleMusic}
        onQuickSave={handleQuickSave}
        onBackToMainMenu={handleReturnToMainMenu}
        onGoBack={handleNavigateBack}
        hasActiveCareer={!!activeCareer}
      />

      {/* Main Screen Container (Fills remaining viewport height without outer scroll) */}
      <main className="flex-1 min-h-0 w-full max-w-[1440px] mx-auto px-2.5 py-2 sm:px-4 sm:py-2.5 flex flex-col overflow-hidden">
        {/* Fallback if navigated to career-only screens without active career */}
        {!activeCareer && currentScreen !== 'HISTORY' && currentScreen !== 'SETTINGS' && (
          <div className="retro-box p-8 text-center space-y-4 max-w-lg mx-auto my-12 border-2 border-[#d4af37] bg-[#240507]">
            <div className="w-12 h-12 rounded-full border-2 border-[#d4af37] bg-[#1a0406] flex items-center justify-center mx-auto text-[#d4af37] shadow-lg">
              📜
            </div>
            <h2 className="font-roman text-lg font-bold text-[#facc15] tracking-wide">
              NESSUNA COORTE ATTIVA CARICATA
            </h2>
            <p className="text-xs text-[#cbd5e1] font-roman leading-relaxed">
              Stai consultando gli archivi dell'Impero in modalità pubblica. Per visualizzare la coorte, l'addestramento militare e il campionato in corso, inizia una Nuova Carriera o carica un salvataggio dal Menu Principale.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <RetroButton variant="secondary" size="md" onClick={handleReturnToMainMenu}>
                &larr; Torna al Menu Principale
              </RetroButton>
              <RetroButton variant="gold" size="md" onClick={() => navigateToScreen('HISTORY')}>
                Consulta Albo d'Oro
              </RetroButton>
              <RetroButton variant="crimson" size="md" onClick={() => setAppState('NEW_GAME')}>
                Inizia Nuova Carriera &rarr;
              </RetroButton>
            </div>
          </div>
        )}

        {currentScreen === 'DASHBOARD' && activeCareer && (
          <ManagerDashboardScreen
            career={activeCareer}
            onNavigate={navigateToScreen}
            onSelectPlayer={setSelectedPlayer}
            onAdvanceDay={handleAdvanceDay}
            onSwapStarters={handleSwapStarters}
            onOpenErarioModal={() => setIsErarioModalOpen(true)}
          />
        )}

        {currentScreen === 'SQUAD' && activeCareer && (
          <SquadScreen
            career={activeCareer}
            onSelectPlayer={setSelectedPlayer}
            onUpdateFormation={handleUpdateFormation}
            onToggleTransferList={handleTogglePlayerTransferList}
            onSwapStarters={handleSwapStarters}
          />
        )}

        {currentScreen === 'TRAINING' && activeCareer && (
          <MilitaryTrainingScreen
            career={activeCareer}
            onUpdateCareer={updated => {
              setActiveCareer(updated);
              careerRepository.saveCareer(updated);
            }}
            onSelectPlayer={setSelectedPlayer}
          />
        )}

        {currentScreen === 'LEAGUE' && activeCareer && (
          <LeagueTableScreen
            career={activeCareer}
            onSelectPlayer={setSelectedPlayer}
          />
        )}

        {currentScreen === 'NATIONALS' && activeCareer && (
          <NationalTeamsScreen
            career={activeCareer}
            onUpdateCareer={updated => {
              setActiveCareer(updated);
              careerRepository.saveCareer(updated);
            }}
            onSelectPlayer={setSelectedPlayer}
            onLaunchNationalMatchSimulation={payload => setLastSimulationResult(payload)}
          />
        )}

        {currentScreen === 'FIXTURES' && activeCareer && (
          <FixturesScreen
            career={activeCareer}
            onInspectMatch={(match, result) =>
              setLastSimulationResult({
                simulatedMatches: [{ match, result }],
                userMatch: { match, result }
              })
            }
          />
        )}

        {currentScreen === 'TRANSFERS' && activeCareer && (
          <TransferMarketScreen
            career={activeCareer}
            onSelectPlayer={setSelectedPlayer}
            onUpdateCareer={updated => {
              setActiveCareer(updated);
              careerRepository.saveCareer(updated);
            }}
            initialOfferPlayer={offerTargetPlayer}
            onClearInitialOfferPlayer={() => setOfferTargetPlayer(null)}
          />
        )}

        {currentScreen === 'CUPS' && activeCareer && (
          <CompetitionsScreen
            career={activeCareer}
            onUpdateCareer={updated => {
              setActiveCareer(updated);
              careerRepository.saveCareer(updated);
            }}
            onLaunchCupMatchSimulation={payload => setLastSimulationResult(payload)}
            onBack={handleNavigateBack}
          />
        )}

        {currentScreen === 'HISTORY' && (
          <HistoryArchiveScreen
            career={activeCareer}
            onBack={handleNavigateBack}
          />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen
            career={activeCareer}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onCareerLoaded={career => {
              const reconciled = reconcileLoadedCareer(career);
              setActiveCareer(reconciled);
              refreshSavedCareers();
              showToast(`Carriera "${career.saveName}" caricata!`);
            }}
            onCareerDeleted={() => {
              setActiveCareer(null);
              refreshSavedCareers();
              setAppState('MAIN_MENU');
            }}
            onBackToMenu={handleReturnToMainMenu}
            onBackToTabularium={() => navigateToScreen('DASHBOARD')}
          />
        )}
      </main>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerCardModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          isUserPlayer={selectedPlayer.clubId === activeCareer?.userClubId}
          currentYear={activeCareer?.currentYear || -50}
          onToggleTransferList={handleTogglePlayerTransferList}
          onRenewContract={handleRenewContract}
          onMakeOffer={() => {
            const target = selectedPlayer;
            setSelectedPlayer(null);
            setOfferTargetPlayer(target);
            navigateToScreen('TRANSFERS');
            showToast(`Apertura trattativa per ${target.nome} ${target.cognome}`);
          }}
        />
      )}

      {/* Erario & Arena Expansion Modal */}
      {activeCareer && isErarioModalOpen && (
        <ErarioArenaModal
          isOpen={isErarioModalOpen}
          onClose={() => setIsErarioModalOpen(false)}
          career={activeCareer}
          onExpandArena={handleExpandArena}
          onSelectPlayerForRenewal={player => setSelectedPlayer(player)}
        />
      )}

      {/* Matchday Simulation Scoreboard Modal */}
      {lastSimulationResult && (
        <MatchSimulationModal
          isOpen={!!lastSimulationResult}
          onClose={() => handleCloseMatchSimulation(false)}
          onReturnToMain={() => handleCloseMatchSimulation(true)}
          userMatch={lastSimulationResult.userMatch}
          allSimulatedMatches={lastSimulationResult.simulatedMatches}
          clubs={{ ...(activeCareer?.clubs || {}), ...(lastSimulationResult.clubsOverride || {}) }}
          userClubId={activeCareer?.userClubId || ''}
          allPlayers={{ ...(activeCareer?.players || {}), ...(lastSimulationResult.playersOverride || {}) }}
        />
      )}

      {/* Season-End Fasti Consolari Ceremony Modal */}
      <SeasonEndModal
        isOpen={!!activeSeasonEndReport}
        report={activeSeasonEndReport}
        userClubId={activeCareer?.userClubId || ''}
        clubs={activeCareer?.clubs || {}}
        onClose={() => {
          setActiveSeasonEndReport(null);
          showToast('Nuova stagione pronta al via!');
        }}
      />
    </div>
  );
}
