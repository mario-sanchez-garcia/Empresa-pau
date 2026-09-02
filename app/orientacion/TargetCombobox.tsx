'use client'

import { useId, useMemo, useState } from 'react'
import { Check, ChevronDown, Search, ShieldCheck, X } from 'lucide-react'
import { buildCatalogSearchIndex, searchOrientationTargets } from './catalog'
import type { OrientationTarget } from './data'
import styles from './orientation.module.css'

type UniversityOption = { id: string; acronym: string | null; name: string }

export default function TargetCombobox({ targets, selectedId, universities, onSelect }: {
  targets: OrientationTarget[]
  selectedId: string
  universities: UniversityOption[]
  onSelect: (id: string) => void
}) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const index = useMemo(() => buildCatalogSearchIndex(targets), [targets])
  const results = useMemo(() => searchOrientationTargets(index, query, universityId).slice(0, 12), [index, query, universityId])
  const selected = targets.find(item => item.id === selectedId) ?? null

  function choose(target: OrientationTarget) {
    onSelect(target.id)
    setQuery('')
    setOpen(false)
    setActiveIndex(0)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(current => Math.min(results.length - 1, current + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(current => Math.max(0, current - 1))
    } else if (event.key === 'Enter' && open && results[activeIndex]) {
      event.preventDefault()
      choose(results[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={styles.targetChooser} data-selected-id={selectedId}>
      <div className={styles.searchSteps} aria-label="Busca tu objetivo">
        <label className={styles.searchField}>
          <span><b>1</b> Buscar grado</span>
          <div className={styles.searchInputWrap}>
            <Search size={17} aria-hidden="true" />
            <input
              role="combobox"
              aria-label="Carrera y universidad"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={open && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
              value={query}
              placeholder="Ej. análisis datos, psicolo, economi UC3M…"
              onFocus={() => setOpen(true)}
              onChange={event => { setQuery(event.target.value); setOpen(true); setActiveIndex(0) }}
              onKeyDown={onKeyDown}
            />
            {query && <button type="button" aria-label="Limpiar búsqueda" onClick={() => { setQuery(''); setActiveIndex(0) }}><X size={15} /></button>}
          </div>
        </label>
        <label className={styles.universityField}>
          <span><b>2</b> Universidad</span>
          <span className={styles.nativeSelectWrap}>
            <select aria-label="Filtrar universidad del objetivo" value={universityId} onChange={event => { setUniversityId(event.target.value); setOpen(true); setActiveIndex(0) }}>
              <option value="">Todas las universidades</option>
              {universities.map(item => <option key={item.id} value={item.id}>{item.acronym ? `${item.acronym} · ` : ''}{item.name}</option>)}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </span>
        </label>
      </div>

      {open && (
        <div className={styles.comboboxPanel} id={listId} role="listbox" aria-label="Resultados de grados">
          <div className={styles.resultsMeta}><span><b>3</b> Resultados</span><small>{results.length ? `${results.length} mejores coincidencias` : 'Sin coincidencias'}</small></div>
          {results.length ? results.map((item, resultIndex) => (
            <button
              type="button"
              id={`${listId}-${resultIndex}`}
              role="option"
              aria-selected={item.id === selectedId}
              className={resultIndex === activeIndex ? styles.activeResult : ''}
              key={item.id}
              onMouseEnter={() => setActiveIndex(resultIndex)}
              onMouseDown={event => event.preventDefault()}
              onClick={() => choose(item)}
            >
              <span><strong>{item.degree}</strong><small>{item.universityAcronym ? `${item.universityAcronym} · ` : ''}{item.university}</small></span>
              <span className={styles.resultReference}><small><ShieldCheck size={11} /> OFICIAL</small><b>{item.referenceScore.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</b>{item.id === selectedId && <Check size={15} />}</span>
            </button>
          )) : <div className={styles.comboEmpty}>Prueba con menos palabras o cambia la universidad.</div>}
        </div>
      )}

      {selected && (
        <div className={styles.selectedTarget}>
          <div className={styles.selectedTargetIcon}><Check size={17} /></div>
          <div><small>Objetivo seleccionado</small><strong>{selected.degree}</strong><span>{selected.universityAcronym ? `${selected.universityAcronym} · ` : ''}{selected.university}</span></div>
          <div className={styles.selectedScore}><small>Referencia {selected.source.academicYear}</small><b>{selected.referenceScore.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</b></div>
        </div>
      )}
    </div>
  )
}
