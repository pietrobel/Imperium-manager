import Dexie, { type EntityTable } from 'dexie';
import type { CareerSave } from '../types';

export interface GameSettings {
  id: string;
  soundEnabled: boolean;
  soundVolume: number;
  simulationSpeed: 'NORMALE' | 'VELOCE' | 'ISTANTANEA';
  detailLevel: 'COMMENTO_ESTESO' | 'SOLO_GOL';
  theme: 'VINTAGE_ROMAN_DARK';
}

export class ImperiumDatabase extends Dexie {
  careers!: EntityTable<CareerSave, 'id'>;
  settings!: EntityTable<GameSettings, 'id'>;

  constructor() {
    super('ImperiumManagerDB');

    // Schema v1
    this.version(1).stores({
      careers: 'id, saveName, updatedAt, currentYear, userClubId',
      settings: 'id'
    });
  }
}

export const db = new ImperiumDatabase();

export async function getGameSettings(): Promise<GameSettings> {
  const defaultSettings: GameSettings = {
    id: 'user_settings',
    soundEnabled: true,
    soundVolume: 0.5,
    simulationSpeed: 'NORMALE',
    detailLevel: 'COMMENTO_ESTESO',
    theme: 'VINTAGE_ROMAN_DARK'
  };

  try {
    const existing = await db.settings.get('user_settings');
    if (!existing) {
      await db.settings.put(defaultSettings);
      return defaultSettings;
    }
    return existing;
  } catch (err) {
    console.warn('Fallback to memory settings:', err);
    return defaultSettings;
  }
}

export async function saveGameSettings(settings: Partial<GameSettings>): Promise<void> {
  try {
    const current = await getGameSettings();
    await db.settings.put({ ...current, ...settings });
  } catch (err) {
    console.warn('Failed saving settings to DB:', err);
  }
}
