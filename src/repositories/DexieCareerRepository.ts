import { db } from '../database/db';
import type { CareerSave } from '../types';
import type { ICareerRepository } from './ICareerRepository';
import { getRomanDateString, convertBCToOlympicEra } from '../engines/calendarEngine';

function sanitizeCareerRecord(career: CareerSave): CareerSave {
  if (!career) return career;
  const yearBC = Math.abs(career.currentYear || -50);
  const era = convertBCToOlympicEra(yearBC);

  // If saveName still contains modern references like '50 a.C.' or '-'
  if (career.saveName && (career.saveName.includes('a.C.') || career.saveName.includes(' - '))) {
    const clubName = career.clubs?.[career.userClubId]?.nome || career.saveName.split('-')[0].trim() || 'Imperium';
    career.saveName = `${clubName} (${era.displayText})`;
  }

  // If currentDateText still contains 'a.C.' or doesn't have Olympic Era
  if (!career.currentDateText || career.currentDateText.includes('a.C.')) {
    career.currentDateText = getRomanDateString(career.currentMatchday || 1, yearBC);
  }

  // If manager hiring date contains 'a.C.'
  if (career.manager?.dataIngaggio && career.manager.dataIngaggio.includes('a.C.')) {
    career.manager.dataIngaggio = getRomanDateString(1, yearBC);
  }

  // Sanitize news headlines or dates if they have 'a.C.'
  if (Array.isArray(career.news)) {
    career.news = career.news.map(n => ({
      ...n,
      titolo: n.titolo?.replace(/\d+\s+a\.C\./g, era.displayText) || n.titolo,
      corpo: n.corpo?.replace(/\d+\s+a\.C\./g, era.displayText) || n.corpo,
      data: n.data?.replace(/\d+\s+a\.C\./g, era.displayText) || n.data
    }));
  }

  return career;
}

export class DexieCareerRepository implements ICareerRepository {
  async getAllCareers(): Promise<CareerSave[]> {
    try {
      const records = await db.careers.orderBy('updatedAt').reverse().toArray();
      return records.map(sanitizeCareerRecord);
    } catch (err) {
      console.error('DexieCareerRepository.getAllCareers error:', err);
      return [];
    }
  }

  async getCareerById(id: string): Promise<CareerSave | null> {
    try {
      const career = await db.careers.get(id);
      return career ? sanitizeCareerRecord(career) : null;
    } catch (err) {
      console.error(`DexieCareerRepository.getCareerById(${id}) error:`, err);
      return null;
    }
  }

  async saveCareer(career: CareerSave): Promise<void> {
    try {
      career.updatedAt = Date.now();
      await db.careers.put(career);
    } catch (err) {
      console.error('DexieCareerRepository.saveCareer error:', err);
      throw err;
    }
  }

  async deleteCareer(id: string): Promise<void> {
    try {
      await db.careers.delete(id);
    } catch (err) {
      console.error(`DexieCareerRepository.deleteCareer(${id}) error:`, err);
      throw err;
    }
  }

  async exportCareerJSON(id: string): Promise<string> {
    const career = await this.getCareerById(id);
    if (!career) throw new Error('Salvataggio non trovato');
    return JSON.stringify(career, null, 2);
  }

  async importCareerJSON(jsonStr: string): Promise<CareerSave> {
    const parsed = JSON.parse(jsonStr) as CareerSave;
    if (!parsed.id || !parsed.userClubId || !parsed.manager) {
      throw new Error('Formato salvataggio non valido');
    }
    parsed.updatedAt = Date.now();
    await this.saveCareer(parsed);
    return parsed;
  }
}

export const careerRepository: ICareerRepository = new DexieCareerRepository();
