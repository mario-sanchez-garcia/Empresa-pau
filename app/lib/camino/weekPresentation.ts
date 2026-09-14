export type WeekLoadStatus = 'pending' | 'loading' | 'ready' | 'error'

/** Empty cells describe known state, never invent a free-review activity. */
export function emptyStudyDayLabel(input: {
  date: string; today: string; examDate: string; isStudyDay: boolean; isHoliday: boolean; state: WeekLoadStatus
}): string {
  if (input.examDate && input.date >= input.examDate) return 'Fuera del periodo de preparación'
  if (input.today && input.date < input.today) return 'Sin actividad'
  if (input.isHoliday) return 'Festivo'
  if (!input.isStudyDay) return 'Descanso'
  if (input.state === 'loading') return 'Preparando misiones…'
  if (input.state === 'error') return 'No se ha podido cargar'
  return input.state === 'ready' ? 'Sin misiones programadas' : 'Pendiente de planificar'
}
