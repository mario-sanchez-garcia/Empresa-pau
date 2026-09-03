// Catálogo de asignaturas de la beta privada de Kairo: fuente única de qué
// asignaturas están activas (`betaStatus: 'enabled'`) y cuáles siguen
// bloqueadas ("Próximamente"). Módulo neutro (sin 'use client') para poder
// importarlo tanto desde app/components/onboarding/OnboardingFlow.tsx (donde
// decide qué puede elegir un alumno real) como desde app/landing/page.tsx
// (donde antes había un array de marketing duplicado a mano que se
// desincronizaba de la lista real — ver auditoria-plataforma-completa.md).
export const SUBJECT_OPTS: Array<{ id: string; label: string; color: string; betaStatus: 'enabled' | 'locked'; badge?: string }> = [
  { id: 'Matemáticas II', label: 'Matemáticas II', color: '#2563eb', betaStatus: 'enabled' },
  { id: 'Matemáticas CCSS', label: 'Matemáticas CCSS', color: '#7c3aed', betaStatus: 'enabled' },
  { id: 'Lengua Castellana', label: 'Lengua Castellana y Literatura', color: '#0891b2', betaStatus: 'enabled' },
  { id: 'Historia de España', label: 'Historia de España', color: '#b45309', betaStatus: 'enabled' },
  { id: 'Historia de la Filosofía', label: 'Historia de la Filosofía', color: '#c026d3', betaStatus: 'enabled' },
  { id: 'Inglés', label: 'Inglés', color: '#dc2626', betaStatus: 'enabled' },
  { id: 'Física', label: 'Física', color: '#0f766e', betaStatus: 'enabled' },
  { id: 'Química', label: 'Química', color: '#65a30d', betaStatus: 'enabled' },
  { id: 'Economía de la Empresa', label: 'Economía de la Empresa', color: '#ea580c', betaStatus: 'enabled' },
  { id: 'Biología', label: 'Biología', color: '#64748b', betaStatus: 'locked', badge: 'Próximamente' },
]
