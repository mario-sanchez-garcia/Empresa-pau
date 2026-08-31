import { ExternalLink, ShieldCheck, Sparkles } from 'lucide-react'
import type { OfficialCriterion } from './data'
import styles from './orientation.module.css'

export default function OfficialCriterionCard({ criterion }: { criterion: OfficialCriterion }) {
  return (
    <article className={styles.criterionCard}>
      <div className={styles.officialBlock}>
        <div className={styles.criterionLabel}><ShieldCheck size={15} /> Oficial</div>
        <h3>{criterion.subject} · {criterion.criterionType}</h3>
        <p>{criterion.officialText}</p>
        <a href={criterion.sourceUrl} target="_blank" rel="noreferrer">Fuente oficial · {criterion.community} · {criterion.academicYear} <ExternalLink size={13} /></a>
      </div>
      <div className={styles.kairoExplanation}>
        <div className={styles.criterionLabel}><Sparkles size={15} /> En la práctica</div>
        <p>{criterion.kairoExplanation ?? 'La explicación de Kairo está pendiente de revisión.'}</p>
      </div>
    </article>
  )
}
