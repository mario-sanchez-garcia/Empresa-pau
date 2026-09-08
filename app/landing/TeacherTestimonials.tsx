import { teacherTestimonials } from './teacherTestimonials.data'

export default function TeacherTestimonials({ headingFont, monoFont }: { headingFont: string; monoFont: string }) {
  const hasTestimonials = teacherTestimonials.length > 0
  return (
    <div className="v4c-block v4c-dark" style={{ background: '#111' }}>
      <div className="v4c-copy">
        <span style={{ fontFamily: monoFont, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 20, display: 'block' }}>{hasTestimonials ? 'Quienes ya lo usan' : 'Para el aula'}</span>
        <h2 style={{ fontFamily: headingFont, fontSize: 'clamp(36px, 4vw, 52px)', letterSpacing: '.01em', color: '#fff', lineHeight: .95, marginBottom: 20 }}>{hasTestimonials ? 'Profesores y alumnos opinan.' : 'Pensado para acompañar al profesor.'}</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,.5)', maxWidth: '44ch' }}>{hasTestimonials ? 'Opiniones reales de profesores y alumnos que han probado Kairo.' : 'Publicaremos opiniones cuando contemos con testimonios reales, consentidos y verificados.'}</p>
      </div>
      <div className="v4c-data">
        {hasTestimonials ? teacherTestimonials.map(testimonial => (
          <figure key={`${testimonial.displayName}-${testimonial.subject}`} style={{ margin: 0, padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <blockquote style={{ margin: 0, color: 'rgba(255,255,255,.8)', lineHeight: 1.7 }}>&ldquo;{testimonial.quote}&rdquo;</blockquote>
            <figcaption style={{ marginTop: 10, color: 'rgba(255,255,255,.4)', fontFamily: monoFont, fontSize: 10 }}>{testimonial.displayName} · {testimonial.role}{testimonial.subject ? ` de ${testimonial.subject}` : ''}{testimonial.school ? ` · ${testimonial.school}` : ''}</figcaption>
          </figure>
        )) : (
          <div style={{ padding: 24, border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
            <strong style={{ display: 'block', color: '#fff', marginBottom: 8 }}>Diseñado para complementar el trabajo del profesor</strong>
            <span style={{ fontSize: 13, lineHeight: 1.7 }}>Kairo ayuda al alumno a practicar y entender sus errores entre clases; no sustituye la orientación docente.</span>
          </div>
        )}
      </div>
    </div>
  )
}
