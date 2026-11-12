import { simulateMatch, getFormationModifiers } from '../engines/matchSimulationEngine';
import { calculateLeagueTable, generateLeagueFixtures } from '../engines/leagueEngine';
import {
  calculatePlayerMarketValue,
  evaluateTransferOffer,
  executeTransfer,
  generateAIOffersForUserPlayer,
  releasePlayerContract,
  initiateNegotiationSession,
  submitClubFeeNegotiation,
  submitPlayerTermsNegotiation,
  finalizeNegotiation
} from '../engines/transferEngine';
import { INITIAL_CLUBS } from '../initialData/clubs';
import { INITIAL_LEAGUES } from '../initialData/leagues';
import { INITIAL_REGIONS } from '../initialData/regions';
import { buildInitialPlayers } from '../initialData/players';
import { buildWorldPlayersDatabase } from '../engines/playerDatabaseEngine';
import { INITIAL_COMPETITIONS, getParticipatingClubsForCompetition } from '../engines/cupEngine';
import { processSeasonEndTransition } from '../engines/seasonEndEngine';

export function runImperiumSelfTests(): { passed: boolean; log: string[] } {
  const log: string[] = [];
  let passed = true;

  try {
    // 1. Test Player Building
    const players = buildInitialPlayers();
    const playerCount = Object.keys(players).length;
    if (playerCount < 300) {
      throw new Error(`Expected at least 300 players, got ${playerCount}`);
    }
    log.push(`[PASS] Initial players created: ${playerCount} athletes`);

    // 2. Test Match Simulation Engine
    const homeClub = INITIAL_CLUBS['club_roma'];
    const awayClub = INITIAL_CLUBS['club_neapolis'];
    const result = simulateMatch({
      homeClub,
      awayClub,
      allPlayers: players,
      competitionName: 'Test Match'
    });

    if (typeof result.golCasa !== 'number' || typeof result.golOspite !== 'number') {
      throw new Error('Invalid match goals return');
    }
    log.push(`[PASS] Match simulated successfully: ${homeClub.nome} ${result.golCasa} - ${result.golOspite} ${awayClub.nome}`);

    // 3. Test Fixture Generator (15 clubs with 1 BYE per round = 210 matches over 30 matchdays)
    const romaLeague = INITIAL_LEAGUES['league_romana'];
    const fixtures = generateLeagueFixtures(romaLeague, -50);
    if (fixtures.length !== 210) {
      throw new Error(`Expected 210 fixtures for 15 clubs round-robin, got ${fixtures.length}`);
    }
    log.push(`[PASS] Round-robin fixtures generated for 15 clubs: ${fixtures.length} matches over 30 matchdays`);

    // 4. Test League Table Calculation
    const sampleMatches = [...fixtures];
    sampleMatches[0].disputata = true;
    sampleMatches[0].risultato = result;
    const table = calculateLeagueTable('league_romana', INITIAL_CLUBS, sampleMatches);
    if (table.length !== 15) {
      throw new Error(`Expected 15 clubs in standings, got ${table.length}`);
    }
    log.push(`[PASS] League table computed with ${table.length} clubs`);

    // 5. Test Transfer Valuation
    const firstPlayer = Object.values(players)[0];
    const val = calculatePlayerMarketValue(firstPlayer);
    if (val <= 0) {
      throw new Error('Invalid market value calculation');
    }
    log.push(`[PASS] Player market valuation calculated: ${firstPlayer.nome} ${firstPlayer.cognome} = ${val.toLocaleString()} HS`);

    // 6. Test World Database Engine Integrity: 30 Leagues
    const leagueList = Object.values(INITIAL_LEAGUES);
    if (leagueList.length !== 30) {
      throw new Error(`Expected exactly 30 leagues, got ${leagueList.length}`);
    }
    log.push(`[PASS] World Database contains exactly 30 official leagues`);

    // 7. Test World Database Engine Integrity: 450 Clubs (15 clubs per league)
    const clubList = Object.values(INITIAL_CLUBS);
    if (clubList.length !== 450) {
      throw new Error(`Expected exactly 450 clubs, got ${clubList.length}`);
    }
    log.push(`[PASS] World Database contains exactly 450 historical clubs`);

    // 8. Test World Database Engine Integrity: 30 Regions
    const regionList = Object.values(INITIAL_REGIONS);
    if (regionList.length !== 30) {
      throw new Error(`Expected exactly 30 regions, got ${regionList.length}`);
    }
    log.push(`[PASS] World Database contains exactly 30 sporting regions`);

    // 9. Verify each league has 15 valid clubs and cross-references match
    for (const league of leagueList) {
      if (league.clubIds.length !== 15) {
        throw new Error(`League ${league.nome} has ${league.clubIds.length} clubs instead of 15`);
      }
      for (const cid of league.clubIds) {
        const c = INITIAL_CLUBS[cid];
        if (!c) {
          throw new Error(`Club ID ${cid} referenced in league ${league.nome} not found in INITIAL_CLUBS`);
        }
        if (c.leagueId !== league.id) {
          throw new Error(`Club ${c.nome} (${cid}) points to leagueId ${c.leagueId} but is in league ${league.id}`);
        }
      }
    }
    log.push(`[PASS] 100% of 450 clubs correctly cross-referenced to their respective leagues`);

    // 10. Test Master Player Database Generation Engine (12.000 - 15.000 players)
    const clonedClubs = JSON.parse(JSON.stringify(INITIAL_CLUBS));
    const { players: worldRoster, totalCount } = buildWorldPlayersDatabase(clonedClubs);
    if (totalCount < 12000 || totalCount > 15000) {
      throw new Error(`Expected between 12.000 and 15.000 players, got ${totalCount}`);
    }

    // Verify SPQR Roma has full roster and starters
    const roma = clonedClubs['club_roma'];
    if (!roma.titolariIds || roma.titolariIds.length !== 11) {
      throw new Error(`Expected 11 starters for SPQR Roma, got ${roma.titolariIds?.length}`);
    }
    if (!roma.panchinaIds || roma.panchinaIds.length !== 7) {
      throw new Error(`Expected 7 bench players for SPQR Roma, got ${roma.panchinaIds?.length}`);
    }

    // Verify free agents exist
    const freeAgents = Object.values(worldRoster).filter(p => !p.clubId);
    if (freeAgents.length < 1000) {
      throw new Error(`Expected at least 1.000 free agents, got ${freeAgents.length}`);
    }

    log.push(`[PASS] Master Player Database generated: ${totalCount.toLocaleString()} athletes (${(totalCount - freeAgents.length).toLocaleString()} in 450 clubs, ${freeAgents.length.toLocaleString()} free agents)`);

    // 11. Test Transfer Engine: Valuation & Evaluation
    const contractedPlayer = Object.values(worldRoster).find(p => p.clubId === 'club_neapolis')!;
    contractedPlayer.inListaTrasferimenti = true;
    contractedPlayer.prezzoRichiesto = 1200000;
    const neapolisClub = clonedClubs['club_neapolis'];
    const buyerRoma = clonedClubs['club_roma'];

    // Offer at asking price should ALWAYS be accepted
    const offerEval = evaluateTransferOffer(
      {
        playerId: contractedPlayer.id,
        buyingClubId: buyerRoma.id,
        sellingClubId: neapolisClub.id,
        offeredFee: 1200000,
        offeredWage: Math.round(contractedPlayer.contratto.stipendioSettimanale * 1.1)
      },
      contractedPlayer,
      neapolisClub
    );
    if (!offerEval.accepted) {
      throw new Error(`Expected offer at asking price to be accepted, but got: ${offerEval.reason}`);
    }
    log.push(`[PASS] Transfer offer at asking price evaluated as ACCEPTED`);

    // Lowball offer (under 88% asking) should be rejected
    const lowballEval = evaluateTransferOffer(
      {
        playerId: contractedPlayer.id,
        buyingClubId: buyerRoma.id,
        sellingClubId: neapolisClub.id,
        offeredFee: 200000,
        offeredWage: contractedPlayer.contratto.stipendioSettimanale
      },
      contractedPlayer,
      neapolisClub
    );
    if (lowballEval.accepted) {
      throw new Error('Expected lowball offer to be rejected, but was accepted');
    }
    log.push(`[PASS] Lowball transfer offer correctly rejected`);

    // 12. Test Transfer Execution
    const initialBuyerCash = buyerRoma.saldoCassa;
    const initialSellerCash = neapolisClub.saldoCassa;
    const sampleTransfer = {
      id: 'transf_test_1',
      playerId: contractedPlayer.id,
      playerNome: `${contractedPlayer.nome} ${contractedPlayer.cognome}`,
      daClubId: neapolisClub.id,
      daClubNome: neapolisClub.nome,
      aClubId: buyerRoma.id,
      aClubNome: buyerRoma.nome,
      cifraTrasferimento: 1200000,
      data: 'Idus Martiae · anno 3 della 182ª Olimpiade',
      stagioneAnno: -50
    };

    const execResult = executeTransfer(sampleTransfer, contractedPlayer, buyerRoma, neapolisClub);
    if (execResult.updatedBuyer.saldoCassa !== initialBuyerCash - 1200000) {
      throw new Error('Buyer treasury not correctly deducted');
    }
    if (execResult.updatedSeller?.saldoCassa !== initialSellerCash + 1200000) {
      throw new Error('Seller treasury not correctly credited');
    }
    if (execResult.updatedPlayer.clubId !== buyerRoma.id) {
      throw new Error('Player clubId not updated to buyer');
    }
    log.push(`[PASS] Transfer executed: funds transferred and player registered to buyer`);

    // 13. Test AI Bids Generation for Player Sales
    const aiBids = generateAIOffersForUserPlayer(contractedPlayer, clonedClubs, 'club_roma', 1, 'Idus Martiae · anno 3 della 182ª Olimpiade');
    if (aiBids.length === 0) {
      throw new Error('Expected at least 1 AI bid for user player');
    }
    if (aiBids[0].offeredFee <= 0 || !aiBids[0].offeringClubNome) {
      throw new Error('Invalid AI bid generated');
    }
    log.push(`[PASS] AI clubs generated ${aiBids.length} cash bids for player sale`);

    // 14. Test Player Contract Release (Svincolo)
    const releaseRes = releasePlayerContract(contractedPlayer, buyerRoma);
    if (releaseRes.updatedPlayer.clubId !== '') {
      throw new Error('Released player clubId should be empty string');
    }
    if (releaseRes.updatedPlayer.inListaTrasferimenti !== true) {
      throw new Error('Released player should be on transfer list as free agent');
    }
    log.push(`[PASS] Player contract release (svincolo) successfully processed`);

    // 15. Test The 3 International Cups & National Cup
    const expectedCups = ['cup_munus_caesarum', 'cup_mare_nostrum', 'cup_scudo_province', 'cup_consolare'];
    for (const cupId of expectedCups) {
      const comp = INITIAL_COMPETITIONS[cupId];
      if (!comp) {
        throw new Error(`Missing expected competition ${cupId}`);
      }
      const participants = getParticipatingClubsForCompetition(cupId, clonedClubs);
      if (participants.length < 8) {
        throw new Error(`Competition ${comp.nome} has insufficient participants: ${participants.length}`);
      }
    }
    log.push(`[PASS] All 3 International Cups + National Cup validated with active qualifying clubs`);

    // 16. Test Season End Transition Engine & Formation Modifiers
    const atkMods = getFormationModifiers('3-4-3');
    const defMods = getFormationModifiers('5-4-1');
    if (atkMods.praevenientes <= defMods.praevenientes || defMods.luctatores <= atkMods.luctatores) {
      throw new Error('Formation modifiers must reflect offensive vs defensive tactical trade-offs');
    }
    log.push(`[PASS] Tactical formation modifiers validated (3-4-3 Praev ${atkMods.praevenientes} vs 5-4-1 Luct ${defMods.luctatores})`);

    const mockCareerSave: any = {
      id: 'career_test',
      userClubId: 'club_roma',
      manager: {
        id: 'mgr_test',
        nome: 'Marcus',
        cognome: 'Aurelius',
        nazionalita: 'Romana',
        famigliaOrigine: 'Julia',
        clubId: 'club_roma',
        puntiReputazione: 500,
        partiteGestite: 30,
        vittorie: 20,
        pareggi: 5,
        sconfitte: 5,
        trofeiVinti: [],
        dataIngaggio: 'Test'
      },
      currentYear: -50,
      currentMatchday: 31,
      clubs: clonedClubs,
      players: worldRoster,
      leagues: INITIAL_LEAGUES,
      matches: fixtures,
      transfers: [],
      trofeiAlboDOro: {}
    };

    const seasonEndResult = processSeasonEndTransition(mockCareerSave);
    if (!seasonEndResult.report.userSummary || !seasonEndResult.report.eraDisplayText || !seasonEndResult.report.nextEraDisplayText) {
      throw new Error('Expected enriched SeasonEndReport with userSummary and Olympic eras');
    }
    if (seasonEndResult.updatedCareer.currentYear !== -49) {
      throw new Error(`Expected season year to advance to -49, got ${seasonEndResult.updatedCareer.currentYear}`);
    }
    if (seasonEndResult.updatedCareer.currentMatchday !== 1) {
      throw new Error(`Expected matchday to reset to 1, got ${seasonEndResult.updatedCareer.currentMatchday}`);
    }
    if (seasonEndResult.report.youthPromoted.length === 0) {
      throw new Error('Expected youth prospects to be generated on season rollover');
    }
    if (!seasonEndResult.report.movements || seasonEndResult.report.movements.length === 0) {
      throw new Error('Expected promotion and relegation movements to be calculated on season rollover');
    }
    log.push(`[PASS] Season end rollover executed: year advanced to anno 4 della 182ª Olimpiade, ${seasonEndResult.report.movements.length} clubs promoted/relegated, ${seasonEndResult.report.youthPromoted.length} youth talents promoted`);

    // 17. Test Real Multi-Stage Negotiation Logic (Club Fee & Player Contract)
    const testPlayer = Object.values(worldRoster).find(p => p.clubId === 'club_neapolis')!;
    const testSeller = clonedClubs['club_neapolis'];
    const testBuyer = clonedClubs['club_roma'];

    // Stage 1: Initiate session with reputation leverage
    let session = initiateNegotiationSession(testPlayer, testBuyer, testSeller, 'Idus Martiae · anno 3 della 182ª Olimpiade');
    if (session.stage !== 'CLUB_FEE') {
      throw new Error(`Expected stage CLUB_FEE, got ${session.stage}`);
    }
    if (session.prestigeFactor <= 0) {
      throw new Error('Prestige factor not calculated correctly');
    }

    // Step 2: Lowball fee triggers counter-offer or patience loss
    session = submitClubFeeNegotiation(session, Math.round(session.minAcceptableFee * 0.75), 'Idus Martiae · anno 3 della 182ª Olimpiade');
    if (!session.clubCounterFee && session.clubPatience === 100) {
      throw new Error('Expected club counter-fee or patience decrement on lowball bid');
    }

    // Step 3: Meeting the target fee advances to PLAYER_TERMS
    session = submitClubFeeNegotiation(session, session.targetFee, 'Idus Martiae · anno 3 della 182ª Olimpiade');
    if (session.stage !== 'PLAYER_TERMS') {
      throw new Error(`Expected stage to advance to PLAYER_TERMS, got ${session.stage}`);
    }

    // Step 4: Submitting player contract terms meeting wage requirement completes the deal
    session = submitPlayerTermsNegotiation(session, session.targetWage, 3, 50000, 2000000, 'Idus Martiae · anno 3 della 182ª Olimpiade');
    if (session.stage !== 'COMPLETED') {
      throw new Error(`Expected stage COMPLETED, got ${session.stage}`);
    }

    // Step 5: Finalize transfer
    const finalRes = finalizeNegotiation(session, mockCareerSave);
    if (!finalRes.transfer || finalRes.updatedCareer.players[testPlayer.id].clubId !== testBuyer.id) {
      throw new Error('Failed to finalize transfer in career save');
    }
    log.push(`[PASS] Real negotiation logic validated: Club Fee, Player Terms, Prestige factor and Ratification`);

  } catch (err: any) {
    passed = false;
    log.push(`[FAIL] ${err.message}`);
  }

  return { passed, log };
}
