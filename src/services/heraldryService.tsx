/**
 * SERVIZIO ARALDICO LEGIONARIO & STEMMI DEI CLUB
 * Generatore e fornitore di emblemi araldici dell'antichità classica (I secolo a.C.)
 * basati sui vessilli legionari (vexilla), scudi d'arena (scuta) e totem culturali.
 */

import React from 'react';
import type { Club } from '../types';

export type HeraldicIconType =
  | 'AQUILA'      // Aquila imperiale con alloro
  | 'LUPA'        // Lupa capitolina
  | 'TORO'        // Toro della Legio Gemina
  | 'CINGHIALE'   // Cinghiale celtico / gallico
  | 'ELEFANTE'    // Elefante da guerra punico
  | 'LEONE'       // Leone macedone ed ellenico
  | 'FULMINE'     // Fulmini alati di Giove
  | 'GLADIO'      // Scudo scutum con gladii incrociati
  | 'FALCO'       // Falco solare egizio di Horus
  | 'PEGASO';     // Pegaso alato greco

export interface ClubHeraldry {
  iconType: HeraldicIconType;
  title: string;
  motto: string;
  primaryColor: string;
  secondaryColor: string;
  goldTrim: boolean;
}

export const HERALDIC_SYMBOLS: { id: HeraldicIconType; label: string; meaning: string }[] = [
  { id: 'AQUILA', label: 'Aquila Legionaria', meaning: 'Insegna suprema del comando di Roma, alloro della vittoria e protezione di Giove.' },
  { id: 'LUPA', label: 'Lupa Capitolina', meaning: 'Madre ancestrale di Romolo e Remo, tenacia fiera e determinazione eterna.' },
  { id: 'TORO', label: 'Toro da Battaglia', meaning: 'Forza d’urto inarrestabile, totem della Legio Gemina e delle legioni cesariane.' },
  { id: 'CINGHIALE', label: 'Cinghiale Celtico', meaning: 'Ferocia e coraggio sfrenato dei popoli gallici ed europei.' },
  { id: 'ELEFANTE', label: 'Elefante Punico', meaning: 'Potenza travolgente delle sabbie africane e memoria delle gesta di Annibale.' },
  { id: 'LEONE', label: 'Leone Macedone', meaning: 'Orgoglio regale e virtù guerriera del mondo ellenico di Alessandro.' },
  { id: 'FULMINE', label: 'Fulmini Alati di Giove', meaning: 'Rapidità distruttiva, energia tellurica e precisione letale in campo.' },
  { id: 'GLADIO', label: 'Gladii & Scutum', meaning: 'Disciplina militare, duello ravvicinato e tattica difensiva d’acciaio.' },
  { id: 'FALCO', label: 'Falco di Horus', meaning: 'Occhio solare vigile, nobiltà sacra del Nilo e traiettorie infallibili.' },
  { id: 'PEGASO', label: 'Pegaso Alato', meaning: 'Agilità sopraffina, scatti aerei imprendibili e grazia olimpica.' }
];

export const LEGIONARY_PALETTES = [
  { id: 'ROSSO_ORO', label: 'Rosso Pompeiano & Oro Imperiale', primary: '#800020', secondary: '#d4af37' },
  { id: 'PORPORA_MARMO', label: 'Porpora Tiria & Bianco Marmo', primary: '#581c87', secondary: '#f8fafc' },
  { id: 'BLU_ARGENTO', label: 'Blu Tirreno & Argento', primary: '#1e3a8a', secondary: '#cbd5e1' },
  { id: 'VERDE_BRONZO', label: 'Verde Alloro & Bronzo Antico', primary: '#14532d', secondary: '#ca8a04' },
  { id: 'NERO_ORO', label: 'Nero Ossidiana & Oro', primary: '#18181b', secondary: '#eab308' },
  { id: 'OCRA_TERRA', label: 'Ocra Numidica & Rame Solare', primary: '#9a3412', secondary: '#facc15' },
  { id: 'CREMISI_NOTTE', label: 'Cremisi Pretoriano & Notte', primary: '#991b1b', secondary: '#0f172a' }
];

export const CLASSICAL_MOTTOS = [
  'Fortiter et Fideliter',
  'Virtus et Disciplina',
  'Invicta Cohors',
  'Audaces Fortuna Iuvat',
  'Aut Vincere Aut Mori',
  'Gloria in Arena',
  'Soli Deo et Romae',
  'Ad Finem Usque',
  'Ferrum et Arena',
  'Per Aspera ad Astra',
  'Veni Vidi Vici',
  'Nulla Dies Sine Pugna'
];

/**
 * Genera uno stemma unico e tematico casuale
 */
export function generateRandomHeraldry(club?: Club): {
  iconType: HeraldicIconType;
  motto: string;
  paletteName: string;
  primaryColor: string;
  secondaryColor: string;
  goldTrim: boolean;
} {
  const symbol = HERALDIC_SYMBOLS[Math.floor(Math.random() * HERALDIC_SYMBOLS.length)];
  const palette = LEGIONARY_PALETTES[Math.floor(Math.random() * LEGIONARY_PALETTES.length)];
  const motto = CLASSICAL_MOTTOS[Math.floor(Math.random() * CLASSICAL_MOTTOS.length)];

  return {
    iconType: symbol.id,
    motto,
    paletteName: palette.label,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    goldTrim: true
  };
}

/**
 * Determina il simbolo araldico storico più consono al sodalizio
 * in base alla sua regione, cultura e tradizione.
 */
export function getClubHeraldicEmblem(club: Club): ClubHeraldry {
  if (club.araldica) {
    return {
      iconType: club.araldica.iconType,
      title: club.nome,
      motto: club.araldica.motto,
      primaryColor: club.araldica.primaryColor || club.colori?.primary || '#800020',
      secondaryColor: club.araldica.secondaryColor || club.colori?.secondary || '#d4af37',
      goldTrim: club.araldica.goldTrim !== undefined ? club.araldica.goldTrim : true
    };
  }

  const name = club.nome.toLowerCase();
  const region = (club.regione || '').toLowerCase();

  let iconType: HeraldicIconType = 'GLADIO';
  let motto = 'Fortiter et Fideliter';

  if (name.includes('roma') || name.includes('spqr') || name.includes('caput')) {
    iconType = 'AQUILA';
    motto = 'Senatus Populusque Romanus';
  } else if (name.includes('lup') || name.includes('sabina') || name.includes('tiberis')) {
    iconType = 'LUPA';
    motto = 'Roma Aeterna & Nutrix Gentium';
  } else if (region.includes('celt') || region.includes('gall') || name.includes('lugdunum') || name.includes('arverni')) {
    iconType = 'CINGHIALE';
    motto = 'Ferocia Celtica';
  } else if (region.includes('afric') || region.includes('punic') || name.includes('carthago') || name.includes('barca')) {
    iconType = 'ELEFANTE';
    motto = 'Barcidis Virtus';
  } else if (region.includes('grec') || region.includes('macedon') || name.includes('athen') || name.includes('alexand')) {
    iconType = 'LEONE';
    motto = 'Victoria Hellenica';
  } else if (region.includes('egiz') || region.includes('nil') || name.includes('memphis') || name.includes('ptolem')) {
    iconType = 'FALCO';
    motto = 'Lux Aegyptia';
  } else if (name.includes('neapolis') || name.includes('corinth') || name.includes('olympia')) {
    iconType = 'PEGASO';
    motto = 'Agon Gloriosus';
  } else if (name.includes('gladiat') || name.includes('castra') || name.includes('legio')) {
    iconType = 'FULMINE';
    motto = 'Fulmen Martis';
  } else if (region.includes('iber') || name.includes('tarraco') || name.includes('saguntum')) {
    iconType = 'TORO';
    motto = 'Vis Hispanica';
  }

  return {
    iconType,
    title: club.nome,
    motto,
    primaryColor: club.colori?.primary || '#800020',
    secondaryColor: club.colori?.secondary || '#d4af37',
    goldTrim: true
  };
}

/**
 * Renderizzatore SVG dello stemma araldico legionario per qualsiasi club
 */
export function renderHeraldicShieldSVG(heraldry: ClubHeraldry, size = 64): React.ReactElement {
  const { primaryColor, secondaryColor, iconType } = heraldry;

  const renderIconPath = () => {
    switch (iconType) {
      case 'AQUILA':
        return (
          // Aquila imperiale stilizzata
          <g fill="#d4af37" stroke="#111" strokeWidth="0.5">
            <path d="M50 15 L56 26 L68 28 L59 36 L62 48 L50 42 L38 48 L41 36 L32 28 L44 26 Z" />
            <circle cx="50" cy="24" r="5" />
            <path d="M35 32 Q50 20 65 32 L60 38 Q50 28 40 38 Z" fill="#fef08a" />
            <path d="M47 50 L53 50 L50 62 Z" />
          </g>
        );
      case 'LUPA':
        return (
          // Profilo lupa capitolina
          <g fill="#d4af37">
            <path d="M36 28 Q44 18 56 22 Q66 26 64 36 Q60 48 50 56 Q40 48 36 38 Z" />
            <circle cx="43" cy="25" r="2.5" fill="#111" />
            <path d="M34 22 L38 27 L33 28 Z" fill="#fef08a" />
            <circle cx="46" cy="62" r="3" fill="#fef08a" />
            <circle cx="54" cy="62" r="3" fill="#fef08a" />
          </g>
        );
      case 'CINGHIALE':
        return (
          // Cinghiale celtico fiero
          <g fill="#d4af37">
            <ellipse cx="50" cy="40" rx="18" ry="12" />
            <polygon points="32,42 22,46 32,49" />
            <path d="M40 24 L44 28 L48 24 L52 28 L56 24 L60 28" stroke="#fef08a" strokeWidth="2" fill="none" />
            <circle cx="36" cy="38" r="2" fill="#111" />
          </g>
        );
      case 'ELEFANTE':
        return (
          // Elefante da guerra con torretta
          <g fill="#d4af37">
            <rect x="44" y="18" width="12" height="8" rx="1" fill="#fef08a" />
            <ellipse cx="50" cy="42" rx="19" ry="15" />
            <path d="M32 44 Q24 48 26 60 Q28 64 32 58" fill="none" stroke="#d4af37" strokeWidth="4" />
            <path d="M28 50 L34 52 L30 55 Z" fill="#fff" />
          </g>
        );
      case 'LEONE':
        return (
          // Leone macedone ruggente
          <g fill="#d4af37">
            <circle cx="50" cy="38" r="14" fill="#facc15" />
            <path d="M38 26 Q50 16 62 26 Q70 38 60 52 Q50 60 40 52 Q30 38 38 26 Z" fill="none" stroke="#d4af37" strokeWidth="4" />
            <circle cx="45" cy="36" r="2.5" fill="#111" />
            <circle cx="55" cy="36" r="2.5" fill="#111" />
            <polygon points="48,42 52,42 50,46" fill="#111" />
          </g>
        );
      case 'FALCO':
        return (
          // Falco di Horus / Egitto tolemaico
          <g fill="#d4af37">
            <circle cx="50" cy="20" r="7" fill="#fef08a" />
            <path d="M50 27 L66 38 L58 44 L50 36 L42 44 L34 38 Z" fill="#d4af37" />
            <path d="M46 36 L54 36 L50 58 Z" fill="#facc15" />
          </g>
        );
      case 'TORO':
        return (
          // Toro legionario (Legio Gemina)
          <g fill="#d4af37">
            <ellipse cx="50" cy="42" rx="16" ry="12" />
            <path d="M38 30 Q32 18 26 22 Q34 26 38 34" fill="#fef08a" />
            <path d="M62 30 Q68 18 74 22 Q66 26 62 34" fill="#fef08a" />
            <circle cx="44" cy="38" r="2" fill="#111" />
            <circle cx="56" cy="38" r="2" fill="#111" />
          </g>
        );
      case 'PEGASO':
        return (
          // Pegaso ellenico
          <g fill="#d4af37">
            <path d="M38 48 Q44 32 54 36 Q64 40 68 30 Q62 52 50 54 Z" />
            <path d="M46 36 Q36 20 54 18 Q50 28 46 36 Z" fill="#fef08a" />
          </g>
        );
      case 'FULMINE':
        return (
          // Fulmini alati di Giove
          <g fill="#d4af37">
            <polygon points="52,18 36,40 48,40 44,62 62,36 50,36" fill="#fef08a" stroke="#d4af37" strokeWidth="1" />
          </g>
        );
      default:
        return (
          // Gladio e scudo incrociato
          <g fill="#d4af37" stroke="#111" strokeWidth="0.5">
            <rect x="48" y="16" width="4" height="48" rx="1" fill="#fef08a" />
            <rect x="42" y="24" width="16" height="4" rx="1" fill="#d4af37" />
            <circle cx="50" cy="65" r="3" fill="#d4af37" />
            <circle cx="50" cy="40" r="10" fill="none" stroke="#d4af37" strokeWidth="2" />
          </g>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="drop-shadow-md select-none inline-block shrink-0"
    >
      <defs>
        <linearGradient id={`shieldGrad_${heraldry.iconType}_${heraldry.title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#1a0406" />
        </linearGradient>
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>

      {/* Scutum Roman Shield Contour */}
      <path
        d="M20 12 Q50 4 80 12 L84 60 Q82 88 50 96 Q18 88 16 60 Z"
        fill={`url(#shieldGrad_${heraldry.iconType}_${heraldry.title.replace(/\s+/g, '')})`}
        stroke="url(#goldBorder)"
        strokeWidth="3.5"
      />

      {/* Internal decorative Roman fillet */}
      <path
        d="M26 18 Q50 12 74 18 L77 58 Q75 80 50 88 Q25 80 23 58 Z"
        fill="none"
        stroke={secondaryColor}
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Heraldic Emblem Graphic */}
      {renderIconPath()}

      {/* Golden Boss / Umbo at Center */}
      <circle cx="50" cy="42" r="3.5" fill="#fef08a" stroke="#854d0e" strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
