export const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/

export function normalizeUsername(u: string): string {
  return u.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const RESERVED_SET = new Set([
  'kairo', 'admin', 'soporte', 'moderador', 'staff', 'administrador',
  'kairo_admin', 'kairoapp', 'kairo.admin', 'kairo.app',
  'support', 'help', 'ayuda', 'mod', 'mods', 'sistema',
].map(normalizeUsername))

export function validateUsername(u: string): string | null {
  if (!u) return 'Obligatorio'
  if (u.length < 3) return 'Mínimo 3 caracteres'
  if (u.length > 20) return 'Máximo 20 caracteres'
  if (!USERNAME_RE.test(u)) return 'Solo letras, números, punto y guion bajo. Sin espacios'
  if (RESERVED_SET.has(normalizeUsername(u))) return 'Este nombre está reservado'
  return null
}

export function generateCandidates(base: string): string[] {
  const b = base.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 17)
  if (!b) return []
  const out: string[] = []
  for (let i = 1; out.length < 5 && i <= 30; i++) {
    const c = `${b}${i}`
    if (!validateUsername(c)) out.push(c)
  }
  return out
}
