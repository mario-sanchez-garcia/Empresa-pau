import getStroke from 'perfect-freehand'
import type { CanvasElement } from '@/components/zona/types'

export const DRAW_COLORS = ['#111827', '#2563eb', '#7C3AED', '#16a34a', '#f59e0b', '#dc2626']
export const CANVAS_SIZE = 9000

type Point = { x: number; y: number }

interface DrawToolProps {
  color: string
  width: number
  setColor: (color: string) => void
  setWidth: (width: number) => void
}

export function DrawTool({ color, width, setColor, setWidth }: DrawToolProps) {
  return (
    <div className="flex items-center gap-2">
      {DRAW_COLORS.map(item => (
        <button
          key={item}
          type="button"
          aria-label={item}
          onClick={() => setColor(item)}
          className={`h-7 w-7 rounded-full border-2 ${color === item ? 'border-[#7C3AED]' : 'border-white'}`}
          style={{ background: item }}
        />
      ))}
      <input className="h-8 w-10 rounded-lg" type="color" value={color} onChange={event => setColor(event.target.value)} />
      <select className="h-9 rounded-xl border border-[#f2e4d4] bg-white px-2 text-sm font-bold text-[#7c6f64]" value={width} onChange={event => setWidth(Number(event.target.value))}>
        <option value={3}>Fino</option>
        <option value={6}>Medio</option>
        <option value={12}>Grueso</option>
      </select>
    </div>
  )
}

export function createPath(point: Point, color: string, strokeWidth: number): CanvasElement {
  return {
    id: makeId('path'),
    type: 'path',
    x: 0,
    y: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    points: [[point.x, point.y]],
    color,
    strokeWidth
  }
}

export function appendPathPoint(element: CanvasElement, point: Point): CanvasElement {
  return { ...element, points: [...(element.points ?? []), [point.x, point.y]] }
}

export function finalizePath(element: CanvasElement): CanvasElement {
  const points = element.points ?? []
  if (points.length < 2) return { ...element, width: 10, height: 10 }
  const xs = points.map(point => point[0])
  const ys = points.map(point => point[1])
  const pad = (element.strokeWidth ?? 6) * 2
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const maxX = Math.max(...xs) + pad
  const maxY = Math.max(...ys) + pad

  return {
    ...element,
    x: minX,
    y: minY,
    width: Math.max(12, maxX - minX),
    height: Math.max(12, maxY - minY),
    points: points.map(point => [point[0] - minX, point[1] - minY])
  }
}

export function pathData(element: CanvasElement) {
  const points = element.points ?? []
  if (!points.length) return ''
  const stroke = getStroke(points, {
    size: element.strokeWidth ?? 6,
    thinning: 0.55,
    smoothing: 0.68,
    streamline: 0.48
  })
  if (!stroke.length) return ''
  const first = stroke[0]
  const rest = stroke.slice(1).map(point => `L ${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(' ')
  return `M ${first[0].toFixed(2)} ${first[1].toFixed(2)} ${rest} Z`
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}
