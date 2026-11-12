import React, { useState } from 'react';
import { RetroButton } from '../components/RetroButton';
import { Settings, Download, Upload, Trash2, Volume2, Shield, Monitor, Music } from 'lucide-react';
import type { CareerSave } from '../types';
import { careerRepository } from '../repositories/DexieCareerRepository';
import { audio } from '../services/audioService';
import type { AncientMusicMood } from '../services/ancientMusicEngine';

interface SettingsScreenProps {
  career?: CareerSave | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onCareerLoaded: (career: CareerSave) => void;
  onCareerDeleted?: () => void;
  onBackToMenu: () => void;
  onBackToTabularium?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  career,
  soundEnabled,
  onToggleSound,
  onCareerLoaded,
  onCareerDeleted,
  onBackToMenu,
  onBackToTabularium
}) => {
  const [simModePref, setSimModePref] = useState<'HIGHLIGHTS' | 'FULL'>(audio.simModePreference);
  const [speedMul, setSpeedMul] = useState<1 | 1.5 | 2>(audio.simSpeedMultiplier);
  const [detail, setDetail] = useState<'COMMENTO_ESTESO' | 'SOLO_GOL'>(audio.commentaryDetail);
  const [voiceOn, setVoiceOn] = useState<boolean>(audio.voiceCommentaryEnabled);
  const [musicOn, setMusicOn] = useState<boolean>(audio.musicEnabled);
  const [crowdOn, setCrowdOn] = useState<boolean>(audio.crowdEnabled);
  const [musicVol, setMusicVol] = useState<number>(Math.round(audio.musicVolume * 100));
  const [crowdVol, setCrowdVol] = useState<number>(Math.round(audio.crowdVolume * 100));
  const [musicMood, setMusicMood] = useState<'AUTO' | AncientMusicMood>(audio.musicMoodPreference);
  const [displayScale, setDisplayScale] = useState<'AUTO' | 'COMPACT' | 'COMFORTABLE'>(audio.displayScaleMode);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleExport = async () => {
    if (!career) return;
    try {
      const json = await careerRepository.exportCareerJSON(career.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `magister_ludorum_save_${career.saveName.replace(/\s+/g, '_')}_${Date.now()}.json`;
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
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (career) {
      await careerRepository.deleteCareer(career.id);
    }
    setConfirmDelete(false);
    setMsg('Salvataggio eliminato.');
    setTimeout(() => {
      if (onCareerDeleted) onCareerDeleted();
      else onBackToMenu();
    }, 600);
  };

  return (
    <div className="h-full flex flex-col gap-3 max-w-5xl mx-auto w-full min-h-0 overflow-hidden">
      <div className="retro-box p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-[#d4af37]" />
          <h1 className="font-roman text-sm font-bold text-white tracking-wide">
            IMPOSTAZIONI &amp; ADATTAMENTO SCHERMO
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {career && onBackToTabularium && (
            <RetroButton variant="gold" size="sm" onClick={onBackToTabularium}>
              &larr; Torna al Tabularium
            </RetroButton>
          )}
          <RetroButton variant="secondary" size="sm" onClick={onBackToMenu}>
            Menu Principale
          </RetroButton>
        </div>
      </div>

      {msg && (
        <div className="p-2.5 bg-[#1e293b] border border-[#d4af37] text-[#d4af37] text-xs font-semibold rounded-xs shrink-0">
          {msg}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pr-0.5">
        {/* Audio & Simulation Settings */}
        <div className="retro-box p-3.5 space-y-3">
          <h2 className="font-roman text-xs font-bold text-[#d4af37] pb-1.5 border-b border-[#252e42] flex items-center gap-1.5">
            <Volume2 size={14} />
            <span>AUDIO &amp; SIMULATORE ARENA</span>
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
                onClick={() => {
                  onToggleSound();
                  audio.savePreferences();
                }}
              >
                {soundEnabled ? 'Attivato' : 'Muto'}
              </RetroButton>
            </div>

            {audio.isSpeechSupported() && (
              <div className="flex items-center justify-between p-2 retro-inset">
                <div>
                  <span className="font-semibold text-white block">Telecronaca Vocale Sintetica (it-IT)</span>
                  <span className="text-[10px] text-[#94a3b8]">Voce offline del cronista durante gli agoni 2D</span>
                </div>
                <RetroButton
                  variant={voiceOn ? 'gold' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const next = !voiceOn;
                    setVoiceOn(next);
                    audio.voiceCommentaryEnabled = next;
                    if (!next) audio.stopSpeech();
                    else audio.speakCommentary('Telecronaca vocale attivata.', { priority: 'HIGH', interrupt: true, rate: 0.9 });
                    audio.savePreferences();
                  }}
                >
                  {voiceOn ? 'Voce ON' : 'Voce OFF'}
                </RetroButton>
              </div>
            )}

            {/* Ancient Greco-Roman Music */}
            <div className="p-2.5 retro-inset space-y-2 border border-[#232d3f]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Music size={13} className="text-[#d4af37]" />
                    <span>Musica dell'Antichità (Cetra, Aulo e Timpani)</span>
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">
                    Composizione modale greco-romana offline sintetizzata in tempo reale
                  </span>
                </div>
                <RetroButton
                  variant={musicOn ? 'gold' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const next = !musicOn;
                    setMusicOn(next);
                    audio.setMusicEnabled(next);
                    setMsg(next ? 'Musica Antiqua attivata.' : 'Musica Antiqua disattivata.');
                  }}
                >
                  {musicOn ? 'Musica ON' : 'Musica OFF'}
                </RetroButton>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-[#94a3b8] w-24 shrink-0">Volume Musica</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={musicVol}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setMusicVol(v);
                    audio.setMusicVolume(v / 100);
                  }}
                  className="flex-1 accent-[#d4af37] cursor-pointer"
                />
                <span className="font-data tabular-nums text-[#facc15] w-9 text-right">{musicVol}%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-0.5">
                {([
                  { id: 'AUTO', label: 'Auto' },
                  { id: 'MENU', label: 'Hymnus (Lira)' },
                  { id: 'ARENA', label: 'Cantus Arena' },
                  { id: 'TRIUMPH', label: 'Triumphus' }
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setMusicMood(opt.id);
                      audio.setMusicMoodPreference(opt.id);
                      setMsg(`Tema musicale impostato: ${opt.label}.`);
                    }}
                    className={`py-1 px-1.5 text-[10px] font-semibold rounded-xs border transition-colors cursor-pointer whitespace-nowrap truncate ${
                      musicMood === opt.id
                        ? 'bg-[#1e2738] border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#111622] border-[#232d3f] text-[#94a3b8]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Stadium Crowd Chants */}
            <div className="p-2.5 retro-inset space-y-2 border border-[#232d3f]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-white block">Cori da Stadio &amp; Boato dell'Arena</span>
                  <span className="text-[10px] text-[#94a3b8]">
                    Il coro cresce durante gli assalti a fondo campo ed esplode alla Meta
                  </span>
                </div>
                <RetroButton
                  variant={crowdOn ? 'gold' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const next = !crowdOn;
                    setCrowdOn(next);
                    audio.setCrowdEnabled(next);
                    setMsg(next ? 'Cori da stadio attivati.' : 'Cori da stadio disattivati.');
                  }}
                >
                  {crowdOn ? 'Cori ON' : 'Cori OFF'}
                </RetroButton>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-[#94a3b8] w-24 shrink-0">Volume Cori</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={crowdVol}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setCrowdVol(v);
                    audio.setCrowdVolume(v / 100);
                  }}
                  className="flex-1 accent-[#d4af37] cursor-pointer"
                />
                <span className="font-data tabular-nums text-[#facc15] w-9 text-right">{crowdVol}%</span>
              </div>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-semibold">Modalità Predefinita Arena 2D</label>
              <div className="grid grid-cols-2 gap-1">
                {(['HIGHLIGHTS', 'FULL'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      audio.playClick();
                      setSimModePref(m);
                      audio.simModePreference = m;
                      audio.savePreferences();
                      setMsg(`Modalità Arena impostata su: ${m === 'HIGHLIGHTS' ? 'Azioni Salienti' : 'Gara Intera'}.`);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
                      simModePref === m
                        ? 'bg-[#1e2738] border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#111622] border-[#232d3f] text-[#94a3b8]'
                    }`}
                  >
                    {m === 'HIGHLIGHTS' ? 'Azioni Salienti' : 'Gara Intera (50 min)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-semibold">Ritmo di Simulazione Predefinito</label>
              <div className="grid grid-cols-3 gap-1">
                {([1, 1.5, 2] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      audio.playClick();
                      setSpeedMul(s);
                      audio.simSpeedMultiplier = s;
                      audio.savePreferences();
                      setMsg(`Ritmo di simulazione salvato a ${s}x.`);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
                      speedMul === s
                        ? 'bg-[#1e2738] border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#111622] border-[#232d3f] text-[#94a3b8]'
                    }`}
                  >
                    {s === 1 ? '1x Calmo' : s === 1.5 ? '1.5x Dinamico' : '2x Rapido'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-semibold">Dettaglio Telecronaca</label>
              <div className="grid grid-cols-2 gap-1">
                {(['COMMENTO_ESTESO', 'SOLO_GOL'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => {
                      audio.playClick();
                      setDetail(d);
                      audio.commentaryDetail = d;
                      audio.savePreferences();
                      setMsg(`Dettaglio telecronaca salvato: ${d === 'COMMENTO_ESTESO' ? 'Commento Esteso' : 'Solo Mete & Salienti'}.`);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
                      detail === d
                        ? 'bg-[#1e2738] border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#111622] border-[#232d3f] text-[#94a3b8]'
                    }`}
                  >
                    {d === 'COMMENTO_ESTESO' ? 'Commento Esteso' : 'Solo Mete & Chiave'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 border-t border-[#252e42]">
              <label className="text-[#d4af37] flex items-center gap-1.5 mb-1.5 font-semibold">
                <Monitor size={13} />
                <span>Adattamento Schermo (PC &amp; Tablet 16:9)</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { id: 'AUTO', label: 'Auto 16:9' },
                  { id: 'COMPACT', label: 'Tablet Compatto' },
                  { id: 'COMFORTABLE', label: 'Desktop Ampio' }
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      audio.playClick();
                      setDisplayScale(opt.id);
                      audio.applyDisplayScale(opt.id);
                      audio.savePreferences();
                      setMsg(`Scala schermo impostata su: ${opt.label}.`);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-xs border transition-colors cursor-pointer whitespace-nowrap ${
                      displayScale === opt.id
                        ? 'bg-[#1e2738] border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#111622] border-[#232d3f] text-[#94a3b8]'
                    }`}
                  >
                    {opt.label}
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
                <div className="flex items-center gap-2">
                  <RetroButton
                    variant="danger"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2 py-2"
                    onClick={handleClearAll}
                  >
                    <Trash2 size={14} />
                    <span>{confirmDelete ? 'Conferma Eliminazione Definitiva' : 'Elimina Salvataggio Corrente'}</span>
                  </RetroButton>
                  {confirmDelete && (
                    <RetroButton
                      variant="secondary"
                      size="sm"
                      className="py-2"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Annulla
                    </RetroButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
