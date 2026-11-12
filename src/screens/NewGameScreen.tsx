import React, { useState, useEffect } from 'react';
import { RetroButton } from '../components/RetroButton';
import { INITIAL_LEAGUES } from '../initialData/leagues';
import { INITIAL_CLUBS } from '../initialData/clubs';
import type { CreateCareerParams } from '../services/careerService';
import { INITIAL_REGIONS } from '../initialData/regions';
import {
  getClubHeraldicEmblem,
  renderHeraldicShieldSVG,
  HERALDIC_SYMBOLS,
  LEGIONARY_PALETTES,
  CLASSICAL_MOTTOS,
  generateRandomHeraldry,
  type HeraldicIconType,
  type ClubHeraldry
} from '../services/heraldryService';
import type { ClubHeraldryData } from '../types';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Search,
  Globe,
  User,
  Sparkles,
  Award,
  Landmark,
  Coins,
  MapPin,
  Flame,
  Palette,
  RefreshCw,
  Check
} from 'lucide-react';

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
    descrizione: 'Nato nel solco del Mos Maiorum e addestrato al comando strategico delle legioni romane.'
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
    descrizione: 'Custode dei papiri della grande Biblioteca di Alessandria, maestro nell’analisi matematica dei varchi.'
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
  'Oriente & Asia Anteriore',
  'Nord Africa & Nilo',
  'Terre Lontane & Confini'
];

type WizardStep = 1 | 2 | 3 | 4;

export const NewGameScreen: React.FC<NewGameScreenProps> = ({ onStartCareer, onBack }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);

  // Step 1: Magister State
  const [selectedOrigin, setSelectedOrigin] = useState<MagisterOriginPreset>(MAGISTER_ORIGINS[0]);
  const [managerName, setManagerName] = useState(MAGISTER_ORIGINS[0].defaultName);
  const [managerCognome, setManagerCognome] = useState(MAGISTER_ORIGINS[0].defaultCognome);
  const [family, setFamily] = useState(MAGISTER_ORIGINS[0].famiglie[0]);

  // Step 2: League State
  const [selectedMacroArea, setSelectedMacroArea] = useState('TUTTE LE AREE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('league_romana');

  // Step 3: Club State & Heraldry Laboratory
  const [selectedClubId, setSelectedClubId] = useState('club_roma');
  const [customHeraldry, setCustomHeraldry] = useState<ClubHeraldryData | null>(null);
  const [isCustomizingHeraldry, setIsCustomizingHeraldry] = useState(false);

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
    const matchesSearch =
      !searchQuery ||
      l.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.regione.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.cultura && l.cultura.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMacro && matchesSearch;
  });

  const clubsInLeague = Object.values(INITIAL_CLUBS).filter(c => c.leagueId === selectedLeagueId);
  const selectedClub = INITIAL_CLUBS[selectedClubId] || clubsInLeague[0] || Object.values(INITIAL_CLUBS)[0];
  const selectedLeague = INITIAL_LEAGUES[selectedLeagueId] || allLeagues[0];

  // Initialize or update heraldry when selectedClub changes
  useEffect(() => {
    if (selectedClub) {
      const base = getClubHeraldicEmblem(selectedClub);
      setCustomHeraldry({
        iconType: base.iconType,
        motto: base.motto,
        paletteName: 'Colori Tradizionali della Legione',
        primaryColor: base.primaryColor,
        secondaryColor: base.secondaryColor,
        goldTrim: true
      });
    }
  }, [selectedClubId]);

  const effectiveHeraldry: ClubHeraldry = customHeraldry
    ? {
        iconType: customHeraldry.iconType,
        title: selectedClub.nome,
        motto: customHeraldry.motto,
        primaryColor: customHeraldry.primaryColor,
        secondaryColor: customHeraldry.secondaryColor,
        goldTrim: customHeraldry.goldTrim ?? true
      }
    : getClubHeraldicEmblem(selectedClub);

  const handleRandomizeHeraldry = () => {
    const forged = generateRandomHeraldry(selectedClub);
    setCustomHeraldry({
      iconType: forged.iconType,
      motto: forged.motto,
      paletteName: forged.paletteName,
      primaryColor: forged.primaryColor,
      secondaryColor: forged.secondaryColor,
      goldTrim: true
    });
  };

  // When league changes, pick first club in that league
  const handleSelectLeague = (leagueId: string) => {
    setSelectedLeagueId(leagueId);
    const firstClub = Object.values(INITIAL_CLUBS).find(c => c.leagueId === leagueId);
    if (firstClub) {
      setSelectedClubId(firstClub.id);
    }
  };

  const handleFinalSubmit = () => {
    if (!managerName || !managerCognome) return;
    onStartCareer({
      managerName,
      managerCognome,
      originFamily: family.split('(')[0].trim() || 'Julia',
      userClubId: selectedClubId,
      nationality: selectedOrigin.nazionalita,
      culture: selectedOrigin.cultura,
      customHeraldry: customHeraldry || undefined
    });
  };

  const stepTitles = [
    { step: 1, title: 'Identità del Magister', subtitle: 'Origine & Casata' },
    { step: 2, title: 'Provincia & Campionato', subtitle: 'La Lega dei Giochi' },
    { step: 3, title: 'Il Sodalizio & Araldica', subtitle: 'Stemma & Club' },
    { step: 4, title: 'Ratifica del Senato', subtitle: 'Giuramento Trionfale' }
  ];

  return (
    <div className="h-dvh w-full bg-[#1c0406] p-2 sm:p-3 flex flex-col items-center justify-center overflow-hidden select-none">
      <div className="w-full max-w-6xl h-full max-h-[95dvh] retro-box overflow-hidden shadow-2xl flex flex-col border-2 border-[#85222b]">
        {/* Header Bar */}
        <div className="retro-panel-header px-4 py-2 flex items-center justify-between border-b border-[#731922] shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={17} className="text-[#d4af37]" />
            <div>
              <h1 className="font-roman text-sm font-bold tracking-wider text-[#d4af37]">
                NUOVA CARRIERA · ATTO D'INGAGGIO DEL MAGISTER
              </h1>
              <span className="text-[10px] text-[#cbd5e1] font-roman">
                Anno 3 della 182ª Olimpiade (50 a.C.)
              </span>
            </div>
          </div>
          <RetroButton
            variant="secondary"
            size="sm"
            onClick={currentStep === 1 ? onBack : () => setCurrentStep((s: WizardStep) => (Math.max(1, s - 1) as WizardStep))}
            className="flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft size={14} />
            <span>{currentStep === 1 ? 'Annulla' : 'Passo Precedente'}</span>
          </RetroButton>
        </div>

        {/* Multi-Step Wizard Progress Ribbon */}
        <div className="grid grid-cols-4 bg-[#140203] border-b border-[#521016] text-xs font-roman shrink-0">
          {stepTitles.map(st => {
            const isActive = currentStep === st.step;
            const isCompleted = currentStep > st.step;
            return (
              <div
                key={st.step}
                onClick={() => {
                  if (st.step < currentStep) setCurrentStep(st.step as WizardStep);
                }}
                className={`p-2 flex items-center gap-2 border-r border-[#521016] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#800020] text-[#d4af37] border-b-2 border-b-[#d4af37]'
                    : isCompleted
                    ? 'bg-[#2b080b] text-[#6ee7b7] hover:bg-[#3d0b10]'
                    : 'text-[#64748b] opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    isActive
                      ? 'bg-[#d4af37] text-[#1c0406]'
                      : isCompleted
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#252e42] text-[#94a3b8]'
                  }`}
                >
                  {isCompleted ? '✓' : st.step}
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="font-bold text-[11px] leading-tight truncate">{st.title}</div>
                  <div className="text-[9px] text-[#94a3b8] truncate">{st.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Step Content Body */}
        <div className="p-3 overflow-y-auto space-y-3 text-xs flex-1 min-h-0 bg-[#1a0406]">
          {/* ========================================================================= */}
          {/* PASSO 1: PROFILO & ORIGINE DEL MAGISTER                                   */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 retro-inset bg-[#240507] border border-[#731922] space-y-3">
                <div className="flex items-center justify-between border-b border-[#521016] pb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#d4af37]" />
                    <span className="font-roman text-xs font-bold text-[#facc15] uppercase tracking-wide">
                      Passo 1: Tradizione Culturale & Titolo Magistrale
                    </span>
                  </div>
                  <span className="text-[10px] text-[#cbd5e1] font-roman">
                    Titolo: <strong className="text-white">{selectedOrigin.titoloMagister}</strong>
                  </span>
                </div>

                {/* Cultural Origin Selector */}
                <div>
                  <label className="block text-[#cbd5e1] font-roman mb-1.5 font-bold">
                    Seleziona l'Origine e la Scuola Tattica:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {MAGISTER_ORIGINS.map(orig => {
                      const isSelected = orig.id === selectedOrigin.id;
                      return (
                        <div
                          key={orig.id}
                          onClick={() => handleOriginChange(orig.id)}
                          className={`p-3 rounded-xs text-left cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-[#800020] border-[#d4af37] text-white shadow-lg'
                              : 'bg-[#140203] border-[#420d11] text-[#cbd5e1] hover:border-[#731922]'
                          }`}
                        >
                          <div className="font-roman font-bold text-xs text-[#facc15]">{orig.cultura}</div>
                          <div className="text-[10px] text-[#94a3b8] mt-0.5">{orig.nazionalita}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] italic mt-2 font-roman bg-[#140203] p-2 border border-[#420d11] rounded-xs">
                    📜 {selectedOrigin.descrizione}
                  </p>
                </div>

                {/* Name, Surname and Family */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[#cbd5e1] mb-1 font-roman font-bold">
                      {selectedOrigin.cultura === 'ROMANA' ? 'Praenomen (Nome Proprio)' : 'Nome'}
                    </label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={e => setManagerName(e.target.value)}
                      className="w-full bg-[#140203] border border-[#521016] px-3 py-2 text-white rounded-xs focus:border-[#d4af37] outline-none font-roman text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#cbd5e1] mb-1 font-roman font-bold">
                      {selectedOrigin.cultura === 'ROMANA' ? 'Nomen / Cognomen' : 'Famiglia / Epiteto'}
                    </label>
                    <input
                      type="text"
                      value={managerCognome}
                      onChange={e => setManagerCognome(e.target.value)}
                      className="w-full bg-[#140203] border border-[#521016] px-3 py-2 text-white rounded-xs focus:border-[#d4af37] outline-none font-roman text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#cbd5e1] mb-1 font-roman font-bold">
                      {selectedOrigin.cultura === 'ROMANA' ? 'Gens / Casata Patrizia' : 'Lignaggio / Tribù'}
                    </label>
                    <select
                      value={family}
                      onChange={e => setFamily(e.target.value)}
                      className="w-full bg-[#140203] border border-[#521016] px-3 py-2 text-white rounded-xs focus:border-[#d4af37] outline-none font-roman text-xs cursor-pointer"
                    >
                      {selectedOrigin.famiglie.map(fam => (
                        <option key={fam} value={fam}>
                          {fam}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASSO 2: LA PROVINCIA & IL CAMPIONATO                                     */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 retro-inset bg-[#240507] border border-[#731922] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#521016] gap-2">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-[#d4af37]" />
                    <span className="font-roman text-xs font-bold text-[#facc15] uppercase tracking-wide">
                      Passo 2: Provincia & Campionato ({filteredLeagues.length} Leghe Disponibili)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search size={14} className="text-[#94a3b8]" />
                    <input
                      type="text"
                      placeholder="Cerca lega o regione..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-[#140203] border border-[#521016] px-2 py-1 text-white rounded-xs text-[11px] outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Macro Area Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {MACRO_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSelectedMacroArea(area)}
                      className={`px-2.5 py-1 rounded-xs font-roman text-[10px] uppercase cursor-pointer whitespace-nowrap transition-colors border ${
                        selectedMacroArea === area
                          ? 'bg-[#800020] text-[#d4af37] border-[#d4af37] font-bold'
                          : 'bg-[#140203] text-[#94a3b8] border-[#3b0b10] hover:text-white'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                {/* League Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {filteredLeagues.map(l => {
                    const isSelected = l.id === selectedLeagueId;
                    const region = l.regionId ? INITIAL_REGIONS[l.regionId] : undefined;
                    return (
                      <div
                        key={l.id}
                        onClick={() => handleSelectLeague(l.id)}
                        className={`p-2.5 rounded-xs border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#800020] border-[#d4af37] text-white shadow-lg'
                            : 'bg-[#140203] border-[#3b0b10] text-[#cbd5e1] hover:border-[#731922]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-roman font-bold text-xs text-[#facc15] truncate">{l.nome}</span>
                            <span className="text-[9px] font-roman bg-black/40 px-1.5 py-0.5 rounded-xs text-[#d4af37] border border-[#d4af37]/30">
                              Livello {l.livello}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#94a3b8] mt-0.5 flex items-center gap-1">
                            <MapPin size={10} />
                            <span>{l.regione}</span>
                            {region && <span className="text-[#64748b]">· {region.macroArea}</span>}
                          </div>
                          <div className="text-[10px] text-[#cbd5e1] italic mt-1 line-clamp-2">
                            {l.nomeLatino || l.paeseCapitale || 'Lega Ufficiale dell’Impero'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-[#94a3b8] mt-2 pt-1 border-t border-black/30 font-data">
                          <span>15 Sodalizi Iscritti</span>
                          <span className="text-[#6ee7b7] font-semibold">{l.cultura || 'Latina'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASSO 3: IL SODALIZIO D'HARPASTUM & ARALDICA                              */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {/* Club Selection Grid */}
              <div className="p-3 retro-inset bg-[#240507] border border-[#731922] space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#521016]">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-[#d4af37]" />
                    <span className="font-roman text-xs font-bold text-[#facc15] uppercase tracking-wide">
                      Passo 3: Scegli il tuo Club in {selectedLeague.nome}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#cbd5e1] font-roman">
                    15 Club Disponibili nella Divisione
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {clubsInLeague.map(club => {
                    const isSelected = club.id === selectedClubId;
                    const heraldry = isSelected ? effectiveHeraldry : getClubHeraldicEmblem(club);
                    return (
                      <div
                        key={club.id}
                        onClick={() => setSelectedClubId(club.id)}
                        className={`p-2.5 rounded-xs border cursor-pointer transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#800020] border-2 border-[#d4af37] text-white shadow-xl scale-[1.01]'
                            : 'bg-[#140203] border-[#3b0b10] text-[#cbd5e1] hover:border-[#731922]'
                        }`}
                      >
                        {/* Club Heraldic Shield */}
                        {renderHeraldicShieldSVG(heraldry, 44)}

                        <div className="flex-1 min-w-0">
                          <div className="font-roman font-bold text-xs text-white truncate flex items-center justify-between">
                            <span>{club.nome}</span>
                            <span className="text-[9px] font-data text-[#d4af37]">Rep: {club.reputazione}</span>
                          </div>
                          <div className="text-[10px] text-[#94a3b8] mt-0.5 truncate flex items-center gap-1">
                            <Landmark size={10} />
                            <span>{club.stadioNome}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-black/30 text-[9px] font-data">
                            <span className="text-[#6ee7b7]">{club.citta}</span>
                            <span className="text-[#facc15]">{club.saldoCassa.toLocaleString()} HS</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Laboratorio Araldico dei Vessilliferi (Heraldic Forge & Emblem Generator) */}
              <div className="p-3 retro-inset bg-[#1a0305] border-2 border-[#d4af37]/60 rounded-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#521016]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#facc15]" />
                    <span className="font-roman text-xs font-bold text-[#facc15] uppercase tracking-wider">
                      Laboratorio Araldico dei Vessilliferi · Stemma di {selectedClub.nome}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RetroButton
                      variant="gold"
                      size="sm"
                      onClick={handleRandomizeHeraldry}
                      className="flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Forgia Stemma Casuale</span>
                    </RetroButton>
                    <RetroButton
                      variant={isCustomizingHeraldry ? 'crimson' : 'secondary'}
                      size="sm"
                      onClick={() => setIsCustomizingHeraldry(!isCustomizingHeraldry)}
                      className="flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 cursor-pointer"
                    >
                      <Palette size={12} />
                      <span>{isCustomizingHeraldry ? 'Chiudi Forgia' : 'Personalizza Simbolo'}</span>
                    </RetroButton>
                  </div>
                </div>

                {/* Shield Preview Ribbon */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#140203] p-3 rounded-xs border border-[#3b0b10]">
                  <div className="flex-shrink-0 flex items-center justify-center p-2 rounded-full bg-[#240507] border-2 border-[#d4af37] shadow-lg">
                    {renderHeraldicShieldSVG(effectiveHeraldry, 64)}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="font-roman font-bold text-sm text-[#facc15]">
                        {HERALDIC_SYMBOLS.find(s => s.id === effectiveHeraldry.iconType)?.label || effectiveHeraldry.iconType}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#800020] text-[#fef08a] border border-[#d4af37]/40 rounded-xs font-roman uppercase">
                        Vexillum Legionario
                      </span>
                    </div>

                    <div className="text-xs text-[#cbd5e1] font-roman italic">
                      "{effectiveHeraldry.motto}"
                    </div>

                    <p className="text-[10px] text-[#94a3b8] font-roman leading-relaxed">
                      {HERALDIC_SYMBOLS.find(s => s.id === effectiveHeraldry.iconType)?.meaning}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[#521016] pt-2 sm:pt-0 sm:pl-3">
                    <div className="text-[9px] font-roman text-[#94a3b8] text-center">
                      <span>Colori Coorte</span>
                      <div className="flex items-center gap-1 mt-1 justify-center">
                        <span
                          className="w-5 h-5 rounded-full border border-black shadow-inner"
                          style={{ backgroundColor: effectiveHeraldry.primaryColor }}
                          title="Colore Primario"
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black shadow-inner"
                          style={{ backgroundColor: effectiveHeraldry.secondaryColor }}
                          title="Colore Secondario"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Forge Controls */}
                {isCustomizingHeraldry && (
                  <div className="p-3 bg-[#120204] border border-[#521016] rounded-xs space-y-3 text-xs font-roman animate-fadeIn">
                    {/* Icon Selection */}
                    <div>
                      <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-1.5">
                        1. Scegli il Simbolo Araldico dell'Arena
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {HERALDIC_SYMBOLS.map(sym => {
                          const isSel = effectiveHeraldry.iconType === sym.id;
                          return (
                            <button
                              key={sym.id}
                              type="button"
                              onClick={() => {
                                setCustomHeraldry(prev => ({
                                  ...(prev || effectiveHeraldry),
                                  iconType: sym.id
                                }));
                              }}
                              className={`p-1.5 text-left rounded-xs border text-[10px] transition-colors cursor-pointer ${
                                isSel
                                  ? 'bg-[#800020] border-[#d4af37] text-[#facc15] font-bold shadow'
                                  : 'bg-[#1c0406] border-[#3b0b10] text-[#cbd5e1] hover:border-[#731922]'
                              }`}
                            >
                              <div className="truncate">{sym.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Palette Selection */}
                    <div>
                      <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-1.5">
                        2. Tavolozza della Legione
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                        {LEGIONARY_PALETTES.map(pal => {
                          const isSel = effectiveHeraldry.primaryColor === pal.primary && effectiveHeraldry.secondaryColor === pal.secondary;
                          return (
                            <button
                              key={pal.id}
                              type="button"
                              onClick={() => {
                                setCustomHeraldry(prev => ({
                                  ...(prev || effectiveHeraldry),
                                  primaryColor: pal.primary,
                                  secondaryColor: pal.secondary,
                                  paletteName: pal.label
                                }));
                              }}
                              className={`p-1.5 flex items-center gap-2 rounded-xs border text-[10px] transition-colors cursor-pointer ${
                                isSel
                                  ? 'bg-[#800020] border-[#d4af37] text-white font-bold'
                                  : 'bg-[#1c0406] border-[#3b0b10] text-[#cbd5e1] hover:border-[#731922]'
                              }`}
                            >
                              <div className="flex items-center gap-0.5">
                                <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: pal.primary }} />
                                <span className="w-3.5 h-3.5 rounded-full border border-black" style={{ backgroundColor: pal.secondary }} />
                              </div>
                              <span className="truncate">{pal.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Motto Selection */}
                    <div>
                      <label className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider block mb-1.5">
                        3. Motto Classico della Coorte
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CLASSICAL_MOTTOS.slice(0, 8).map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setCustomHeraldry(prev => ({
                                ...(prev || effectiveHeraldry),
                                motto: m
                              }));
                            }}
                            className={`px-2 py-1 rounded-xs border text-[10px] cursor-pointer transition-colors ${
                              effectiveHeraldry.motto === m
                                ? 'bg-[#d4af37] text-[#140203] font-bold border-[#d4af37]'
                                : 'bg-[#1c0406] border-[#3b0b10] text-[#cbd5e1] hover:border-[#731922]'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASSO 4: RATIFICA DEL SENATO & GIURAMENTO                                 */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 retro-inset bg-[#240507] border-2 border-[#d4af37] space-y-4">
                <div className="text-center pb-3 border-b border-[#521016]">
                  <div className="inline-block p-3 rounded-full bg-[#800020] border-2 border-[#d4af37] mb-2 shadow-lg">
                    {renderHeraldicShieldSVG(effectiveHeraldry, 72)}
                  </div>
                  <h2 className="font-roman text-base font-bold text-[#facc15] tracking-widest">
                    ATTO DI RATIFICA & GIURAMENTO MAGISTRALE
                  </h2>
                  <p className="text-[11px] text-[#cbd5e1] font-roman">
                    In virtù dei poteri conferiti dal Senato e dalle assemblee dei giochi sotto i Fasti dell'anno 3 della 182ª Olimpiade.
                  </p>
                </div>

                {/* Contract Summary Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-roman">
                  <div className="p-3 bg-[#140203] border border-[#521016] rounded-xs space-y-1.5">
                    <div className="font-bold text-[#d4af37] uppercase text-[10px] pb-1 border-b border-[#3b0b10]">
                      IL MAGISTER
                    </div>
                    <div><span className="text-[#94a3b8]">Nome:</span> <strong className="text-white">{managerName} {managerCognome}</strong></div>
                    <div><span className="text-[#94a3b8]">Tradizione:</span> <strong className="text-[#facc15]">{selectedOrigin.label}</strong></div>
                    <div><span className="text-[#94a3b8]">Casata / Gens:</span> <strong className="text-white">{family}</strong></div>
                    <div><span className="text-[#94a3b8]">Titolo:</span> <strong className="text-[#6ee7b7]">{selectedOrigin.titoloMagister}</strong></div>
                  </div>

                  <div className="p-3 bg-[#140203] border border-[#521016] rounded-xs space-y-1.5">
                    <div className="font-bold text-[#d4af37] uppercase text-[10px] pb-1 border-b border-[#3b0b10]">
                      IL SODALIZIO ASSEGNATO
                    </div>
                    <div><span className="text-[#94a3b8]">Club:</span> <strong className="text-white">{selectedClub.nome}</strong></div>
                    <div><span className="text-[#94a3b8]">Campionato:</span> <strong className="text-[#facc15]">{selectedLeague.nome}</strong> ({selectedLeague.regione})</div>
                    <div><span className="text-[#94a3b8]">Vessillo:</span> <strong className="text-[#fef08a]">{HERALDIC_SYMBOLS.find(s => s.id === effectiveHeraldry.iconType)?.label}</strong></div>
                    <div><span className="text-[#94a3b8]">Motto:</span> <strong className="text-[#d4af37] italic">"{effectiveHeraldry.motto}"</strong></div>
                    <div><span className="text-[#94a3b8]">Arena & Stadio:</span> <strong className="text-white">{selectedClub.stadioNome}</strong> ({selectedClub.stadioCapienza.toLocaleString()} posti)</div>
                    <div><span className="text-[#94a3b8]">Tesoro di Cassa:</span> <strong className="text-[#6ee7b7] font-data">{selectedClub.saldoCassa.toLocaleString()} HS</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-[#170406] border border-[#d4af37]/40 rounded-xs text-center text-[#cbd5e1] text-[11px] font-roman italic">
                  "Nel nome degli Dei e delle gloriose leggi dell'Harpastum, io giuro di condurre la mia coorte con virtus, disciplina e valore nelle sabbie dell'agone."
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="retro-panel-header px-4 py-2 flex items-center justify-between border-t border-[#731922] shrink-0">
          <div className="text-[11px] text-[#94a3b8] font-roman hidden sm:block">
            Passo {currentStep} di 4 · {stepTitles[currentStep - 1].title}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <RetroButton
                variant="secondary"
                size="md"
                onClick={() => setCurrentStep((s: WizardStep) => (Math.max(1, s - 1) as WizardStep))}
                className="font-bold uppercase tracking-wider"
              >
                &larr; Indietro
              </RetroButton>
            )}

            {currentStep < 4 ? (
              <RetroButton
                variant="gold"
                size="md"
                onClick={() => setCurrentStep((s: WizardStep) => (Math.min(4, s + 1) as WizardStep))}
                className="font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Continua al Passo {currentStep + 1}</span>
                <ArrowRight size={14} />
              </RetroButton>
            ) : (
              <RetroButton
                variant="crimson"
                size="md"
                onClick={handleFinalSubmit}
                className="font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl animate-pulse"
              >
                <Sparkles size={16} className="text-[#fef08a]" />
                <span>Ratifica & Entra nell'Arena &rarr;</span>
              </RetroButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
