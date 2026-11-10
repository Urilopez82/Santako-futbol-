import React, { useState } from 'react';
import { dataService } from '../../services/dataService';
import { 
  WorldClub, 
  WorldCompetition, 
  WorldPlayer, 
  WorldStaff, 
  DetailedStadium, 
  CountryFederation 
} from '../../types/worldDatabase';
import { playClickSound } from '../../utils/audio';
import { 
  Globe2, 
  Search, 
  Trophy, 
  Shield, 
  Users, 
  MapPin, 
  Award, 
  X, 
  CheckCircle, 
  Sparkles, 
  Building, 
  Zap, 
  FileText 
} from 'lucide-react';

interface WorldDatabaseBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldDatabaseBrowser: React.FC<WorldDatabaseBrowserProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedConfederation, setSelectedConfederation] = useState<string>('TODAS');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('ESP'); // Default to España
  const [selectedClubId, setSelectedClubId] = useState<string>('fe_grama'); // Default to Santako's FE Grama
  const [inspectedPlayer, setInspectedPlayer] = useState<WorldPlayer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const countries = dataService.getCountries().filter((c) => {
    if (selectedConfederation === 'TODAS') return true;
    return c.confederation === selectedConfederation;
  });

  const selectedCountry = dataService.getCountries().find((c) => c.code === selectedCountryCode);
  const competitionsInCountry = dataService.getCompetitions().filter((comp) => comp.countryId === selectedCountryCode);

  const clubsInCountry = dataService.getClubs().filter((c) => {
    if (searchTerm.trim()) {
      return c.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
             c.city.toLowerCase().includes(searchTerm.toLowerCase().trim());
    }
    return c.countryId === selectedCountryCode;
  });

  const activeClub = dataService.getClubById(selectedClubId) || clubsInCountry[0] || dataService.getClubs()[0];
  const activeStadium = activeClub ? dataService.getStadiumById(activeClub.stadiumId) : null;
  const clubPlayers = activeClub ? dataService.getPlayersByClub(activeClub.id) : [];
  const clubStaff = activeClub ? dataService.getStaffByClub(activeClub.id) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-condensed tracking-wide uppercase">
                Enciclopedia Mundial & Base de Datos Futbolística
              </h2>
              <p className="text-xs text-slate-400">
                Consulta países, federaciones, estructuras de división, clubes, estadios y fichas técnicas detalladas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confederation & Country Filters Toolbar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Confederation Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['TODAS', 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'].map((conf) => (
              <button
                key={conf}
                onClick={() => {
                  playClickSound();
                  setSelectedConfederation(conf);
                }}
                className={`px-3 py-1 font-bold rounded-lg transition-colors text-[11px] font-condensed uppercase tracking-wider ${
                  selectedConfederation === conf
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {conf}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar club o ciudad..."
              className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-sky-500 w-full"
            />
          </div>
        </div>

        {/* Countries Strip */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          {countries.map((country) => (
            <button
              key={country.id}
              onClick={() => {
                playClickSound();
                setSelectedCountryCode(country.code);
                setSearchTerm('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                selectedCountryCode === country.code
                  ? 'bg-slate-800 border border-sky-500/50 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span className="text-sm">{country.flag}</span>
              <span className="font-semibold">{country.name}</span>
              <span className="text-[10px] text-slate-500 font-mono-num">#{country.fifaRanking}</span>
            </button>
          ))}
        </div>

        {/* Main Content: Left Column (Clubs list) + Right Column (Club / Player dossier) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Clubs List & Country Competitions (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-800 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
            {/* Country Federation Info */}
            {selectedCountry && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{selectedCountry.federationName}</span>
                  <span className="text-slate-500 text-[10px]">Fundada {selectedCountry.foundedYear}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Afiliada a FIFA en {selectedCountry.fifaAffiliationYear} · Ranking FIFA: #{selectedCountry.fifaRanking}
                </div>
              </div>
            )}

            {/* Pyramid Competitions in country */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2 font-condensed">
                Estructura de Competiciones ({competitionsInCountry.length})
              </span>
              <div className="space-y-1.5">
                {competitionsInCountry.map((comp) => (
                  <div key={comp.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-slate-100">{comp.shortName}</span>
                      <span className="text-[10px] font-mono-num text-sky-400 font-bold bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-500/20">
                        Nivel {comp.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{comp.formatDescription}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clubs in Category */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2 font-condensed">
                Clubes Documentados ({clubsInCountry.length})
              </span>
              <div className="space-y-1.5">
                {clubsInCountry.map((club) => {
                  const isSelected = activeClub?.id === club.id;
                  const isSantako = club.id === 'fe_grama' || club.id === 'uda_gramenet';

                  return (
                    <div
                      key={club.id}
                      onClick={() => {
                        playClickSound();
                        setSelectedClubId(club.id);
                        setInspectedPlayer(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-sky-500 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-condensed shrink-0 shadow-sm"
                            style={{
                              backgroundColor: club.primaryColor,
                              color: club.textColor,
                              border: `1.5px solid ${club.secondaryColor}`,
                            }}
                          >
                            {club.code}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-slate-100 text-xs truncate block">{club.name}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{club.city} · Fundado {club.foundedYear}</span>
                          </div>
                        </div>

                        {isSantako && (
                          <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0">
                            SANTAKO
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Dossier (Club, Stadium, Staff, Squad) (8 cols) */}
          <div className="lg:col-span-8 overflow-y-auto p-6 space-y-6">
            {activeClub ? (
              <div className="space-y-6">
                {/* Club Header Dossier */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl font-condensed shadow-lg"
                        style={{
                          backgroundColor: activeClub.primaryColor,
                          color: activeClub.textColor,
                          border: `3px solid ${activeClub.secondaryColor}`,
                        }}
                      >
                        {activeClub.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-slate-100 font-condensed uppercase tracking-wide">
                            {activeClub.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400">
                          {activeClub.officialName} · Ciudad de {activeClub.city} · Fundado en {activeClub.foundedYear}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono-num text-xs shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase block">Presupuesto Anual Estimado</span>
                      <span className="text-base font-bold text-emerald-400">
                        {activeClub.finances.estimatedBudgetAnnual.toLocaleString()} €
                      </span>
                    </div>
                  </div>

                  {/* Kits Showcase */}
                  <div className="mt-4 pt-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-3">
                      <div
                        className="w-9 h-11 rounded border border-white/20 shadow flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: activeClub.kits.home.primaryColor, color: '#fff' }}
                      >
                        1ª
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-200 block text-[11px]">Equipación Local</span>
                        <span className="text-[10px] text-slate-400 font-mono-num">
                          {activeClub.kits.home.pattern}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-3">
                      <div
                        className="w-9 h-11 rounded border border-white/20 shadow flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: activeClub.kits.away.primaryColor, color: '#fff' }}
                      >
                        2ª
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-200 block text-[11px]">Equipación Visitante</span>
                        <span className="text-[10px] text-slate-400 font-mono-num">
                          {activeClub.kits.away.pattern}
                        </span>
                      </div>
                    </div>

                    {activeStadium && (
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-2.5">
                        <Building className="w-5 h-5 text-sky-400 shrink-0" />
                        <div className="text-xs min-w-0">
                          <span className="font-semibold text-slate-200 block text-[11px] truncate">
                            {activeStadium.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono-num">
                            {activeStadium.capacity.toLocaleString()} esp. · {activeStadium.surfaceType}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rivalries & Palmares */}
                  {activeClub.rivalries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 text-[11px]">Rivalidades Clásicas:</span>
                      {activeClub.rivalries.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/30 text-rose-300 text-[11px]">
                          {r.derbyName} (vs {r.rivalClubName})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coaching Staff */}
                {clubStaff.length > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider block mb-3">
                      Cuerpo Técnico & Estructura del Club ({clubStaff.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {clubStaff.map((staff) => (
                        <div key={staff.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide block">
                              {staff.role.replace('_', ' ')}
                            </span>
                            <span className="font-bold text-slate-100 text-sm">{staff.name}</span>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {staff.tacticalPhilosophy || staff.coachingStyle}
                            </p>
                          </div>
                          <span className="text-xs font-bold font-mono-num text-amber-400 bg-slate-950 px-2 py-0.5 rounded">
                            {staff.reputation} Rep.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Squad Roster Table */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider">
                      Fichas Individuales de Jugadores ({clubPlayers.length})
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Haz clic en un jugador para examinar sus 28+ atributos y procedencia
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono-num">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                          <th className="py-2 px-2">Dorsal</th>
                          <th className="py-2 px-2">Pos</th>
                          <th className="py-2 px-3 font-sans">Nombre Completo</th>
                          <th className="py-2 px-2 text-center">Edad</th>
                          <th className="py-2 px-2 text-center">CA</th>
                          <th className="py-2 px-2 text-center">PA</th>
                          <th className="py-2 px-3 text-right">Valor Mercado</th>
                          <th className="py-2 px-3 font-sans text-center">Fuente</th>
                          <th className="py-2 px-2 text-center">Ficha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {clubPlayers.map((player) => (
                          <tr key={player.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-2 text-slate-400">#{player.squadNumber}</td>
                            <td className="py-2.5 px-2 font-bold text-slate-200">{player.primaryPosition}</td>
                            <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">
                              {player.fullName}
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{player.age}</td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded">
                                {player.currentAbility}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <span className="font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded">
                                {player.potentialAbility}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-200">
                              {player.marketValue.toLocaleString()} €
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  player.isOfficialSource
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {player.isOfficialSource ? 'OFICIAL' : 'ESTIMADO'}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setInspectedPlayer(player);
                                }}
                                className="px-2.5 py-0.5 text-xs font-semibold text-sky-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                              >
                                Examinar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-sm">
                Selecciona un club en la columna izquierda para visualizar su información detallada.
              </div>
            )}
          </div>
        </div>

        {/* Player Technical Attribute Modal */}
        {inspectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-lg font-condensed">
                    {inspectedPlayer.primaryPosition}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {inspectedPlayer.fullName} #{inspectedPlayer.squadNumber}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {inspectedPlayer.age} años · {inspectedPlayer.heightCm} cm · Pie dominante: {inspectedPlayer.preferredFoot}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono-num">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Habilidad Actual (CA)</span>
                    <span className="text-2xl font-black text-emerald-400">{inspectedPlayer.currentAbility}</span>
                  </div>
                  <div className="text-right border-l border-slate-800 pl-3">
                    <span className="text-[10px] text-slate-400 uppercase block">Potencial Máx (PA)</span>
                    <span className="text-2xl font-black text-sky-400">{inspectedPlayer.potentialAbility}</span>
                  </div>
                </div>
              </div>

              {/* Source attribution callout */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Fuente del Registro: </span>
                  <strong className="text-slate-200">{inspectedPlayer.sourceName}</strong>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    inspectedPlayer.isOfficialSource
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {inspectedPlayer.isOfficialSource ? 'Verificado en fuente federativa' : 'Estimación de motor de juego'}
                </span>
              </div>

              {/* Granular Attributes Breakdown */}
              <div className="space-y-4">
                {/* Físicos */}
                <div>
                  <span className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider block mb-2">
                    Atributos Físicos
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono-num">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Velocidad:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.velocidad}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Aceleración:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.aceleracion}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Resistencia:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.resistencia}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Fuerza:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.fuerza}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Salto:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.salto}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Agilidad:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.agilidad}</strong>
                    </div>
                  </div>
                </div>

                {/* Técnicos */}
                <div>
                  <span className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider block mb-2">
                    Atributos Técnicos
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-num">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Técnica:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.tecnica}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Control Balón:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.controlBalon}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Pase Corto:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.paseCorto}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Pase Largo:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.paseLargo}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Centros:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.centros}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Regate:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.regate}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Remate:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.remate}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Potencia Tiro:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.potenciaDisparo}</strong>
                    </div>
                  </div>
                </div>

                {/* Mentales y Tácticos */}
                <div>
                  <span className="text-xs font-bold text-slate-300 font-condensed uppercase tracking-wider block mb-2">
                    Atributos Mentales & Tácticos
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-num">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Visión:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.vision}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Creatividad:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.creatividad}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Decisiones:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.decisiones}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Colocación:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.colocacion}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Marcaje:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.marcaje}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Entradas:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.entradas}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Liderazgo:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.liderazgo}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Compostura:</span>
                      <strong className="text-slate-100">{inspectedPlayer.attributes.compostura}</strong>
                    </div>
                  </div>
                </div>

                {/* Portero si aplica */}
                {inspectedPlayer.primaryPosition === 'POR' && (
                  <div>
                    <span className="text-xs font-bold text-amber-300 font-condensed uppercase tracking-wider block mb-2">
                      Atributos Específicos de Portero
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-num">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Reflejos:</span>
                        <strong className="text-emerald-400">{inspectedPlayer.attributes.porteroReflejos}</strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Blocaje:</span>
                        <strong className="text-emerald-400">{inspectedPlayer.attributes.porteroBlocaje}</strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Estirada:</span>
                        <strong className="text-emerald-400">{inspectedPlayer.attributes.porteroEstirada}</strong>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Uno contra Uno:</span>
                        <strong className="text-emerald-400">{inspectedPlayer.attributes.porteroUnoContraUno}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setInspectedPlayer(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Volver al Club
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
