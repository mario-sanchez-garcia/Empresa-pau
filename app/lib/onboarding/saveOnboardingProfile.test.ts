import assert from 'node:assert/strict'
import test from 'node:test'
import { cleanStudentExamsForSubjects, cleanSupportedSubjects } from './onboardingValidation.ts'

test('onboarding accepts only enabled catalog subjects and removes duplicates', () => {
  assert.deepEqual(
    cleanSupportedSubjects(['Matemáticas II', 'Biología', 'Inventada', 'Matemáticas II', ' Inglés ']),
    ['Matemáticas II', 'Inglés'],
  )
})

test('upcoming exams are limited to subjects selected by the user', () => {
  const exams = cleanStudentExamsForSubjects([
    { subject: 'Inglés', date: '2027-01-10', name: 'Parcial' },
    { subject: 'Química', date: '2027-01-11', name: 'No seleccionada' },
    { subject: 'Inventada', date: '2027-01-12', name: 'Inválida' },
  ], ['Inglés'])
  assert.equal(exams.length, 1)
  assert.equal(exams[0].subject, 'Inglés')
})
