'use client'

import type { CSSProperties } from 'react'
import styles from './orientation.module.css'

function clamp(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum
  return Math.min(maximum, Math.max(minimum, value))
}

type GradeControlBaseProps = {
  id: string
  label: string
  hint?: string
  disabled?: boolean
  minimum?: number
  maximum?: number
  step?: number
  suffix?: string
}

type GradeControlProps = GradeControlBaseProps & ({
  allowEmpty: true
  value: number | null
  onChange: (value: number | null) => void
} | {
  allowEmpty?: false
  value: number
  onChange: (value: number) => void
})

export default function GradeControl(props: GradeControlProps) {
  const { id, label, hint, disabled = false, minimum = 0, maximum = 10, step = 0.05, suffix = '/ 10' } = props
  const numericValue = props.value ?? minimum
  const progress = ((numericValue - minimum) / (maximum - minimum)) * 100

  function updateFromNumber(rawValue: string) {
    if (props.allowEmpty) {
      props.onChange(rawValue === '' ? null : clamp(Number(rawValue), minimum, maximum))
      return
    }
    props.onChange(clamp(Number(rawValue), minimum, maximum))
  }

  function updateFromRange(rawValue: string) {
    const nextValue = clamp(Number(rawValue), minimum, maximum)
    if (props.allowEmpty) props.onChange(nextValue)
    else props.onChange(nextValue)
  }

  return (
    <div className={styles.gradeControl}>
      <div className={styles.controlHeading}>
        <div><label htmlFor={`${id}-range`}>{label}</label>{hint && <span>{hint}</span>}</div>
        <div className={styles.numberWrap}>
          <input id={`${id}-number`} aria-label={`${label}, nota numérica`} type="number" min={minimum} max={maximum} step={step} value={props.value ?? ''} placeholder={props.allowEmpty ? '—' : undefined} disabled={disabled} onChange={event => updateFromNumber(event.target.value)} />
          <span>{suffix}</span>
        </div>
      </div>
      <input id={`${id}-range`} aria-label={label} className={styles.range} type="range" min={minimum} max={maximum} step={step} value={numericValue} disabled={disabled} style={{ '--range-progress': `${Math.max(0, Math.min(100, progress))}%` } as CSSProperties} onChange={event => updateFromRange(event.target.value)} />
    </div>
  )
}
