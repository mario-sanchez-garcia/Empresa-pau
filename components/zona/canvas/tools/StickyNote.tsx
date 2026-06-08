import type { CanvasElement } from '@/components/zona/types'

export const STICKY_COLORS = ['#FEF3C7', '#DBEAFE', '#FCE7F3', '#DCFCE7', '#FED7AA']

type Point = { x: number; y: number }

interface StickyNoteProps {
  color: string
  setColor: (color: string) => void
}

export function StickyNoteTool({ color, setColor }: StickyNoteProps) {
  return (
    <div className="flex items-center gap-2">
      {STICKY_COLORS.map(item => (
        <button
          key={item}
          type="button"
          aria-label={item}
          onClick={() => setColor(item)}
          className={`h-8 w-8 rounded-xl border-2 ${color === item ? 'border-[#7C3AED]' : 'border-white'}`}
          style={{ background: item }}
        />
      ))}
    </div>
  )
}

export function createSticky(point: Point, fill: string): CanvasElement {
  return {
    id: makeId('sticky'),
    type: 'sticky',
    x: point.x,
    y: point.y,
    width: 215,
    height: 155,
    text: 'Idea clave',
    fill,
    color: '#172033'
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}
