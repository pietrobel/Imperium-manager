import React, { useState } from 'react';
import type { CareerSave, Player } from '../types';
import { RetroButton } from '../components/RetroButton';
import { ArrowUpDown, Shield, Sliders, Layers, UserCheck } from 'lucide-react';
import { getHarpastumRole, getHarpastumCategory, getHarpastumRoleBadgeStyle, groupPlayersByHarpastum } from '../engines/harpastumEngine';

interface SquadScreenProps {
  career: CareerSave;
  onSelectPlayer: (player: Player) => void;
  onUpdateFormation: (formation: '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1' | '3-4-3' | '5-4-1' | '4-5-1') => void;
  onToggleTransferList?: (player: Player) => void;
}

type SortField = 'ruoloPrimario' | 'valoreGenerale' | 'eta' | 'condizione' | 'morale' | 'statisticheStagione.gol' | 'statisticheStagione.mediaVoto' | 'contratto.stipendioSettimanale';
type SquadViewMode = 'TABELLA' | 'TATTICA' | 'CATEGORIE';

export const SquadScreen: React.FC<SquadScreenProps> = ({
  career,
  onSelectPlayer,
  onUpdateFormation,
  onToggleTransferList
}) => {
  const userClub = career.clubs[career.userClubId];
  const players = Object.values(career.players).filter(p => p.clubId === career.userClubId);

  const [sortField, setSortField] = useState<SortField>('valoreGenerale');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SquadViewMode>('TABELLA');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CUSTOS' | 'LUCTATOR' | 'TRACTOR' | 'PRAEVENIENS'>('ALL');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredPlayers = players.filter(p => {
    if (categoryFilter === 'ALL') return true;
    return getHarpastumCategory(p) === categoryFilter;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let valA: any = a[sortField as keyof Player];
    let valB: any = b[sortField as keyof Player];

    if (sortField === 'statisticheStagione.gol') {
      valA = a.statisticheStagione.gol;
      valB = b.statisticheStagione.gol;
    } else if (sortField === 'statisticheStagione.mediaVoto') {
      valA = a.statisticheStagione.mediaVoto;
      valB = b.statisticheStagione.mediaVoto;
    } else if (sortField === 'contratto.stipendioSettimanale') {
      valA = a.contratto.stipendioSettimanale;
      valB = b.contratto.stipendioSettimanale;
    }

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const allSortedForTactics = [...players].sort((a, b) => b.valoreGenerale - a.valoreGenerale);
  const starters = allSortedForTactics.slice(0, 12);
  const bench = allSortedForTactics.slice(12);

  const grouped = groupPlayersByHarpastum(players);

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="retro-box p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-[#d4af37]" />
          <div>
            <h1 className="font-roman text-sm font-bold text-white tracking-wide">
              COORTE HARPASTICA & DISPOSIZIONE NELL'ARENA · {userClub.nome.toUpperCase()}
            </h1>
            <div className="text-[10px] text-[#94a3b8] flex items-center gap-2">
              <span>{players.length} Atleti Registrati</span>
              <span>·</span>
              <span>12 Titolari in Campo (Duodecim Primarii)</span>
              <span>·</span>
              <span>Rotazione Libera con Rientro</span>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#0a0d14] p-0.5 border border-[#232d3f] rounded-xs text-xs font-roman">
            <button
              onClick={() => setActiveTab('TABELLA')}
              className={`px-3 py-1 font-medium rounded-xs transition-colors cursor-pointer ${
                activeTab === 'TABELLA' ? 'bg-[#1e2738] text-[#d4af37] font-bold' : 'text-[#94a3b8]'
              }`}
            >
              Ruoli & Tabella ({players.length})
            </button>
            <button
              onClick={() => setActiveTab('CATEGORIE')}
              className={`px-3 py-1 font-medium rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'CATEGORIE' ? 'bg-[#1e2738] text-[#d4af37] font-bold' : 'text-[#94a3b8]'
              }`}
            >
              <Layers size={12} />
              <span>Divisione per Ruoli</span>
            </button>
            <button
              onClick={() => setActiveTab('TATTICA')}
              className={`px-3 py-1 font-medium rounded-xs transition-colors cursor-pointer ${
                activeTab === 'TATTICA' ? 'bg-[#1e2738] text-[#d4af37] font-bold' : 'text-[#94a3b8]'
              }`}
            >
              Schieramento Arena
            </button>
          </div>

          {/* Formation Picker */}
          <div className="flex items-center gap-1.5 ml-1">
            <Sliders size={14} className="text-[#94a3b8]" />
            <select
              value={userClub.formazioneTattica}
              onChange={e => onUpdateFormation(e.target.value as any)}
              className="bg-[#111622] border border-[#232d3f] text-white text-xs px-2 py-1 rounded-xs outline-none focus:border-[#d4af37] cursor-pointer font-roman"
            >
              <option value="4-4-2">4-4-2 Manipolo Bilanciato</option>
              <option value="4-3-3">4-3-3 Tridente d'Assalto</option>
              <option value="3-5-2">3-5-2 Falange dei Trattori</option>
              <option value="5-3-2">5-3-2 Vallo dei Lottatori</option>
              <option value="4-2-3-1">4-2-3-1 Coorte Tattica</option>
              <option value="3-4-3">3-4-3 Sfondamento Totale</option>
              <option value="5-4-1">5-4-1 Testuggine Romana</option>
              <option value="4-5-1">4-5-1 Sbarramento Mediano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role Filter Pills (in Tabella mode) */}
      {activeTab === 'TABELLA' && (
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1">
          <span className="font-roman text-[10px] text-[#64748b] uppercase mr-1">Filtro Ruolo Harpastum:</span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-xs font-roman text-[11px] cursor-pointer transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-[#d4af37] text-[#0a0d14] font-bold'
                : 'bg-[#111622] text-[#94a3b8] hover:text-white border border-[#232d3f]'
            }`}
          >
            Tutti ({players.length})
          </button>
          <button
            onClick={() => setCategoryFilter('CUSTOS')}
            className={`px-2.5 py-1 rounded-xs font-roman text-[11px] cursor-pointer transition-colors ${
              categoryFilter === 'CUSTOS'
                ? 'bg-[#ca8a04] text-white font-bold'
                : 'bg-[#111622] text-[#eab308] hover:text-white border border-[#232d3f]'
            }`}
          >
            Custodi ({grouped.custodes.length})
          </button>
          <button
            onClick={() => setCategoryFilter('LUCTATOR')}
            className={`px-2.5 py-1 rounded-xs font-roman text-[11px] cursor-pointer transition-colors ${
              categoryFilter === 'LUCTATOR'
                ? 'bg-[#2563eb] text-white font-bold'
                : 'bg-[#111622] text-[#60a5fa] hover:text-white border border-[#232d3f]'
            }`}
          >
            Lottatori ({grouped.luctatores.length})
          </button>
          <button
            onClick={() => setCategoryFilter('TRACTOR')}
            className={`px-2.5 py-1 rounded-xs font-roman text-[11px] cursor-pointer transition-colors ${
              categoryFilter === 'TRACTOR'
                ? 'bg-[#059669] text-white font-bold'
                : 'bg-[#111622] text-[#34d399] hover:text-white border border-[#232d3f]'
            }`}
          >
            Trattori ({grouped.tractores.length})
          </button>
          <button
            onClick={() => setCategoryFilter('PRAEVENIENS')}
            className={`px-2.5 py-1 rounded-xs font-roman text-[11px] cursor-pointer transition-colors ${
              categoryFilter === 'PRAEVENIENS'
                ? 'bg-[#dc2626] text-white font-bold'
                : 'bg-[#111622] text-[#f87171] hover:text-white border border-[#232d3f]'
            }`}
          >
            Cursori / Scattisti ({grouped.praevenientes.length})
          </button>
        </div>
      )}

      {/* 1. DENSE MANAGERIAL SQUAD TABLE */}
      {activeTab === 'TABELLA' && (
        <div className="retro-box overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="retro-panel-header text-[10px] text-[#94a3b8] uppercase font-roman border-b border-[#252e42] select-none">
                  <th className="py-2 px-3 w-16 text-center">RUOLO</th>
                  <th className="py-2 px-3">ATLETA D'HARPASTUM</th>
                  <th
                    className="py-2 px-2 text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort('eta')}
                  >
                    <span className="inline-flex items-center gap-1">
                      ETÀ <ArrowUpDown size={10} />
                    </span>
                  </th>
                  <th className="py-2 px-2">ORIGINE</th>
                  <th
                    className="py-2 px-2 text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort('valoreGenerale')}
                  >
                    <span className="inline-flex items-center gap-1">
                      OVR <ArrowUpDown size={10} />
                    </span>
                  </th>
                  <th
                    className="py-2 px-2 text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort('condizione')}
                  >
                    <span className="inline-flex items-center gap-1">
                      COND <ArrowUpDown size={10} />
                    </span>
                  </th>
                  <th
                    className="py-2 px-2 text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort('morale')}
                  >
                    <span className="inline-flex items-center gap-1">
                      MOR <ArrowUpDown size={10} />
                    </span>
                  </th>
                  <th className="py-2 px-2 text-center">AGONE</th>
                  <th
                    className="py-2 px-2 text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort('statisticheStagione.gol')}
                  >
                    <span className="inline-flex items-center gap-1">
                      METE <ArrowUpDown size={10} />
                    </span>
                  </th>
                  <th
                    className="py-2 px-2 text-center cursor-pointer hover:text-white"
                    onClick={() => handleSort('statisticheStagione.mediaVoto')}
                  >
                    <span className="inline-flex items-center gap-1">
                      VOTO <ArrowUpDown size={10} />
                    </span>
                  </th>
                  <th
                    className="py-2 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort('contratto.stipendioSettimanale')}
                  >
                    <span className="inline-flex items-center gap-1">
                      INGAGGIO (HS) <ArrowUpDown size={10} />
                    </span>
                  </th>
                  <th className="py-2 px-3 text-center">STATO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182030] font-data text-xs">
                {sortedPlayers.map((p, idx) => {
                  const hRole = getHarpastumRole(p.ruoloPrimario);
                  const badge = getHarpastumRoleBadgeStyle(p.ruoloPrimario);
                  const isStarter = idx < 11;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="hover:bg-[#1b2334] transition-colors cursor-pointer group"
                    >
                      <td className="py-2 px-3 text-center">
                        <span
                          title={hRole.latinName + ' - ' + hRole.italianName}
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <div className="font-semibold text-[#f1f5f9] group-hover:text-[#d4af37]">
                          {p.nome} {p.cognome}
                          {p.soprannome && (
                            <span className="text-[10px] text-[#94a3b8] italic ml-1.5">
                              "{p.soprannome}"
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#64748b] font-roman">
                          {hRole.latinName}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-[#cbd5e1]">{p.eta}</td>
                      <td className="py-2 px-2 text-[#94a3b8] font-sans text-[11px]">{p.nazionalita}</td>
                      <td className="py-2 px-2 text-center font-bold text-[#d4af37] text-sm">
                        {p.valoreGenerale}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`font-semibold ${
                            p.condizione > 85
                              ? 'text-[#10b981]'
                              : p.condizione > 70
                              ? 'text-[#f59e0b]'
                              : 'text-[#ef4444]'
                          }`}
                        >
                          {p.condizione}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`font-semibold ${
                            p.morale > 80
                              ? 'text-[#10b981]'
                              : p.morale > 50
                              ? 'text-[#f59e0b]'
                              : 'text-[#ef4444]'
                          }`}
                        >
                          {p.morale}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-[#cbd5e1]">
                        {p.statisticheStagione.presenze}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-[#facc15]">
                        {p.statisticheStagione.gol}
                      </td>
                      <td className="py-2 px-2 text-center text-[#38bdf8]">
                        {p.statisticheStagione.mediaVoto > 0 ? p.statisticheStagione.mediaVoto.toFixed(1) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-[#94a3b8]">
                        {p.contratto.stipendioSettimanale.toLocaleString()} HS
                      </td>
                      <td className="py-2 px-3 text-center">
                        {p.infortunato ? (
                          <span className="px-1.5 py-0.5 bg-[#450a0a] text-[#f87171] rounded-xs text-[10px] font-bold">
                            INF ({p.giorniInfortunio} gg)
                          </span>
                        ) : p.squalificato ? (
                          <span className="px-1.5 py-0.5 bg-[#422006] text-[#facc15] rounded-xs text-[10px] font-bold">
                            SQUAL
                          </span>
                        ) : p.inListaTrasferimenti ? (
                          <span className="px-1.5 py-0.5 bg-[#172554] text-[#93c5fd] rounded-xs text-[10px]">
                            MERCATO
                          </span>
                        ) : isStarter ? (
                          <span className="px-1.5 py-0.5 bg-[#064e3b] text-[#6ee7b7] rounded-xs text-[10px] font-bold">
                            TITOLARE
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#64748b]">RISERVA</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. DIVISIONE DETTAGLIATA PER RUOLI HARPASTUM */}
      {activeTab === 'CATEGORIE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CUSTODES */}
            <div className="retro-box p-3 border-t-2 border-[#ca8a04]">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ca8a04]" />
                  <h3 className="font-roman text-xs font-bold text-[#fef08a]">CUSTODI DELLA LINEA</h3>
                </div>
                <span className="text-[10px] font-data text-[#d4af37] font-bold">{grouped.custodes.length}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mb-3 leading-relaxed">
                Ultimo baluardo prima del varco di fondo: intercettano al volo i lanci e placcano in tuffo disperato.
              </p>
              <div className="space-y-1.5">
                {grouped.custodes.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlayer(p)}
                    className="w-full text-left p-2 retro-inset hover:bg-[#1b2333] transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white">{p.nome} {p.cognome}</div>
                      <div className="text-[9px] text-[#64748b]">{p.eta} anni · {p.nazionalita}</div>
                    </div>
                    <span className="font-data font-bold text-[#facc15]">{p.valoreGenerale}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LUCTATORES */}
            <div className="retro-box p-3 border-t-2 border-[#3b82f6]">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                  <h3 className="font-roman text-xs font-bold text-[#bfdbfe]">LOTTATORI & MURA</h3>
                </div>
                <span className="text-[10px] font-data text-[#60a5fa] font-bold">{grouped.luctatores.length}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mb-3 leading-relaxed">
                Colossi di stazza gladiatoria per le mischie: sbarrano i varchi, atterrano gli scattisti con prese alla vita.
              </p>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {grouped.luctatores.map(p => {
                  const role = getHarpastumRole(p.ruoloPrimario);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="w-full text-left p-2 retro-inset hover:bg-[#1b2333] transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{p.nome} {p.cognome}</span>
                          <span className="text-[9px] text-[#93c5fd] font-roman">[{role.code.replace('LUC_', '')}]</span>
                        </div>
                        <div className="text-[9px] text-[#64748b]">{p.eta} anni · For: {p.attributi.forza}</div>
                      </div>
                      <span className="font-data font-bold text-[#d4af37]">{p.valoreGenerale}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TRACTORES */}
            <div className="retro-box p-3 border-t-2 border-[#10b981]">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <h3 className="font-roman text-xs font-bold text-[#a7f3d0]">TRATTORI DI PALLA</h3>
                </div>
                <span className="text-[10px] font-data text-[#34d399] font-bold">{grouped.tractores.length}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mb-3 leading-relaxed">
                I maestri dell'inganno: circolazione della sfera sulla linea mediana, passaggi a due mani e finte fulminee.
              </p>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {grouped.tractores.map(p => {
                  const role = getHarpastumRole(p.ruoloPrimario);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="w-full text-left p-2 retro-inset hover:bg-[#1b2333] transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{p.nome} {p.cognome}</span>
                          <span className="text-[9px] text-[#6ee7b7] font-roman">[{role.code.replace('TRAC_', '')}]</span>
                        </div>
                        <div className="text-[9px] text-[#64748b]">{p.eta} anni · Tec: {p.attributi.passaggio}</div>
                      </div>
                      <span className="font-data font-bold text-[#d4af37]">{p.valoreGenerale}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRAEVENIENTES */}
            <div className="retro-box p-3 border-t-2 border-[#ef4444]">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <h3 className="font-roman text-xs font-bold text-[#fecaca]">CURSORI & METE</h3>
                </div>
                <span className="text-[10px] font-data text-[#f87171] font-bold">{grouped.praevenientes.length}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mb-3 leading-relaxed">
                Gli scattisti d'assalto: fuggono sulla sabbia laterale e piombano a capofitto oltre la linea di fondo avversaria.
              </p>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {grouped.praevenientes.map(p => {
                  const role = getHarpastumRole(p.ruoloPrimario);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="w-full text-left p-2 retro-inset hover:bg-[#1b2333] transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{p.nome} {p.cognome}</span>
                          <span className="text-[9px] text-[#fca5a5] font-roman">[{role.code.replace('PRAEV_', '')}]</span>
                        </div>
                        <div className="text-[9px] text-[#64748b]">Mete: {p.statisticheStagione.gol} · Vel: {p.attributi.velocita}</div>
                      </div>
                      <span className="font-data font-bold text-[#facc15]">{p.valoreGenerale}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TACTICAL ARENA DISPOSITION (ARENA SAND PITCH) */}
      {activeTab === 'TATTICA' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Harpastum Arena Graphic */}
          <div className="lg:col-span-2 retro-box p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-[#252e42] mb-3">
              <span className="font-roman font-bold text-[#d4af37]">
                ARENA SABBIOSA D'HARPASTUM · DISPOSIZIONE DEI TRIBUNI
              </span>
              <span className="text-[#94a3b8] font-data">{userClub.formazioneTattica}</span>
            </div>

            {/* The Roman Harpastum Arena Graphic */}
            <div className="w-full max-w-lg aspect-3/4 bg-[#78350f]/75 border-4 border-[#92400e] rounded-sm relative p-4 flex flex-col justify-between overflow-hidden shadow-2xl">
              {/* Sandy texture lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              {/* Linea Castrense Opposita (Meta Avversaria - top) */}
              <div className="absolute inset-x-4 top-2 h-0.5 bg-[#fef08a] border-t-2 border-dashed border-[#facc15]" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-roman text-[#fef08a] uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-xs">
                LINEA DI META AVVERSARIA (Castra Capta)
              </div>

              {/* Mesê Grammê (Linea Mediana di Partenza) */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[#d4af37]/60" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-[#d4af37]/50 flex items-center justify-center">
                <span className="text-[8px] font-roman text-[#fef08a]/70 tracking-widest uppercase">
                  Mesê Grammê
                </span>
              </div>

              {/* Linea Castrense Propria (Meta Amica - bottom) */}
              <div className="absolute inset-x-4 bottom-2 h-0.5 bg-[#fef08a] border-b-2 border-dashed border-[#facc15]" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-roman text-[#fef08a] uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-xs">
                LINEA DI FONDO DIFESA DALLA COORTE
              </div>

              {/* Starters distributed on the Harpastum Arena */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between py-6 text-center">
                {/* 1. Praevenientes / Cursori (Top / Incursione) */}
                <div className="flex justify-around items-center">
                  {starters
                    .filter(p => getHarpastumCategory(p) === 'PRAEVENIENS')
                    .map(p => {
                      const role = getHarpastumRole(p.ruoloPrimario);
                      return (
                        <button
                          key={p.id}
                          onClick={() => onSelectPlayer(p)}
                          className="bg-[#111827]/95 border-2 border-[#ef4444] px-2.5 py-1.5 rounded-xs shadow-lg hover:scale-105 transition-transform text-center cursor-pointer"
                        >
                          <div className="text-[9px] font-black text-[#fca5a5] font-roman">
                            {role.code.replace('PRAEV_', 'CUR-')}
                          </div>
                          <div className="text-[11px] font-bold text-white truncate max-w-[90px]">{p.cognome}</div>
                          <div className="text-[9px] font-data text-[#facc15]">{p.valoreGenerale} OVR</div>
                        </button>
                      );
                    })}
                </div>

                {/* 2. Tractores / Trattori (Center / Mesê Grammê) */}
                <div className="flex justify-around items-center">
                  {starters
                    .filter(p => getHarpastumCategory(p) === 'TRACTOR')
                    .map(p => {
                      const role = getHarpastumRole(p.ruoloPrimario);
                      return (
                        <button
                          key={p.id}
                          onClick={() => onSelectPlayer(p)}
                          className="bg-[#111827]/95 border-2 border-[#10b981] px-2.5 py-1.5 rounded-xs shadow-lg hover:scale-105 transition-transform text-center cursor-pointer"
                        >
                          <div className="text-[9px] font-black text-[#6ee7b7] font-roman">
                            {role.code.replace('TRAC_', 'TRA-')}
                          </div>
                          <div className="text-[11px] font-bold text-white truncate max-w-[90px]">{p.cognome}</div>
                          <div className="text-[9px] font-data text-[#34d399]">{p.valoreGenerale} OVR</div>
                        </button>
                      );
                    })}
                </div>

                {/* 3. Luctatores / Lottatori (Bottom-Center / Trincea) */}
                <div className="flex justify-around items-center">
                  {starters
                    .filter(p => getHarpastumCategory(p) === 'LUCTATOR')
                    .map(p => {
                      const role = getHarpastumRole(p.ruoloPrimario);
                      return (
                        <button
                          key={p.id}
                          onClick={() => onSelectPlayer(p)}
                          className="bg-[#111827]/95 border-2 border-[#3b82f6] px-2.5 py-1.5 rounded-xs shadow-lg hover:scale-105 transition-transform text-center cursor-pointer"
                        >
                          <div className="text-[9px] font-black text-[#93c5fd] font-roman">
                            {role.code.replace('LUC_', 'LUC-')}
                          </div>
                          <div className="text-[11px] font-bold text-white truncate max-w-[90px]">{p.cognome}</div>
                          <div className="text-[9px] font-data text-[#60a5fa]">{p.valoreGenerale} OVR</div>
                        </button>
                      );
                    })}
                </div>

                {/* 4. Custos / Custode (Bottom / Ultimo Baluardo) */}
                <div className="flex justify-center items-center">
                  {starters
                    .filter(p => getHarpastumCategory(p) === 'CUSTOS')
                    .map(p => (
                      <button
                        key={p.id}
                        onClick={() => onSelectPlayer(p)}
                        className="bg-[#111827]/95 border-2 border-[#eab308] px-4 py-1.5 rounded-xs shadow-lg hover:scale-105 transition-transform text-center cursor-pointer"
                      >
                        <div className="text-[10px] font-black text-[#fef08a] font-roman">CUSTOS</div>
                        <div className="text-[11px] font-bold text-white">{p.cognome}</div>
                        <div className="text-[9px] font-data text-[#facc15]">{p.valoreGenerale} OVR</div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Harpastum Tactical Codex & Sub Bench */}
          <div className="retro-box p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-[#252e42] mb-3">
                <UserCheck size={16} className="text-[#d4af37]" />
                <h3 className="font-roman text-xs font-bold text-white">RESERVE & SOSTITUTI D'ARENA</h3>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {bench.map(p => {
                  const role = getHarpastumRole(p.ruoloPrimario);
                  const badge = getHarpastumRoleBadgeStyle(p.ruoloPrimario);
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlayer(p)}
                      className="w-full text-left p-2 retro-inset hover:bg-[#1b2334] transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{p.nome} {p.cognome}</div>
                          <div className="text-[9px] text-[#64748b]">{role.italianName}</div>
                        </div>
                      </div>
                      <span className="font-data font-bold text-[#d4af37]">{p.valoreGenerale} OVR</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tactical Codex Note */}
            <div className="retro-inset p-3 text-[11px] text-[#94a3b8] leading-relaxed">
              <span className="font-roman text-[#d4af37] font-bold block mb-1">DOTTRINA HARPASTICA</span>
              I lottatori assorbono la carica avversaria, mentre i trattori smistano la piccola sfera con passaggi a due mani prima dell'assalto finale dei cursori.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
