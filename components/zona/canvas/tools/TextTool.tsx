import type { CanvasElement } from '@/components/zona/types'

type Point = { x: number; y: number }

interface TextToolProps {
  color: string
  fontSize: number
  bold: boolean
  italic: boolean
  setColor: (color: string) => void
  setFontSize: (size: number) => void
  setBold: (active: boolean) => void
  setItalic: (active: boolean) => void
}

export function TextTool({ color, fontSize, bold, italic, setColor, setFontSize, setBold, setItalic }: TextToolProps) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => setBold(!bold)} className={`h-9 w-9 rounded-xl border text-sm font-black ${bold ? 'border-[#7C3AED] bg-[#f5f3ff] text-[#7C3AED]' : 'border-[#f2e4d4] bg-white text-[#7c6f64]'}`}>B</button>
      <button type="button" onClick={() => setItalic(!italic)} className={`h-9 w-9 rounded-xl border text-sm font-black italic ${italic ? 'border-[#7C3AED] bg-[#f5f3ff] text-[#7C3AED]' : 'border-[#f2e4d4] bg-white text-[#7c6f64]'}`}>I</button>
      <input className="h-8 w-10 rounded-lg" type="color" value={color} onChange={event => setColor(event.target.value)} />
      <input className="h-9 w-16 rounded-xl border border-[#f2e4d4] bg-white px-2 text-sm font-bold text-[#172033]" type="number" min={12} max={72} value={fontSize} onChange={event => setFontSize(Number(event.target.value))} />
    </div>
  )
}

export function createText(point: Point, options: { color: string; fontSize: number; bold: boolean; italic: boolean }): CanvasElement {
  return {
    id: makeId('text'),
    type: 'text',
    x: point.x,
    y: point.y,
    width: 250,
    height: 86,
    text: 'Nuevo texto',
    color: options.color,
    fontSize: options.fontSize,
    bold: options.bold,
    italic: options.italic
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}
