import type { CanvasElement, CanvasTool } from '@/components/zona/types'

type Point = { x: number; y: number }

interface ShapeToolProps {
  fill: string
  border: string
  setFill: (color: string) => void
  setBorder: (color: string) => void
}

export function ShapeTool({ fill, border, setFill, setBorder }: ShapeToolProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-black text-[#7c6f64]">
      <span>Fill</span>
      <input className="h-8 w-10 rounded-lg" type="color" value={fill === 'transparent' ? '#ffffff' : fill} onChange={event => setFill(event.target.value)} />
      <span>Borde</span>
      <input className="h-8 w-10 rounded-lg" type="color" value={border} onChange={event => setBorder(event.target.value)} />
      <button type="button" onClick={() => setFill('transparent')} className="rounded-xl border border-[#f2e4d4] bg-white px-3 py-2">Transparente</button>
    </div>
  )
}

export function createShape(point: Point, tool: CanvasTool, fill: string, border: string): CanvasElement {
  return {
    id: makeId('shape'),
    type: 'shape',
    x: point.x,
    y: point.y,
    width: 184,
    height: 120,
    shape: tool as CanvasElement['shape'],
    fill,
    border,
    strokeWidth: 3
  }
}

export function renderShape(element: CanvasElement) {
  const fill = element.fill ?? 'transparent'
  const stroke = element.border ?? '#7C3AED'
  const sw = element.strokeWidth ?? 3
  if (element.shape === 'circle') return <svg className="h-full w-full"><ellipse cx="50%" cy="50%" rx="48%" ry="46%" fill={fill} stroke={stroke} strokeWidth={sw} /></svg>
  if (element.shape === 'triangle') return <svg className="h-full w-full"><polygon points={`${element.width / 2},4 ${element.width - 4},${element.height - 4} 4,${element.height - 4}`} fill={fill} stroke={stroke} strokeWidth={sw} /></svg>
  if (element.shape === 'arrow') return <svg className="h-full w-full"><line x1="10" y1={element.height / 2} x2={element.width - 24} y2={element.height / 2} stroke={stroke} strokeWidth={sw + 2} strokeLinecap="round" /><polygon points={`${element.width - 24},${element.height / 2 - 14} ${element.width - 4},${element.height / 2} ${element.width - 24},${element.height / 2 + 14}`} fill={stroke} /></svg>
  return <div className="h-full w-full rounded-xl" style={{ background: fill, border: `${sw}px solid ${stroke}` }} />
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}
