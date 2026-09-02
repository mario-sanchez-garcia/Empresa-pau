'use client'

import { BookOpenCheck, ChevronDown, ExternalLink, Info, Route } from 'lucide-react'
import { useState } from 'react'
import styles from '../orientation.module.css'
import { ACCESS_PATHS, getAccessPath } from './model'
import type { AccessPathId } from './types'

export default function AccessPathSelector({ value, onChange }: { value: AccessPathId; onChange: (value: AccessPathId) => void }) {
  const [showDetails, setShowDetails] = useState(false)
  const path = getAccessPath(value)

  return (
    <div className={styles.accessPathBlock}>
      <div className={styles.accessPathHeading}>
        <div><Route size={15} /><span><b>Vía de acceso</b><small>¿Desde qué vía accedes a la universidad?</small></span></div>
        {value !== 'spanish_bachillerato' && <span className={styles.pathChangedBadge}>Cálculo adaptado</span>}
      </div>
      <div className={styles.accessPathOptions} role="radiogroup" aria-label="Vía de acceso a la universidad">
        {ACCESS_PATHS.map(option => (
          <button key={option.id} type="button" role="radio" aria-checked={value === option.id} onClick={() => { setShowDetails(false); onChange(option.id) }}>
            <span>{option.shortLabel}</span><small>{option.description}</small>
          </button>
        ))}
      </div>
      {value !== 'spanish_bachillerato' && (
        <div className={styles.accessPathContext}>
          <div><Info size={14} /><span>Tu vía de acceso modifica cómo se calcula la nota.</span></div>
          <button type="button" aria-expanded={showDetails} aria-controls="access-path-details" onClick={() => setShowDetails(current => !current)}>Ver qué cambia <ChevronDown size={13} /></button>
        </div>
      )}
      {showDetails && (
        <div className={styles.accessPathDetails} id="access-path-details">
          <div className={styles.officialPathExplanation}>
            <span><BookOpenCheck size={13} /> OFICIAL</span>
            <p>{path.officialSummary}</p>
            <ul>{path.changes.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className={styles.kairoPathExplanation}>
            <span>KAIRO TE LO EXPLICA</span>
            <p>{path.kairoSummary}</p>
            <dl><div><dt>Necesitamos</dt><dd>{path.needs.join(' · ')}</dd></div><div><dt>Sigue igual</dt><dd>{path.stays.join(' · ')}</dd></div></dl>
          </div>
          <div className={styles.accessPathSources}>
            {path.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.organization} · {source.period} <ExternalLink size={11} /></a>)}
          </div>
        </div>
      )}
    </div>
  )
}
