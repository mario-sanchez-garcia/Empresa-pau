import type Anthropic from '@anthropic-ai/sdk'

// Tools que puede invocar Kairo (Claude) en el chat ampliado de Camino PAU.
// CADA una mapea a un endpoint ya existente y ya validado -- Claude nunca
// escribe en camino_calendar/user_learning_queue/curriculum_topics
// directamente, solo propone una acción (ver app/api/camino/chat/route.ts,
// que construye un CaminoChatPreview a partir del tool_use y lo entrega al
// alumno para confirmar; la escritura real ocurre en
// CaminoAssistant.tsx::executePreview(), sin cambios, contra los mismos
// endpoints que ya usaba el parser de keywords anterior).
//
// A propósito NO existe ninguna tool para "marcar no dado en clase": esa
// acción solo está permitida para 2 temas concretos (ver allowlist en
// /api/camino/postpone-mission) y no tiene sentido exponerla a lenguaje
// natural. Tampoco existe ninguna tool que permita elegir missionType/kind
// libremente -- anadirRepasoExtra siempre crea contenido bonus/review, nunca
// un Simulacro (ver límite mensual aplicado en calendar-editor/mission).
export const CAMINO_CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'moverMision',
    description:
      'Mueve una misión YA EXISTENTE del calendario del alumno a otra fecha y/o hora. ' +
      'El missionId debe ser uno real, tomado literalmente del listado "Misiones pendientes" ' +
      'del contexto -- nunca inventes un id. Esto es solo una PROPUESTA: el alumno debe ' +
      'confirmarla antes de que se aplique de verdad, así que nunca digas que el cambio ya se hizo.',
    input_schema: {
      type: 'object',
      properties: {
        missionId: {
          type: 'string',
          description: 'ID exacto de la misión a mover, copiado del listado de misiones pendientes del contexto.',
        },
        nuevaFecha: {
          type: 'string',
          description: 'Nueva fecha en formato YYYY-MM-DD. Si el alumno solo pide cambiar la hora, usa la misma fecha que ya tenía la misión.',
        },
        nuevaHora: {
          type: 'string',
          description: 'Nueva hora en formato HH:MM (24h). Omite este campo si el alumno no menciona ninguna hora nueva y quieres conservar la hora original de la misión.',
        },
      },
      required: ['missionId', 'nuevaFecha'],
    },
  },
  {
    name: 'anadirRepasoExtra',
    description:
      'Añade una sesión de repaso adicional (bonus) al calendario del alumno. Nunca cuenta ' +
      'como Simulacro ni como misión del Curso -- es siempre contenido extra de refuerzo. ' +
      'Requiere que el alumno haya dado explícitamente la ASIGNATURA y la DURACIÓN en minutos. ' +
      'Si falta cualquiera de las dos, NO llames a esta herramienta: pregúntalas primero en ' +
      'una respuesta de texto normal, sin tool.',
    input_schema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'Slug de la asignatura, tomado literalmente de la lista "Asignaturas del alumno" del contexto. Nunca inventes una asignatura que no esté en esa lista.',
        },
        tema: {
          type: 'string',
          description: 'Descripción breve de qué se va a repasar, en las palabras del alumno.',
        },
        fecha: {
          type: 'string',
          description: 'Fecha de la sesión en formato YYYY-MM-DD.',
        },
        hora: {
          type: 'string',
          description: 'Hora en formato HH:MM (24h). Omite este campo si el alumno no ha dado ninguna hora concreta.',
        },
        duracionMin: {
          type: 'integer',
          description: 'Duración en minutos (entre 5 y 180). Debe venir explícitamente del alumno -- nunca un valor inventado por ti.',
        },
      },
      required: ['subject', 'tema', 'fecha', 'duracionMin'],
    },
  },
  {
    name: 'anadirExamen',
    description:
      'Registra un examen real del alumno y hace que Kairo reorganice su plan de estudio ' +
      'alrededor de esa fecha (motor real de planificación, no un simple recordatorio). ' +
      'Requiere asignatura, fecha futura y una descripción del temario que entra. Si falta ' +
      'cualquiera de los tres, pregunta antes de llamar a esta herramienta.',
    input_schema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'Slug de la asignatura, tomado literalmente de la lista "Asignaturas del alumno" del contexto.',
        },
        temario: {
          type: 'string',
          description: 'Qué temas o bloques entran en el examen, en las palabras del alumno.',
        },
        fecha: {
          type: 'string',
          description: 'Fecha del examen en formato YYYY-MM-DD. Debe ser una fecha futura.',
        },
      },
      required: ['subject', 'temario', 'fecha'],
    },
  },
  {
    name: 'reorganizarDia',
    description:
      'Reorganiza automáticamente TODAS las misiones pendientes de un día concreto, ' +
      'recolocándolas en los próximos huecos libres del alumno (respeta su disponibilidad ' +
      'real, incluyendo Google Calendar si lo tiene conectado). Úsala cuando el alumno pida ' +
      'liberar o reorganizar un día completo -- para mover una sola misión suelta usa moverMision.',
    input_schema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          description: 'Fecha del día a reorganizar, en formato YYYY-MM-DD.',
        },
      },
      required: ['fecha'],
    },
  },
]

export type MoverMisionInput = { missionId: string; nuevaFecha: string; nuevaHora?: string }
export type AnadirRepasoExtraInput = { subject: string; tema: string; fecha: string; hora?: string; duracionMin: number }
export type AnadirExamenInput = { subject: string; temario: string; fecha: string }
export type ReorganizarDiaInput = { fecha: string }
