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
      <button type="button" onClick={() => setBold(!bold)} className={`h-9 w-9 rounded-xl border text-sm font-black transition hover:border-blue-300 hover:bg-blue-50 ${bold ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-[#dbe7fb] bg-white text-slate-600'}`}>B</button>
      <button type="button" onClick={() => setItalic(!italic)} className={`h-9 w-9 rounded-xl border text-sm font-black italic transition hover:border-blue-300 hover:bg-blue-50 ${italic ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-[#dbe7fb] bg-white text-slate-600'}`}>I</button>
      <input className="h-8 w-10 rounded-lg" type="color" value={color} onChange={event => setColor(event.target.value)} />
      <input className="h-9 w-16 rounded-xl border border-[#dbe7fb] bg-white px-2 text-sm font-bold text-[#172033] outline-none focus:border-blue-300" type="number" min={12} max={72} value={fontSize} onChange={event => setFontSize(Number(event.target.value))} />
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
