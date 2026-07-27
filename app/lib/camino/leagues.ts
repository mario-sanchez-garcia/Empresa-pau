export const DIVISIONS = [
  { name: 'Bronce',    min: 0,     max: 499,      bg: '#fff7ed', text: '#92400e', bar: '#b45309' },
  { name: 'Plata',     min: 500,   max: 1499,     bg: '#f8fafc', text: '#475569', bar: '#94a3b8' },
  { name: 'Oro',       min: 1500,  max: 3499,     bg: '#fefce8', text: '#a16207', bar: '#eab308' },
  { name: 'Platino',   min: 3500,  max: 6999,     bg: '#f0f9ff', text: '#0369a1', bar: '#38bdf8' },
  { name: 'Diamante',  min: 7000,  max: 12999,    bg: '#eff6ff', text: '#1d4ed8', bar: '#2563eb' },
  { name: 'Élite PAU', min: 13000, max: Infinity, bg: '#f5f3ff', text: '#6d28d9', bar: '#7c3aed' },
]

export function divisionFor(xp: number) {
  return DIVISIONS.find(d => xp >= d.min && xp <= d.max) ?? DIVISIONS[0]
}
