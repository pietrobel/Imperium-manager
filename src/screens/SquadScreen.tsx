import React, { useState } from 'react';
import type { CareerSave, Player } from '../types';
import { TacticalSlate } from '../components/TacticalSlate';
import { ArrowUpDown, Shield, Sliders, Layers } from 'lucide-react';
import { getHarpastumRole, getHarpastumCategory, getHarpastumRoleBadgeStyle, groupPlayersByHarpastum } from '../engines/harpastumEngine';
import { getFormationModifiers } from '../engines/matchSimulationEngine';

interface SquadScreenProps {
  career: CareerSave;
  onSelectPlayer: (player: Player) => void;
  onUpdateFormation: (formation: '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1' | '3-4-3' | '5-4-1' | '4-5-1') => void;
  onToggleTransferList?: (player: Player) => void;
  onSwapStarters?: (newStartersIds: string[]) => void;
}

type SortField = 'ruoloPrimario' | 'valoreGenerale' | 'eta' | 'condizione' | 'morale' | 'statisticheStagione.gol' | 'statisticheStagione.mediaVoto' | 'contratto.stipendioSettimanale';
type SquadViewMode = 'TABELLA' | 'TATTICA' | 'CATEGORIE';

export const SquadScreen: React.FC<SquadScreenProps> = ({
  career,
  onSelectPlayer,
  onUpdateFormation,
  onSwapStarters
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

  const starterIdSet = new Set<string>(
    (userClub.titolariIds && userClub.titolariIds.length >= 12
      ? userClub.titolariIds.slice(0, 12)
      : [...players].sort((a, b) => b.valoreGenerale - a.valoreGenerale).slice(0, 12).map(p => p.id))
  );

  const grouped = groupPlayersByHarpastum(players);
  const activeFormationMods = getFormationModifiers(userClub.formazioneTattica);
  const fmtPct = (m: number) => {
    const pct = Math.round((m - 1) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  };

  return (
    <div className="h-full flex flex-col gap-2.5 min-h-0 overflow-hidden">
      {/* Top Header Controls */}
      <div className="retro-box p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
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
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 shrink-0">
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
        <div className="retro-box flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10">
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
                {sortedPlayers.map(p => {
                  const hRole = getHarpastumRole(p.ruoloPrimario);
                  const badge = getHarpastumRoleBadgeStyle(p.ruoloPrimario);
                  const isStarter = starterIdSet.has(p.id);
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
                        <div>{p.contratto.stipendioSettimanale.toLocaleString()} HS</div>
                        <div className={`text-[9px] ${p.contratto.annoScadenza <= career.currentYear + 1 ? 'text-[#f59e0b] font-bold' : 'text-[#64748b]'}`}>
                          Scad. {Math.abs(p.contratto.annoScadenza)} a.C.
                        </div>
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
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 overflow-y-auto md:overflow-hidden">
            {/* CUSTODES */}
            <div className="retro-box p-3 border-t-2 border-[#ca8a04] flex flex-col min-h-0 overflow-hidden">
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
              <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
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
            <div className="retro-box p-3 border-t-2 border-[#3b82f6] flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
                  <h3 className="font-roman text-xs font-bold text-[#bfdbfe]">LOTTATORI & MURA</h3>
                </div>
                <span className="text-[10px] font-data text-[#60a5fa] font-bold">{grouped.luctatores.length}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mb-2 leading-relaxed shrink-0">
                Colossi di stazza gladiatoria per le mischie: sbarrano i varchi, atterrano gli scattisti con prese alla vita.
              </p>
              <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
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
            <div className="retro-box p-3 border-t-2 border-[#10b981] flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <h3 className="font-roman text-xs font-bold text-[#a7f3d0]">TRATTORI DI PALLA</h3>
                </div>
                <span className="text-[10px] font-data text-[#34d399] font-bold">{grouped.tractores.length}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mb-2 leading-relaxed shrink-0">
                I maestri dell'inganno: circolazione della sfera sulla linea mediana, passaggi a due mani e finte fulminee.
              </p>
              <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
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
            <div className="retro-box p-3 border-t-2 border-[#ef4444] flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#252e42] mb-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <h3 className="font-roman text-xs font-bold text-[#fecaca]">CURSORI & METE</h3>
                </div>
                <span className="text-[10px] font-data text-[#f87171] font-bold">{grouped.praevenientes.length}</span>
              </div>
              <p className="text-[10px] text-[#94a3b8] mb-2 leading-relaxed shrink-0">
                Gli scattisti d'assalto: fuggono sulla sabbia laterale e piombano a capofitto oltre la linea di fondo avversaria.
              </p>
              <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
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

      {/* 3. INTERACTIVE TACTICAL ARENA DISPOSITION */}
      {activeTab === 'TATTICA' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Active Formation Modifier Summary */}
          <div className="retro-inset px-3 py-1.5 border border-[#521016] flex flex-wrap items-center justify-between gap-2 text-[11px] shrink-0">
            <span className="font-roman font-bold text-[#d4af37]">
              MODULO ATTIVO: {userClub.formazioneTattica} · {activeFormationMods.label}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-data tabular-nums text-[#e2e8f0]">
              <span>Cursori <strong className={activeFormationMods.praevenientes >= 1 ? 'text-[#10b981]' : 'text-[#f87171]'}>{fmtPct(activeFormationMods.praevenientes)}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Trattori <strong className={activeFormationMods.tractores >= 1 ? 'text-[#10b981]' : 'text-[#f87171]'}>{fmtPct(activeFormationMods.tractores)}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Lottatori <strong className={activeFormationMods.luctatores >= 1 ? 'text-[#10b981]' : 'text-[#f87171]'}>{fmtPct(activeFormationMods.luctatores)}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Custode <strong className={activeFormationMods.custos >= 1 ? 'text-[#10b981]' : 'text-[#f87171]'}>{fmtPct(activeFormationMods.custos)}</strong></span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <TacticalSlate
              userClub={userClub}
              squad={players}
              onSwapStarters={onSwapStarters}
              onSelectPlayer={onSelectPlayer}
            />
          </div>
        </div>
      )}
    </div>
  );
};
