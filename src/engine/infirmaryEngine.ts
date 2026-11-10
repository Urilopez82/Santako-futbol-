import { GameSave, NewsItem } from '../types/game';
import { Player } from '../types/player';
import { DetailedInjury, InjurySeverity, TreatmentType, MedicalStaffReport } from '../types/infirmary';

const INJURY_CATALOG: Array<{ name: string; severity: InjurySeverity; baseWeeks: number }> = [
  { name: 'Sobrecarga en los isquiotibiales', severity: 'LEVE', baseWeeks: 1 },
  { name: 'Contractura en el gemelo', severity: 'LEVE', baseWeeks: 1 },
  { name: 'Esguince leve de tobillo (Grado I)', severity: 'LEVE', baseWeeks: 2 },
  { name: 'Microrotura en el recto anterior', severity: 'MODERADA', baseWeeks: 3 },
  { name: 'Fascitis plantar aguda', severity: 'MODERADA', baseWeeks: 4 },
  { name: 'Esguince de ligamento lateral interno (Grado II)', severity: 'MODERADA', baseWeeks: 5 },
  { name: 'Rotura fibrilar de 3cm en el bíceps femoral', severity: 'GRAVE', baseWeeks: 6 },
  { name: 'Fisura en el quinto metatarsiano', severity: 'GRAVE', baseWeeks: 8 },
  { name: 'Rotura parcial del menisco externo', severity: 'GRAVE', baseWeeks: 10 },
  { name: 'Rotura completa del ligamento cruzado anterior (LCA)', severity: 'CRÍTICA', baseWeeks: 26 },
  { name: 'Fractura de tibia y peroné con desplazamiento', severity: 'CRÍTICA', baseWeeks: 28 },
];

export function ensureInfirmaryState(save: GameSave): GameSave {
  const injuries = { ...(save.infirmaryInjuries || {}) };
  const userClub = save.clubs[save.userClubId];
  const currentDate = save.currentDate || '2026-08-15';

  // Find club's chief medical officer from staff or default
  const doctor = userClub?.staffMembers?.find((s: any) => s.role === 'Médico Jefe' || s.role === 'Fisioterapeuta Jefe') || {
    name: 'Dr. Alejandro Ripoll',
    ability: 15,
  };
  const doctorLevel = Math.max(1, Math.min(5, Math.round((doctor.ability || 15) / 4)));

  // Check user club players who are injured but not yet registered in infirmary
  Object.values(save.players || {}).forEach((player) => {
    if (player.clubId === save.userClubId && player.isInjured) {
      if (!injuries[player.id]) {
        // Pick or match injury catalog
        const template = INJURY_CATALOG.find((i) => i.name === player.injuryName) || 
          INJURY_CATALOG[Math.floor(Math.random() * INJURY_CATALOG.length)];
        
        const initialWeeks = player.injuryWeeksLeft || template.baseWeeks;
        injuries[player.id] = {
          id: `inj_${player.id}_${Date.now()}`,
          playerId: player.id,
          playerName: `${player.firstName} ${player.lastName}`,
          position: player.primaryPosition,
          injuryName: template.name,
          severity: template.severity,
          dateOccurred: currentDate,
          estimatedReturnDate: calculateReturnDate(currentDate, initialWeeks),
          initialWeeks,
          weeksRemaining: initialWeeks,
          treatment: template.severity === 'CRÍTICA' ? 'CIRUGIA_ARTROSCOPICA' : 'FISIOTERAPIA_INTENSIVA',
          treatmentName: template.severity === 'CRÍTICA' ? 'Intervención Quirúrgica Reparadora' : 'Fisioterapia Regenerativa y Descarga',
          responsibleDoctor: doctor.name,
          doctorLevel,
          status: 'EN_TRATAMIENTO',
          relapseRiskPercent: Math.max(5, 25 - doctorLevel * 3),
          evolutionLog: [
            `${currentDate}: Diagnóstico confirmado por el ${doctor.name}. ${template.name} (${template.severity}). Se prescribe protocolo terapéutico.`,
          ],
        };
      }
    } else if (player.clubId === save.userClubId && !player.isInjured && injuries[player.id]) {
      // Player is healed
      delete injuries[player.id];
    }
  });

  return {
    ...save,
    infirmaryInjuries: injuries,
  };
}

export function applyTreatmentToInjury(
  save: GameSave,
  playerId: string,
  treatment: TreatmentType
): { updatedSave: GameSave; newsItem?: NewsItem } {
  const injuries = { ...(save.infirmaryInjuries || {}) };
  const currentInj = injuries[playerId];
  if (!currentInj) return { updatedSave: save };

  let treatmentName = 'Protocolo Conservador';
  let weekReduction = 0;
  let relapseRisk = currentInj.relapseRiskPercent;

  switch (treatment) {
    case 'CONSERVADOR':
      treatmentName = 'Protocolo Conservador (Reposo y Crioterapia)';
      relapseRisk = Math.max(5, relapseRisk - 5);
      break;
    case 'FISIOTERAPIA_INTENSIVA':
      treatmentName = 'Fisioterapia Intensiva y Readaptación Funcional';
      weekReduction = currentInj.weeksRemaining > 3 ? 1 : 0;
      relapseRisk = Math.min(30, relapseRisk + 2);
      break;
    case 'INFILTRACION_PRP':
      treatmentName = 'Terapia Biológica con Factores de Crecimiento (PRP)';
      weekReduction = currentInj.weeksRemaining > 4 ? 1 : 0;
      relapseRisk = Math.max(8, relapseRisk - 3);
      break;
    case 'CIRUGIA_ARTROSCOPICA':
      treatmentName = 'Cirugía Artroscópica Reconstructiva';
      relapseRisk = 6;
      break;
    case 'CAMARA_HIPERBARICA':
      treatmentName = 'Oxigenoterapia en Cámara Hiperbárica';
      weekReduction = currentInj.weeksRemaining > 2 ? 1 : 0;
      relapseRisk = Math.max(5, relapseRisk - 4);
      break;
  }

  const updatedWeeks = Math.max(1, currentInj.weeksRemaining - weekReduction);
  const updatedInjury: DetailedInjury = {
    ...currentInj,
    treatment,
    treatmentName,
    weeksRemaining: updatedWeeks,
    relapseRiskPercent: relapseRisk,
    evolutionLog: [
      ...currentInj.evolutionLog,
      `${save.currentDate}: Se aplica nuevo tratamiento: ${treatmentName}. Semanas estimadas restantes: ${updatedWeeks}.`,
    ],
  };

  injuries[playerId] = updatedInjury;

  return {
    updatedSave: {
      ...save,
      infirmaryInjuries: injuries,
    },
  };
}

export function progressWeeklyInjuries(save: GameSave): GameSave {
  const injuries = { ...(save.infirmaryInjuries || {}) };
  const players = { ...(save.players || {}) };
  const currentDate = save.currentDate || '2026-08-15';
  let hasChanges = false;

  const doctor = save.clubs[save.userClubId]?.staffMembers?.find((s: any) => s.role === 'Médico Jefe' || s.role === 'Fisioterapeuta Jefe');
  const doctorBonus = doctor ? doctor.ability >= 16 : false;

  Object.entries(injuries).forEach(([playerId, inj]) => {
    const player = players[playerId];
    if (!player) return;

    const weeksLeft = Math.max(0, inj.weeksRemaining - (doctorBonus && Math.random() < 0.20 ? 2 : 1));

    if (weeksLeft <= 0) {
      // Healed!
      player.isInjured = false;
      player.injuryWeeksLeft = 0;
      player.injuryName = undefined;
      player.fitness = 82; // returns in decent condition
      delete injuries[playerId];
      hasChanges = true;
    } else {
      inj.weeksRemaining = weeksLeft;
      player.injuryWeeksLeft = weeksLeft;
      if (weeksLeft === 1) {
        inj.status = 'EN_READAPTACION';
        inj.evolutionLog.push(`${currentDate}: El jugador entra en fase de readaptación sobre el césped.`);
      }
      hasChanges = true;
    }
  });

  if (!hasChanges) return save;

  return {
    ...save,
    players,
    infirmaryInjuries: injuries,
  };
}

function calculateReturnDate(startDateStr: string, weeks: number): string {
  try {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + weeks * 7);
    return d.toISOString().split('T')[0];
  } catch {
    return 'En recuperación';
  }
}
