'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronDown, ExternalLink, GraduationCap, MapPin, RefreshCw, ShieldCheck, Target, TrendingUp } from 'lucide-react'
import type { OrientationTarget, SavedOrientationTarget } from './data'
import { classifyOpportunity, isSavedOpportunity, opportunityDifference, rankOpportunities, type OpportunityCategory } from './opportunities'
import styles from './orientation.module.css'

const INITIAL_VISIBLE = 6
const formatGrade = (value: number) => value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const CATEGORY_META: Record<Exclude<OpportunityCategory, 'unavailable'>, { label: string; shortLabel: string; icon: typeof Check }> = {
  above: { label: 'Por encima de la referencia', shortLabel: 'Supera la referencia', icon: Check },
  close: { label: 'Muy cerca de la referencia', shortLabel: 'Muy cerca', icon: Target },
  improve: { label: 'Opción para subir nota', shortLabel: 'Para subir nota', icon: TrendingUp },
}

type Props = {
  estimatedScore: number
  officialTargets: OrientationTarget[]
  savedTarget: SavedOrientationTarget | null
  loadState: 'loading' | 'ready' | 'error'
  catalogAvailable: boolean | null
  onRetry: () => void
}

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className={styles.opportunityFilter}>
      <span>{label}</span>
      <span className={styles.opportunitySelectWrap}>
        <select value={value} onChange={event => onChange(event.target.value)}>
          <option value="">Todas</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </span>
    </label>
  )
}

export default function OpportunitiesExplorer({ estimatedScore, officialTargets, savedTarget, loadState, catalogAvailable, onRetry }: Props) {
  const [university, setUniversity] = useState('')
  const [degree, setDegree] = useState('')
  const [community, setCommunity] = useState('')
  const [category, setCategory] = useState<'all' | Exclude<OpportunityCategory, 'unavailable'>>('all')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  const universities = useMemo(() => [...new Set(officialTargets.map(item => item.university))].sort((a, b) => a.localeCompare(b, 'es')), [officialTargets])
  const degrees = useMemo(() => [...new Set(officialTargets.map(item => item.degree))].sort((a, b) => a.localeCompare(b, 'es')), [officialTargets])
  const communities = useMemo(() => [...new Set(officialTargets.map(item => item.community).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'es')), [officialTargets])

  const ranked = useMemo(() => rankOpportunities(officialTargets, estimatedScore, savedTarget), [officialTargets, estimatedScore, savedTarget])
  const filteredByMetadata = useMemo(() => ranked.filter(item =>
    (!university || item.university === university)
    && (!degree || item.degree === degree)
    && (!community || item.community === community)
    && classifyOpportunity(estimatedScore, item.referenceScore) !== 'unavailable'
  ), [ranked, university, degree, community, estimatedScore])
  const counts = useMemo(() => filteredByMetadata.reduce((current, item) => {
    const itemCategory = classifyOpportunity(estimatedScore, item.referenceScore)
    if (itemCategory !== 'unavailable') current[itemCategory] += 1
    return current
  }, { above: 0, close: 0, improve: 0 }), [filteredByMetadata, estimatedScore])
  const filtered = useMemo(() => category === 'all' ? filteredByMetadata : filteredByMetadata.filter(item => classifyOpportunity(estimatedScore, item.referenceScore) === category), [filteredByMetadata, category, estimatedScore])
  const visible = filtered.slice(0, visibleCount)

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setVisibleCount(INITIAL_VISIBLE)
  }

  return (
    <section className={styles.opportunitiesPanel} aria-labelledby="opportunities-title">
      <div className={styles.opportunitiesHero}>
        <div>
          <span className={styles.opportunitiesEyebrow}>Con tu nota actual</span>
          <h2 id="opportunities-title">Explora oportunidades cerca de tu escenario</h2>
          <p>Explora qué opciones quedarían cerca de esta nota según referencias históricas.</p>
        </div>
        <div className={styles.currentEstimate} aria-live="polite">
          <span>Tu estimación</span>
          <strong key={estimatedScore}>{formatGrade(estimatedScore)} <small>/ 14</small></strong>
          <small>Estimación basada en este escenario</small>
        </div>
      </div>

      {loadState === 'loading' ? (
        <div className={styles.opportunitySkeleton} aria-label="Cargando referencias oficiales"><i /><i /><i /></div>
      ) : officialTargets.length === 0 ? (
        <div className={styles.catalogEmpty}>
          <ShieldCheck size={27} />
          <h3>{catalogAvailable === false || loadState === 'error' ? 'No se pudo cargar el catálogo verificado.' : 'Estamos incorporando las referencias oficiales de universidades.'}</h3>
          <p>Las referencias universitarias estarán disponibles cuando se carguen datos oficiales trazables. El simulador sigue operativo.</p>
          {(catalogAvailable === false || loadState === 'error') && <button onClick={onRetry}><RefreshCw size={14} /> Reintentar</button>}
        </div>
      ) : (
        <>
          <div className={styles.opportunityFilters}>
            <div className={styles.filterHeading}><span>Filtrar referencias</span><small>{filteredByMetadata.length} opciones verificadas</small></div>
            <SelectFilter label="Universidad" value={university} options={universities} onChange={value => changeFilter(setUniversity, value)} />
            <SelectFilter label="Área o grado" value={degree} options={degrees} onChange={value => changeFilter(setDegree, value)} />
            <SelectFilter label="Comunidad" value={community} options={communities} onChange={value => changeFilter(setCommunity, value)} />
          </div>

          <div className={styles.categoryChips} aria-label="Clasificación por distancia a la referencia">
            <button aria-pressed={category === 'all'} onClick={() => { setCategory('all'); setVisibleCount(INITIAL_VISIBLE) }}>Todas <b>{filteredByMetadata.length}</b></button>
            {(Object.keys(CATEGORY_META) as Array<Exclude<OpportunityCategory, 'unavailable'>>).map(key => {
              const meta = CATEGORY_META[key]
              const Icon = meta.icon
              return <button key={key} aria-pressed={category === key} onClick={() => { setCategory(key); setVisibleCount(INITIAL_VISIBLE) }}><Icon size={13} /> {meta.shortLabel} <b>{counts[key]}</b></button>
            })}
          </div>

          {visible.length ? (
            <div className={styles.opportunityList} aria-live="polite">
              {visible.map(item => {
                const itemCategory = classifyOpportunity(estimatedScore, item.referenceScore) as Exclude<OpportunityCategory, 'unavailable'>
                const meta = CATEGORY_META[itemCategory]
                const Icon = meta.icon
                const difference = opportunityDifference(estimatedScore, item.referenceScore)!
                const isTarget = isSavedOpportunity(item, savedTarget)
                return (
                  <article className={[styles.opportunityCard, styles['opportunity_' + itemCategory], isTarget ? styles.savedOpportunity : ''].filter(Boolean).join(' ')} key={item.id}>
                    <div className={styles.opportunityIdentity}>
                      <div className={styles.opportunityIcon}><GraduationCap size={18} /></div>
                      <div><div className={styles.opportunityBadges}>{isTarget && <span className={styles.targetBadge}><Target size={11} /> Tu objetivo</span>}<span className={styles.categoryLabel}><Icon size={11} /> {meta.label}</span></div><h3>{item.degree}</h3><p>{item.university}</p>{item.community && <small><MapPin size={11} /> {item.community}</small>}</div>
                    </div>
                    <div className={styles.referenceNumbers}>
                      <div><span>Referencia {item.source.academicYear}</span><b>{formatGrade(item.referenceScore)}</b></div>
                      <div><span>Tu escenario</span><b>{formatGrade(estimatedScore)}</b></div>
                    </div>
                    <div className={styles.opportunityOutcome}>
                      <strong>{difference >= 0 ? '+' + formatGrade(difference) + ' sobre referencia' : 'Te faltan ' + formatGrade(Math.abs(difference))}</strong>
                      <span>{difference >= 0 ? 'Ahora superas la referencia histórica' : meta.label}</span>
                      <a href={item.source.url!} target="_blank" rel="noreferrer">Fuente oficial · {item.source.label} <ExternalLink size={12} /></a>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : <div className={styles.filteredEmpty}><Target size={22} /><span>No hay referencias que coincidan con estos filtros.</span></div>}

          {visibleCount < filtered.length && <button className={styles.showMoreButton} onClick={() => setVisibleCount(current => current + INITIAL_VISIBLE)}>Ver más opciones</button>}
        </>
      )}

      <p className={styles.opportunityDisclaimer}>Las notas de corte son referencias históricas y pueden variar cada curso. Superar una referencia anterior no garantiza la admisión.</p>
    </section>
  )
}
