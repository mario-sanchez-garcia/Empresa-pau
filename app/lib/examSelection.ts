export type CataloniaHistoryExamLike = {
  id: string
  anio: number
  serie: string
}

export function cataloniaHistoryExamsForYear<T extends CataloniaHistoryExamLike>(source: T[], year: number | null) {
  return source.filter(exam => exam.anio === year)
}

export function selectCataloniaHistoryExam<T extends CataloniaHistoryExamLike>(exams: T[], sessionIndex: number) {
  return exams[sessionIndex] ?? exams[0] ?? null
}
