import React, { useState } from 'react';
import { Club } from '../../types/club';
import { GameSave, NewsItem } from '../../types/game';
import { playClickSound, playGoalSound } from '../../utils/audio';
import { Stadium3DViewer } from '../stadium/Stadium3DViewer';
import { 
  Building, 
  Dumbbell, 
  GraduationCap, 
  HeartPulse, 
  ArrowUpCircle, 
  CheckCircle2, 
  Coins,
  Eye,
  Hammer
} from 'lucide-react';
import { startStadiumUpgrade } from '../../engine/clubManagementEngine';
import { StadiumUpgradeOption } from '../../types/clubManagement';

interface FacilitiesViewProps {
  gameSave: GameSave;
  onUpgradeFacility: (updatedClub: Club, newsItem: NewsItem) => void;
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  gameSave,
  onUpgradeFacility,
}) => {
  const club = gameSave.clubs[gameSave.userClubId];
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [show3D, setShow3D] = useState<boolean>(true);

  const notify = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Facility upgrade definitions
  const canUpgrade = (cost: number) => club.finances.balance >= cost;

  const handleUpgradeStadium = () => {
    playClickSound();
    const ongoingStadiumProject = (club.activeStadiumProjects || []).find(
      (p) => p.type === 'AMPLIACION_AFORO' || p.capacityChange > 0
    );
    if (ongoingStadiumProject) {
      notify(`Ya existen obras de ampliación en curso: ${ongoingStadiumProject.title} (${ongoingStadiumProject.weeksRemaining} sem. restantes).`);
      return;
    }

    const cost = 120000;
    if (!canUpgrade(cost)) {
      notify(`Fondos insuficientes. Se requieren ${cost.toLocaleString()} € en tesorería.`);
      return;
    }

    playGoalSound();
    const option: StadiumUpgradeOption = {
      id: `upg_fac_stadium_${Date.now()}`,
      title: `Ampliación del Graderío del ${club.stadium.name} (+1.000 localidades)`,
      category: 'AMPLIACION_AFORO',
      cost: 120000,
      durationWeeks: 4,
      capacityBonus: 1000,
      comfortBonus: 8,
      revenueBonusPerMatch: 1200,
      description: `Ampliación estructural del graderío para sumar 1.000 nuevas localidades permanentes tras 4 semanas de obras.`,
    };

    const res = startStadiumUpgrade(club, option, gameSave.currentDate);
    notify(`¡Obras iniciadas! Descontados 120.000 € del presupuesto. Duración: 4 semanas (+1.000 asientos permanentes).`);
    onUpgradeFacility(res.updatedClub, res.newsItem);
  };

  const handleUpgradeTraining = () => {
    playClickSound();
    const cost = 80000;
    if (club.facilities.trainingGroundLevel >= 5) {
      notify('El centro de entrenamiento ya se encuentra en el nivel máximo (5 estrellas).');
      return;
    }
    if (!canUpgrade(cost)) {
      notify(`Fondos insuficientes. Se requieren ${cost.toLocaleString()} €.`);
      return;
    }

    playGoalSound();
    const newLevel = club.facilities.trainingGroundLevel + 1;
    const updatedClub: Club = {
      ...club,
      facilities: {
        ...club.facilities,
        trainingGroundLevel: newLevel,
      },
      finances: {
        ...club.finances,
        balance: club.finances.balance - cost,
        recentLedger: [
          {
            id: `ledg_train_${Date.now()}`,
            date: gameSave.currentDate,
            category: 'instalaciones',
            description: `Mejora de la Ciudad Deportiva a Nivel ${newLevel}`,
            amount: -cost,
          },
          ...club.finances.recentLedger,
        ],
      },
    };

    const news: NewsItem = {
      id: `news_train_${Date.now()}`,
      date: gameSave.currentDate,
      title: `Inauguradas las nuevas instalaciones de entrenamiento de ${club.name}`,
      content: `El club estrena equipamiento de vanguardia en la ciudad deportiva. Esto potenciará el desarrollo y la condición de la plantilla.`,
      category: 'INSTALACIONES',
      read: false,
    };

    notify(`¡Ciudad Deportiva mejorada a Nivel ${newLevel}!`);
    onUpgradeFacility(updatedClub, news);
  };

  const handleUpgradeAcademy = () => {
    playClickSound();
    const cost = 95000;
    if (club.facilities.youthAcademyLevel >= 5) {
      notify('La academia de cantera ya está al máximo nivel.');
      return;
    }
    if (!canUpgrade(cost)) {
      notify(`Fondos insuficientes. Se requieren ${cost.toLocaleString()} €.`);
      return;
    }

    playGoalSound();
    const newLevel = club.facilities.youthAcademyLevel + 1;
    const updatedClub: Club = {
      ...club,
      facilities: {
        ...club.facilities,
        youthAcademyLevel: newLevel,
      },
      finances: {
        ...club.finances,
        balance: club.finances.balance - cost,
        recentLedger: [
          {
            id: `ledg_acad_${Date.now()}`,
            date: gameSave.currentDate,
            category: 'instalaciones',
            description: `Modernización de la Escuela de Fútbol Base (Nivel ${newLevel})`,
            amount: -cost,
          },
          ...club.finances.recentLedger,
        ],
      },
    };

    const news: NewsItem = {
      id: `news_acad_${Date.now()}`,
      date: gameSave.currentDate,
      title: `Impulso a la cantera del ${club.name}`,
      content: `Se ha completado el plan de modernización de las instalaciones juveniles. Los ojeadores y preparadores captarán promesas con mayor potencial.`,
      category: 'INSTALACIONES',
      read: false,
    };

    notify(`¡Cantera de Juveniles mejorada a Nivel ${newLevel}!`);
    onUpgradeFacility(updatedClub, news);
  };

  const handleUpgradeMedical = () => {
    playClickSound();
    const cost = 65000;
    if (club.facilities.medicalCenterLevel >= 5) {
      notify('El centro médico ya está en el nivel máximo.');
      return;
    }
    if (!canUpgrade(cost)) {
      notify(`Fondos insuficientes. Se requieren ${cost.toLocaleString()} €.`);
      return;
    }

    playGoalSound();
    const newLevel = club.facilities.medicalCenterLevel + 1;
    const updatedClub: Club = {
      ...club,
      facilities: {
        ...club.facilities,
        medicalCenterLevel: newLevel,
      },
      finances: {
        ...club.finances,
        balance: club.finances.balance - cost,
        recentLedger: [
          {
            id: `ledg_med_${Date.now()}`,
            date: gameSave.currentDate,
            category: 'instalaciones',
            description: `Ampliación del Centro Médico y Fisioterapia (Nivel ${newLevel})`,
            amount: -cost,
          },
          ...club.finances.recentLedger,
        ],
      },
    };

    const news: NewsItem = {
      id: `news_med_${Date.now()}`,
      date: gameSave.currentDate,
      title: `Nuevos quirófanos y unidad de fisioterapia en ${club.name}`,
      content: `La inversión en equipamiento médico avanzado reducirá sensiblemente las semanas de inactividad de los futbolistas lesionados.`,
      category: 'INSTALACIONES',
      read: false,
    };

    notify(`¡Centro Médico mejorado a Nivel ${newLevel}!`);
    onUpgradeFacility(updatedClub, news);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-condensed uppercase tracking-wide">
            Instalaciones & Patrimonio del Club
          </h2>
          <p className="text-xs text-slate-400">
            Invierte el patrimonio del club en infraestructuras duraderas que otorguen ventajas deportivas y comerciales
          </p>
        </div>

        <div className="bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800 font-mono-num text-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Tesorería para Obras
          </span>
          <span className="text-base font-bold text-emerald-400">
            {club.finances.balance.toLocaleString()} €
          </span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 3D Stadium Visualization Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                Visualización Arquitectónica 3D — {club.stadium.name}
              </h3>
              <p className="text-xs text-slate-400">
                Modelo tridimensional en tiempo real con capacidad actual ({club.stadium.capacity.toLocaleString()} esp.) y proyecto de ampliación.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setShow3D(!show3D);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-condensed uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>{show3D ? 'Ocultar Modelo 3D' : 'Mostrar Modelo 3D'}</span>
          </button>
        </div>

        {show3D && (
          <div className="animate-in fade-in duration-300">
            <Stadium3DViewer club={club} previewUpgrade={club.facilities.stadiumLevel >= 4} />
          </div>
        )}
      </div>

      {/* Grid of 4 Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. STADIUM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm font-condensed uppercase">
                  Estadio ({club.stadium.name})
                </h3>
              </div>
              <span className="text-xs font-mono-num text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded">
                Nivel {club.facilities.stadiumLevel} / 5
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              El hogar del club. Ampliar la capacidad permite albergar más masa social y disparar las recaudaciones en taquillas y abonos.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono-num mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Aforo actual:</span>
                <strong className="text-slate-100">{club.stadium.capacity.toLocaleString()} asientos</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Abonados fieles:</span>
                <strong className="text-slate-100">{club.stadium.seasonTicketHolders.toLocaleString()} abonados</strong>
              </div>
            </div>

            {/* Active works indicator */}
            {club.activeStadiumProjects && club.activeStadiumProjects.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-lg mb-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span className="flex items-center gap-1.5 font-condensed uppercase tracking-wider">
                    <Hammer className="w-3.5 h-3.5 animate-bounce" />
                    Obras: {club.activeStadiumProjects[0].title}
                  </span>
                  <span className="font-mono-num">{club.activeStadiumProjects[0].weeksRemaining} sem.</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{
                      width: `${Math.round(((club.activeStadiumProjects[0].totalWeeks - club.activeStadiumProjects[0].weeksRemaining) / club.activeStadiumProjects[0].totalWeeks) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono-num">
                  <span>Aumento permanente: +{club.activeStadiumProjects[0].capacityChange.toLocaleString()} asientos</span>
                  {club.activeStadiumProjects[0].targetCompletionDate && (
                    <span>Inauguración: {club.activeStadiumProjects[0].targetCompletionDate}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono-num text-slate-300">
              Coste ampliación (+1.000): <strong className="text-amber-400">120.000 €</strong>
            </span>
            {(club.activeStadiumProjects || []).some((p) => p.type === 'AMPLIACION_AFORO' || p.capacityChange > 0) ? (
              <button
                disabled
                className="px-3.5 py-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 rounded-lg cursor-not-allowed font-sans"
              >
                En Obras ({club.activeStadiumProjects?.find((p) => p.type === 'AMPLIACION_AFORO' || p.capacityChange > 0)?.weeksRemaining} sem.)
              </button>
            ) : (
              <button
                onClick={handleUpgradeStadium}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
              >
                Iniciar Obras (4 sem.)
              </button>
            )}
          </div>
        </div>

        {/* 2. TRAINING GROUND */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm font-condensed uppercase">
                  Ciudad Deportiva & Entrenamientos
                </h3>
              </div>
              <span className="text-xs font-mono-num text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded">
                Nivel {club.facilities.trainingGroundLevel} / 5
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Campos de entrenamiento de césped híbrido, gimnasios y salas tácticas. Acelera la progresión de los futbolistas jóvenes y mantiene alta la condición física.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono-num mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Bonus de desarrollo:</span>
                <strong className="text-emerald-400">+{club.facilities.trainingGroundLevel * 15}% crecimiento</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recuperación de fatiga:</span>
                <strong className="text-slate-100">+{club.facilities.trainingGroundLevel * 2}% / semana</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono-num text-slate-300">
              Coste nivel superior: <strong className="text-amber-400">80.000 €</strong>
            </span>
            <button
              onClick={handleUpgradeTraining}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
            >
              Mejorar Complejo
            </button>
          </div>
        </div>

        {/* 3. YOUTH ACADEMY */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm font-condensed uppercase">
                  Cantera & Escuela de Fútbol Base
                </h3>
              </div>
              <span className="text-xs font-mono-num text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded">
                Nivel {club.facilities.youthAcademyLevel} / 5
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Red de captación juvenil local y residencia de canteranos. Genera periódicamente jóvenes promesas colomenses con alto potencial para el primer equipo.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono-num mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Calidad media hornada:</span>
                <strong className="text-slate-100">{50 + club.facilities.youthAcademyLevel * 4} OVR inicial</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Techo potencial canterano:</span>
                <strong className="text-emerald-400">Hasta {75 + club.facilities.youthAcademyLevel * 4} POT</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono-num text-slate-300">
              Coste nivel superior: <strong className="text-amber-400">95.000 €</strong>
            </span>
            <button
              onClick={handleUpgradeAcademy}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
            >
              Potenciar Cantera
            </button>
          </div>
        </div>

        {/* 4. MEDICAL CENTER */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-sm font-condensed uppercase">
                  Centro Médico & Fisioterapia
                </h3>
              </div>
              <span className="text-xs font-mono-num text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded">
                Nivel {club.facilities.medicalCenterLevel} / 5
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Quirófanos de diagnóstico ecográfico, cámaras hiperbáricas y fisioterapeutas de primer nivel para prevenir lesiones y recortar plazos de baja.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs font-mono-num mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Prevención de lesiones:</span>
                <strong className="text-emerald-400">-{club.facilities.medicalCenterLevel * 10}% riesgo</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Aceleración del alta:</span>
                <strong className="text-slate-100">-{club.facilities.medicalCenterLevel * 0.5} semanas</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono-num text-slate-300">
              Coste nivel superior: <strong className="text-amber-400">65.000 €</strong>
            </span>
            <button
              onClick={handleUpgradeMedical}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-colors"
            >
              Mejorar Servicios Médicos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
