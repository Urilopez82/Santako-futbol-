import React, { useState, useMemo } from 'react';
import { Club } from '../../types/club';
import { GameSave, NewsItem } from '../../types/game';
import { Player } from '../../types/player';
import { 
  OpponentScoutingReport, 
  PlayerLockerRoomProfile, 
  PressConference, 
  PressQuestion 
} from '../../types/tactics';
import { 
  generateOpponentReport, 
  generatePressConference 
} from '../../engine/tacticsEngine';
import { findUnifiedNextMatch } from '../../engine/internationalCompetitionsEngine';
import { playClickSound } from '../../utils/audio';
import { 
  Eye, 
  Mic, 
  Users2, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Sparkles, 
  Flame, 
  HeartHandshake, 
  Smile, 
  Frown, 
  Meh, 
  Award,
  Zap,
  Check
} from 'lucide-react';

interface OpponentAndPressViewProps {
  gameSave: GameSave;
  club: Club;
  onUpdateClub: (updatedClub: Club, playerDeltas?: Record<string, Player>, newsItem?: NewsItem) => void;
}

export const OpponentAndPressView: React.FC<OpponentAndPressViewProps> = ({
  gameSave,
  club,
  onUpdateClub,
}) => {
  const [subTab, setSubTab] = useState<'rival' | 'rueda_prensa' | 'vestuario'>('rival');

  // Find next upcoming match across ALL competitions (Liga, Copa, Champions, Mundial)
  const unifiedNextMatch = useMemo(() => {
    return findUnifiedNextMatch(gameSave, club.id);
  }, [gameSave, club.id]);

  const comp = gameSave.competitions[club.divisionId] || Object.values(gameSave.competitions)[0];
  const fallbackRivalId = comp?.clubIds.find((id) => id !== club.id) || 'fc_barcelona';
  const rivalClubId = unifiedNextMatch?.opponentId || fallbackRivalId;
  const rivalClub = gameSave.clubs[rivalClubId] || Object.values(gameSave.clubs)[0];

  // Dynamic Scouting report updates immediately with each rival
  const scoutingReport: OpponentScoutingReport = useMemo(() => {
    return generateOpponentReport(rivalClub, gameSave.players, club);
  }, [rivalClub?.id, gameSave.players, club?.id]);

  // Press conference state (pre-match)
  const [pressConference, setPressConference] = useState<PressConference>(() => {
    if (club.activePressConference && club.activePressConference.rivalClubName === (rivalClub?.name || '')) {
      return club.activePressConference;
    }
    return generatePressConference(club, rivalClub, { type: 'PRE_PARTIDO' });
  });

  // Whenever the upcoming opponent or match changes, generate a fresh press conference for THIS rival!
  React.useEffect(() => {
    const isSameRival = club.activePressConference && club.activePressConference.rivalClubName === (rivalClub?.name || '');
    if (isSameRival && club.activePressConference) {
      setPressConference(club.activePressConference);
    } else {
      const freshPc = generatePressConference(club, rivalClub, { type: 'PRE_PARTIDO' });
      setPressConference(freshPc);
    }
  }, [rivalClub?.name, unifiedNextMatch?.id]);

  const [counterMeasureApplied, setCounterMeasureApplied] = useState(false);
  const [teamTalkGiven, setTeamTalkGiven] = useState(false);

  // Apply recommended counter-measure
  const handleApplyCounterMeasure = () => {
    playClickSound();
    const inst = club.teamInstructions;
    if (!inst) return;

    let updatedInst = { ...inst };
    if (scoutingReport.threatLevel === 'Peligro Máximo') {
      updatedInst.alturaDefensiva = 'Repliegue Intensivo';
      updatedInst.contraataque = 'Inmediato y Vertical';
      updatedInst.presion = 'Media';
    } else {
      updatedInst.presion = 'Alta';
      updatedInst.transiciones = 'Presión tras Pérdida';
    }

    onUpdateClub({
      ...club,
      teamInstructions: updatedInst,
    });
    setCounterMeasureApplied(true);
    setTimeout(() => setCounterMeasureApplied(false), 3000);
  };

  // Answer a question in the press conference
  const handleAnswerQuestion = (qId: string, optIndex: number) => {
    playClickSound();
    const updatedQuestions = pressConference.questions.map((q) => {
      if (q.id === qId) {
        return { ...q, selectedOptionIndex: optIndex };
      }
      return q;
    });

    const selectedOpt = pressConference.questions.find((q) => q.id === qId)?.options[optIndex];
    if (!selectedOpt) return;

    // Apply consequences to club & board
    const newBoardConfidence = Math.max(10, Math.min(100, club.boardConfidence + selectedOpt.boardConfidenceDelta));

    // Update squad morale in player deltas
    const updatedPlayersMap: Record<string, Player> = {};
    (club.startingElevenIds || []).forEach((pid) => {
      const p = gameSave.players[pid];
      if (p) {
        updatedPlayersMap[pid] = {
          ...p,
          morale: Math.max(10, Math.min(100, (p.morale || 75) + selectedOpt.moraleDelta)),
        };
      }
    });

    const isAllCompleted = updatedQuestions.every((q) => q.selectedOptionIndex !== undefined);

    const updatedConf: PressConference = {
      ...pressConference,
      questions: updatedQuestions,
      completed: isAllCompleted,
    };

    setPressConference(updatedConf);

    onUpdateClub(
      {
        ...club,
        boardConfidence: newBoardConfidence,
        activePressConference: updatedConf,
      },
      updatedPlayersMap
    );
  };

  // Give motivating team talk to squad
  const handleGiveTeamTalk = (tone: 'MOTIVADORA' | 'EXIGENTE' | 'CALMA') => {
    playClickSound();
    const updatedPlayersMap: Record<string, Player> = {};
    const updatedDynamics = { ...(club.lockerRoomDynamics || {}) };

    const moraleBoost = tone === 'MOTIVADORA' ? 6 : tone === 'EXIGENTE' ? 2 : 4;
    const confidenceBoost = tone === 'MOTIVADORA' ? 5 : tone === 'EXIGENTE' ? 3 : 5;

    (club.startingElevenIds || []).forEach((pid) => {
      const p = gameSave.players[pid];
      if (p) {
        updatedPlayersMap[pid] = {
          ...p,
          morale: Math.min(100, (p.morale || 75) + moraleBoost),
        };
        if (updatedDynamics[pid]) {
          updatedDynamics[pid] = {
            ...updatedDynamics[pid],
            confidence: Math.min(100, updatedDynamics[pid].confidence + confidenceBoost),
            coachRelationship: 'Excelente',
          };
        }
      }
    });

    const newsItem: NewsItem = {
      id: `talk_${Date.now()}`,
      date: gameSave.currentDate,
      title: `Charla Táctica en el Vestuario (${tone})`,
      content: `El míster ha reunido a los jugadores antes del encuentro: "Todos juntos como una piña hacia la victoria". La plantilla reacciona con gran entusiasmo.`,
      category: 'DIRECTIVA',
      read: false,
    };

    onUpdateClub(
      {
        ...club,
        lockerRoomDynamics: updatedDynamics,
      },
      updatedPlayersMap,
      newsItem
    );

    setTeamTalkGiven(true);
    setTimeout(() => setTeamTalkGiven(false), 3000);
  };

  const dynamics = club.lockerRoomDynamics || {};
  const starters = (club.startingElevenIds || []).map((id) => gameSave.players[id]).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Sub navigation segmented control */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'rival', label: '1. Análisis del Rival', icon: Eye },
          { id: 'rueda_prensa', label: '2. Rueda de Prensa Oficial', icon: Mic },
          { id: 'vestuario', label: '3. Psicología & Dinámicas de Vestuario', icon: Users2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setSubTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-condensed uppercase tracking-wider rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. ANÁLISIS DEL PRÓXIMO RIVAL                                             */}
      {/* ========================================================================= */}
      {subTab === 'rival' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-bold font-mono-num uppercase">
                  INFORME DE SCOUTING OFICIAL
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono-num uppercase border ${
                  scoutingReport.threatLevel === 'Peligro Máximo'
                    ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                    : 'bg-amber-950 text-amber-400 border-amber-500/40'
                }`}>
                  Peligro: {scoutingReport.threatLevel}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">
                Próximo Oponente: {rivalClub.name} ({rivalClub.code})
              </h3>
              <p className="text-xs text-slate-400">
                Dibujo habitual: <strong className="text-emerald-400">{scoutingReport.formation}</strong> · Estilo: {scoutingReport.playStyle} · Reputación: {rivalClub.reputation}/100.
              </p>
            </div>

            <button
              onClick={handleApplyCounterMeasure}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black font-condensed uppercase text-xs rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center gap-2"
            >
              {counterMeasureApplied ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{counterMeasureApplied ? '¡Ajuste Aplicado!' : 'Aplicar Ajuste Táctico Sugerido'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Key Players & Offensive Threats */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
              <span className="text-xs font-bold text-slate-200 uppercase font-condensed tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                <Flame className="w-4 h-4 text-amber-400" />
                Amenazas Principales & Jugadores Clave
              </span>

              <div className="space-y-3">
                {scoutingReport.keyPlayers.map((kp, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                          {kp.position}
                        </span>
                        <span className="font-bold text-white text-sm">{kp.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {kp.threatSummary}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-emerald-400 font-mono-num bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30 shrink-0">
                      {kp.rating} OVR
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
              <span className="text-xs font-bold text-slate-200 uppercase font-condensed tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                Diagnóstico del Analista: Virtudes & Vulnerabilidades
              </span>

              <div className="space-y-3">
                {/* Puntos Fuertes */}
                <div className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-condensed block">
                    Puntos Fuertes Identificados:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {scoutingReport.strengths.map((s, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Debilidades */}
                <div className="bg-slate-950/80 border border-rose-500/20 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-400 uppercase font-condensed block">
                    Debilidades Explotables:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {scoutingReport.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recomendación del Analista */}
                <div className="bg-slate-950/90 border border-amber-500/30 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase font-condensed block">
                    Consejo Táctico Recomendado: {scoutingReport.recommendedCounterMeasure.setting}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {scoutingReport.recommendedCounterMeasure.rationale}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RUEDA DE PRENSA OFICIAL                                                */}
      {/* ========================================================================= */}
      {subTab === 'rueda_prensa' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono-num uppercase">
                  SALA DE PRENSA OFICIAL
                </span>
                <span className="text-xs text-slate-400 font-mono-num">
                  {pressConference.date}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">
                {pressConference.headline}
              </h3>
              <p className="text-xs text-slate-400">
                Tus respuestas serán analizadas por los medios de comunicación y tendrán repercusión directa en la moral del vestuario, el apoyo social y la directiva.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pressConference.questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-300 font-condensed uppercase">
                    Pregunta #{qIdx + 1} — {q.journalistName} ({q.mediaOutlet})
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-100 italic">
                  &ldquo;{q.question}&rdquo;
                </p>

                {/* Response Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.selectedOptionIndex === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerQuestion(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-white shadow'
                            : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <p className="font-medium leading-relaxed">
                          &ldquo;{opt.text}&rdquo;
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono-num font-bold pt-2 border-t border-slate-800/60">
                          <span className={`px-2 py-0.5 rounded ${
                            opt.tone === 'CONFIADO' ? 'text-emerald-400 bg-emerald-950' :
                            opt.tone === 'EXIGENTE' ? 'text-amber-400 bg-amber-950' :
                            opt.tone === 'PROTECTOR' ? 'text-sky-400 bg-sky-950' : 'text-purple-400 bg-purple-950'
                          }`}>
                            Tono: {opt.tone}
                          </span>
                          <span className="text-slate-400">
                            Moral: {opt.moraleDelta > 0 ? `+${opt.moraleDelta}` : opt.moraleDelta} · Directiva: {opt.boardConfidenceDelta > 0 ? `+${opt.boardConfidenceDelta}` : opt.boardConfidenceDelta}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {q.selectedOptionIndex !== undefined && (
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{q.options[q.selectedOptionIndex].reactionSummary}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PSICOLOGÍA & DINÁMICAS DE VESTUARIO                                    */}
      {/* ========================================================================= */}
      {subTab === 'vestuario' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider flex items-center gap-2">
                <Users2 className="w-5 h-5 text-emerald-400" />
                Relaciones, Liderazgo & Clima de Vestuario
              </h3>
              <p className="text-xs text-slate-400">
                Monitorea la confianza, ambición, profesionalidad y grado de satisfacción con los minutos jugados.
              </p>
            </div>

            {/* Team Talks Action Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGiveTeamTalk('MOTIVADORA')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-condensed uppercase tracking-wider text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Charla Motivadora</span>
              </button>
              <button
                onClick={() => handleGiveTeamTalk('CALMA')}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold font-condensed uppercase tracking-wider text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Mensaje de Calma</span>
              </button>
              <button
                onClick={() => handleGiveTeamTalk('EXIGENTE')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-condensed uppercase tracking-wider text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4" />
                <span>Charla Exigente</span>
              </button>
            </div>
          </div>

          {teamTalkGiven && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡La plantilla ha recibido con gran motivación las palabras del cuerpo técnico!</span>
            </div>
          )}

          {/* Player Psychological Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starters.map((p) => {
              const dyn: PlayerLockerRoomProfile = dynamics[p.id] || {
                playerId: p.id,
                morale: p.morale || 80,
                confidence: 75,
                ambition: 'Alta',
                professionalism: 'Alta',
                leadership: p.attributes.liderazgo || 50,
                coachRelationship: 'Buena',
                playingTimeSatisfaction: 'Indispensable',
                concerns: [],
              };

              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                        {p.primaryPosition}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {p.firstName} {p.lastName}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-400 font-mono-num">
                      {p.overallRating} OVR
                    </span>
                  </div>

                  {/* Emotional Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] text-slate-400 uppercase font-condensed block">Moral</span>
                      <span className="text-xs font-bold text-emerald-400">{dyn.morale}%</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] text-slate-400 uppercase font-condensed block">Confianza</span>
                      <span className="text-xs font-bold text-sky-400">{dyn.confidence}%</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] text-slate-400 uppercase font-condensed block">Relación Míster</span>
                      <span className="text-xs font-bold text-amber-400 truncate block">{dyn.coachRelationship}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] text-slate-400 uppercase font-condensed block">Satisfacción Minutos</span>
                      <span className="text-xs font-bold text-slate-200 truncate block">{dyn.playingTimeSatisfaction}</span>
                    </div>
                  </div>

                  {/* Character Traits */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Ambición: <strong className="text-slate-200">{dyn.ambition}</strong></span>
                    <span>Profesionalidad: <strong className="text-slate-200">{dyn.professionalism}</strong></span>
                    <span>Liderazgo: <strong className="text-amber-400">{dyn.leadership}</strong></span>
                  </div>

                  {/* Concerns */}
                  {dyn.concerns && dyn.concerns.length > 0 && (
                    <div className="bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg text-[10px] text-rose-300">
                      ⚠️ {dyn.concerns.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
