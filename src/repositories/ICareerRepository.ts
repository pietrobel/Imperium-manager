import type { CareerSave } from '../types';

export interface ICareerRepository {
  getAllCareers(): Promise<CareerSave[]>;
  getCareerById(id: string): Promise<CareerSave | null>;
  saveCareer(career: CareerSave): Promise<void>;
  deleteCareer(id: string): Promise<void>;
  exportCareerJSON(id: string): Promise<string>;
  importCareerJSON(jsonStr: string): Promise<CareerSave>;
}
