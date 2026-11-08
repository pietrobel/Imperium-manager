import React, { useState } from 'react';
import { RetroButton } from '../components/RetroButton';
import { Settings, Download, Upload, Trash2, Volume2, Shield } from 'lucide-react';
import type { CareerSave } from '../types';
import { careerRepository } from '../repositories/DexieCareerRepository';
import { audio } from '../services/audioService';

interface SettingsScreenProps {
  career?: CareerSave | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onCareerLoaded: (career: CareerSave) => void;
  onBackToMenu: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  career,
  soundEnabled,
  onToggleSound,
  onCareerLoaded,
  onBackToMenu
}) => {
  const [speed, setSpeed] = useState<'NORMALE' | 'VELOCE' | 'ISTANTANEA'>('NORMALE');
  const [detail, setDetail] = useState<'COMMENTO_ESTESO' | 'SOLO_GOL'>('COMMENTO_ESTESO');
  const [msg, setMsg] = useState<string | null>(null);

  const handleExport = async () => {
    if (!career) return;
    try {
      const json = await careerRepository.exportCareerJSON(career.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imperium_save_${career.saveName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg('Salvataggio esportato con successo in formato JSON!');
    } catch (err: any) {
      setMsg(`Errore nell'esportazione: ${err.message}`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = await careerRepository.importCareerJSON(text);
      onCareerLoaded(imported);
      setMsg(`Carriera "${imported.saveName}" importata e caricata correttamente!`);
    } catch (err: any) {
      setMsg(`Errore nell'importazione: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Sei sicuro di voler eliminare tutti i salvataggi memorizzati in locale?')) {
      if (career) await careerRepository.deleteCareer(career.id);
      setMsg('Salvataggio eliminato.');
      setTimeout(() => onBackToMenu(), 1000);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="retro-box p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-[#d4af37]" />
          <h1 className="font-roman text-sm font-bold text-white tracking-wide">
            IMPOSTAZIONI & GESTIONE DATI DI GIOCO
          </h1>
        </div>
        <RetroButton variant="secondary" size="sm" onClick={onBackToMenu}>
          Menu Principale
        </RetroButton>
      </div>

      {msg && (
        <div className="p-3 bg-[#1e293b] border border-[#d4af37] text-[#d4af37] text-xs font-semibold rounded-xs">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Audio & Simulation Settings */}
        <div className="retro-box p-4 space-y-4">
          <h2 className="font-roman text-xs font-bold text-[#d4af37] pb-1.5 border-b border-[#252e42] flex items-center gap-1.5">
            <Volume2 size={14} />
            <span>AUDIO & SIMULATORE</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 retro-inset">
              <div>
                <span className="font-semibold text-white block">Effetti Sonori Sintetizzati</span>
                <span className="text-[10px] text-[#94a3b8]">Audio vintage stile PC anni '90 (Web Audio API)</span>
              </div>
              <RetroButton
                variant={soundEnabled ? 'gold' : 'secondary'}
                size="sm"
                onClick={onToggleSound}
              >
                {soundEnabled ? 'Attivato' : 'Muto'}
              </RetroButton>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-semibold">Velocità di Simulazione</label>
              <div className="grid grid-cols-3 gap-1">
                {(['NORMALE', 'VELOCE', 'ISTANTANEA'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      audio.playClick();
                      setSpeed(s);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
                      speed === s
                        ? 'bg-[#1e2738] border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#111622] border-[#232d3f] text-[#94a3b8]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-semibold">Dettaglio Cronaca Partita</label>
              <div className="grid grid-cols-2 gap-1">
                {(['COMMENTO_ESTESO', 'SOLO_GOL'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      audio.playClick();
                      setDetail(d);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
                      detail === d
                        ? 'bg-[#1e2738] border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#111622] border-[#232d3f] text-[#94a3b8]'
                    }`}
                  >
                    {d === 'COMMENTO_ESTESO' ? 'Commento Esteso' : 'Solo Marcatori'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Database & Saves Persistence */}
        <div className="retro-box p-4 space-y-4">
          <h2 className="font-roman text-xs font-bold text-[#d4af37] pb-1.5 border-b border-[#252e42] flex items-center gap-1.5">
            <Shield size={14} />
            <span>PERSISTENZA & SALVATAGGI (INDEXEDDB)</span>
          </h2>

          <div className="space-y-3">
            <div className="retro-inset p-3 space-y-2">
              <span className="text-[10px] text-[#64748b] block font-roman">STATO ARCHIVIO LOCALE</span>
              <div className="text-[#e2e8f0]">
                I dati della carriera vengono salvati automaticamente su IndexedDB ad ogni avanzamento di giornata.
              </div>
              {career && (
                <div className="font-data text-[11px] text-[#38bdf8] pt-1">
                  Carriera attiva: {career.saveName} (ID: {career.id})
                </div>
              )}
            </div>

            <div className="space-y-2">
              {career && (
                <RetroButton
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={handleExport}
                >
                  <Download size={14} />
                  <span>Esporta Carriera Corrente (.JSON)</span>
                </RetroButton>
              )}

              <label className="w-full">
                <div className="border border-t-[#2d3748] border-l-[#2d3748] border-r-[#090d14] border-b-[#090d14] bg-[#151a24] hover:bg-[#1e2533] text-[#cbd5e1] py-2 px-3 text-xs flex items-center justify-center gap-2 cursor-pointer select-none">
                  <Upload size={14} />
                  <span>Carica da File di Backup (.JSON)</span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>

              {career && (
                <RetroButton
                  variant="danger"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 py-2"
                  onClick={handleClearAll}
                >
                  <Trash2 size={14} />
                  <span>Elimina Salvataggio Corrente</span>
                </RetroButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
