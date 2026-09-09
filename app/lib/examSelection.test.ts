import assert from 'node:assert/strict'
import test from 'node:test'
import { examenesCataluna } from '../data/examenes_cataluna.ts'
import { cataloniaHistoryExamsForYear, selectCataloniaHistoryExam } from './examSelection.ts'

test('all official Catalonia History sessions for a year remain selectable', () => {
  const exams = cataloniaHistoryExamsForYear(Object.values(examenesCataluna), 2024)
  assert.deepEqual(exams.map(exam => exam.serie), ['Serie 1', 'Serie 3', 'Serie 5'])
  assert.equal(selectCataloniaHistoryExam(exams, 0)?.id, 'cat_2024_s1')
  assert.equal(selectCataloniaHistoryExam(exams, 1)?.id, 'cat_2024_s3')
  assert.equal(selectCataloniaHistoryExam(exams, 2)?.id, 'cat_2024_s5')
})

test('invalid Catalonia History session indexes fail safely to the first session', () => {
  const exams = cataloniaHistoryExamsForYear(Object.values(examenesCataluna), 2023)
  assert.equal(selectCataloniaHistoryExam(exams, 99)?.id, 'cat_2023_s1')
  assert.equal(selectCataloniaHistoryExam([], 0), null)
})
