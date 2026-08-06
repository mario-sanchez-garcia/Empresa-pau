// Debe coincidir con CHAT_SUBJECTS en app/page-client.tsx (los pills del
// Chat con Kairo) y con el check constraint de chat_threads.subject en la
// migración 20260806150000_create_chat_threads.sql. 'general' es el único
// valor que no es una asignatura real de Exámenes (ver comentario sobre
// CHAT_SUBJECTS en page-client.tsx).
export const CHAT_SUBJECTS = [
  'general',
  'mates',
  'matematicas_ccss',
  'fisica',
  'quimica',
  'biologia',
  'ingles',
  'lengua',
  'historia',
  'historia_filosofia',
] as const

export type ChatSubject = typeof CHAT_SUBJECTS[number]

export function isValidChatSubject(value: unknown): value is ChatSubject {
  return typeof value === 'string' && (CHAT_SUBJECTS as readonly string[]).includes(value)
}
