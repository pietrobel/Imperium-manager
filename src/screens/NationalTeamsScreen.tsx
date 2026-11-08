import React, { useState } from 'react';
import type { CareerSave, NationalTeam, Player } from '../types';
import { RetroButton } from '../components/RetroButton';
import { OFFICIAL_NATIONAL_CIVILIZATIONS, simulateNationalMatch } from '../engines/nationalTeamsEngine';
import { getHarpastumRole, getHarpastumRoleBadgeStyle } from '../engines/harpastumEngine';
import { Flag, Trophy, Users, Swords, Award, Shield, Sparkles } from 'lucide-react';

interface NationalTeamsScreenProps {
  career: CareerSave;
  onSelectPlayer: (player: Player) => void;
}

export const NationalTeamsScreen: React.FC<NationalTeamsScreenProps> = ({
  career,
  onSelectPlayer
}) => {
  const nationalTeams = career.nationalTeams || {};
  const nationalMatches = career.nationalMatches || [];

  const [selectedNatId, setSelectedNatId] = useState<string>('nat_roma');
  const [activeTab, setActiveTab] = useState<'ROSA' | 'TORNEO' | 'ALBO'>('ROSA');
  const [simulatedMatches, setSimulatedMatches] = useState(nationalMatches);

  const selectedTeam = nationalTeams[selectedNatId] || Object.values(nationalTeams)[0];
  const selectedCivInfo = OFFICIAL_NATIONAL_CIVILIZATIONS.find(c => c.id === selectedNatId) || OFFICIAL_NATIONAL_CIVILIZATIONS[0];

  const convocatiPlayers = (selectedTeam?.giocatoriConvocatiIds || [])
    .map(id => career.players[id])
    .filter(Boolean);

  const handleSimulateMatch = (matchId: string) => {
    const matchIndex = simulatedMatches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;
    const match = simulatedMatches[matchIndex];
    if (match.disputata) return;

    const res = simulateNationalMatch(match, nationalTeams, career.players);
    const updated = [...simulatedMatches];
    updated[matchIndex] = res;
    setSimulatedMatches(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="retro-box p-3 flex flex-col md:flex-row items-center justify-between gap-3 border-l-4 border-l-[#d4af37]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#521118] border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow">
            <Flag size={20} />
          </div>
          <div>
            <h1 className="font-roman text-sm font-bold text-white tracking-wide">
              CERTAMEN NATIONUM · LE 16 GRANDI NAZIONALI DELL'ANTICHITÀ
            </h1>
            <span className="text-[10px] text-[#cbd5e1] font-roman">
              Convocazioni dei migliori atleti delle civiltà del Mediterraneo & Torneo delle Nazioni
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#2b080b] p-0.5 border border-[#521016] rounded-xs text-xs font-roman">
          <button
            onClick={() => setActiveTab('ROSA')}
            className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ROSA' ? 'bg-[#6b161f] text-[#facc15] shadow-xs' : 'text-[#cbd5e1] hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Convocati ({convocatiPlayers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('TORNEO')}
            className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TORNEO' ? 'bg-[#6b161f] text-[#facc15] shadow-xs' : 'text-[#cbd5e1] hover:text-white'
            }`}
          >
            <Swords size={13} />
            <span>Torneo delle Nazioni</span>
          </button>
          <button
            onClick={() => setActiveTab('ALBO')}
            className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALBO' ? 'bg-[#6b161f] text-[#facc15] shadow-xs' : 'text-[#cbd5e1] hover:text-white'
            }`}
          >
            <Trophy size={13} />
            <span>Tavola & Reputazione</span>
          </button>
        </div>
      </div>

      {/* Nation Selector Carousel */}
      <div className="retro-box p-2.5 overflow-x-auto flex items-center gap-2">
        <span className="font-roman text-[10px] text-[#d4af37] font-bold shrink-0 uppercase mr-1">
          NAZIONALI:
        </span>
        {OFFICIAL_NATIONAL_CIVILIZATIONS.map(civ => {
          const isSelected = civ.id === selectedNatId;
          return (
            <button
              key={civ.id}
              onClick={() => setSelectedNatId(civ.id)}
              className={`px-3 py-1.5 rounded-xs text-xs font-roman font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#63141c] text-[#facc15] border-[#d4af37] shadow-md scale-102'
                  : 'bg-[#2b080b] text-[#cbd5e1] border-[#521016] hover:text-white hover:border-[#731922]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: civ.stemmaColore }} />
              <span>{civ.sigla}</span>
              <span className="text-[10px] font-normal text-[#94a3b8]">({civ.nome.split(' ')[1] || civ.nome})</span>
            </button>
          );
        })}
      </div>

      {/* Main View Content */}
      {activeTab === 'ROSA' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Nation Dossier & Banner */}
          <div className="retro-box p-4 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-[#731922] mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white"
                    style={{ backgroundColor: selectedCivInfo.stemmaColore }}
                  />
                  <h2 className="font-roman text-sm font-black text-[#d4af37]">
                    {selectedTeam?.nome.toUpperCase()}
                  </h2>
                </div>
                <div className="text-[11px] text-[#cbd5e1] font-roman mt-1">
                  Regione: <strong className="text-white">{selectedTeam?.regione}</strong> · Cultura: <strong className="text-[#facc15]">{selectedTeam?.cultura}</strong>
                </div>
              </div>

              <div className="retro-inset p-3 mb-3 text-xs leading-relaxed text-[#cbd5e1]">
                <span className="font-roman text-[#d4af37] font-bold block mb-1">TRADIZIONE ATLETICA</span>
                {selectedCivInfo.descrizione}
              </div>

              <div className="space-y-2 text-xs font-data">
                <div className="flex justify-between py-1 border-b border-[#521016]">
                  <span className="text-[#94a3b8]">Commissario Tecnico:</span>
                  <span className="text-white font-roman font-bold">{selectedTeam?.commissarioTecnico || 'Praefectus Legionis'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#521016]">
                  <span className="text-[#94a3b8]">Reputazione Mondiale:</span>
                  <span className="text-[#facc15] font-bold">{selectedTeam?.reputazione} pt</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#521016]">
                  <span className="text-[#94a3b8]">Palmarès Storico:</span>
                  <span className="text-[#10b981] font-bold">{selectedTeam?.trofeiVinti?.length || 0} Trionfi</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94a3b8]">Bilancio Agoni:</span>
                  <span className="text-white">
                    {selectedTeam?.vittorie}V - {selectedTeam?.pareggi}P - {selectedTeam?.sconfitte}S
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#731922] text-[10px] text-[#94a3b8] text-center font-roman">
              I migliori 18 atleti convocati in base al valore generale nell'Impero
            </div>
          </div>

          {/* Call-up Roster Table */}
          <div className="lg:col-span-2 retro-box overflow-hidden">
            <div className="retro-panel-header px-4 py-2.5 flex items-center justify-between border-b border-[#731922]">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#d4af37]" />
                <h3 className="font-roman text-xs font-bold text-white tracking-wide">
                  I 18 CONVOCATI DELLA SELEZIONE NAZIONALE
                </h3>
              </div>
              <span className="text-xs font-data text-[#facc15] font-bold">
                OVR Medio: {convocatiPlayers.length > 0 ? Math.round(convocatiPlayers.reduce((s, p) => s + p.valoreGenerale, 0) / convocatiPlayers.length) : '-'}
              </span>
            </div>

            <div className="overflow-x-auto max-h-[440px]">
              <table className="w-full text-left text-xs border-collapse font-data">
                <thead>
                  <tr className="text-[10px] text-[#cbd5e1] uppercase font-roman border-b border-[#521016] bg-[#2b080b]">
                    <th className="py-2 px-3 text-center">RUO</th>
                    <th className="py-2 px-3">ATLETA</th>
                    <th className="py-2 px-2 text-center">ETÀ</th>
                    <th className="py-2 px-3">CLUB DI PROVENIENZA</th>
                    <th className="py-2 px-2 text-center">OVR</th>
                    <th className="py-2 px-2 text-center">METE</th>
                    <th className="py-2 px-3 text-center">AZIONI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#420d11] text-xs">
                  {convocatiPlayers.map(p => {
                    const badge = getHarpastumRoleBadgeStyle(p.ruoloPrimario);
                    const club = p.clubId ? career.clubs[p.clubId] : null;
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[#3d0b10] transition-colors cursor-pointer group"
                        onClick={() => onSelectPlayer(p)}
                      >
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <div className="font-semibold text-white group-hover:text-[#facc15]">
                            {p.nome} {p.cognome}
                          </div>
                          <div className="text-[10px] text-[#94a3b8] font-roman">
                            {p.nazionalita}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center text-[#cbd5e1]">{p.eta}</td>
                        <td className="py-2 px-3 text-[#cbd5e1] font-roman text-[11px]">
                          {club ? club.nome : 'Atleta Libero'}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-[#facc15] text-sm">
                          {p.valoreGenerale}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-[#38bdf8]">
                          {p.statisticheStagione.gol}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[10px] text-[#d4af37] group-hover:underline">Dossier &rarr;</span>
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

      {/* Torneo delle Nazioni (Fixtures) */}
      {activeTab === 'TORNEO' && (
        <div className="space-y-4">
          <div className="retro-box p-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#731922] mb-3">
              <Swords size={16} className="text-[#d4af37]" />
              <h2 className="font-roman text-xs font-bold text-white tracking-wide">
                CERTAMEN NATIONUM · PROGRAMMA UFFICIALE DEGLI SCONTRI
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-data">
              {simulatedMatches.map(m => {
                const home = nationalTeams[m.nazionaleCasaId];
                const away = nationalTeams[m.nazionaleOspiteId];
                return (
                  <div key={m.id} className="retro-inset p-3 border border-[#521016] flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#cbd5e1] font-roman">
                      <span className="text-[#facc15] font-bold">{m.torneo}</span>
                      <span>{m.dataCalendario}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 py-1">
                      <div className="flex-1 text-left">
                        <div className="font-roman font-bold text-sm text-white">{home?.nome || m.nazionaleCasaId}</div>
                        <span className="text-[10px] text-[#94a3b8]">{home?.sigla}</span>
                      </div>

                      <div className="px-3 py-1 bg-[#2b080b] border border-[#d4af37] rounded-xs text-center font-bold text-base min-w-[70px]">
                        {m.disputata ? (
                          <span className="text-[#facc15]">{m.meteCasa} - {m.meteOspite}</span>
                        ) : (
                          <span className="text-[#cbd5e1] text-xs">VS</span>
                        )}
                      </div>

                      <div className="flex-1 text-right">
                        <div className="font-roman font-bold text-sm text-white">{away?.nome || m.nazionaleOspiteId}</div>
                        <span className="text-[10px] text-[#94a3b8]">{away?.sigla}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#420d11]">
                      <span className="text-[#94a3b8]">
                        {m.disputata ? `Miglior Incursore: ${m.migliorAtleta}` : 'In attesa di disputa'}
                      </span>
                      {!m.disputata ? (
                        <button
                          onClick={() => handleSimulateMatch(m.id)}
                          className="px-2 py-1 bg-[#63141c] hover:bg-[#85222b] text-[#facc15] font-roman font-bold rounded-xs cursor-pointer border border-[#d4af37]"
                        >
                          Simula Agone
                        </button>
                      ) : (
                        <span className="text-[#10b981] font-bold">OMOLOGATO</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tavola & Reputazione */}
      {activeTab === 'ALBO' && (
        <div className="retro-box overflow-hidden">
          <div className="retro-panel-header px-4 py-2.5 flex items-center gap-2 border-b border-[#731922]">
            <Trophy size={14} className="text-[#d4af37]" />
            <h2 className="font-roman text-xs font-bold text-white tracking-wide">
              GERARCHIA DELLE CIVILTÀ · CLASSIFICA MONDIALE DELLE NAZIONALI
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-data">
              <thead>
                <tr className="text-[10px] text-[#cbd5e1] uppercase font-roman border-b border-[#521016] bg-[#2b080b]">
                  <th className="py-2 px-3 text-center">RKG</th>
                  <th className="py-2 px-3">NAZIONALE</th>
                  <th className="py-2 px-3">CULTURA & ORIGINE</th>
                  <th className="py-2 px-2 text-center">PG</th>
                  <th className="py-2 px-2 text-center">V</th>
                  <th className="py-2 px-2 text-center">P</th>
                  <th className="py-2 px-2 text-center">S</th>
                  <th className="py-2 px-3 text-right">REPUTAZIONE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#420d11] text-xs">
                {OFFICIAL_NATIONAL_CIVILIZATIONS
                  .slice()
                  .sort((a, b) => b.reputazione - a.reputazione)
                  .map((civ, idx) => {
                    const team = nationalTeams[civ.id];
                    return (
                      <tr
                        key={civ.id}
                        onClick={() => {
                          setSelectedNatId(civ.id);
                          setActiveTab('ROSA');
                        }}
                        className="hover:bg-[#3d0b10] transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-[#facc15]">#{idx + 1}</td>
                        <td className="py-2.5 px-3 font-roman font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: civ.stemmaColore }} />
                          <span>{civ.nome}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#cbd5e1] font-sans">{civ.cultura}</td>
                        <td className="py-2.5 px-2 text-center text-white">{team?.partiteGiocate || 0}</td>
                        <td className="py-2.5 px-2 text-center text-[#10b981] font-bold">{team?.vittorie || 0}</td>
                        <td className="py-2.5 px-2 text-center text-[#cbd5e1]">{team?.pareggi || 0}</td>
                        <td className="py-2.5 px-2 text-center text-[#f87171]">{team?.sconfitte || 0}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#d4af37]">{civ.reputazione} pt</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
