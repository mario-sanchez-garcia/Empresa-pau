// Icono técnico propio para las divisiones de XP (Bronce...Élite PAU) —
// mismo gema/kite de contorno para las seis, solo cambia cuántas líneas de
// "faceta" lleva dentro (tierIndex + 1: Bronce 1 faceta, Élite PAU 6).
// Nada de emoji ni ilustración: trazo fino, geometría exacta, mismo
// registro que los diagramas de XpExplainerDrawer.
export default function DivisionIcon({ tierIndex, size = 16, color, strokeWidth = 1.3 }: {
  tierIndex: number
  size?: number
  color: string
  strokeWidth?: number
}) {
  const facets = Math.max(1, Math.min(6, tierIndex + 1))
  const top: [number, number] = [7, 4]
  const topRight: [number, number] = [17, 4]
  const bottom: [number, number] = [12, 21]
  const outline = `M${top[0]},${top[1]} L${topRight[0]},${topRight[1]} L21,10 L${bottom[0]},${bottom[1]} L3,10 Z`

  const facetLines = Array.from({ length: facets }, (_, i) => {
    const t = facets === 1 ? 0.5 : i / (facets - 1)
    const x = top[0] + (topRight[0] - top[0]) * t
    return { x1: x, y1: 4, x2: bottom[0], y2: bottom[1] }
  })

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={outline} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      {facetLines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={strokeWidth * 0.6} opacity={0.55} />
      ))}
    </svg>
  )
}
