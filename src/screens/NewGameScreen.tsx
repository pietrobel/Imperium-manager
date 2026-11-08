import React, { useState } from 'react';
import { RetroButton } from '../components/RetroButton';
import { INITIAL_LEAGUES } from '../initialData/leagues';
import { INITIAL_CLUBS } from '../initialData/clubs';
import type { CreateCareerParams } from '../services/careerService';
import { INITIAL_REGIONS } from '../initialData/regions';
import { Shield, ArrowLeft, CheckCircle2, Search, Globe, User, Sparkles } from 'lucide-react';

interface NewGameScreenProps {
  onStartCareer: (params: CreateCareerParams) => void;
  onBack: () => void;
}

export interface MagisterOriginPreset {
  id: string;
  cultura: 'ROMANA' | 'GRECA' | 'EGIZIA' | 'GALLICA' | 'PUNICA';
  label: string;
  nazionalita: string;
  defaultName: string;
  defaultCognome: string;
  famiglie: string[];
  titoloMagister: string;
  descrizione: string;
}

const MAGISTER_ORIGINS: MagisterOriginPreset[] = [
  {
    id: 'orig_romana',
    cultura: 'ROMANA',
    label: 'Magister Romano (Patrizio dell’Urbe)',
    nazionalita: 'Romana',
    defaultName: 'Gaius',
    defaultCognome: 'Valerius',
    famiglie: [
      'Gens Julia (Patrizia - Fama ed Eleganza)',
      'Gens Claudia (Aristocratica - Rigore e Disciplina)',
      'Gens Cornelia (Gloriosa - Tradizione Militare)',
      'Gens Fabia (Prudente - Tattica e Pazienza)',
      'Gens Sempronia (Popolare - Vicina ai Tifosi)',
      'Gens Calpurnia (Senatoria - Diplomazia e Ricchezza)'
    ],
    titoloMagister: 'Magister Harpastico & Tribuno dell’Arena',
    descrizione: 'Nato nel solco del Mos Maiorum e addestrato al comando strategico delle legioni.'
  },
  {
    id: 'orig_greca',
    cultura: 'GRECA',
    label: 'Magister Greco / Ellenico (Maestro dei Giochi)',
    nazionalita: 'Greca',
    defaultName: 'Alexander',
    defaultCognome: 'Kallikrates',
    famiglie: [
      'Casata dei Filelleni (Atene - Filosofia e Armonia)',
      'Discendenti di Leonida (Sparta - Disciplina Ferrea)',
      'Ginnasiarchi di Corinto (Strategia e Commercio)',
      'Lignaggio di Tebe (Forza e Coesione Atletica)',
      'Atleti di Olimpia (Custodi del Sacro Agone)'
    ],
    titoloMagister: 'Epistates / Didaskalos dei Grandi Agoni',
    descrizione: 'Formatosi nei ginnasi dell’Attica e del Peloponneso, profondo conoscitore della palla e del ritmo atletico.'
  },
  {
    id: 'orig_egizia',
    cultura: 'EGIZIA',
    label: 'Magister Egizio / Alessandrino (Saggio del Nilo)',
    nazionalita: 'Egizia',
    defaultName: 'Ptolemaios',
    defaultCognome: 'Imhotep',
    famiglie: [
      'Dinastia Alessandrina (Sapienza e Calcolo Matematico)',
      'Sacerdoti di Menfi (Tradizione Millenaria e Resilienza)',
      'Custodi di Tebe (Astuzia Tattica e Mistica)',
      'Casata del Delta del Nilo (Velocità e Adattamento)'
    ],
    titoloMagister: 'Scriba delle Tattiche & Ciambellano Reale',
    descrizione: 'Custode dei papiri della grande Biblioteca di Alessandria, maestro nell’analisi matematica dei varchi e del moto della sfera.'
  },
  {
    id: 'orig_punica',
    cultura: 'PUNICA',
    label: 'Magister Cartaginese / Punico (Erede dei Barcidi)',
    nazionalita: 'Punica',
    defaultName: 'Hamilcar',
    defaultCognome: 'Barca',
    famiglie: [
      'Lignaggio dei Barcidi (Genio Militare e Audacia)',
      'Sufeti di Cartagine (Commercio Globale e Diplomazia)',
      'Comandanti di Utica (Pragmatismo e Furbizia)'
    ],
    titoloMagister: 'Navarca & Stratega dei Campi di Sabbia',
    descrizione: 'Ispirato dalle campagne di Annibale: trappole a sorpresa, contrattacchi fulminei e determinazione incrollabile.'
  },
  {
    id: 'orig_gallica',
    cultura: 'GALLICA',
    label: 'Magister Gallico / Celtico (Campione dei Druidi)',
    nazionalita: 'Gallica',
    defaultName: 'Vercingetorix',
    defaultCognome: 'Arvernus',
    famiglie: [
      'Tribù degli Alverni (Orgoglio e Cariche Travolgenti)',
      'Capi degli Edui (Forza d’Urto e Alleanze)',
      'Guerrieri dei Sequani (Resistenza alle Intemperie)'
    ],
    titoloMagister: 'Vergobret & Condottiero delle Foreste',
    descrizione: 'Campione dei boschi continentali, infonde negli atleti una ferocia agonistica e una forza d’urto inarrestabile.'
  }
];

const MACRO_AREAS = [
  'TUTTE LE AREE',
  'Occidente Romano',
  'Europa Continentale & Celtica',
  'Mediterraneo Orientale & Grecia',
  'Asia & Vicino Oriente',
  'Nord Africa & Nilo'
];

export const NewGameScreen: React.FC<NewGameScreenProps> = ({ onStartCareer, onBack }) => {
  const [selectedOrigin, setSelectedOrigin] = useState<MagisterOriginPreset>(MAGISTER_ORIGINS[0]);
  const [managerName, setManagerName] = useState(MAGISTER_ORIGINS[0].defaultName);
  const [managerCognome, setManagerCognome] = useState(MAGISTER_ORIGINS[0].defaultCognome);
  const [family, setFamily] = useState(MAGISTER_ORIGINS[0].famiglie[0]);
  const [selectedMacroArea, setSelectedMacroArea] = useState('TUTTE LE AREE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('league_romana');
  const [selectedClubId, setSelectedClubId] = useState('club_roma');

  const allLeagues = Object.values(INITIAL_LEAGUES);

  // Handle changing cultural origin
  const handleOriginChange = (origId: string) => {
    const orig = MAGISTER_ORIGINS.find(o => o.id === origId) || MAGISTER_ORIGINS[0];
    setSelectedOrigin(orig);
    setManagerName(orig.defaultName);
    setManagerCognome(orig.defaultCognome);
    setFamily(orig.famiglie[0]);
  };

  // Filter leagues
  const filteredLeagues = allLeagues.filter(l => {
    const region = l.regionId ? INITIAL_REGIONS[l.regionId] : undefined;
    const matchesMacro = selectedMacroArea === 'TUTTE LE AREE' || (region && region.macroArea === selectedMacroArea);
    const matchesSearch = !searchQuery || 
      l.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.regione.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.cultura && l.cultura.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMacro && matchesSearch;
  });

  const clubsInLeague = Object.values(INITIAL_CLUBS).filter(c => c.leagueId === selectedLeagueId);
  const selectedClub = INITIAL_CLUBS[selectedClubId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName || !managerCognome) return;
    onStartCareer({
      managerName,
      managerCognome,
      originFamily: family.split('(')[0].trim() || 'Julia',
      userClubId: selectedClubId,
      nationality: selectedOrigin.nazionalita,
      culture: selectedOrigin.cultura
    });
  };

  return (
    <div className="min-h-screen bg-[#240507] p-4 flex flex-col items-center justify-center select-none">
      <div className="w-full max-w-5xl retro-box overflow-hidden shadow-2xl flex flex-col max-h-[96vh] border-2 border-[#85222b]">
        {/* Header */}
        <div className="retro-panel-header px-4 py-3 flex items-center justify-between border-b border-[#731922]">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#d4af37]" />
            <h1 className="font-roman text-sm font-bold tracking-wider text-[#d4af37]">
              NUOVA CARRIERA · ATTO D'INGAGGIO DEL MAGISTER (182ª OLIMPIADE)
            </h1>
          </div>
          <RetroButton variant="secondary" size="sm" onClick={onBack} className="flex items-center gap-1">
            <ArrowLeft size={14} />
            <span>Indietro</span>
          </RetroButton>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Section 1: Magister Identity & Cultural Origin */}
          <div className="retro-inset p-3.5 border border-[#521016]">
            <div className="flex items-center justify-between pb-2 border-b border-[#731922] mb-3">
              <div className="flex items-center gap-2">
                <User size={15} className="text-[#d4af37]" />
                <h2 className="font-roman text-xs font-bold text-[#facc15] tracking-wide">
                  1. PROFILO & ORIGINE CULTURALE DEL MAGISTER (ROMANO, GRECO, EGIZIO...)
                </h2>
              </div>
              <span className="text-[10px] text-[#cbd5e1] font-roman">
                Titolo: <strong className="text-white">{selectedOrigin.titoloMagister}</strong>
              </span>
            </div>

            {/* Cultural Origin Selector */}
            <div className="mb-3">
              <label className="block text-[#cbd5e1] font-roman mb-1">
                Scegli la Tradizione Culturale del Magister:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {MAGISTER_ORIGINS.map(orig => {
                  const isSelected = orig.id === selectedOrigin.id;
                  return (
                    <button
                      type="button"
                      key={orig.id}
                      onClick={() => handleOriginChange(orig.id)}
                      className={`p-2 rounded-xs text-left cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#6b161f] border-[#d4af37] text-white shadow-md'
                          : 'bg-[#190305] border-[#420d11] text-[#cbd5e1] hover:border-[#731922]'
                      }`}
                    >
                      <div className="font-roman font-bold text-[11px] text-[#facc15]">{orig.cultura}</div>
                      <div className="text-[9px] text-[#94a3b8] truncate">{orig.nazionalita}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#cbd5e1] italic mt-1.5 font-sans">
                {selectedOrigin.descrizione}
              </p>
            </div>

            {/* Name, Surname and Family/Dynasty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#cbd5e1] mb-1 font-roman">
                  {selectedOrigin.cultura === 'ROMANA' ? 'Praenomen (Nome)' : 'Nome Proprio'}
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  className="w-full bg-[#190305] border border-[#521016] px-3 py-1.5 text-white rounded-xs focus:border-[#d4af37] outline-none font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-[#cbd5e1] mb-1 font-roman">
                  {selectedOrigin.cultura === 'ROMANA' ? 'Nomen / Cognomen' : 'Famiglia / Epiteto'}
                </label>
                <input
                  type="text"
                  value={managerCognome}
                  onChange={e => setManagerCognome(e.target.value)}
                  className="w-full bg-[#190305] border border-[#521016] px-3 py-1.5 text-white rounded-xs focus:border-[#d4af37] outline-none font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-[#cbd5e1] mb-1 font-roman">Casata / Dinastia d’Origine</label>
                <select
                  value={family}
                  onChange={e => setFamily(e.target.value)}
                  className="w-full bg-[#190305] border border-[#521016] px-3 py-1.5 text-white rounded-xs focus:border-[#d4af37] outline-none cursor-pointer font-sans"
                >
                  {selectedOrigin.famiglie.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Choose League */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-[#d4af37]" />
                <h2 className="font-roman text-xs font-bold text-[#facc15]">
                  2. SELEZIONE CAMPIONATO (30 LEGHE NEL MONDO CONOSCIUTO)
                </h2>
              </div>
              
              {/* Search & Macro Area Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-2 text-[#64748b]" />
                  <input
                    type="text"
                    placeholder="Cerca lega o regione..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-[#190305] border border-[#521016] pl-6 pr-2 py-1 text-xs text-white rounded-xs focus:border-[#d4af37] outline-none w-40"
                  />
                </div>
                <select
                  value={selectedMacroArea}
                  onChange={e => setSelectedMacroArea(e.target.value)}
                  className="bg-[#190305] border border-[#521016] text-[#cbd5e1] text-xs px-2 py-1 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer"
                >
                  {MACRO_AREAS.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* League Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredLeagues.map(league => {
                const isSelected = league.id === selectedLeagueId;
                return (
                  <button
                    type="button"
                    key={league.id}
                    onClick={() => {
                      setSelectedLeagueId(league.id);
                      const firstClub = Object.values(INITIAL_CLUBS).find(c => c.leagueId === league.id);
                      if (firstClub) setSelectedClubId(firstClub.id);
                    }}
                    className={`p-2 rounded-xs text-left cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#6b161f] border-[#d4af37] text-white shadow-md'
                        : 'bg-[#190305] border-[#420d11] text-[#cbd5e1] hover:border-[#731922]'
                    }`}
                  >
                    <div className="font-roman font-bold text-xs truncate text-[#facc15]">
                      {league.nome.replace('Lega ', '')}
                    </div>
                    <div className="text-[10px] text-[#cbd5e1] truncate">{league.regione}</div>
                    <div className="text-[9px] text-[#94a3b8] font-data mt-0.5">
                      Rep. {league.reputazione}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Choose Club */}
          <div>
            <h2 className="font-roman text-xs font-bold text-[#facc15] mb-2 flex items-center gap-1.5">
              <Shield size={14} className="text-[#d4af37]" />
              <span>3. SCEGLI IL CLUB DA CONDURRE AL TRIONFO (15 SQUADRE PER LEGA)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {clubsInLeague.map(club => {
                const isSelected = club.id === selectedClubId;
                return (
                  <button
                    type="button"
                    key={club.id}
                    onClick={() => setSelectedClubId(club.id)}
                    className={`p-2.5 rounded-xs text-left cursor-pointer transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#6b161f] border-[#d4af37] text-white shadow-md'
                        : 'bg-[#190305] border-[#420d11] text-[#cbd5e1] hover:border-[#731922]'
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: club.colori.primary }}
                        />
                        <span className="font-roman font-bold text-xs truncate text-white">
                          {club.nome}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#cbd5e1] truncate mt-0.5">
                        {club.citta} · {club.stadioNome} ({club.stadioCapienza.toLocaleString()} posti)
                      </div>
                      <div className="text-[10px] text-[#facc15] font-data mt-0.5">
                        Budget: {club.budgetTrasferimenti.toLocaleString()} HS
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-[#d4af37] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Summary Callout */}
          {selectedClub && (
            <div className="retro-inset p-3 border-l-2 border-l-[#d4af37] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#190305]">
              <div>
                <span className="text-[10px] text-[#cbd5e1] font-roman uppercase block">
                  Mandato Magistrale Confermato
                </span>
                <div className="font-roman font-bold text-sm text-white">
                  {managerName} {managerCognome} · <span className="text-[#facc15]">{selectedOrigin.titoloMagister} ({selectedOrigin.nazionalita})</span>
                </div>
                <div className="text-[11px] text-[#cbd5e1]">
                  Guiderà il <strong className="text-[#d4af37]">{selectedClub.nome}</strong> nella {INITIAL_LEAGUES[selectedLeagueId]?.nome}.
                </div>
              </div>

              <RetroButton
                variant="crimson"
                size="lg"
                type="submit"
                className="font-roman text-xs font-bold tracking-wider uppercase px-6 py-2.5 shadow-lg border border-[#f87171]"
              >
                Ratifica Contratto & Inizia
              </RetroButton>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
