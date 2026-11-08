import type { League } from '../types';

export const INITIAL_LEAGUES: Record<string, League> = {
  // 1. Lega Romana
  league_romana: {
    id: 'league_romana',
    nome: 'Lega Romana',
    nomeLatino: 'Prima Divisio Foederis Italici',
    regione: 'Italia & Latium',
    regionId: 'reg_roma',
    livello: 1,
    reputazione: 950,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 3,
    cultura: 'Romana',
    paeseCapitale: 'Roma',
    clubIds: [
      'club_roma', 'club_neapolis', 'club_mediolanum', 'club_capua', 'club_ravenna',
      'club_syracuse', 'club_rom_aquileia', 'club_rom_tarentum', 'club_rom_florentia', 'club_rom_verona',
      'club_rom_beneventum', 'club_rom_arretium', 'club_rom_bononia', 'club_rom_rhegium', 'club_rom_patavium'
    ]
  },

  // 2. Lega Gallica
  league_gallica: {
    id: 'league_gallica',
    nome: 'Lega Gallica',
    nomeLatino: 'Liga Gallica Transalpina',
    regione: 'Gallia Transalpina',
    regionId: 'reg_gallia',
    livello: 1,
    reputazione: 820,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Celtica',
    paeseCapitale: 'Bibracte',
    clubIds: [
      'club_lutetia', 'club_lugdunum', 'club_carnutes', 'club_massilia', 'club_gal_gergovia',
      'club_gal_avaricum', 'club_gal_durocortorum', 'club_gal_burdigala', 'club_gal_tolosa', 'club_gal_nemossus',
      'club_gal_samarobriva', 'club_gal_nemausus', 'club_gal_rotomagus', 'club_gal_bibracte', 'club_gal_alobroges'
    ]
  },

  // 3. Lega Iberica
  league_iberica: {
    id: 'league_iberica',
    nome: 'Lega Iberica',
    nomeLatino: 'Conventus Foederis Hispanici',
    regione: 'Hispania',
    regionId: 'reg_iberica',
    livello: 1,
    reputazione: 840,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Iberica',
    paeseCapitale: 'Corduba',
    clubIds: [
      'club_corduba', 'club_gades', 'club_caesaraugusta', 'club_ibe_tarraco', 'club_ibe_carthagonova',
      'club_ibe_toletum', 'club_ibe_numantia', 'club_ibe_hispalis', 'club_ibe_saguntum', 'club_ibe_barcino',
      'club_ibe_olisipo', 'club_ibe_bracara', 'club_ibe_asturica', 'club_ibe_emerita', 'club_ibe_valentia'
    ]
  },

  // 4. Lega Cartaginese
  league_cartaginese: {
    id: 'league_cartaginese',
    nome: 'Lega Cartaginese',
    nomeLatino: 'Liga Punica Byrsensis',
    regione: 'Cartagine & Zeugitana',
    regionId: 'reg_cartaginese',
    livello: 1,
    reputazione: 870,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 3,
    cultura: 'Punica',
    paeseCapitale: 'Carthago',
    clubIds: [
      'club_carthago', 'club_car_utica', 'club_car_hadrumetum', 'club_car_thapsus', 'club_car_hippodiarrhytus',
      'club_car_clupea', 'club_car_neapolis_punica', 'club_car_siccaveneria', 'club_car_zama', 'club_car_thuburbo',
      'club_car_clypea', 'club_car_byrsa_arx', 'club_car_megara', 'club_car_karthalo', 'club_car_melqart'
    ]
  },

  // 5. Lega Africana
  league_africana: {
    id: 'league_africana',
    nome: 'Lega Africana',
    nomeLatino: 'Conventus Africae Proconsularis',
    regione: 'Africa Proconsolare',
    regionId: 'reg_africana',
    livello: 1,
    reputazione: 780,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Romano-Africana',
    paeseCapitale: 'Utica',
    clubIds: [
      'club_afr_leptis', 'club_afr_sabratha', 'club_afr_oea', 'club_afr_capsa', 'club_afr_tacape',
      'club_afr_thelepte', 'club_afr_gigthis', 'club_afr_mactaris', 'club_afr_sufetula', 'club_afr_thugga',
      'club_afr_bullaregia', 'club_afr_simitthu', 'club_afr_cillium', 'club_afr_theveste', 'club_afr_ammaedara'
    ]
  },

  // 6. Lega Greca
  league_greca: {
    id: 'league_greca',
    nome: 'Lega Greca',
    nomeLatino: 'Koina Hellados et Peloponnesi',
    regione: 'Grecia & Peloponneso',
    regionId: 'reg_greca',
    livello: 1,
    reputazione: 880,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 3,
    cultura: 'Greca',
    paeseCapitale: 'Athenae',
    clubIds: [
      'club_athenae', 'club_sparta', 'club_corinthus', 'club_thebae', 'club_rhodes',
      'club_gre_delphi', 'club_gre_olympia', 'club_gre_argos', 'club_gre_mycenae', 'club_gre_epidaurus',
      'club_gre_patrae', 'club_gre_chalcis', 'club_gre_larissa', 'club_gre_nauplia', 'club_gre_megara_hellas'
    ]
  },

  // 7. Lega Macedone
  league_macedone: {
    id: 'league_macedone',
    nome: 'Lega Macedone',
    nomeLatino: 'Liga Macedonica Argeadum',
    regione: 'Macedonia & Epiro',
    regionId: 'reg_macedone',
    livello: 1,
    reputazione: 800,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Macedone',
    paeseCapitale: 'Pella',
    clubIds: [
      'club_mac_pella', 'club_mac_amphipolis', 'club_mac_thessalonica', 'club_mac_philippi', 'club_mac_apollonia',
      'club_mac_dyrrachium', 'club_mac_beroea', 'club_mac_edessa', 'club_mac_dion', 'club_mac_cassandreia',
      'club_mac_ambracia', 'club_mac_buthrotum', 'club_mac_passaron', 'club_mac_stobi', 'club_mac_scodra'
    ]
  },

  // 8. Lega Anatolica
  league_anatolica: {
    id: 'league_anatolica',
    nome: 'Lega Anatolica',
    nomeLatino: 'Koina Asiana et Ioniae',
    regione: 'Anatolia & Ionia',
    regionId: 'reg_anatolica',
    livello: 1,
    reputazione: 810,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Greco-Asiatica',
    paeseCapitale: 'Ephesus',
    clubIds: [
      'club_ana_ephesus', 'club_ana_pergamum', 'club_ana_miletus', 'club_ana_smyrna', 'club_ana_halicarnassus',
      'club_ana_sardis', 'club_ana_priene', 'club_ana_cyzicus', 'club_ana_magnesia', 'club_ana_teos',
      'club_ana_erythrae', 'club_ana_phocaea', 'club_ana_clazomenae', 'club_ana_colophon', 'club_ana_cnidus'
    ]
  },

  // 9. Lega Siriana
  league_siriana: {
    id: 'league_siriana',
    nome: 'Lega Siriana',
    nomeLatino: 'Liga Syriaca et Phoenicis',
    regione: 'Siria & Fenicia',
    regionId: 'reg_siriana',
    livello: 1,
    reputazione: 830,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Siriana',
    paeseCapitale: 'Antiochia',
    clubIds: [
      'club_syr_antiochia', 'club_syr_damascus', 'club_syr_tyrus', 'club_syr_sidon', 'club_syr_byblos',
      'club_syr_palmyra', 'club_syr_berytus', 'club_syr_emesa', 'club_syr_apamea', 'club_syr_laodicea',
      'club_syr_aradus', 'club_syr_heliopolis_baalbek', 'club_syr_chalcis_syria', 'club_syr_tripolis', 'club_syr_gaza'
    ]
  },

  // 10. Lega Egizia
  league_egizia: {
    id: 'league_egizia',
    nome: 'Lega Egizia',
    nomeLatino: 'Liga Ptolemaica Aegypti',
    regione: 'Aegyptus & Delta del Nilo',
    regionId: 'reg_egizia',
    livello: 1,
    reputazione: 890,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 3,
    cultura: 'Egizia',
    paeseCapitale: 'Alexandria',
    clubIds: [
      'club_alexandria', 'club_egy_memphis', 'club_egy_thebae_nili', 'club_egy_canopus', 'club_egy_pelusium',
      'club_egy_naucratis', 'club_egy_oxyrhynchus', 'club_egy_hermopolis', 'club_egy_crocodilopolis', 'club_egy_abydos',
      'club_egy_heliopolis_nili', 'club_egy_ptolemais_hermiou', 'club_egy_syene', 'club_egy_rhakotis', 'club_egy_berenicenili'
    ]
  },

  // 11. Lega Persiana
  league_persiana: {
    id: 'league_persiana',
    nome: 'Lega Persiana',
    nomeLatino: 'Liga Achaemenia Persidis',
    regione: 'Perside & Media',
    regionId: 'reg_persiana',
    livello: 1,
    reputazione: 820,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Persiana',
    paeseCapitale: 'Persepolis',
    clubIds: [
      'club_per_persepolis', 'club_per_pasargadae', 'club_per_susa', 'club_per_ecbatana', 'club_per_istakhr',
      'club_per_gabae', 'club_per_artacoana', 'club_per_aspadana', 'club_per_carmana', 'club_per_rhagae',
      'club_per_anxan', 'club_per_drangiana', 'club_per_arachosia', 'club_per_aria', 'club_per_marakanda_persis'
    ]
  },

  // 12. Lega Partica
  league_partica: {
    id: 'league_partica',
    nome: 'Lega Partica',
    nomeLatino: 'Liga Regalis Parthorum',
    regione: 'Partia & Mesopotamia',
    regionId: 'reg_partica',
    livello: 1,
    reputazione: 860,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Partica',
    paeseCapitale: 'Ctesiphon',
    clubIds: [
      'club_par_ctesiphon', 'club_par_seleucia_tigrim', 'club_par_hecatompylos', 'club_par_babylon', 'club_par_nisa',
      'club_par_duraeuropos', 'club_par_hatra', 'club_par_charax', 'club_par_apamea_rhadin', 'club_par_singara',
      'club_par_assaak', 'club_par_mithradatkert', 'club_par_arbelites', 'club_par_opais', 'club_par_maru'
    ]
  },

  // 13. Lega Armena
  league_armena: {
    id: 'league_armena',
    nome: 'Lega Armena',
    nomeLatino: 'Liga Magnae Armeniae',
    regione: 'Armenia Maior',
    regionId: 'reg_armena',
    livello: 1,
    reputazione: 790,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Armena',
    paeseCapitale: 'Tigranocerta',
    clubIds: [
      'club_arm_tigranocerta', 'club_arm_artaxata', 'club_arm_armavir', 'club_arm_van_tushpa', 'club_arm_errebuni',
      'club_arm_arsamosata', 'club_arm_carcathiocerta', 'club_arm_zarishat', 'club_arm_ani_kamakh', 'club_arm_arzun',
      'club_arm_mokk', 'club_arm_siwnik', 'club_arm_ararat', 'club_arm_vaspurakan', 'club_arm_kars'
    ]
  },

  // 14. Lega Battriana
  league_battriana: {
    id: 'league_battriana',
    nome: 'Lega Battriana',
    nomeLatino: 'Liga Graeco-Bactriana',
    regione: 'Battriana & Sogdiana',
    regionId: 'reg_battriana',
    livello: 1,
    reputazione: 770,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Greco-Battriana',
    paeseCapitale: 'Bactra',
    clubIds: [
      'club_bac_bactra', 'club_bac_aïkhanoum', 'club_bac_maracanda', 'club_bac_alexandria_oxiana', 'club_bac_demetrias',
      'club_bac_eucratideia', 'club_bac_cyropolis', 'club_bac_nautaca', 'club_bac_drasaca', 'club_bac_zariaspa',
      'club_bac_antiochia_margiana', 'club_bac_gabae_sogd', 'club_bac_termez', 'club_bac_kunduz', 'club_bac_badakhshan'
    ]
  },

  // 15. Lega Arabica
  league_arabica: {
    id: 'league_arabica',
    nome: 'Lega Arabica',
    nomeLatino: 'Liga Arabica Meridionalis',
    regione: 'Arabia Felix',
    regionId: 'reg_arabica',
    livello: 1,
    reputazione: 730,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Sabea / Araba',
    paeseCapitale: 'Marib',
    clubIds: [
      'club_ara_marib', 'club_ara_shabwa', 'club_ara_timna', 'club_ara_qarna', 'club_ara_najran',
      'club_ara_dhafar', 'club_ara_khorrori', 'club_ara_sirwah', 'club_ara_yatill', 'club_ara_dedan',
      'club_ara_hegra_arabia', 'club_ara_tayma', 'club_ara_gerrha', 'club_ara_adulis_coast', 'club_ara_muza'
    ]
  },

  // 16. Lega Britannica
  league_britannica: {
    id: 'league_britannica',
    nome: 'Lega Britannica',
    nomeLatino: 'Liga Insularis Britanniae',
    regione: 'Britannia Insulare',
    regionId: 'reg_britannia',
    livello: 1,
    reputazione: 740,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Britanna',
    paeseCapitale: 'Camulodunum',
    clubIds: [
      'club_londinium', 'club_eburacum', 'club_bri_camulodunum', 'club_bri_verulamium', 'club_bri_calleva',
      'club_bri_ventasilurum', 'club_bri_corinium', 'club_bri_lindum', 'club_bri_durovernum', 'club_bri_aquaesulis',
      'club_bri_iscadumnoniorum', 'club_bri_deva', 'club_bri_segontium', 'club_bri_moridunum', 'club_bri_monainsula'
    ]
  },

  // 17. Lega Germanica
  league_germanica: {
    id: 'league_germanica',
    nome: 'Lega Germanica',
    nomeLatino: 'Confoederatio Germanica Silvestris',
    regione: 'Germania Magna',
    regionId: 'reg_germania',
    livello: 1,
    reputazione: 760,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Germanica',
    paeseCapitale: 'Aliso',
    clubIds: [
      'club_ger_cherusci', 'club_ger_suebi', 'club_ger_chatti', 'club_ger_cimbri', 'club_ger_marcomanni',
      'club_ger_teutones', 'club_ger_frisii', 'club_ger_ubii', 'club_ger_batavi', 'club_ger_hermunduri',
      'club_ger_semnones', 'club_ger_quadi', 'club_ger_chauci', 'club_ger_bructeri', 'club_ger_tencteri'
    ]
  },

  // 18. Lega Tracica
  league_tracica: {
    id: 'league_tracica',
    nome: 'Lega Tracica',
    nomeLatino: 'Liga Thracica Odrysia',
    regione: 'Tracia',
    regionId: 'reg_tracia',
    livello: 1,
    reputazione: 750,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Tracica',
    paeseCapitale: 'Seuthopolis',
    clubIds: [
      'club_tra_seuthopolis', 'club_tra_philippopolis', 'club_tra_serdica', 'club_tra_odessos', 'club_tra_mesembria',
      'club_tra_apolloniapontica', 'club_tra_aenus', 'club_tra_bessapara', 'club_tra_perinthus', 'club_tra_abdera',
      'club_tra_maroneia', 'club_tra_selymbria', 'club_tra_kabyle', 'club_tra_byzantion', 'club_tra_lysimachia'
    ]
  },

  // 19. Lega Dacica
  league_dacica: {
    id: 'league_dacica',
    nome: 'Lega Dacica',
    nomeLatino: 'Liga Dacica Burebistae',
    regione: 'Dacia',
    regionId: 'reg_dacia',
    livello: 1,
    reputazione: 770,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Dacica',
    paeseCapitale: 'Sarmizegetusa',
    clubIds: [
      'club_dac_sarmizegetusa', 'club_dac_apulum', 'club_dac_drobeta', 'club_dac_napoca', 'club_dac_potaissa',
      'club_dac_buridava', 'club_dac_singidava', 'club_dac_cumidava', 'club_dac_arcobadara', 'club_dac_carsidava',
      'club_dac_capidava', 'club_dac_dierna', 'club_dac_tibiscum', 'club_dac_marcodava', 'club_dac_pelendava'
    ]
  },

  // 20. Lega Numidica
  league_numidica: {
    id: 'league_numidica',
    nome: 'Lega Numidica',
    nomeLatino: 'Liga Numidica Massylorum',
    regione: 'Numidia',
    regionId: 'reg_numidica',
    livello: 1,
    reputazione: 780,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Numida',
    paeseCapitale: 'Cirta',
    clubIds: [
      'club_numidia', 'club_num_hipporegius', 'club_num_theveste', 'club_num_thugga', 'club_num_zama_regia',
      'club_num_calama', 'club_num_sicca', 'club_num_bulla', 'club_num_thibilis', 'club_num_cuicul',
      'club_num_thamugadi', 'club_num_djemila', 'club_num_rusicade', 'club_num_chullu', 'club_num_tagaste'
    ]
  },

  // 21. Lega Mauritana
  league_mauritana: {
    id: 'league_mauritana',
    nome: 'Lega Mauritana',
    nomeLatino: 'Liga Mauritanica Bogudis',
    regione: 'Mauretania',
    regionId: 'reg_mauritana',
    livello: 1,
    reputazione: 730,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Mauritana',
    paeseCapitale: 'Tingis',
    clubIds: [
      'club_tingis', 'club_mau_volubilis', 'club_mau_lixus', 'club_mau_tamuda', 'club_mau_sala',
      'club_mau_zilis', 'club_mau_banasa', 'club_mau_rusadir', 'club_mau_siga', 'club_mau_iol_caesarea',
      'club_mau_tipasa', 'club_mau_cartenna', 'club_mau_oppidumnovum', 'club_mau_septem', 'club_mau_portusmagnus'
    ]
  },

  // 22. Lega Cirenaica
  league_cirenaica: {
    id: 'league_cirenaica',
    nome: 'Lega Cirenaica',
    nomeLatino: 'Pentapolis Cyrenaica Libyca',
    regione: 'Cirenaica & Pentapoli',
    regionId: 'reg_cirenaica',
    livello: 1,
    reputazione: 750,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Greco-Libica',
    paeseCapitale: 'Cyrene',
    clubIds: [
      'club_cir_cyrene', 'club_cir_apollonia', 'club_cir_barca', 'club_cir_teuchira', 'club_cir_berenice',
      'club_cir_ptolemais', 'club_cir_hydrax', 'club_cir_balagrae', 'club_cir_limnias', 'club_cir_antipyrgos',
      'club_cir_darnis', 'club_cir_chersonesus', 'club_cir_naustathmos', 'club_cir_marmarica', 'club_cir_boreion'
    ]
  },

  // 23. Lega Nubiana
  league_nubiana: {
    id: 'league_nubiana',
    nome: 'Lega Nubiana',
    nomeLatino: 'Liga Nubica Regni Kush',
    regione: 'Nubia & Kush',
    regionId: 'reg_nubiana',
    livello: 1,
    reputazione: 720,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Kushita',
    paeseCapitale: 'Meroe',
    clubIds: [
      'club_nub_meroe', 'club_nub_napata', 'club_nub_kawa', 'club_nub_kerma', 'club_nub_soleb',
      'club_nub_wadbanqa', 'club_nub_musawwarat', 'club_nub_naqa', 'club_nub_amara', 'club_nub_dangeil',
      'club_nub_farad', 'club_nub_buhen', 'club_nub_qasribrim', 'club_nub_semna', 'club_nub_sai'
    ]
  },

  // 24. Lega Etiopica
  league_etiopica: {
    id: 'league_etiopica',
    nome: 'Lega Etiopica',
    nomeLatino: 'Liga Aethiopica Axumitis',
    regione: 'Etiopia & Axum',
    regionId: 'reg_etiopica',
    livello: 1,
    reputazione: 710,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Axumita',
    paeseCapitale: 'Axum',
    clubIds: [
      'club_eti_axum', 'club_eti_adulis', 'club_eti_yeha', 'club_eti_matara', 'club_eti_qohaito',
      'club_eti_hawulti', 'club_eti_kaskase', 'club_eti_debredamo', 'club_eti_tcheros', 'club_eti_coloe',
      'club_eti_avalon', 'club_eti_sarapion', 'club_eti_malao', 'club_eti_mundus', 'club_eti_mosylon'
    ]
  },

  // 25. Lega Cilicia
  league_cilicia: {
    id: 'league_cilicia',
    nome: 'Lega Cilicia',
    nomeLatino: 'Liga Ciliciensis Navalis',
    regione: 'Cilicia',
    regionId: 'reg_cilicia',
    livello: 1,
    reputazione: 760,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Cilicia',
    paeseCapitale: 'Tarsus',
    clubIds: [
      'club_cil_tarsus', 'club_cil_soli_pompeiopolis', 'club_cil_adana', 'club_cil_anazarbus', 'club_cil_mopsuestia',
      'club_cil_issos', 'club_cil_corasium', 'club_cil_seleucia_calycadnum', 'club_cil_corycus', 'club_cil_elaiussa_sebaste',
      'club_cil_anemurium', 'club_cil_kelenderis', 'club_cil_castabala', 'club_cil_mallus', 'club_cil_aegae'
    ]
  },

  // 26. Lega Cappadoce
  league_cappadoce: {
    id: 'league_cappadoce',
    nome: 'Lega Cappadoce',
    nomeLatino: 'Liga Regni Cappadociae',
    regione: 'Cappadocia',
    regionId: 'reg_cappadoce',
    livello: 1,
    reputazione: 750,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Cappadoce',
    paeseCapitale: 'Mazaca',
    clubIds: [
      'club_cap_mazaca_caesarea', 'club_cap_tyana', 'club_cap_comana_cappadocia', 'club_cap_archelais', 'club_cap_nyssa',
      'club_cap_nazianzus', 'club_cap_diocaesarea', 'club_cap_ariarathia', 'club_cap_castabala_north', 'club_cap_argaeus',
      'club_cap_saravene', 'club_cap_morimene', 'club_cap_cappadocia_tiana', 'club_cap_venasa', 'club_cap_faustinopolis'
    ]
  },

  // 27. Lega Sarmatica
  league_sarmatica: {
    id: 'league_sarmatica',
    nome: 'Lega Sarmatica',
    nomeLatino: 'Liga Sarmatarum et Scytharum',
    regione: 'Sarmatia & Scizia',
    regionId: 'reg_sarmatica',
    livello: 1,
    reputazione: 740,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Sarmatica',
    paeseCapitale: 'Tanais',
    clubIds: [
      'club_sar_tanais', 'club_sar_olbia_pontica', 'club_sar_tyras', 'club_sar_panticapeum', 'club_sar_phanagoria',
      'club_sar_hermonassa', 'club_sar_gorgippia', 'club_sar_chersonesus_taurica', 'club_sar_theodosia', 'club_sar_roxolani',
      'club_sar_iazyges', 'club_sar_aorsi', 'club_sar_siraces', 'club_sar_gelonus', 'club_sar_alani'
    ]
  },

  // 28. Lega Nabatea
  league_nabatea: {
    id: 'league_nabatea',
    nome: 'Lega Nabatea',
    nomeLatino: 'Liga Regni Nabataei Petrae',
    regione: 'Arabia Nabatea & Petra',
    regionId: 'reg_nabataea',
    livello: 1,
    reputazione: 770,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Nabatea',
    paeseCapitale: 'Petra',
    clubIds: [
      'club_nab_petra', 'club_nab_hegra', 'club_nab_bostra', 'club_nab_gerasa', 'club_nab_philadelphia_ammon',
      'club_nab_madaba', 'club_nab_avdat', 'club_nab_shivta', 'club_nab_mamshit', 'club_nab_elusa',
      'club_nab_aila_aqaba', 'club_nab_leukekome', 'club_nab_dumah', 'club_nab_wadi_rum', 'club_nab_rehovot'
    ]
  },

  // 29. Lega Pontica
  league_pontica: {
    id: 'league_pontica',
    nome: 'Lega Pontica',
    nomeLatino: 'Liga Euxina Regni Pontici',
    regione: 'Ponto Eussino',
    regionId: 'reg_pontus',
    livello: 1,
    reputazione: 800,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 2,
    cultura: 'Pontica',
    paeseCapitale: 'Sinope',
    clubIds: [
      'club_pon_sinope', 'club_pon_amaseia', 'club_pon_trapezus', 'club_pon_amisos', 'club_pon_cabeira',
      'club_pon_pharnacia', 'club_pon_polemonium', 'club_pon_cotyora', 'club_pon_cerasus', 'club_pon_comana_pontica',
      'club_pon_neocaesarea', 'club_pon_zela', 'club_pon_dioscurias', 'club_pon_pityus', 'club_pon_heraclea_pontica'
    ]
  },

  // 30. Lega Illirica
  league_illirica: {
    id: 'league_illirica',
    nome: 'Lega Illirica',
    nomeLatino: 'Liga Illyrica et Dalmatica',
    regione: 'Illiria & Dalmazia',
    regionId: 'reg_illyricum',
    livello: 1,
    reputazione: 750,
    retrocessioni: 2,
    promozioni: 2,
    qualificazioniCoppe: 1,
    cultura: 'Illirica',
    paeseCapitale: 'Salona',
    clubIds: [
      'club_ill_salona', 'club_ill_narona', 'club_ill_epidaurum', 'club_ill_lissus', 'club_ill_iader',
      'club_ill_issa', 'club_ill_pharossa', 'club_ill_corcyranigra', 'club_ill_polaticum', 'club_ill_aenona',
      'club_ill_scardona', 'club_ill_delminium', 'club_ill_doclea', 'club_ill_albona', 'club_ill_tarsatica'
    ]
  }
};
