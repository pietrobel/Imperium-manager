/**
 * IMPERIUM MANAGER (50 a.C.)
 * Master Application Root Component
 */

import React, { useState, useEffect } from 'react';
import type { CareerSave, Player } from './types';
import { RetroTopNav, type ScreenId } from './components/RetroTopNav';
import { PlayerCardModal } from './components/PlayerCardModal';
import { MatchSimulationModal } from './components/MatchSimulationModal';
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
import { careerRepository } from './repositories/DexieCareerRepository';
import { audio } from './services/audioService';

export default function App() {
  const [activeCareer, setActiveCareer] = useState<CareerSave | null>(null);
  const [savedCareers, setSavedCareers] = useState<CareerSave[]>([]);
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('DASHBOARD');
  const [appState, setAppState] = useState<'MAIN_MENU' | 'NEW_GAME' | 'IN_CAREER'>('MAIN_MENU');
  
  // Modals
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastSimulationResult, setLastSimulationResult] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved careers on mount
  useEffect(() => {
    careerRepository.getAllCareers().then(careers => {
      setSavedCareers(careers);
      // Auto-load most recent career if exists
      if (careers.length > 0 && !activeCareer) {
        // Leave in main menu so user can choose to resume or start new
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
    if (next) audio.playClick();
  };

  const handleStartCareer = async (params: CreateCareerParams) => {
    const newSave = createNewCareer(params);
    await careerRepository.saveCareer(newSave);
    setActiveCareer(newSave);
    setAppState('IN_CAREER');
    setCurrentScreen('DASHBOARD');
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
    setAppState('IN_CAREER');
    setCurrentScreen('DASHBOARD');
    showToast('Carriera avviata con SPQR Roma Caput Mundi!');
  };

  const handleLoadGame = (career: CareerSave) => {
    setActiveCareer(career);
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
      setIsSimulating(false);
    }, 400);
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

  // 1. Main Menu State
  if (appState === 'MAIN_MENU') {
    return (
      <MainMenuScreen
        onNewGame={() => setAppState('NEW_GAME')}
        onQuickStartRoma={handleQuickStartRoma}
        onLoadGame={handleLoadGame}
        savedCareers={savedCareers}
        onOpenHistory={() => {
          setAppState('IN_CAREER');
          setCurrentScreen('HISTORY');
        }}
        onOpenSettings={() => {
          setAppState('IN_CAREER');
          setCurrentScreen('SETTINGS');
        }}
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

  // 3. Active In-Career State
  return (
    <div className="min-h-screen bg-[#2a0709] text-[#e2e8f0] flex flex-col font-sans select-none">
      {/* Toast feedback banner */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#420d11] border border-[#d4af37] text-[#d4af37] px-4 py-1.5 text-xs font-semibold rounded-xs shadow-xl animate-fade-in font-roman">
          {toastMessage}
        </div>
      )}

      {/* Retro 3-Zone Top Bar */}
      <RetroTopNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        dateText={activeCareer?.currentDateText || 'Ludi Romani Magni · anno 3 della 182ª Olimpiade'}
        treasuryHS={userClub?.saldoCassa || 0}
        clubName={userClub?.nome || 'Imperium Manager'}
        onAdvanceDay={handleAdvanceDay}
        isSimulating={isSimulating}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onQuickSave={handleQuickSave}
        onBackToMainMenu={() => setAppState('MAIN_MENU')}
        hasActiveCareer={!!activeCareer}
      />

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 overflow-x-hidden">
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
              <RetroButton variant="secondary" size="md" onClick={() => setAppState('MAIN_MENU')}>
                &larr; Torna al Menu Principale
              </RetroButton>
              <RetroButton variant="gold" size="md" onClick={() => setCurrentScreen('HISTORY')}>
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
            onNavigate={setCurrentScreen}
            onSelectPlayer={setSelectedPlayer}
            onAdvanceDay={handleAdvanceDay}
          />
        )}

        {currentScreen === 'SQUAD' && activeCareer && (
          <SquadScreen
            career={activeCareer}
            onSelectPlayer={setSelectedPlayer}
            onUpdateFormation={handleUpdateFormation}
            onToggleTransferList={handleTogglePlayerTransferList}
          />
        )}

        {currentScreen === 'TRAINING' && activeCareer && (
          <MilitaryTrainingScreen
            career={activeCareer}
            onUpdateCareer={setActiveCareer}
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
            onSelectPlayer={setSelectedPlayer}
          />
        )}

        {currentScreen === 'FIXTURES' && activeCareer && (
          <FixturesScreen career={activeCareer} />
        )}

        {currentScreen === 'TRANSFERS' && activeCareer && (
          <TransferMarketScreen
            career={activeCareer}
            onSelectPlayer={setSelectedPlayer}
            onUpdateCareer={setActiveCareer}
          />
        )}

        {currentScreen === 'CUPS' && activeCareer && (
          <CompetitionsScreen career={activeCareer} />
        )}

        {currentScreen === 'HISTORY' && (
          <HistoryArchiveScreen
            career={activeCareer}
            onBack={() => activeCareer ? setCurrentScreen('DASHBOARD') : setAppState('MAIN_MENU')}
          />
        )}

        {currentScreen === 'SETTINGS' && (
          <SettingsScreen
            career={activeCareer}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onCareerLoaded={career => {
              setActiveCareer(career);
              showToast(`Carriera "${career.saveName}" caricata!`);
            }}
            onBackToMenu={() => setAppState('MAIN_MENU')}
          />
        )}
      </main>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerCardModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          isUserPlayer={selectedPlayer.clubId === activeCareer?.userClubId}
          onToggleTransferList={handleTogglePlayerTransferList}
          onMakeOffer={() => {
            setSelectedPlayer(null);
            setCurrentScreen('TRANSFERS');
            showToast(`Navigazione al Mercato Trasferimenti per trattare ${selectedPlayer.nome} ${selectedPlayer.cognome}`);
          }}
        />
      )}

      {/* Matchday Simulation Scoreboard Modal */}
      {lastSimulationResult && (
        <MatchSimulationModal
          isOpen={!!lastSimulationResult}
          onClose={() => setLastSimulationResult(null)}
          userMatch={lastSimulationResult.userMatch}
          allSimulatedMatches={lastSimulationResult.simulatedMatches}
          clubs={activeCareer?.clubs || {}}
          userClubId={activeCareer?.userClubId || ''}
          allPlayers={activeCareer?.players || {}}
        />
      )}
    </div>
  );
}
