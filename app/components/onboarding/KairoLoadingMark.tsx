'use client'

// Animación "K A I R O" del antiguo paso 'saving' de OnboardingFlow.tsx —
// extraída aquí para reutilizarla tal cual en /onboarding/finalizando
// (Fase 2), que es ahora quien muestra el estado de carga real mientras
// /api/onboarding/finalize procesa server-side.

const LOADING_MARK_CSS = `
@keyframes onb-top-slam{0%{transform:translateY(-50%);opacity:0}45%{opacity:1}72%{transform:translateY(3.5%)}86%{transform:translateY(-1%)}100%{transform:translateY(0)}}
@keyframes onb-bot-slam{0%{transform:translateY(50%);opacity:0}45%{opacity:1}72%{transform:translateY(-3.5%)}86%{transform:translateY(1%)}100%{transform:translateY(0)}}
@keyframes onb-seam{0%{opacity:0;transform:scaleX(0.3)}40%{opacity:1;transform:scaleX(1)}75%{opacity:0.5}100%{opacity:0}}
.onb-lw{position:relative;display:inline-block;margin-right:-4px}.onb-lw:last-child{margin-right:0}
.onb-ghost{font-size:100px;font-weight:900;letter-spacing:-0.04em;line-height:1;visibility:hidden;display:block;white-space:nowrap}
.onb-glyph{position:absolute;top:0;left:0;font-size:100px;font-weight:900;color:white;letter-spacing:-0.04em;line-height:1;white-space:nowrap;display:block}
.onb-top{clip-path:inset(0 0 50% 0);animation:onb-top-slam .72s cubic-bezier(0.34,1.4,0.64,1) both}
.onb-bot{clip-path:inset(50% 0 0 0);animation:onb-bot-slam .72s cubic-bezier(0.34,1.4,0.64,1) both}
.onb-seam{position:absolute;left:-2px;right:-2px;top:calc(50% - 1px);height:2px;background:linear-gradient(90deg,transparent,rgba(37,99,235,0.9),rgba(120,196,255,0.95),rgba(37,99,235,0.9),transparent);animation:onb-seam .72s ease-out both;pointer-events:none}
@media (prefers-reduced-motion: reduce) {
  .onb-top, .onb-bot, .onb-seam { animation: none; opacity: 1; transform: none; }
}
`

export default function KairoLoadingMark() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <style>{LOADING_MARK_CSS}</style>
      {['K', 'A', 'I', 'R', 'O'].map((ch, i) => (
        <div key={i} className="onb-lw">
          <span className="onb-ghost">{ch}</span>
          <span className="onb-glyph onb-top" style={{ animationDelay: `${i * 110}ms` }}>{ch}</span>
          <span className="onb-glyph onb-bot" style={{ animationDelay: `${i * 110}ms` }}>{ch}</span>
          <div className="onb-seam" style={{ animationDelay: `${i * 110}ms` }} />
        </div>
      ))}
    </div>
  )
}
