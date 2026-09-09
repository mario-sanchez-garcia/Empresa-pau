import assert from 'node:assert/strict'
import test from 'node:test'
import { examTextDraftKey } from './useExamTextDraft.ts'

test('exam draft keys are stable and isolate user, question, option and community', () => {
  const first = examTextDraftKey(['principal', 'user-a', 'Madrid', 'mates', 2025, 'ordinaria', 'q1', 'A'])
  assert.equal(first, examTextDraftKey(['principal', 'user-a', 'Madrid', 'mates', 2025, 'ordinaria', 'q1', 'A']))
  assert.notEqual(first, examTextDraftKey(['principal', 'user-b', 'Madrid', 'mates', 2025, 'ordinaria', 'q1', 'A']))
  assert.notEqual(first, examTextDraftKey(['principal', 'user-a', 'Madrid', 'mates', 2025, 'ordinaria', 'q2', 'A']))
  assert.notEqual(first, examTextDraftKey(['principal', 'user-a', 'Cataluña', 'mates', 2025, 'ordinaria', 'q1', 'A']))
  assert.notEqual(first, examTextDraftKey(['principal', 'user-a', 'Madrid', 'mates', 2025, 'ordinaria', 'q1', 'B']))
})
