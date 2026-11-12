import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { CareerSave, Player, Club, IncomingTransferOffer } from '../types';
import { RetroButton } from '../components/RetroButton';
import {
  Coins,
  Search,
  Filter,
  ShoppingBag,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Send,
  Trash2,
  Tag,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
  MessageSquare,
  Award,
  FileText,
  UserCheck
} from 'lucide-react';
import {
  evaluateTransferOffer,
  executeTransfer,
  generateAIOffersForUserPlayer,
  acceptIncomingOffer,
  releasePlayerContract,
  calculatePlayerMarketValue,
  initiateNegotiationSession,
  submitClubFeeNegotiation,
  acceptClubCounterOffer,
  submitPlayerTermsNegotiation,
  acceptPlayerCounterOffer,
  finalizeNegotiation,
  type NegotiationSession
} from '../engines/transferEngine';
import { audio } from '../services/audioService';

interface TransferMarketScreenProps {
  career: CareerSave;
  onSelectPlayer: (player: Player) => void;
  onUpdateCareer: (career: CareerSave) => void;
  initialOfferPlayer?: Player | null;
  onClearInitialOfferPlayer?: () => void;
}

export const TransferMarketScreen: React.FC<TransferMarketScreenProps> = ({
  career,
  onSelectPlayer,
  onUpdateCareer,
  initialOfferPlayer,
  onClearInitialOfferPlayer
}) => {
  const userClub = career.clubs[career.userClubId];

  // Active Main Hub Tab
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL' | 'OFFERS'>('BUY');

  // Search & Filters for Market (BUY)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('TUTTI');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('ALL');
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>('ALL');
  const [selectedOvrFilter, setSelectedOvrFilter] = useState<string>('ALL');
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<string>('ALL');
  const [onlyListed, setOnlyListed] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'OVR_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'AGE_ASC'>('OVR_DESC');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  // Real Multi-Stage Negotiation Session State
  const [negotiationSession, setNegotiationSession] = useState<NegotiationSession | null>(null);
  const [negotiationError, setNegotiationError] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState<number>(0);
  const [wageInput, setWageInput] = useState<number>(0);
  const [yearsInput, setYearsInput] = useState<number>(3);
  const [bonusInput, setBonusInput] = useState<number>(0);
  const [releaseClauseInput, setReleaseClauseInput] = useState<number>(0);

  // Edit Asking Price Modal (SELL)
  const [editingPricePlayer, setEditingPricePlayer] = useState<Player | null>(null);
  const [newAskingPrice, setNewAskingPrice] = useState<number>(0);

  // Release Contract Confirmation Modal (SELL)
  const [releasingPlayer, setReleasingPlayer] = useState<Player | null>(null);

  // Offer Feedback Banner
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (negotiationSession) {
      dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [negotiationSession?.dialogueHistory.length]);

  const leaguesList = Object.values(career.leagues);

  // Clubs available in Squadra filter (scoped to selectedLeagueFilter if chosen)
  const clubsForFilter = useMemo(() => {
    return Object.values(career.clubs)
      .filter(c => {
        if (c.id === career.userClubId) return false;
        if (selectedLeagueFilter !== 'ALL' && selectedLeagueFilter !== 'FREE_AGENTS') {
          return c.leagueId === selectedLeagueFilter;
        }
        return true;
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [career.clubs, career.userClubId, selectedLeagueFilter]);

  // Filter pool excluding user's current players
  const allOtherPlayers = useMemo(() => {
    return Object.values(career.players).filter(p => p.clubId !== career.userClubId);
  }, [career.players, career.userClubId]);

  // User's own squad players
  const userSquad = useMemo(() => {
    return Object.values(career.players).filter(p => p.clubId === career.userClubId);
  }, [career.players, career.userClubId]);

  // Counts
  const freeAgentsCount = useMemo(() => {
    return allOtherPlayers.filter(p => !p.clubId).length;
  }, [allOtherPlayers]);

  const listedCount = useMemo(() => {
    return allOtherPlayers.filter(p => p.inListaTrasferimenti).length;
  }, [allOtherPlayers]);

  const pendingOffers = useMemo(() => {
    return (career.incomingOffers || []).filter(o => o.status === 'PENDING');
  }, [career.incomingOffers]);

  // Filtered market players
  const filteredPlayers = useMemo(() => {
    return allOtherPlayers
      .filter(p => {
        if (onlyListed && !p.inListaTrasferimenti) return false;

        if (selectedRole !== 'TUTTI') {
          if (selectedRole === 'POR' && p.ruoloPrimario !== 'POR') return false;
          if (selectedRole === 'DIF' && !['DFC', 'TD', 'TS'].includes(p.ruoloPrimario)) return false;
          if (selectedRole === 'CEN' && !['MED', 'CC', 'TRQ'].includes(p.ruoloPrimario)) return false;
          if (selectedRole === 'ATT' && !['ATT', 'AD', 'AS'].includes(p.ruoloPrimario)) return false;
        }

        if (selectedLeagueFilter === 'FREE_AGENTS') {
          if (p.clubId) return false;
        } else if (selectedLeagueFilter !== 'ALL') {
          const club = career.clubs[p.clubId];
          if (!club || club.leagueId !== selectedLeagueFilter) return false;
        }

        if (selectedClubFilter !== 'ALL') {
          if (selectedClubFilter === 'FREE_AGENTS') {
            if (p.clubId) return false;
          } else if (p.clubId !== selectedClubFilter) {
            return false;
          }
        }

        if (selectedOvrFilter !== 'ALL') {
          const ovr = p.valoreGenerale;
          if (selectedOvrFilter === '85_PLUS' && ovr < 85) return false;
          if (selectedOvrFilter === '80_PLUS' && ovr < 80) return false;
          if (selectedOvrFilter === '75_PLUS' && ovr < 75) return false;
          if (selectedOvrFilter === '70_PLUS' && ovr < 70) return false;
          if (selectedOvrFilter === '65_74' && (ovr < 65 || ovr > 74)) return false;
          if (selectedOvrFilter === 'UNDER_65' && ovr >= 65) return false;
        }

        if (selectedAgeFilter === 'U21' && p.eta > 21) return false;
        if (selectedAgeFilter === 'PRIME' && (p.eta < 22 || p.eta > 28)) return false;
        if (selectedAgeFilter === 'VETERAN' && p.eta < 29) return false;

        if (searchTerm) {
          const query = searchTerm.toLowerCase();
          const fullName = `${p.nome} ${p.cognome}`.toLowerCase();
          const nat = p.nazionalita.toLowerCase();
          const clubName = (p.clubId && career.clubs[p.clubId]?.nome.toLowerCase()) || '';
          if (!fullName.includes(query) && !nat.includes(query) && !clubName.includes(query)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'OVR_DESC') return b.valoreGenerale - a.valoreGenerale;
        if (sortBy === 'PRICE_ASC') return a.prezzoRichiesto - b.prezzoRichiesto;
        if (sortBy === 'PRICE_DESC') return b.prezzoRichiesto - a.prezzoRichiesto;
        if (sortBy === 'AGE_ASC') return a.eta - b.eta;
        return 0;
      });
  }, [allOtherPlayers, onlyListed, selectedRole, selectedLeagueFilter, selectedClubFilter, selectedOvrFilter, selectedAgeFilter, searchTerm, sortBy, career.clubs]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedPlayers = filteredPlayers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const triggerBanner = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => {
      setFeedbackBanner(null);
    }, 4500);
  };

  // -------------------------------------------------------------
  // REAL NEGOTIATION ACTIONS
  // -------------------------------------------------------------
  const handleStartRealNegotiation = (player: Player) => {
    const seller = player.clubId ? career.clubs[player.clubId] : null;
    const session = initiateNegotiationSession(player, userClub, seller, career.currentDateText);
    setNegotiationSession(session);
    setNegotiationError(null);
    setFeeInput(session.targetFee);
    setWageInput(session.targetWage);
    setYearsInput(player.eta >= 30 ? 2 : 3);
    setBonusInput(0);
    setReleaseClauseInput(Math.round(session.fairMarketValue * 2.5));
    audio.playClick();
  };

  useEffect(() => {
    if (initialOfferPlayer && initialOfferPlayer.clubId !== career.userClubId) {
      setActiveTab('BUY');
      handleStartRealNegotiation(initialOfferPlayer);
      onClearInitialOfferPlayer?.();
    }
  }, [initialOfferPlayer]);

  const handleSendClubFee = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!negotiationSession) return;
    setNegotiationError(null);

    const sanitizedFee = Math.round(Number(feeInput));
    if (!Number.isFinite(sanitizedFee) || sanitizedFee <= 0) {
      const msg = 'Inserisci un importo valido in Sesterzi (HS) maggiore di 0 per formulare l’offerta.';
      setNegotiationError(msg);
      triggerBanner(msg);
      return;
    }

    if (sanitizedFee > userClub.saldoCassa) {
      const msg = `Fondi insufficienti in erario: la cassa dispone di ${userClub.saldoCassa.toLocaleString()} HS, hai offerto ${sanitizedFee.toLocaleString()} HS.`;
      setNegotiationError(msg);
      triggerBanner(msg);
      return;
    }

    const updated = submitClubFeeNegotiation(negotiationSession, sanitizedFee, career.currentDateText);
    setNegotiationSession(updated);

    if (updated.stage === 'PLAYER_TERMS') {
      audio.playTone(440, 0.2);
    } else if (updated.stage === 'COLLAPSED') {
      audio.playTone(200, 0.3);
    } else {
      audio.playClick();
    }
  };

  const handleAcceptClubCounter = () => {
    if (!negotiationSession || !negotiationSession.clubCounterFee) return;
    setNegotiationError(null);
    if (negotiationSession.clubCounterFee > userClub.saldoCassa) {
      const msg = `Fondi insufficienti in erario per accettare la controfferta (${negotiationSession.clubCounterFee.toLocaleString()} HS richiesti, cassa ${userClub.saldoCassa.toLocaleString()} HS).`;
      setNegotiationError(msg);
      triggerBanner(msg);
      return;
    }
    const updated = acceptClubCounterOffer(negotiationSession, career.currentDateText);
    setNegotiationSession(updated);
    audio.playTone(440, 0.2);
  };

  const handleSendPlayerTerms = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!negotiationSession) return;
    setNegotiationError(null);

    const sanitizedWage = Math.round(Number(wageInput));
    if (!Number.isFinite(sanitizedWage) || sanitizedWage < 500) {
      const msg = 'Inserisci un ingaggio settimanale valido di almeno 500 HS/settimana.';
      setNegotiationError(msg);
      triggerBanner(msg);
      return;
    }

    const totalCashNeeded = (negotiationSession.agreedFee || 0) + bonusInput;
    if (totalCashNeeded > userClub.saldoCassa) {
      const msg = `Fondi insufficienti per coprire cartellino e premio alla firma (${totalCashNeeded.toLocaleString()} HS richiesti).`;
      setNegotiationError(msg);
      triggerBanner(msg);
      return;
    }

    const updated = submitPlayerTermsNegotiation(
      negotiationSession,
      sanitizedWage,
      yearsInput,
      bonusInput,
      releaseClauseInput > 0 ? releaseClauseInput : undefined,
      career.currentDateText
    );
    setNegotiationSession(updated);

    if (updated.stage === 'COMPLETED') {
      audio.playGoal();
    } else if (updated.stage === 'COLLAPSED') {
      audio.playTone(200, 0.3);
    } else {
      audio.playClick();
    }
  };

  const handleAcceptPlayerCounter = () => {
    if (!negotiationSession) return;
    setNegotiationError(null);
    const totalNeeded = (negotiationSession.agreedFee || 0) + (negotiationSession.playerCounterBonus || 0);
    if (totalNeeded > userClub.saldoCassa) {
      const msg = `Fondi insufficienti per premio alla firma e cartellino (${totalNeeded.toLocaleString()} HS richiesti).`;
      setNegotiationError(msg);
      triggerBanner(msg);
      return;
    }
    const updated = acceptPlayerCounterOffer(negotiationSession, career.currentDateText);
    setNegotiationSession(updated);
    audio.playGoal();
  };

  const handleFinalizeSigning = () => {
    if (!negotiationSession) return;
    setNegotiationError(null);

    try {
      const { updatedCareer } = finalizeNegotiation(negotiationSession, career);
      audio.playGoal();
      onUpdateCareer(updatedCareer);
      setNegotiationSession(null);
      triggerBanner(`Trattativa ratificata dal Senato! ${negotiationSession.player.nome} ${negotiationSession.player.cognome} è ufficialmente tesserato con ${userClub.nome}!`);
    } catch (err: any) {
      const msg = err.message || 'Errore nella ratifica del trasferimento.';
      setNegotiationError(msg);
      triggerBanner(msg);
    }
  };

  // Instant 1-Click Buy (convenience button for full asking price)
  const handleInstantBuy = (player: Player) => {
    const isFree = !player.clubId;
    const fee = isFree ? 0 : (player.prezzoRichiesto > 0 ? player.prezzoRichiesto : calculatePlayerMarketValue(player));

    if (!isFree && fee > userClub.saldoCassa) {
      triggerBanner(`Fondi insufficienti: il tuo tesoro è di ${userClub.saldoCassa.toLocaleString()} HS, richiesti ${fee.toLocaleString()} HS.`);
      return;
    }

    const sellerClub = player.clubId ? career.clubs[player.clubId] : null;
    const wage = Math.round((player.contratto?.stipendioSettimanale || player.valoreGenerale * 250) * 1.05);

    const transferId = `transf_${Date.now()}`;
    const transferRecord = {
      id: transferId,
      playerId: player.id,
      playerNome: `${player.nome} ${player.cognome}`,
      daClubId: sellerClub ? sellerClub.id : 'free_agent',
      daClubNome: sellerClub ? sellerClub.nome : 'Atleta Svincolato / Libero',
      aClubId: userClub.id,
      aClubNome: userClub.nome,
      cifraTrasferimento: fee,
      data: career.currentDateText,
      stagioneAnno: career.currentYear
    };

    const { updatedPlayer, updatedBuyer, updatedSeller } = executeTransfer(
      transferRecord,
      player,
      userClub,
      sellerClub,
      wage
    );

    const updatedPlayers = { ...career.players, [updatedPlayer.id]: updatedPlayer };
    const updatedClubs = { ...career.clubs, [updatedBuyer.id]: updatedBuyer };
    if (updatedSeller) {
      updatedClubs[updatedSeller.id] = updatedSeller;
    }

    audio.playGoal();
    onUpdateCareer({
      ...career,
      players: updatedPlayers,
      clubs: updatedClubs,
      transfers: [transferRecord, ...career.transfers]
    });

    triggerBanner(`Acquisto rapido perfezionato! ${player.nome} ${player.cognome} si unisce alla legione.`);
  };

  // -------------------------------------------------------------
  // SELL ACTIONS
  // -------------------------------------------------------------
  const handleToggleTransferList = (player: Player) => {
    const isNowListed = !player.inListaTrasferimenti;
    const defaultVal = player.prezzoRichiesto > 0 ? player.prezzoRichiesto : calculatePlayerMarketValue(player);
    const updated: Player = {
      ...player,
      inListaTrasferimenti: isNowListed,
      prezzoRichiesto: defaultVal
    };

    const updatedPlayers = { ...career.players, [player.id]: updated };
    onUpdateCareer({ ...career, players: updatedPlayers });

    audio.playClick();
    triggerBanner(
      isNowListed
        ? `${player.nome} ${player.cognome} è stato inserito nella lista trasferimenti con prezzo ${defaultVal.toLocaleString()} HS.`
        : `${player.nome} ${player.cognome} è stato dichiarato incedibile.`
    );
  };

  const handleOpenEditPrice = (player: Player) => {
    setEditingPricePlayer(player);
    const curr = player.prezzoRichiesto > 0 ? player.prezzoRichiesto : calculatePlayerMarketValue(player);
    setNewAskingPrice(curr);
  };

  const handleSaveAskingPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPricePlayer) return;

    const updated: Player = {
      ...editingPricePlayer,
      prezzoRichiesto: Math.max(10000, newAskingPrice),
      inListaTrasferimenti: true
    };

    const updatedPlayers = { ...career.players, [updated.id]: updated };
    onUpdateCareer({ ...career, players: updatedPlayers });

    audio.playClick();
    setEditingPricePlayer(null);
    triggerBanner(`Prezzo richiesto per ${updated.nome} ${updated.cognome} aggiornato a ${updated.prezzoRichiesto.toLocaleString()} HS.`);
  };

  const handleOfferToClubs = (player: Player) => {
    audio.playClick();
    const bids = generateAIOffersForUserPlayer(
      player,
      career.clubs,
      career.userClubId,
      career.currentMatchday,
      career.currentDateText
    );

    if (bids.length === 0) {
      triggerBanner(`Gli osservatori dei club dell'Impero hanno esaminato ${player.nome} ${player.cognome}, ma nessun club dispone attualmente dei fondi necessari.`);
      return;
    }

    const existing = career.incomingOffers || [];
    const merged = [...bids, ...existing];

    onUpdateCareer({
      ...career,
      incomingOffers: merged
    });

    audio.playTone(520, 0.2);
    setActiveTab('OFFERS');
    triggerBanner(`Messaggio inviato a tutti i mercati dell'Impero! Ricevute ${bids.length} offerte per ${player.nome} ${player.cognome}.`);
  };

  const handleConfirmRelease = () => {
    if (!releasingPlayer) return;

    const { updatedPlayer, updatedClub, severanceFee } = releasePlayerContract(
      releasingPlayer,
      userClub
    );

    const updatedPlayers = { ...career.players, [updatedPlayer.id]: updatedPlayer };
    const updatedClubs = { ...career.clubs, [updatedClub.id]: updatedClub };

    audio.playWhistle();
    onUpdateCareer({
      ...career,
      players: updatedPlayers,
      clubs: updatedClubs
    });

    const playerName = `${releasingPlayer.nome} ${releasingPlayer.cognome}`;
    setReleasingPlayer(null);
    triggerBanner(`Contratto di ${playerName} rescisso. Liquidata buonuscita di ${severanceFee.toLocaleString()} HS.`);
  };

  // -------------------------------------------------------------
  // INCOMING OFFERS ACTIONS
  // -------------------------------------------------------------
  const handleAcceptOffer = (offer: IncomingTransferOffer) => {
    try {
      const { updatedCareer, transfer } = acceptIncomingOffer(offer, career);
      audio.playGoal();
      onUpdateCareer(updatedCareer);
      triggerBanner(`Cessione completata! ${offer.playerNome} ceduto a ${transfer.aClubNome} per ${offer.offeredFee.toLocaleString()} HS.`);
    } catch (err: any) {
      triggerBanner(err.message || 'Errore durante la cessione.');
    }
  };

  const handleRejectOffer = (offerId: string) => {
    audio.playClick();
    const updated = (career.incomingOffers || []).map(o => {
      if (o.id === offerId) return { ...o, status: 'REJECTED' as const };
      return o;
    });
    onUpdateCareer({ ...career, incomingOffers: updated });
    triggerBanner('Offerta di cessione respinta con fermezza.');
  };

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0 overflow-hidden select-none">
      {/* Toast / Notification Banner */}
      {feedbackBanner && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[70] bg-[#162235] border-2 border-[#d4af37] text-[#f1f5f9] px-4 py-2 text-xs font-semibold rounded-xs shadow-2xl animate-in fade-in flex items-center gap-2">
          <Sparkles size={16} className="text-[#d4af37] shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Top Treasury and Hub Header */}
      <div className="retro-box p-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <Coins size={18} className="text-[#38bdf8] shrink-0" />
          <div>
            <h1 className="font-roman text-sm font-bold text-white tracking-wide">
              FORO DEGLI ATLETI & MERCATO DELL'IMPERO · 182ª OLIMPIADE
            </h1>
            <div className="text-[11px] text-[#94a3b8] flex flex-wrap items-center gap-x-2">
              <span>Club: <span className="text-white font-semibold">{userClub.nome}</span></span>
              <span>·</span>
              <span>Reputazione: <span className="text-[#facc15] font-data font-bold">{userClub.reputazione}</span></span>
              <span>·</span>
              <span>Cassa Disponibile: <span className="text-[#38bdf8] font-data font-bold">{userClub.saldoCassa.toLocaleString()} HS</span></span>
              <span>·</span>
              <span>Budget Cartellini: <span className="text-[#d4af37] font-data font-bold">{userClub.budgetTrasferimenti.toLocaleString()} HS</span></span>
            </div>
          </div>
        </div>

        {/* 3 Main Tabs Switcher */}
        <div className="flex items-center gap-1.5 bg-[#0c1017] p-1 border border-[#222b3d] rounded-xs text-xs shrink-0">
          <button
            onClick={() => setActiveTab('BUY')}
            className={`px-3 py-1 font-roman font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'BUY'
                ? 'bg-[#1e2738] text-[#d4af37] border border-[#d4af37]/40 shadow-xs'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <ShoppingBag size={13} />
            Acquisti & Osservatori
          </button>

          <button
            onClick={() => setActiveTab('SELL')}
            className={`px-3 py-1 font-roman font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SELL'
                ? 'bg-[#1e2738] text-[#d4af37] border border-[#d4af37]/40 shadow-xs'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <DollarSign size={13} />
            Le Tue Cessioni ({userSquad.length})
          </button>

          <button
            onClick={() => setActiveTab('OFFERS')}
            className={`px-3 py-1 font-roman font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 relative whitespace-nowrap ${
              activeTab === 'OFFERS'
                ? 'bg-[#1e2738] text-[#d4af37] border border-[#d4af37]/40 shadow-xs'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Send size={13} />
            Offerte Ricevute
            {pendingOffers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#ef4444] text-white text-[10px] font-bold rounded-full animate-pulse">
                {pendingOffers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACQUISTI & OSSERVATORI                                             */}
      {/* ========================================================================= */}
      {activeTab === 'BUY' && (
        <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-hidden">
          {/* Filters Bar */}
          <div className="retro-box p-2.5 space-y-2 shrink-0">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Cerca atleta per nome, cognome o nazionalità..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#111622] border border-[#232d3f] pl-8 pr-3 py-1.5 text-xs text-white rounded-xs focus:border-[#d4af37] outline-none font-sans"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-data self-end md:self-center">
                <span className="px-2 py-0.5 bg-[#1e2738] text-[#facc15] border border-[#2e3c54] rounded-xs">
                  {listedCount.toLocaleString()} sul mercato
                </span>
                <span className="px-2 py-0.5 bg-[#152e25] text-[#34d399] border border-[#1b4332] rounded-xs">
                  {freeAgentsCount.toLocaleString()} svincolati
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
              <select
                value={selectedRole}
                onChange={e => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#111622] border border-[#232d3f] text-white px-2 py-1.5 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="TUTTI">Tutti i Ruoli</option>
                <option value="POR">Portieri (POR)</option>
                <option value="DIF">Difensori (DFC, TD, TS)</option>
                <option value="CEN">Centrocampisti (MED, CC, TRQ)</option>
                <option value="ATT">Attaccanti (ATT, AD, AS)</option>
              </select>

              <select
                value={selectedLeagueFilter}
                onChange={e => {
                  const nextLeague = e.target.value;
                  setSelectedLeagueFilter(nextLeague);
                  setSelectedClubFilter('ALL');
                  setCurrentPage(1);
                }}
                className="bg-[#111622] border border-[#232d3f] text-white px-2 py-1.5 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="ALL">Tutte le Leghe ({leaguesList.length})</option>
                <option value="FREE_AGENTS">Svincolati / Parametro Zero</option>
                {leaguesList.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>

              <select
                value={selectedClubFilter}
                onChange={e => {
                  const nextClub = e.target.value;
                  setSelectedClubFilter(nextClub);
                  if (nextClub !== 'ALL' && onlyListed) {
                    setOnlyListed(false);
                  }
                  setCurrentPage(1);
                }}
                className="bg-[#111622] border border-[#232d3f] text-white px-2 py-1.5 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="ALL">Tutte le Squadre ({clubsForFilter.length})</option>
                <option value="FREE_AGENTS">Svincolati (Senza Squadra)</option>
                {clubsForFilter.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>

              <select
                value={selectedOvrFilter}
                onChange={e => {
                  setSelectedOvrFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#111622] border border-[#232d3f] text-white px-2 py-1.5 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="ALL">Tutti gli Overall (OVR)</option>
                <option value="85_PLUS">Campioni (85+ OVR)</option>
                <option value="80_PLUS">Titolari Top (80+ OVR)</option>
                <option value="75_PLUS">Esperti (75+ OVR)</option>
                <option value="70_PLUS">Solidi (70+ OVR)</option>
                <option value="65_74">Fascia Media (65-74)</option>
                <option value="UNDER_65">Promesse (&lt; 65 OVR)</option>
              </select>

              <select
                value={selectedAgeFilter}
                onChange={e => {
                  setSelectedAgeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#111622] border border-[#232d3f] text-white px-2 py-1.5 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="ALL">Tutte le Età</option>
                <option value="U21">Giovani Talenti (&le; 21)</option>
                <option value="PRIME">Nel Pieno (22 - 28)</option>
                <option value="VETERAN">Veterani (29+)</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-[#111622] border border-[#232d3f] text-white px-2 py-1.5 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="OVR_DESC">Miglior Valore (OVR)</option>
                <option value="PRICE_ASC">Prezzo Più Basso</option>
                <option value="PRICE_DESC">Prezzo Più Alto</option>
                <option value="AGE_ASC">Più Giovane</option>
              </select>

              <label className="flex items-center gap-1.5 text-[#cbd5e1] text-xs cursor-pointer select-none bg-[#111622] border border-[#232d3f] px-2 py-1.5 rounded-xs">
                <input
                  type="checkbox"
                  checked={onlyListed}
                  onChange={e => {
                    setOnlyListed(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="accent-[#d4af37]"
                />
                <span className="truncate">Solo in Vendita</span>
              </label>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('TUTTI');
                  setSelectedLeagueFilter('ALL');
                  setSelectedClubFilter('ALL');
                  setSelectedOvrFilter('ALL');
                  setSelectedAgeFilter('ALL');
                  setOnlyListed(false);
                  setSortBy('OVR_DESC');
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 bg-[#1b2333] hover:bg-[#252f44] text-[#94a3b8] hover:text-white rounded-xs text-xs font-semibold cursor-pointer text-center"
              >
                Azzera Filtri
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="retro-box flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="retro-panel-header text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42]">
                    <th className="py-2 px-3 w-12 text-center">RUO</th>
                    <th className="py-2 px-3">ATLETA</th>
                    <th className="py-2 px-3">CLUB ATTUALE</th>
                    <th className="py-2 px-2 text-center">ETÀ</th>
                    <th className="py-2 px-2 text-center">OVR</th>
                    <th className="py-2 px-2 text-center">POT</th>
                    <th className="py-2 px-3 text-right">VALORE / CARTELLINO</th>
                    <th className="py-2 px-3 text-right">INGAGGIO SETT.</th>
                    <th className="py-2 px-3 text-center w-52">AZIONI TRATTATIVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] font-data text-xs">
                  {paginatedPlayers.map(p => {
                    const club = p.clubId ? career.clubs[p.clubId] : null;
                    const isFree = !p.clubId;
                    const fee = isFree ? 0 : (p.prezzoRichiesto > 0 ? p.prezzoRichiesto : calculatePlayerMarketValue(p));
                    const canAfford = isFree || userClub.saldoCassa >= fee;

                    return (
                      <tr key={p.id} className="hover:bg-[#1b2334] transition-colors">
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                              p.ruoloPrimario === 'POR'
                                ? 'bg-amber-900/60 text-amber-200'
                                : ['DFC', 'TD', 'TS'].includes(p.ruoloPrimario)
                                ? 'bg-blue-900/60 text-blue-200'
                                : ['MED', 'CC', 'TRQ'].includes(p.ruoloPrimario)
                                ? 'bg-emerald-900/60 text-emerald-200'
                                : 'bg-red-900/60 text-red-200'
                            }`}
                          >
                            {p.ruoloPrimario}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <button
                            onClick={() => onSelectPlayer(p)}
                            className="font-semibold text-white hover:text-[#d4af37] text-left cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{p.nome} {p.cognome}</span>
                            {p.eta <= 20 && (
                              <span className="text-[9px] px-1 py-0.2 bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 rounded-xs font-roman font-bold">
                                TALENTO
                              </span>
                            )}
                          </button>
                          <span className="text-[10px] text-[#64748b] block font-sans">{p.nazionalita}</span>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          {isFree ? (
                            <span className="text-[#34d399] font-bold text-[11px] flex items-center gap-1">
                              <UserPlus size={11} /> Svincolato / Libero
                            </span>
                          ) : (
                            <span className="text-[#cbd5e1]">{club?.nome || p.clubId}</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center text-[#94a3b8]">{p.eta}</td>
                        <td className="py-2 px-2 text-center font-bold text-[#d4af37] text-sm">{p.valoreGenerale}</td>
                        <td className="py-2 px-2 text-center text-[#38bdf8]">{p.potenziale}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#f59e0b]">
                          {isFree ? (
                            <span className="text-[#34d399] text-xs">0 HS (PARAMETRO ZERO)</span>
                          ) : (
                            `${fee.toLocaleString()} HS`
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-[#94a3b8]">
                          {(p.contratto?.stipendioSettimanale || Math.round(p.valoreGenerale * 250)).toLocaleString()} HS
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Real Negotiation Button */}
                            <RetroButton
                              variant="crimson"
                              size="sm"
                              onClick={() => handleStartRealNegotiation(p)}
                              className="text-[11px] px-2.5 py-0.5 font-bold flex items-center gap-1"
                            >
                              <MessageSquare size={11} />
                              Negozia
                            </RetroButton>

                            {/* Instant Buy Shortcut */}
                            <RetroButton
                              variant={canAfford ? 'gold' : 'secondary'}
                              size="sm"
                              disabled={!canAfford}
                              onClick={() => handleInstantBuy(p)}
                              className="text-[11px] px-2 py-0.5 whitespace-nowrap"
                              title={canAfford ? 'Acquista subito pagando la richiesta' : 'Fondi insufficienti'}
                            >
                              {isFree ? 'Ingaggia' : '⚡ Subito'}
                            </RetroButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPlayers.length === 0 && (
              <div className="py-12 text-center text-[#94a3b8] italic text-xs">
                Nessun atleta corrisponde ai filtri di ricerca selezionati.
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="retro-panel-header px-4 py-1.5 flex items-center justify-between border-t border-[#252e42] text-xs font-data shrink-0">
                <span className="text-[#94a3b8]">
                  Pagina <span className="text-white font-bold">{safeCurrentPage}</span> di{' '}
                  <span className="text-white font-bold">{totalPages}</span> ({filteredPlayers.length} atleti totali)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1 text-[#94a3b8] hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-[#d4af37] font-bold">{safeCurrentPage}</span>
                  <button
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1 text-[#94a3b8] hover:text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LE TUE CESSIONI                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'SELL' && (
        <div className="flex flex-col gap-2.5 flex-1 min-h-0 overflow-hidden">
          <div className="retro-box p-2.5 bg-[#111827] flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <Tag size={18} className="text-[#d4af37] shrink-0" />
              <div>
                <span className="font-roman font-bold text-white block">
                  GESTIONE VENDITE & SVINCOLI DELLA TUA ROSA
                </span>
                <span className="text-[#94a3b8] text-[11px]">
                  Metti i tuoi atleti sul mercato, imposta il prezzo richiesto o offrili direttamente alle altre squadre dell'Impero per ricevere offerte immediate di acquisto!
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-[#94a3b8]">Atleti in Rosa</div>
              <div className="text-sm font-bold text-white font-data">{userSquad.length} / 25</div>
            </div>
          </div>

          <div className="retro-box flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="retro-panel-header text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42]">
                    <th className="py-2 px-3 w-12 text-center">RUO</th>
                    <th className="py-2 px-3">ATLETA</th>
                    <th className="py-2 px-2 text-center">ETÀ</th>
                    <th className="py-2 px-2 text-center">OVR</th>
                    <th className="py-2 px-2 text-center">POT</th>
                    <th className="py-2 px-3 text-center">STATO MERCATO</th>
                    <th className="py-2 px-3 text-right">PREZZO RICHIESTO</th>
                    <th className="py-2 px-3 text-right">INGAGGIO SETT.</th>
                    <th className="py-2 px-3 text-center w-72">AZIONI DI CESSIONE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] font-data text-xs">
                  {userSquad.map(p => {
                    const asking = p.prezzoRichiesto > 0 ? p.prezzoRichiesto : calculatePlayerMarketValue(p);
                    const isListed = p.inListaTrasferimenti;

                    return (
                      <tr key={p.id} className="hover:bg-[#1b2334] transition-colors">
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                              p.ruoloPrimario === 'POR'
                                ? 'bg-amber-900/60 text-amber-200'
                                : ['DFC', 'TD', 'TS'].includes(p.ruoloPrimario)
                                ? 'bg-blue-900/60 text-blue-200'
                                : ['MED', 'CC', 'TRQ'].includes(p.ruoloPrimario)
                                ? 'bg-emerald-900/60 text-emerald-200'
                                : 'bg-red-900/60 text-red-200'
                            }`}
                          >
                            {p.ruoloPrimario}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <button
                            onClick={() => onSelectPlayer(p)}
                            className="font-semibold text-white hover:text-[#d4af37] text-left cursor-pointer"
                          >
                            {p.nome} {p.cognome}
                          </button>
                          <span className="text-[10px] text-[#64748b] block font-sans">{p.nazionalita}</span>
                        </td>
                        <td className="py-2 px-2 text-center text-[#cbd5e1]">{p.eta}</td>
                        <td className="py-2 px-2 text-center font-bold text-[#d4af37] text-sm">{p.valoreGenerale}</td>
                        <td className="py-2 px-2 text-center text-[#38bdf8]">{p.potenziale}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-xs text-[10px] font-bold font-roman ${
                              isListed
                                ? 'bg-amber-900/60 text-[#facc15] border border-amber-600/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {isListed ? 'SUL MERCATO' : 'INCEDIBILE'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-bold text-[#f59e0b]">{asking.toLocaleString()} HS</span>
                            <button
                              onClick={() => handleOpenEditPrice(p)}
                              className="text-[10px] text-[#38bdf8] hover:underline cursor-pointer"
                              title="Modifica prezzo richiesto"
                            >
                              Modifica
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-[#94a3b8]">
                          {(p.contratto?.stipendioSettimanale || Math.round(p.valoreGenerale * 250)).toLocaleString()} HS
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <RetroButton
                              variant={isListed ? 'secondary' : 'gold'}
                              size="sm"
                              onClick={() => handleToggleTransferList(p)}
                              className="text-[11px] px-2 py-0.5"
                            >
                              {isListed ? 'Togli' : 'Metti in Vendita'}
                            </RetroButton>

                            <RetroButton
                              variant="crimson"
                              size="sm"
                              onClick={() => handleOfferToClubs(p)}
                              className="text-[11px] px-2 py-0.5"
                              title="Invia dispacci agli altri club per ricevere offerte immediate in sesterzi"
                            >
                              📢 Offri ai Club
                            </RetroButton>

                            <button
                              onClick={() => setReleasingPlayer(p)}
                              className="p-1 text-[#ef4444] hover:text-white hover:bg-[#ef4444]/20 rounded-xs transition-colors cursor-pointer"
                              title="Svincola atleta e rescindi contratto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OFFERTE RICEVUTE & STORICO                                         */}
      {/* ========================================================================= */}
      {activeTab === 'OFFERS' && (
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          <div className="retro-box flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="retro-panel-header px-4 py-2 flex items-center justify-between border-b border-[#252e42] shrink-0">
              <div className="flex items-center gap-2">
                <Send size={15} className="text-[#38bdf8]" />
                <h3 className="font-roman text-sm font-bold text-white tracking-wide">
                  OFFERTE D'ACQUISTO RICEVUTE DALLE ALTRE SQUADRE
                </h3>
              </div>
              <span className="text-xs font-data text-[#facc15]">
                {pendingOffers.length} offerte in attesa di risposta
              </span>
            </div>

            <div className="p-3 flex-1 min-h-0 overflow-y-auto">
              {(career.incomingOffers || []).length === 0 ? (
                <div className="py-8 text-center text-[#94a3b8] italic text-xs space-y-2">
                  <p>Nessuna offerta registrata al momento.</p>
                  <p className="text-[11px] text-[#64748b]">
                    Suggerimento: vai nella scheda "Le Tue Cessioni" e clicca su <strong>"📢 Offri ai Club"</strong> per ricevere offerte di acquisto in contanti dai senati delle altre squadre!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(career.incomingOffers || []).map(offer => {
                    const isPending = offer.status === 'PENDING';

                    return (
                      <div
                        key={offer.id}
                        className={`p-3 rounded-xs border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          isPending
                            ? 'bg-[#152033] border-[#38bdf8]/60 shadow-md'
                            : offer.status === 'ACCEPTED'
                            ? 'bg-[#14291f] border-[#10b981]/40 opacity-75'
                            : 'bg-[#261517] border-[#ef4444]/40 opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-roman font-bold text-sm text-white">
                              {offer.offeringClubNome}
                            </span>
                            <span className="text-[#94a3b8] font-data text-[10px]">
                              {offer.data}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-xs text-[10px] font-bold ${
                                isPending
                                  ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                                  : offer.status === 'ACCEPTED'
                                  ? 'bg-[#10b981]/20 text-[#10b981]'
                                  : 'bg-[#ef4444]/20 text-[#ef4444]'
                              }`}
                            >
                              {offer.status === 'PENDING'
                                ? 'IN ATTESA DI DECISIONE'
                                : offer.status === 'ACCEPTED'
                                ? 'ACCETTATA'
                                : 'RIFIUTATA'}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#cbd5e1]">
                            Offre{' '}
                            <span className="font-bold text-[#f59e0b] font-data text-xs">
                              {offer.offeredFee.toLocaleString()} HS
                            </span>{' '}
                            per l'acquisto a titolo definitivo di{' '}
                            <span className="text-white font-bold">{offer.playerNome}</span> ({offer.playerRuolo}, OVR {offer.playerOvr}, {offer.playerEta} anni).
                          </div>
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <RetroButton
                              variant="gold"
                              size="sm"
                              onClick={() => handleAcceptOffer(offer)}
                              className="text-xs px-3 py-1 font-bold"
                            >
                              ✅ Accetta Cessione (+{offer.offeredFee.toLocaleString()} HS)
                            </RetroButton>
                            <RetroButton
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRejectOffer(offer.id)}
                              className="text-xs px-2.5 py-1"
                            >
                              ❌ Rifiuta
                            </RetroButton>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="retro-box flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="retro-panel-header px-4 py-2 flex items-center justify-between border-b border-[#252e42] shrink-0">
              <div className="flex items-center gap-2">
                <Coins size={15} className="text-[#d4af37]" />
                <h3 className="font-roman text-sm font-bold text-white tracking-wide">
                  LIBRO MASTRO DEI TRASFERIMENTI (STORICO IMPERIALE)
                </h3>
              </div>
              <span className="text-xs font-data text-[#94a3b8]">
                {career.transfers.length} trasferimenti registrati
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="retro-panel-header text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42]">
                    <th className="py-2 px-3">DATA</th>
                    <th className="py-2 px-3">ATLETA</th>
                    <th className="py-2 px-3">DA CLUB</th>
                    <th className="py-2 px-3">A CLUB</th>
                    <th className="py-2 px-3 text-right">SOMMA PAGATA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] font-data text-xs">
                  {career.transfers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#94a3b8] italic">
                        Nessun trasferimento ancora ratificato in questa stagione.
                      </td>
                    </tr>
                  ) : (
                    career.transfers.map(t => (
                      <tr key={t.id} className="hover:bg-[#1b2334] transition-colors">
                        <td className="py-2 px-3 text-[#94a3b8]">{t.data}</td>
                        <td className="py-2 px-3 font-semibold text-white font-sans">{t.playerNome}</td>
                        <td className="py-2 px-3 text-[#cbd5e1]">{t.daClubNome}</td>
                        <td className="py-2 px-3 text-[#38bdf8] font-bold">{t.aClubNome}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#f59e0b]">
                          {t.cifraTrasferimento === 0 ? '0 HS (GRATUITO)' : `${t.cifraTrasferimento.toLocaleString()} HS`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAL NEGOTIATION CHAMBER MODAL (TAVOLO DELLE TRATTATIVE SENATORIE)        */}
      {/* ========================================================================= */}
      {negotiationSession && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 backdrop-blur-xs">
          <div className="retro-box w-full max-w-2xl border-2 border-[#d4af37] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-b border-[#252e42] shrink-0">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#d4af37]" />
                <h3 className="font-roman text-sm font-bold text-white tracking-wide">
                  TAVOLO DELLE TRATTATIVE SENATORIE · {negotiationSession.player.nome} {negotiationSession.player.cognome}
                </h3>
              </div>
              <button
                onClick={() => setNegotiationSession(null)}
                className="text-[#94a3b8] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stages Breadcrumb Bar */}
            <div className="px-4 py-2 bg-[#0c1017] border-b border-[#1b2333] flex items-center justify-between text-xs font-roman shrink-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-xs font-bold ${
                  negotiationSession.stage === 'CLUB_FEE'
                    ? 'bg-[#d4af37] text-black'
                    : negotiationSession.agreedFee !== undefined
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : 'text-[#64748b]'
                }`}>
                  1. Cartellino Club {negotiationSession.agreedFee !== undefined && '✓'}
                </span>
                <span className="text-[#64748b]">&rarr;</span>
                <span className={`px-2 py-0.5 rounded-xs font-bold ${
                  negotiationSession.stage === 'PLAYER_TERMS'
                    ? 'bg-[#d4af37] text-black'
                    : negotiationSession.agreedWage !== undefined
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : 'text-[#64748b]'
                }`}>
                  2. Contratto & Ingaggio {negotiationSession.agreedWage !== undefined && '✓'}
                </span>
                <span className="text-[#64748b]">&rarr;</span>
                <span className={`px-2 py-0.5 rounded-xs font-bold ${
                  negotiationSession.stage === 'COMPLETED'
                    ? 'bg-[#10b981] text-black'
                    : 'text-[#64748b]'
                }`}>
                  3. Ratifica Imperiale
                </span>
              </div>

              {/* Round & Patience Indicators */}
              <div className="flex items-center gap-3 text-[11px] font-data">
                {negotiationSession.stage === 'CLUB_FEE' && negotiationSession.sellingClub && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#94a3b8]">Pazienza Senato:</span>
                    <div className="w-16 bg-[#1a2333] h-2 rounded-full overflow-hidden border border-[#2e3c54]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          negotiationSession.clubPatience > 60
                            ? 'bg-[#10b981]'
                            : negotiationSession.clubPatience > 30
                            ? 'bg-[#facc15]'
                            : 'bg-[#ef4444]'
                        }`}
                        style={{ width: `${negotiationSession.clubPatience}%` }}
                      />
                    </div>
                    <span className="text-white font-bold">{negotiationSession.clubPatience}%</span>
                  </div>
                )}

                {negotiationSession.stage === 'PLAYER_TERMS' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#94a3b8]">Disponibilità Atleta:</span>
                    <div className="w-16 bg-[#1a2333] h-2 rounded-full overflow-hidden border border-[#2e3c54]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          negotiationSession.playerPatience > 60
                            ? 'bg-[#10b981]'
                            : negotiationSession.playerPatience > 30
                            ? 'bg-[#facc15]'
                            : 'bg-[#ef4444]'
                        }`}
                        style={{ width: `${negotiationSession.playerPatience}%` }}
                      />
                    </div>
                    <span className="text-white font-bold">{negotiationSession.playerPatience}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Center Content */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Player & Reputation Leverage Card */}
              <div className="retro-inset p-3 grid grid-cols-1 md:grid-cols-3 gap-3 font-data text-xs">
                {/* Player dossier */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#1e2738] border border-[#d4af37] flex items-center justify-center text-xs font-bold text-[#d4af37] font-roman shrink-0">
                    {negotiationSession.player.ruoloPrimario}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-sm truncate font-sans">
                      {negotiationSession.player.nome} {negotiationSession.player.cognome}
                    </div>
                    <div className="text-[11px] text-[#94a3b8]">
                      {negotiationSession.player.eta} anni · OVR <span className="text-[#d4af37] font-bold">{negotiationSession.player.valoreGenerale}</span> (POT {negotiationSession.player.potenziale})
                    </div>
                  </div>
                </div>

                {/* Market Value & Asking */}
                <div className="border-l border-[#222c3f] pl-3 space-y-0.5">
                  <span className="text-[10px] text-[#64748b] block font-roman">VALUTAZIONE DI MERCATO</span>
                  <div className="font-bold text-[#f59e0b] text-sm">
                    {negotiationSession.fairMarketValue > 0
                      ? `${negotiationSession.fairMarketValue.toLocaleString()} HS`
                      : 'Parametro Zero (Svincolato)'}
                  </div>
                  <div className="text-[10px] text-[#94a3b8]">
                    Stipendio attuale: {negotiationSession.player.contratto?.stipendioSettimanale.toLocaleString() || 15000} HS/sett.
                  </div>
                </div>

                {/* Reputation comparison */}
                <div className="border-l border-[#222c3f] pl-3 space-y-0.5">
                  <span className="text-[10px] text-[#64748b] block font-roman">CONFRONTO PRESTIGIO & REPUTAZIONE</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-[#38bdf8] font-bold">{userClub.sigla} ({userClub.reputazione})</span>
                    <span className="text-[#64748b]">vs</span>
                    <span className="text-[#cbd5e1] font-bold">
                      {negotiationSession.sellingClub ? `${negotiationSession.sellingClub.sigla} (${negotiationSession.sellingClub.reputazione})` : 'Svincolato (500)'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#10b981]">
                    {userClub.reputazione >= (negotiationSession.sellingClub?.reputazione || 500)
                      ? '✓ Prestigio favorevole: forte attrazione sull’atleta'
                      : '⚠ Prestigio inferiore: l’atleta richiede garanzie economiche'}
                  </div>
                </div>
              </div>

              {/* Dialogue Transcript Ledger (Verbale dei Colloqui) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#94a3b8] font-roman">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={13} className="text-[#38bdf8]" />
                    VERBALE DEI COLLOQUI & DICHIARAZIONI DELLE PARTI
                  </span>
                  <span className="text-[10px] font-data">Round {negotiationSession.round} / {negotiationSession.maxRounds}</span>
                </div>

                <div className="p-3 bg-[#0a0e16] rounded-xs border border-[#1e2738] max-h-48 overflow-y-auto space-y-2 font-sans text-xs">
                  {negotiationSession.dialogueHistory.map(entry => {
                    const isSeller = entry.speaker === 'SELLER';
                    const isBuyer = entry.speaker === 'BUYER';
                    const isPlayer = entry.speaker === 'PLAYER';
                    const isAgent = entry.speaker === 'AGENT';

                    return (
                      <div
                        key={entry.id}
                        className={`p-2 rounded-xs border text-[11px] leading-relaxed ${
                          isBuyer
                            ? 'bg-[#122238] border-[#38bdf8]/40 text-[#bae6fd] ml-4'
                            : isSeller
                            ? 'bg-[#29171a] border-[#f43f5e]/40 text-[#fecdd3] mr-4'
                            : isPlayer
                            ? 'bg-[#231e13] border-[#d4af37]/50 text-[#fef08a]'
                            : isAgent
                            ? 'bg-[#13281d] border-[#10b981]/40 text-[#a7f3d0]'
                            : 'bg-[#111827] border-[#374151] text-[#cbd5e1]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-roman font-bold text-[10px] mb-0.5 opacity-90">
                          <span>{entry.speakerName}</span>
                          <span className="font-data font-normal text-[9px]">{entry.timestamp}</span>
                        </div>
                        <div>"{entry.text}"</div>
                      </div>
                    );
                  })}
                  <div ref={dialogueEndRef} />
                </div>
              </div>

              {/* ========================================================================= */}
              {/* STAGE 1 CONTROLS: CLUB FEE                                               */}
              {/* ========================================================================= */}
              {negotiationSession.stage === 'CLUB_FEE' && (
                <div className="space-y-3 p-3 bg-[#111622] rounded-xs border border-[#232d3f]">
                  <div className="flex items-center justify-between">
                    <span className="font-roman font-bold text-white text-xs">
                      PROPOSTA INDENNIZZO CARTELLINO AL CLUB CEDENTE
                    </span>
                    <span className="text-[11px] text-[#38bdf8] font-data">
                      Cassa club: {userClub.saldoCassa.toLocaleString()} HS
                    </span>
                  </div>

                  {/* If seller made a counter offer */}
                  {negotiationSession.clubCounterFee && (
                    <div className="retro-inset p-2.5 border-l-2 border-l-[#facc15] bg-[#1a1f2b] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#facc15] block font-roman font-bold">
                          CONTROFFERTA RICEVUTA DAL SENATO AVVERSARIO
                        </span>
                        <span className="text-white font-bold font-data text-xs">
                          {negotiationSession.clubCounterFee.toLocaleString()} HS
                        </span>
                      </div>
                      <RetroButton
                        variant="gold"
                        size="sm"
                        onClick={handleAcceptClubCounter}
                        className="text-xs font-bold"
                      >
                        ⚡ Accetta Controfferta ({negotiationSession.clubCounterFee.toLocaleString()} HS)
                      </RetroButton>
                    </div>
                  )}

                  {negotiationError && (
                    <div className="p-2.5 bg-[#2a1215] border border-[#ef4444] text-[#fca5a5] text-[11px] rounded-xs flex items-center gap-2">
                      <AlertCircle size={14} className="text-[#ef4444] shrink-0" />
                      <span>{negotiationError}</span>
                    </div>
                  )}

                  <form noValidate onSubmit={handleSendClubFee} className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <label className="text-[#cbd5e1] font-roman">
                          La tua offerta per il cartellino (HS):
                        </label>
                        <span className="text-[#f59e0b] font-data font-bold">
                          {feeInput.toLocaleString()} HS
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={feeInput === 0 ? '' : feeInput}
                        onChange={e => {
                          setNegotiationError(null);
                          const val = e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value)));
                          setFeeInput(Number.isFinite(val) ? val : 0);
                        }}
                        placeholder="Inserisci l'offerta in Sesterzi..."
                        className="w-full bg-[#0a0d14] border border-[#232d3f] px-3 py-1.5 text-white font-data rounded-xs focus:border-[#d4af37] outline-none select-text"
                      />

                      {/* Quick adjustment buttons */}
                      <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setNegotiationError(null);
                            setFeeInput(prev => Math.max(10000, prev - 100000));
                          }}
                          className="px-2 py-0.5 bg-[#1b2333] hover:bg-[#252f44] text-[#94a3b8] hover:text-white rounded-xs text-[10px] font-data cursor-pointer"
                        >
                          -100k
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNegotiationError(null);
                            setFeeInput(prev => Math.max(10000, prev - 25000));
                          }}
                          className="px-2 py-0.5 bg-[#1b2333] hover:bg-[#252f44] text-[#94a3b8] hover:text-white rounded-xs text-[10px] font-data cursor-pointer"
                        >
                          -25k
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNegotiationError(null);
                            setFeeInput(negotiationSession.targetFee);
                          }}
                          className="px-2 py-0.5 bg-[#1b2333] hover:bg-[#252f44] text-[#d4af37] rounded-xs text-[10px] font-data cursor-pointer"
                        >
                          Valore ({negotiationSession.targetFee.toLocaleString()} HS)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNegotiationError(null);
                            setFeeInput(prev => prev + 25000);
                          }}
                          className="px-2 py-0.5 bg-[#1b2333] hover:bg-[#252f44] text-[#94a3b8] hover:text-white rounded-xs text-[10px] font-data cursor-pointer"
                        >
                          +25k
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNegotiationError(null);
                            setFeeInput(prev => prev + 100000);
                          }}
                          className="px-2 py-0.5 bg-[#1b2333] hover:bg-[#252f44] text-[#94a3b8] hover:text-white rounded-xs text-[10px] font-data cursor-pointer"
                        >
                          +100k
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1b2333]">
                      <RetroButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setNegotiationSession(null)}
                      >
                        Interrompi Trattativa
                      </RetroButton>

                      <RetroButton type="submit" variant="crimson" size="sm" className="font-bold">
                        Invia Proposta al Senato &rarr;
                      </RetroButton>
                    </div>
                  </form>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STAGE 2 CONTROLS: PLAYER TERMS                                           */}
              {/* ========================================================================= */}
              {negotiationSession.stage === 'PLAYER_TERMS' && (
                <div className="space-y-3 p-3 bg-[#111622] rounded-xs border border-[#232d3f]">
                  <div className="flex items-center justify-between">
                    <span className="font-roman font-bold text-white text-xs flex items-center gap-1.5">
                      <UserCheck size={14} className="text-[#10b981]" />
                      NEGOZIAZIONE CONTRATTO & INGAGGIO DELL'ATLETA
                    </span>
                    {negotiationSession.agreedFee !== undefined && (
                      <span className="text-[10px] text-[#10b981] font-data bg-[#10b981]/10 px-2 py-0.5 rounded-xs border border-[#10b981]/30">
                        Cartellino approvato: {negotiationSession.agreedFee.toLocaleString()} HS
                      </span>
                    )}
                  </div>

                  {/* Player counter offer */}
                  {negotiationSession.playerCounterWage && (
                    <div className="retro-inset p-2.5 border-l-2 border-l-[#10b981] bg-[#14231b] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#34d399] block font-roman font-bold">
                          RICHIESTA FORMULATA DALL'AGENTE DELL'ATLETA
                        </span>
                        <span className="text-white font-bold font-data text-xs">
                          {negotiationSession.playerCounterWage.toLocaleString()} HS/sett.
                          {negotiationSession.playerCounterBonus ? ` + ${negotiationSession.playerCounterBonus.toLocaleString()} HS premio firma` : ''}
                        </span>
                      </div>
                      <RetroButton
                        variant="gold"
                        size="sm"
                        onClick={handleAcceptPlayerCounter}
                        className="text-xs font-bold"
                      >
                        ⚡ Accetta Richieste dell'Atleta
                      </RetroButton>
                    </div>
                  )}

                  {negotiationError && (
                    <div className="p-2.5 bg-[#2a1215] border border-[#ef4444] text-[#fca5a5] text-[11px] rounded-xs flex items-center gap-2">
                      <AlertCircle size={14} className="text-[#ef4444] shrink-0" />
                      <span>{negotiationError}</span>
                    </div>
                  )}

                  <form noValidate onSubmit={handleSendPlayerTerms} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Weekly Wage */}
                      <div>
                        <label className="block text-[#cbd5e1] mb-1 font-roman text-[11px]">
                          Ingaggio Settimanale (HS/sett.):
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={wageInput === 0 ? '' : wageInput}
                          onChange={e => {
                            setNegotiationError(null);
                            const val = e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value)));
                            setWageInput(Number.isFinite(val) ? val : 0);
                          }}
                          className="w-full bg-[#0a0d14] border border-[#232d3f] px-3 py-1.5 text-white font-data rounded-xs focus:border-[#d4af37] outline-none select-text"
                        />
                        <span className="text-[10px] text-[#64748b] block mt-0.5">
                          Attuale: {(negotiationSession.player.contratto?.stipendioSettimanale || 15000).toLocaleString()} HS/sett.
                        </span>
                      </div>

                      {/* Contract Duration */}
                      <div>
                        <label className="block text-[#cbd5e1] mb-1 font-roman text-[11px]">
                          Durata del Contratto:
                        </label>
                        <select
                          value={yearsInput}
                          onChange={e => setYearsInput(Number(e.target.value))}
                          className="w-full bg-[#0a0d14] border border-[#232d3f] px-3 py-1.5 text-white font-data rounded-xs focus:border-[#d4af37] outline-none cursor-pointer"
                        >
                          <option value={1}>1 Anno (Fino all'anno 4 della 182ª Olimpiade)</option>
                          <option value={2}>2 Anni (Fino all'anno 1 della 183ª Olimpiade)</option>
                          <option value={3}>3 Anni (Fino all'anno 2 della 183ª Olimpiade)</option>
                          <option value={4}>4 Anni (Fino all'anno 3 della 183ª Olimpiade)</option>
                        </select>
                      </div>

                      {/* Signing Bonus */}
                      <div>
                        <label className="block text-[#cbd5e1] mb-1 font-roman text-[11px]">
                          Premio alla Firma (Sesterzi una tantum):
                        </label>
                        <select
                          value={bonusInput}
                          onChange={e => setBonusInput(Number(e.target.value))}
                          className="w-full bg-[#0a0d14] border border-[#232d3f] px-3 py-1.5 text-white font-data rounded-xs focus:border-[#d4af37] outline-none cursor-pointer"
                        >
                          <option value={0}>Nessun Premio (0 HS)</option>
                          <option value={50000}>50.000 HS</option>
                          <option value={100000}>100.000 HS</option>
                          <option value={200000}>200.000 HS</option>
                          <option value={350000}>350.000 HS (Incentivo Top)</option>
                        </select>
                      </div>

                      {/* Release Clause */}
                      <div>
                        <label className="block text-[#cbd5e1] mb-1 font-roman text-[11px]">
                          Clausola Rescissoria (Opzionale):
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={releaseClauseInput === 0 ? '' : releaseClauseInput}
                          onChange={e => {
                            const val = e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value)));
                            setReleaseClauseInput(Number.isFinite(val) ? val : 0);
                          }}
                          className="w-full bg-[#0a0d14] border border-[#232d3f] px-3 py-1.5 text-white font-data rounded-xs focus:border-[#d4af37] outline-none select-text"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1b2333]">
                      <RetroButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setNegotiationSession(null)}
                      >
                        Abbandona Tavolo
                      </RetroButton>

                      <RetroButton type="submit" variant="crimson" size="sm" className="font-bold">
                        Presenta Bozza di Contratto &rarr;
                      </RetroButton>
                    </div>
                  </form>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STAGE 3: COMPLETED SUCCESS RATIFICATION                                   */}
              {/* ========================================================================= */}
              {negotiationSession.stage === 'COMPLETED' && (
                <div className="p-4 bg-[#14231b] border-2 border-[#10b981] rounded-xs space-y-3">
                  <div className="flex items-center gap-2.5 text-[#10b981]">
                    <Award size={22} className="shrink-0" />
                    <div>
                      <h4 className="font-roman font-bold text-sm text-white">
                        ACCORDO TOTALE RAGGIUNTO & RATIFICATO!
                      </h4>
                      <span className="text-[11px] text-[#a7f3d0]">
                        Il club e l'atleta hanno formalizzato ogni clausola contrattuale.
                      </span>
                    </div>
                  </div>

                  <div className="retro-inset p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-data text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748b] block font-roman">CARTELLINO</span>
                      <span className="font-bold text-white text-sm">
                        {negotiationSession.agreedFee ? `${negotiationSession.agreedFee.toLocaleString()} HS` : '0 HS (Gratuito)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] block font-roman">INGAGGIO</span>
                      <span className="font-bold text-[#38bdf8] text-sm">
                        {negotiationSession.agreedWage?.toLocaleString()} HS/sett.
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] block font-roman">DURATA</span>
                      <span className="font-bold text-white text-sm">
                        {negotiationSession.agreedYears} Anni
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748b] block font-roman">PREMIO ALLA FIRMA</span>
                      <span className="font-bold text-[#f59e0b] text-sm">
                        {negotiationSession.agreedBonus ? `${negotiationSession.agreedBonus.toLocaleString()} HS` : '0 HS'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-[#1b3a2a]">
                    <RetroButton
                      variant="gold"
                      size="sm"
                      onClick={handleFinalizeSigning}
                      className="font-bold px-4 py-1.5 text-xs flex items-center gap-1.5"
                    >
                      <FileText size={14} />
                      Apponi il Sigillo Senatorio & Concludi Trasferimento
                    </RetroButton>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STAGE 4: COLLAPSED / FAILED                                               */}
              {/* ========================================================================= */}
              {negotiationSession.stage === 'COLLAPSED' && (
                <div className="p-4 bg-[#261517] border-2 border-[#ef4444] rounded-xs space-y-3">
                  <div className="flex items-center gap-2.5 text-[#ef4444]">
                    <AlertCircle size={22} className="shrink-0" />
                    <div>
                      <h4 className="font-roman font-bold text-sm text-white">
                        TRATTATIVA INTERROTTA DEFINITIVAMENTE
                      </h4>
                      <span className="text-[11px] text-[#fca5a5]">
                        Le divergenze tra le parti sono inconciliabili. I delegati hanno abbandonato il foro.
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-[#3b1d22]">
                    <RetroButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setNegotiationSession(null)}
                      className="font-bold"
                    >
                      Chiudi Scheda
                    </RetroButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT ASKING PRICE (SELL)                                           */}
      {/* ========================================================================= */}
      {editingPricePlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="retro-box w-full max-w-sm border border-[#d4af37] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#232d3f] pb-2">
              <h3 className="font-roman font-bold text-white text-sm">
                MODIFICA PREZZO RICHIESTO
              </h3>
              <button
                onClick={() => setEditingPricePlayer(null)}
                className="text-[#94a3b8] hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[#94a3b8]">
              Imposta il valore minimo in Sesterzi (HS) che il tuo Senato richiede per cedere{' '}
              <strong className="text-white">{editingPricePlayer.nome} {editingPricePlayer.cognome}</strong>.
            </p>

            <form noValidate onSubmit={handleSaveAskingPrice} className="space-y-3">
              <div>
                <label className="block text-[#cbd5e1] mb-1 font-roman">
                  Nuovo Prezzo Richiesto (HS):
                </label>
                <input
                  type="number"
                  min={10000}
                  step="any"
                  value={newAskingPrice === 0 ? '' : newAskingPrice}
                  onChange={e => setNewAskingPrice(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                  className="w-full bg-[#111622] border border-[#232d3f] px-3 py-1.5 text-white font-data rounded-xs focus:border-[#d4af37] outline-none select-text"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1b2333]">
                <RetroButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingPricePlayer(null)}
                >
                  Annulla
                </RetroButton>
                <RetroButton type="submit" variant="gold" size="sm" className="font-bold">
                  Salva Prezzo
                </RetroButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RELEASE PLAYER CONFIRMATION (SELL)                                  */}
      {/* ========================================================================= */}
      {releasingPlayer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="retro-box w-full max-w-sm border border-[#ef4444] p-4 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#ef4444] border-b border-[#232d3f] pb-2">
              <AlertCircle size={16} />
              <h3 className="font-roman font-bold text-white text-sm">
                RESCISSIONE CONTRATTUALE
              </h3>
            </div>

            <p className="text-[#cbd5e1]">
              Sei sicuro di voler svincolare{' '}
              <strong className="text-white">{releasingPlayer.nome} {releasingPlayer.cognome}</strong>?
            </p>

            <div className="retro-inset p-2.5 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Indennità di buonuscita (2 sett.):</span>
                <span className="font-bold text-[#ef4444] font-data">
                  -{(releasingPlayer.contratto?.stipendioSettimanale * 2 || 20000).toLocaleString()} HS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">Risparmio ingaggi settimanale:</span>
                <span className="font-bold text-[#10b981] font-data">
                  +{(releasingPlayer.contratto?.stipendioSettimanale || 10000).toLocaleString()} HS/sett.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1b2333]">
              <RetroButton
                variant="secondary"
                size="sm"
                onClick={() => setReleasingPlayer(null)}
              >
                Annulla
              </RetroButton>
              <RetroButton
                variant="crimson"
                size="sm"
                onClick={handleConfirmRelease}
                className="font-bold"
              >
                Rescindi Subito
              </RetroButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
