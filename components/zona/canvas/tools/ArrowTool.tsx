import type { CanvasElement } from '@/components/zona/types'

interface ArrowToolProps {
  curved: boolean
  arrowHead: 'arrow' | 'dot' | 'none'
  connectorFrom: string | null
  setCurved: (active: boolean) => void
  setArrowHead: (head: 'arrow' | 'dot' | 'none') => void
}

export function ArrowTool({ curved, arrowHead, connectorFrom, setCurved, setArrowHead }: ArrowToolProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-black text-[#7c6f64]">
      <button type="button" onClick={() => setCurved(!curved)} className={`rounded-xl border px-3 py-2 ${curved ? 'border-[#7C3AED] bg-[#f5f3ff] text-[#7C3AED]' : 'border-[#f2e4d4] bg-white'}`}>Curva</button>
      <select className="h-9 rounded-xl border border-[#f2e4d4] bg-white px-2" value={arrowHead} onChange={event => setArrowHead(event.target.value as 'arrow' | 'dot' | 'none')}>
        <option value="arrow">Flecha</option>
        <option value="dot">Punto</option>
        <option value="none">Sin punta</option>
      </select>
      <span>{connectorFrom ? 'Elige destino' : 'Elige origen'}</span>
    </div>
  )
}

export function createConnector(from: string, to: string, curved: boolean, arrowHead: 'arrow' | 'dot' | 'none'): CanvasElement {
  return { id: makeId('conn'), type: 'connector', x: 0, y: 0, width: 0, height: 0, from, to, curved, arrowHead, label: '' }
}

export function elementCenter(element: CanvasElement) {
  return { x: element.x + element.width / 2, y: element.y + element.height / 2 }
}

export function connectorPath(connector: CanvasElement, elements: CanvasElement[]) {
  const from = elements.find(element => element.id === connector.from)
  const to = elements.find(element => element.id === connector.to)
  if (!from || !to) return null
  const a = elementCenter(from)
  const b = elementCenter(to)
  const d = connector.curved
    ? `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`
    : `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  return { a, b, d }
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}
