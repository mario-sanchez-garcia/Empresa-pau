'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { resolveStudyAccess, type StudyAccess } from '@/app/lib/camino/studyAccess'

export function useStudyAccess() {
  const [access, setAccess] = useState<StudyAccess | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        const token = data.session?.access_token
        let next = resolveStudyAccess([])
        if (token) {
          const response = await fetch('/api/billing/me', { headers: { Authorization: `Bearer ${token}` } })
          if (!response.ok) throw new Error('access_unavailable')
          const json = await response.json()
          if (!json.studyAccess) throw new Error('access_unavailable')
          next = json.studyAccess
        }
        if (!cancelled) { setAccess(next); setError('') }
      } catch {
        if (!cancelled) { setAccess(null); setError('No se pudo verificar tu acceso. Recarga para volver a intentarlo.') }
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])
  return { access, error }
}
