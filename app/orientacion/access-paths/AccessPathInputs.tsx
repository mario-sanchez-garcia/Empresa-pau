'use client'

import { AlertTriangle, BadgeCheck, Info } from 'lucide-react'
import GradeControl from '../GradeControl'
import styles from '../orientation.module.css'
import { getAccessPath } from './model'
import type { AccessScenario } from './types'

function ChoiceGroup({ label, value, options, onChange }: { label: string; value: string; options: Array<{ id: string; label: string; description: string }>; onChange: (value: string) => void }) {
  return (
    <div className={styles.routeChoice}>
      <span>{label}</span>
      <div role="radiogroup" aria-label={label}>{options.map(option => <button type="button" role="radio" aria-checked={value === option.id} key={option.id} onClick={() => onChange(option.id)}><b>{option.label}</b><small>{option.description}</small></button>)}</div>
    </div>
  )
}

export default function AccessPathInputs({ scenario, onChange }: { scenario: AccessScenario; onChange: (scenario: AccessScenario) => void }) {
  const path = getAccessPath(scenario.pathId)
  const subjectNote = <div className={styles.subjectOrigin}><BadgeCheck size={14} /><span><b>Qué materias sirven en esta vía</b>{path.subjectOrigin}</span></div>

  if (scenario.pathId === 'spanish_bachillerato') return (
    <>
      <GradeControl id="bachillerato" label="Nota media Bachillerato" hint="60% de la fase de acceso" value={scenario.bachillerato} onChange={bachillerato => onChange({ ...scenario, bachillerato })} />
      <GradeControl id="fase-acceso" label="Fase de acceso PAU" hint="40% de la fase de acceso" value={scenario.accessPhase} onChange={accessPhase => onChange({ ...scenario, accessPhase })} />
      {subjectNote}
    </>
  )

  if (scenario.pathId === 'bachibac') return (
    <>
      <ChoiceGroup label="¿Qué título usarás para acceder?" value={scenario.route} onChange={route => onChange({ ...scenario, route: route === 'spanish_pau' ? 'spanish_pau' : 'french_diploma' })} options={[
        { id: 'french_diploma', label: 'Diplôme du Baccalauréat', description: 'Base Bachibac 70/30' },
        { id: 'spanish_pau', label: 'Título español + PAU', description: 'Base ordinaria 60/40' },
      ]} />
      {scenario.route === 'french_diploma' ? <>
        <GradeControl id="bachibac-media" label="Nota media Bachillerato" hint="70% de la nota del diplôme" value={scenario.bachillerato} onChange={bachillerato => onChange({ ...scenario, bachillerato })} />
        <GradeControl id="bachibac-externa" label="Prueba externa Bachibac" hint="30% de la nota del diplôme" value={scenario.externalTest} onChange={externalTest => onChange({ ...scenario, externalTest })} />
        <div className={styles.pathInlineNotice}><Info size={14} /><span>Esta base sustituye a la fórmula ordinaria 60/40. La prueba externa debe estar superada.</span></div>
      </> : <>
        <GradeControl id="bachibac-bachillerato" label="Nota media Bachillerato" hint="60% de la fase de acceso" value={scenario.bachillerato} onChange={bachillerato => onChange({ ...scenario, bachillerato })} />
        <GradeControl id="bachibac-pau" label="Fase de acceso PAU" hint="40% de la fase de acceso" value={scenario.accessPhase} onChange={accessPhase => onChange({ ...scenario, accessPhase })} />
        <div className={styles.pathInlineNotice}><Info size={14} /><span>Historia de España y Primera Lengua Extranjera pueden tomar las notas equivalentes de la prueba externa, conforme al procedimiento Bachibac.</span></div>
      </>}
      {subjectNote}
    </>
  )

  if (scenario.pathId === 'ib') return (
    <>
      <ChoiceGroup label="¿Qué dato tienes ahora?" value={scenario.inputMode} onChange={inputMode => onChange({ ...scenario, inputMode: inputMode === 'subject_average' ? 'subject_average' : 'accredited_cau' })} options={[
        { id: 'accredited_cau', label: 'CAU de UNEDasiss', description: 'Dato definitivo de la acreditación' },
        { id: 'subject_average', label: 'Media de materias IB', description: 'Estimación oficial 2–7 → 5–10' },
      ]} />
      {scenario.inputMode === 'accredited_cau'
        ? <GradeControl allowEmpty id="ib-cau" label="CAU acreditada por UNEDasiss" hint="Copia la calificación entre 5 y 10" value={scenario.accreditedCau} minimum={5} onChange={accreditedCau => onChange({ ...scenario, accreditedCau })} />
        : <GradeControl allowEmpty id="ib-media" label="Media de las materias del Diploma IB" hint="Usa las calificaciones 2–7 del certificado; no los puntos /45" value={scenario.subjectAverage} minimum={2} maximum={7} step={0.01} suffix="/ 7" onChange={subjectAverage => onChange({ ...scenario, subjectAverage })} />}
      <div className={styles.pathInlineNotice}><Info size={14} /><span>La acreditación emitida por UNEDasiss prevalece sobre esta simulación.</span></div>
      {subjectNote}
    </>
  )

  return (
    <>
      <ChoiceGroup label="¿De qué sistema procedes?" value={scenario.route} onChange={route => onChange({ ...scenario, route: route === 'homologation_pce' || route === 'homologation_pending' ? route : 'direct_unedasiss' })} options={[
        { id: 'direct_unedasiss', label: 'UE / convenio', description: 'Acceso directo con UNEDasiss' },
        { id: 'homologation_pce', label: 'Sin convenio + PCE', description: 'Homologación y modalidad' },
        { id: 'homologation_pending', label: 'Sin PCE/modalidad', description: 'Caso todavía incompleto' },
      ]} />
      {scenario.route === 'direct_unedasiss' && <GradeControl allowEmpty id="international-cau" label="CAU acreditada por UNEDasiss" hint="Calificación oficial entre 5 y 10" value={scenario.accreditedCau} minimum={5} onChange={accreditedCau => onChange({ ...scenario, accreditedCau })} />}
      {scenario.route === 'homologation_pce' && <>
        <GradeControl allowEmpty id="international-media" label="Nota media del Bachillerato homologado" hint="Aporta 0,2 × la media a la CAU" value={scenario.homologatedAverage} minimum={5} onChange={homologatedAverage => onChange({ ...scenario, homologatedAverage })} />
        <div className={styles.pceGroup}><div><b>PCE para acreditar modalidad</b><span>Se suman hasta cuatro aprobadas con ×0,1 en la nota de acceso.</span></div><div className={styles.pceGrid}>{scenario.pceGrades.map((value, index) => <GradeControl allowEmpty key={index} id={`pce-${index + 1}`} label={`PCE ${index + 1}`} value={value} onChange={grade => { const pceGrades = [...scenario.pceGrades] as [number | null, number | null, number | null, number | null]; pceGrades[index] = grade; onChange({ ...scenario, pceGrades }) }} />)}</div></div>
      </>}
      {scenario.route === 'homologation_pending' && <div className={styles.incompletePath}><AlertTriangle size={18} /><div><b>Todavía no podemos calcular una nota comparable.</b><p>Sin PCE superadas ni modalidad acreditada, Madrid sitúa esta solicitud en la convocatoria extraordinaria y detrás de quienes sí cumplen esos requisitos. Kairo no inventará una equivalencia.</p></div></div>}
      {scenario.route !== 'homologation_pending' && subjectNote}
    </>
  )
}
