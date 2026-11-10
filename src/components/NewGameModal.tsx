import React, { useState, useEffect } from 'react';
import { generateInitialDatabase } from '../db/initialDatabase';
import { WORLD_COUNTRIES } from '../db/worldData/countries';
import { evaluateClubEligibility, generateInitialContract } from '../engine/managerCareerEngine';
import { ensureAllNationalTeamsPools } from '../engine/nationalTeamsEngine';
import { saveGame } from '../storage/indexedDB';
import { GameSave, Manager, ManagerContract, ManagerLicense } from '../types/game';
import { playClickSound, playGoalSound } from '../utils/audio';
import { 
  Trophy, 
  User, 
  Shield, 
  MapPin, 
  Users, 
  Coins, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  Lock, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  X 
} from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: (save: GameSave) => void;
}

const AVATAR_OPTIONS = [
  { id: 'av_tactical_suit', label: 'Traje Táctico Formal', icon: '👔', desc: 'Elegancia y presencia seria en la banda' },
  { id: 'av_tracksuit_barro', label: 'Chándal de Barro', icon: '🧢', desc: 'Metido en el barro y pegado a la línea de cal' },
  { id: 'av_young_strategist', label: 'Joven con Libreta', icon: '📋', desc: 'Moderno, metódico y analista tecnológico' },
  { id: 'av_veteran_grey', label: 'Veterano de Pelo Cano', icon: '🧔', desc: 'Años de oficio y curtido en mil batallas' },
  { id: 'av_raincoat_scot', label: 'Gabardina Clásica', icon: '🧥', desc: 'Estilo clásico británico bajo los focos' },
  { id: 'av_energetic_coach', label: 'Míster Enérgico', icon: '⚡', desc: 'Pura pasión y motivación gestual' },
];

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onGameCreated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. Manager Identity & Personal Data
  const [firstName, setFirstName] = useState('Oriol');
  const [lastName, setLastName] = useState('López');
  const [birthDate, setBirthDate] = useState('1988-06-12');
  const [birthCity, setBirthCity] = useState('Santa Coloma de Gramenet');
  const [nationality, setNationality] = useState('España');
  const [secondNationality, setSecondNationality] = useState('');
  const [avatarId, setAvatarId] = useState('av_tracksuit_barro');

  // Languages & Education
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Español', 'Catalán']);
  const [footballEducation, setFootballEducation] = useState('Escuela de Entrenadores RFEF & Graduado en CAFE (INEF)');
  const [license, setLicense] = useState<ManagerLicense>('Licencia UEFA B');
  const [experienceLevel, setExperienceLevel] = useState('Fútbol formativo juvenil y liga territorial');
  const [philosophy, setPhilosophy] = useState('Juego de posición y salida limpia');
  const [preferredFormation, setPreferredFormation] = useState('4-3-3');
  const [specialties, setSpecialties] = useState<string[]>(['Desarrollo de Cantera', 'Motivación']);
  const [personality, setPersonality] = useState('Cercano al vestuario y exigente');

  // Auto-calculated initial reputation (realistic lower league tier)
  const initialReputation = React.useMemo(() => {
    let rep = 38;
    if (license === 'Licencia UEFA A') rep += 7;
    if (license === 'Licencia UEFA B') rep += 4;
    if (experienceLevel.includes('territorial')) rep += 2;
    if (footballEducation.includes('INEF')) rep += 2;
    return Math.min(48, rep);
  }, [license, experienceLevel, footballEducation]);

  // Biography (dynamically generated and editable)
  const [biography, setBiography] = useState('');

  useEffect(() => {
    setBiography(
      `Nacido en ${birthCity}, ${firstName} ${lastName} forjó su pasión futbolística en los campos de tierra y césped artificial del fútbol modesto. Poseedor de la ${license}, destaca por su ${philosophy.toLowerCase()} y su especialidad en ${specialties.join(' y ')}. Afronta su primera gran oportunidad en los banquillos profesionales con la ambición de progresar paso a paso desde las categorías inferiores.`
    );
  }, [firstName, lastName, birthCity, license, philosophy, specialties]);

  // 2. Club Selection & Game Mode
  const [gameMode, setGameMode] = useState<'CARRERA' | 'ARCADE'>('CARRERA');
  const initialData = React.useMemo(() => generateInitialDatabase(), []);
  const clubsList = Object.values(initialData.clubs);
  const [selectedClubId, setSelectedClubId] = useState<string>('fe_grama'); // Default to Santako's FE Grama
  const [saveName, setSaveName] = useState('Santako_Carrera_2026');
  const [difficultyLevel, setDifficultyLevel] = useState<'FACIL' | 'NORMAL' | 'DIFICIL' | 'LEYENDA'>('NORMAL');
  const [selectedCountry, setSelectedCountry] = useState<string>('TODOS');
  const [selectedDivision, setSelectedDivision] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const availableCountries = React.useMemo(() => {
    const countryIdsInDb = new Set(clubsList.map((c) => c.countryId || 'ESP'));
    return WORLD_COUNTRIES.filter((c) => countryIdsInDb.has(c.id));
  }, [clubsList]);

  // Elite clubs block check
  const selectedClub = initialData.clubs[selectedClubId] || clubsList[0];

  if (!isOpen) return null;

  const handleNextStep = () => {
    playClickSound();
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    playClickSound();
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  const toggleLanguage = (lang: string) => {
    playClickSound();
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleSpecialty = (spec: string) => {
    playClickSound();
    if (specialties.includes(spec)) {
      if (specialties.length > 1) {
        setSpecialties(specialties.filter((s) => s !== spec));
      }
    } else {
      if (specialties.length < 3) {
        setSpecialties([...specialties, spec]);
      }
    }
  };

  const handleCreateGame = async () => {
    playGoalSound();

    const initialContract: ManagerContract = generateInitialContract(
      selectedClub,
      initialReputation,
      '2026/27',
      2
    );

    const manager: Manager = {
      id: `mgr_${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      birthCity: birthCity.trim(),
      nationality,
      secondNationality: secondNationality.trim() || undefined,
      avatarId,
      languages: selectedLanguages,
      footballEducation,
      license,
      experienceLevel,
      tacticalPhilosophy: philosophy,
      preferredFormation,
      specialties,
      personality,
      reputation: initialReputation,
      biography,
      contract: initialContract,
      nationalTeamRole: null,
      careerStats: {
        matchesManaged: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        titlesWon: 0,
        promotions: 0,
        sacksCount: 0,
        resignationsCount: 0,
      },
    };

    const saveId = `save_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const finalSaveName = saveName.trim() || `Carrera_${selectedClub.shortName}_${new Date().toISOString().slice(0, 10)}`;

    const userCompetition = initialData.competitions[selectedClub.divisionId] || Object.values(initialData.competitions)[0];

    const newSave: GameSave = {
      version: 2,
      metadata: {
        id: saveId,
        saveName: finalSaveName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentDate: '2026-08-15',
        currentSeason: '2026/27',
        managerName: `${manager.firstName} ${manager.lastName}`,
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        clubCode: selectedClub.code,
        divisionName: userCompetition?.name || 'Liga Oficial',
      },
      manager,
      userClubId: selectedClub.id,
      currentDate: '2026-08-15',
      currentSeason: '2026/27',
      isTransferWindowOpen: true,
      clubs: initialData.clubs,
      players: initialData.players,
      competitions: initialData.competitions,
      transferOffers: [],
      jobOffers: [],
      marketEvents: [
        {
          id: `mkt_ev_init_${Date.now()}`,
          date: '2026-08-15',
          type: 'CONTRATACION',
          clubName: selectedClub.name,
          managerName: `${manager.firstName} ${manager.lastName}`,
          headline: `El ${selectedClub.name} confía su proyecto a ${manager.firstName} ${manager.lastName}`,
          details: `Firma oficial por 2 temporadas con un salario de ${initialContract.wageWeekly.toLocaleString()} € semanales y el objetivo deportivo de "${initialContract.sportingObjective}".`,
        },
      ],
      news: [
        {
          id: `news_welcome_${Date.now()}`,
          date: '2026-08-15',
          title: `¡Firma de Contrato: Bienvenido a ${selectedClub.name}, míster ${manager.lastName}!`,
          content: `La directiva de ${selectedClub.name} ha hecho oficial la contratación de ${manager.firstName} ${manager.lastName}. Contrato suscrito hasta junio de 2028 (${initialContract.wageWeekly.toLocaleString()} € / semana). Objetivo: "${initialContract.sportingObjective}".`,
          category: 'ENTRENADOR',
          read: false,
        },
        {
          id: `news_market_open_${Date.now()}`,
          date: '2026-08-15',
          title: 'Periodo de Transferencias de Verano Activo',
          content: 'El mercado estival se encuentra abierto. Consulta agentes libres y refuerzos adecuados a tu presupuesto.',
          category: 'FICHAJE',
          read: false,
        },
      ],
      history: [],
      gameMode,
      difficultyLevel,
      currentTransferWindow: 'VERANO',
    };

    const { updatedSave: saveWithPools } = ensureAllNationalTeamsPools(newSave);

    await saveGame(saveWithPools);
    onGameCreated(saveWithPools);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-condensed tracking-wide uppercase">
                Creación de Carrera Profesional — Mánager Total
              </h2>
              <p className="text-xs text-slate-400">
                Paso {step} de 4 · {
                  step === 1 ? 'Identidad & Avatar' :
                  step === 2 ? 'Formación, Licencias & Táctica' :
                  step === 3 ? 'Elección de Club (Categoría Inferior)' :
                  'Contrato Oficial & Confirmación'
                }
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: IDENTITY & AVATAR */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">
                  1. Ficha Personal & Datos de Nacimiento
                </h3>
                <p className="text-xs text-slate-400">
                  Completa tu identidad civil y elige el aspecto con el que te presentarás ante la directiva y los medios.
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Fotografía / Avatar en la Banda
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setAvatarId(av.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        avatarId === av.id
                          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-400 text-slate-100'
                          : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{av.icon}</div>
                      <span className="font-semibold text-xs block text-slate-200">{av.label}</span>
                      <span className="text-[10px] text-slate-400 leading-tight block">{av.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. Oriol"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Apellidos</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. López Gómez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono-num focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Ciudad de Nacimiento</label>
                  <input
                    type="text"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    placeholder="Santa Coloma de Gramenet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Nacionalidad</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Nationality */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Segunda Nacionalidad (Opcional)
                </label>
                <input
                  type="text"
                  value={secondNationality}
                  onChange={(e) => setSecondNationality(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  placeholder="Ninguna o ej. Marruecos, Uruguay, Colombia..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION, LICENSES & TACTICS */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">
                  2. Licencias Federativas, Formación & Filosofía
                </h3>
                <p className="text-xs text-slate-400">
                  Las licencias reglamentan en qué categorías tienes permitido entrenar. Nadie empieza en la élite sin méritos.
                </p>
              </div>

              {/* License Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Licencia Federativa de Entrenador
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Licencia Nacional C', label: 'Licencia Nacional C', rep: 'Rep. ~38', desc: 'Fútbol base y Tercera Federación. El punto de partida más humilde.' },
                    { id: 'Licencia UEFA B', label: 'Licencia UEFA B', rep: 'Rep. ~42', desc: 'Autoriza dirigir hasta Segunda Federación y canteras de élite.' },
                    { id: 'Licencia UEFA A', label: 'Licencia UEFA A', rep: 'Rep. ~48', desc: 'Autoriza dirigir en Primera Federación (categoría semiprofesional).' },
                  ].map((lic) => (
                    <button
                      key={lic.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setLicense(lic.id as any);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        license === lic.id
                          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-400 text-slate-100'
                          : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-slate-100">{lic.label}</span>
                        <span className="text-[10px] text-amber-400 font-mono-num font-bold">{lic.rep}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 leading-tight block">{lic.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Idiomas que dominas en el vestuario
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Español', 'Catalán', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedLanguages.includes(lang)
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tactical Philosophy & Preferred Formation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Filosofía Futbolística</label>
                  <select
                    value={philosophy}
                    onChange={(e) => setPhilosophy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Juego de posición y salida limpia">Juego de posición y salida limpia</option>
                    <option value="Contragolpe vertiginoso y repliegue">Contragolpe vertiginoso y repliegue</option>
                    <option value="Presión alta y asfixiante (Gegenpressing)">Presión alta y asfixiante (Gegenpressing)</option>
                    <option value="Roca defensiva y bloque bajo">Roca defensiva y bloque bajo</option>
                    <option value="Fútbol de barro, segundas jugadas y centros">Fútbol de barro y segundas jugadas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Esquema Táctico Predilecto</label>
                  <select
                    value={preferredFormation}
                    onChange={(e) => setPreferredFormation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="4-3-3">4-3-3 (Extremos y mediocentro)</option>
                    <option value="4-2-3-1">4-2-3-1 (Doble pivote y mediapunta)</option>
                    <option value="4-4-2">4-4-2 (Clásico con dos delanteros)</option>
                    <option value="3-5-2">3-5-2 (Carrileros y 3 centrales)</option>
                    <option value="5-3-2">5-3-2 (Muro defensivo)</option>
                  </select>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Especialidades Técnicas (Elige hasta 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Desarrollo de Cantera',
                    'Motivación',
                    'Rigor Táctico',
                    'Estrategia a Balón Parado',
                    'Intensidad Física',
                    'Gestión de Prensa',
                  ].map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        specialties.includes(spec)
                          ? 'bg-sky-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Biography Preview */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Biografía Profesional (Editable)
                </label>
                <textarea
                  rows={3}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {/* STEP 3: CLUB SELECTION & GAME MODE */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Game Mode Selection */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-condensed">
                    Modalidad de Partida
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {gameMode === 'CARRERA' ? 'Progresión federativa estricta' : 'Libertad absoluta de simulación'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setGameMode('CARRERA');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      gameMode === 'CARRERA'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-slate-100 font-bold">Modo Carrera (Realista)</strong>
                      <span className="text-[10px] bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono-num font-bold">OFICIAL</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Comienzo obligatorio en categorías inferiores (FE Grama, UDA Gramenet, Sabadell...). Gana ascensos y licencias con tus propios méritos deportivos.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setGameMode('ARCADE');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      gameMode === 'ARCADE'
                        ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-slate-100 font-bold">Modo Arcade (Libertad Total)</strong>
                      <span className="text-[10px] bg-amber-900/60 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono-num font-bold">DESBLOQUEADO</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Sin restricciones federativas. Dirige de inmediato a cualquier club del mundo, incluyendo colosos de primera división y Champions.
                    </p>
                  </button>
                </div>
              </div>

              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    3. Elección de Club de Inicio
                  </h3>
                  <p className="text-xs text-slate-400">
                    {gameMode === 'CARRERA'
                      ? `Regla fundamental: Comienzo obligatorio en una categoría inferior adecuada a tu licencia y reputación (${initialReputation} Rep.).`
                      : 'Modo Arcade activo: Todos los clubes están desbloqueados para su dirección inmediata.'}
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-md">
                  Licencia: {license}
                </span>
              </div>

              {/* Hierarchical Country, Division & Search Filters */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Country Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      País / Federación
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedDivision('TODAS');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="TODOS">🌍 Todos los países ({availableCountries.length})</option>
                      {availableCountries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.flag} {c.name} ({c.confederation})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Division Filter */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Competición / División
                    </label>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="TODAS">🏆 Todas las divisiones</option>
                      {Object.values(initialData.competitions)
                        .filter((comp) => {
                          if (selectedCountry === 'TODOS') return true;
                          const compClub = clubsList.find((c) => c.divisionId === comp.id);
                          return compClub?.countryId === selectedCountry;
                        })
                        .map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Club Search */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Buscar Club por Nombre o Ciudad
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Ej. Grama, Madrid, Barça, Boca..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 gap-2">
                  <span>
                    Mostrando <strong className="text-emerald-400 font-mono-num">{
                      clubsList.filter((c) => {
                        if (selectedCountry !== 'TODOS' && c.countryId !== selectedCountry) return false;
                        if (selectedDivision !== 'TODAS' && c.divisionId !== selectedDivision) return false;
                        if (searchTerm.trim()) {
                          const term = searchTerm.toLowerCase().trim();
                          return c.name.toLowerCase().includes(term) || c.city.toLowerCase().includes(term) || c.code.toLowerCase().includes(term);
                        }
                        return true;
                      }).length
                    }</strong> clubes disponibles en la base de datos
                  </span>
                  {selectedClub && (
                    <span className="text-slate-300">
                      Club seleccionado: <strong className="text-emerald-400">{selectedClub.name}</strong> ({initialData.competitions[selectedClub.divisionId]?.shortName || selectedClub.divisionId})
                    </span>
                  )}
                </div>
              </div>

              {/* Grid of clubs with eligibility status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {clubsList
                  .filter((club) => {
                    if (selectedCountry !== 'TODOS' && club.countryId !== selectedCountry) return false;
                    if (selectedDivision !== 'TODAS' && club.divisionId !== selectedDivision) return false;
                    if (searchTerm.trim()) {
                      const term = searchTerm.toLowerCase().trim();
                      return club.name.toLowerCase().includes(term) || club.city.toLowerCase().includes(term) || club.code.toLowerCase().includes(term);
                    }
                    return true;
                  })
                  .map((club) => {
                    const evalRes = evaluateClubEligibility(club, license, initialReputation, gameMode);
                    const isSelected = selectedClubId === club.id;
                    const isSantako = club.id === 'fe_grama' || club.id === 'uda_gramenet';
                    const comp = initialData.competitions[club.divisionId];
                    const flag = 
                      club.countryId === 'ENG' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' :
                      club.countryId === 'ITA' ? '🇮🇹' :
                      club.countryId === 'GER' ? '🇩🇪' :
                      club.countryId === 'FRA' ? '🇫🇷' :
                      club.countryId === 'ARG' ? '🇦🇷' :
                      club.countryId === 'BRA' ? '🇧🇷' :
                      club.countryId === 'USA' ? '🇺🇸' :
                      club.countryId === 'KSA' ? '🇸🇦' : '🇪🇸';

                    return (
                      <div
                        key={club.id}
                        onClick={() => {
                          if (evalRes.eligible) {
                            playClickSound();
                            setSelectedClubId(club.id);
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all relative ${
                          !evalRes.eligible
                            ? 'opacity-50 bg-slate-950 border-slate-800/80 cursor-not-allowed'
                            : isSelected
                            ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500 shadow-lg cursor-pointer'
                            : 'bg-slate-800/50 border-slate-700/80 hover:border-slate-600 cursor-pointer'
                        }`}
                      >
                        {/* Santako badge */}
                        {isSantako && (
                          <div className="absolute top-3 right-3 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded">
                            ★ SANTAKO
                          </div>
                        )}

                        {!evalRes.eligible && (
                          <div className="absolute top-3 right-3 text-[10px] font-bold text-rose-400 bg-rose-950 border border-rose-800/60 px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" /> BLOQUEADO
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm font-condensed shadow shrink-0"
                            style={{
                              backgroundColor: club.primaryColor,
                              color: club.textColor,
                              border: `2px solid ${club.secondaryColor}`,
                            }}
                          >
                            {club.code}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">{flag}</span>
                              <h4 className="font-bold text-slate-100 text-sm leading-tight truncate">
                                {club.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                {club.city}
                              </span>
                              <span className="text-[10px] font-bold text-sky-400 bg-sky-950/70 border border-sky-500/30 px-1.5 py-0.2 rounded font-condensed uppercase truncate">
                                {comp?.shortName || club.divisionId}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700/50 pt-2 mb-2 font-mono-num">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Estadio</span>
                            <span className="text-slate-200 truncate block">{club.stadium.capacity.toLocaleString()} esp.</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">Presupuesto</span>
                            <span className="text-emerald-400 font-semibold block">{club.finances.transferBudget.toLocaleString()} €</span>
                          </div>
                        </div>

                        <div className="text-[11px] p-2 rounded-lg border">
                          {evalRes.eligible ? (
                            <div className="text-emerald-300 bg-emerald-950/40 border-emerald-500/20">
                              <span className="text-slate-400">Objetivo:</span>{' '}
                              <strong className="text-slate-200">{club.boardObjective}</strong>
                            </div>
                          ) : (
                            <div className="text-rose-300 bg-rose-950/40 border-rose-800/20">
                              {evalRes.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 4: INITIAL CONTRACT & FINAL CONFIRMATION */}
          {step === 4 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-100 mb-1">
                  4. Contrato Oficial & Vinculación Laboral
                </h3>
                <p className="text-xs text-slate-400">
                  El club ha redactado el contrato laboral con arreglo a su presupuesto y los objetivos pactados.
                </p>
              </div>

              {/* Contract Sheet */}
              <div className="bg-slate-950/90 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg font-condensed"
                      style={{
                        backgroundColor: selectedClub.primaryColor,
                        color: selectedClub.textColor,
                        border: `2px solid ${selectedClub.secondaryColor}`,
                      }}
                    >
                      {selectedClub.code}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-base">{selectedClub.name}</h4>
                      <span className="text-xs text-slate-400">Contrato Profesional de Entrenador Jefe</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono-num text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30">
                    2 Temporadas (2026-2028)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono-num">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Sueldo Semanal</span>
                    <strong className="text-base text-emerald-400 font-bold block mt-0.5">
                      {Math.round(selectedClub.finances.weeklyWageBudget * 0.08 + initialReputation * 8).toLocaleString()} € / sem
                    </strong>
                    <span className="text-[11px] text-slate-500 font-sans">
                      (~{(Math.round(selectedClub.finances.weeklyWageBudget * 0.08 + initialReputation * 8) * 52).toLocaleString()} € anuales)
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Objetivo Deportivo</span>
                    <strong className="text-sm text-slate-100 font-bold block mt-0.5 font-sans">
                      {selectedClub.boardObjective}
                    </strong>
                    <span className="text-[11px] text-amber-400 font-sans">
                      Exigencia directiva
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cláusula de rescisión por otro club:</span>
                    <strong className="text-slate-200 font-mono-num">
                      {(Math.round(selectedClub.finances.weeklyWageBudget * 0.08 + initialReputation * 8) * 52 * 3).toLocaleString()} €
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indemnización por despido anticipado:</span>
                    <strong className="text-slate-200 font-mono-num">
                      {(Math.round(selectedClub.finances.weeklyWageBudget * 0.08 + initialReputation * 8) * 52 * 0.6).toLocaleString()} €
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prima por ascenso de categoría:</span>
                    <strong className="text-emerald-400 font-mono-num">+12.000 €</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Condición de renovación automática:</span>
                    <span className="text-slate-300">Cumplimiento del objetivo de temporada</span>
                  </div>
                </div>

                {/* Difficulty Level Selector */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider font-condensed">
                    Nivel de Dificultad de la Simulación
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'FACIL', label: 'Fácil', desc: 'Mayor presupuesto, directiva muy paciente' },
                      { id: 'NORMAL', label: 'Normal', desc: 'Equilibrado y fiel al fútbol real' },
                      { id: 'DIFICIL', label: 'Difícil', desc: 'Presupuestos justos y directiva exigente' },
                      { id: 'LEYENDA', label: 'Leyenda', desc: 'Realismo extremo, destitución estricta' },
                    ].map((diff) => (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setDifficultyLevel(diff.id as any);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          difficultyLevel === diff.id
                            ? 'bg-emerald-950/60 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`block text-xs font-bold font-condensed uppercase tracking-wider ${difficultyLevel === diff.id ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {diff.label}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                          {diff.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Name Input */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nombre personalizado de la partida
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono-num"
                    placeholder="Ej. Santako_Carrera_2026"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreateGame}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Firmar Contrato y Comenzar Carrera</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
