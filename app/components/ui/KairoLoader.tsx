'use client'

export default function KairoLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      style={{
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Geist, system-ui, sans-serif',
        ...(fullScreen
          ? { minHeight: '100dvh', width: '100%' }
          : { padding: '64px 0' }),
      }}
    >
      <style>{`
        @keyframes kl-top-slam{0%{transform:translateY(-50%);opacity:0}45%{opacity:1}72%{transform:translateY(3.5%)}86%{transform:translateY(-1%)}100%{transform:translateY(0)}}
        @keyframes kl-bot-slam{0%{transform:translateY(50%);opacity:0}45%{opacity:1}72%{transform:translateY(-3.5%)}86%{transform:translateY(1%)}100%{transform:translateY(0)}}
        @keyframes kl-seam{0%{opacity:0;transform:scaleX(0.3)}40%{opacity:1;transform:scaleX(1)}75%{opacity:0.5}100%{opacity:0}}
        @keyframes kl-dot{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}
        .kl-lw{position:relative;display:inline-block;margin-right:-4px}
        .kl-lw:last-child{margin-right:0}
        .kl-ghost{font-size:100px;font-weight:900;letter-spacing:-0.04em;line-height:1;visibility:hidden;display:block;white-space:nowrap}
        .kl-glyph{position:absolute;top:0;left:0;font-size:100px;font-weight:900;color:white;letter-spacing:-0.04em;line-height:1;white-space:nowrap;display:block}
        .kl-top{clip-path:inset(0 0 50% 0);animation:kl-top-slam .72s cubic-bezier(0.34,1.4,0.64,1) both}
        .kl-bot{clip-path:inset(50% 0 0 0);animation:kl-bot-slam .72s cubic-bezier(0.34,1.4,0.64,1) both}
        .kl-seam{position:absolute;left:-2px;right:-2px;top:calc(50% - 1px);height:2px;background:linear-gradient(90deg,transparent,rgba(37,99,235,0.9),rgba(120,196,255,0.95),rgba(37,99,235,0.9),transparent);animation:kl-seam .72s ease-out both;pointer-events:none}
      `}</style>

      {/* KAIRO split-halves animation */}
      <div style={{ display: 'flex', marginBottom: 36 }}>
        {['K', 'A', 'I', 'R', 'O'].map((ch, i) => (
          <div key={i} className="kl-lw">
            <span className="kl-ghost">{ch}</span>
            <span className="kl-glyph kl-top" style={{ animationDelay: `${i * 110}ms` }}>{ch}</span>
            <span className="kl-glyph kl-bot" style={{ animationDelay: `${i * 110}ms` }}>{ch}</span>
            <div className="kl-seam" style={{ animationDelay: `${i * 110}ms` }} />
          </div>
        ))}
      </div>

      {/* Pulsing dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#2563eb',
              animation: `kl-dot 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
