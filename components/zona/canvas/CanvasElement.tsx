import type { PointerEvent as ReactPointerEvent } from 'react'
import type { CanvasElement as CanvasItem } from '@/components/zona/types'
import { pathData } from '@/components/zona/canvas/tools/DrawTool'
import { connectorPath } from '@/components/zona/canvas/tools/ArrowTool'
import { renderShape } from '@/components/zona/canvas/tools/ShapeTool'

interface CanvasElementViewProps {
  element: CanvasItem
  selected: boolean
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>, element: CanvasItem) => void
  startResize: (event: ReactPointerEvent<HTMLElement>, handle: 'nw' | 'ne' | 'sw' | 'se') => void
  updateElement: (id: string, patch: Partial<CanvasItem>, track?: boolean) => void
}

export function CanvasElementView({ element, selected, onPointerDown, startResize, updateElement }: CanvasElementViewProps) {
  return (
    <div
      className={`absolute touch-none ${selected ? 'outline outline-2 outline-dashed outline-[#2563eb]' : ''}`}
      onPointerDown={event => onPointerDown(event, element)}
      style={{ left: element.x, top: element.y, width: element.width, height: element.height, transform: `rotate(${element.rotation ?? 0}deg)` }}
    >
      {renderElementContent(element, updateElement)}
      {selected && (['nw', 'ne', 'sw', 'se'] as const).map(handle => (
        <span
          key={handle}
          onPointerDown={event => startResize(event, handle)}
          className={`absolute h-3 w-3 rounded-full border-2 border-white bg-[#2563eb] shadow ${handleClass(handle)}`}
        />
      ))}
    </div>
  )
}

export function ConnectorElement({ connector, elements, selected, onSelect, updateElement }: {
  connector: CanvasItem
  elements: CanvasItem[]
  selected: boolean
  onSelect: () => void
  updateElement: (id: string, patch: Partial<CanvasItem>, track?: boolean) => void
}) {
  const line = connectorPath(connector, elements)
  if (!line) return null

  return (
    <g onPointerDown={event => { event.stopPropagation(); onSelect() }} className="cursor-pointer">
      <path d={line.d} fill="none" stroke={selected ? '#1d4ed8' : '#2563eb'} strokeWidth={selected ? 4 : 3} strokeDasharray={selected ? '8 6' : undefined} markerEnd={connector.arrowHead === 'arrow' ? 'url(#zona-arrowhead)' : undefined} />
      {connector.arrowHead === 'dot' && <circle cx={line.b.x} cy={line.b.y} r={7} fill="#2563eb" />}
      <foreignObject x={(line.a.x + line.b.x) / 2 - 72} y={(line.a.y + line.b.y) / 2 - 18} width={144} height={42}>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={event => updateElement(connector.id, { label: event.currentTarget.innerText }, true)}
          className="rounded-full border border-[#dbe7fb] bg-white/90 px-3 py-1 text-center text-xs font-black text-[#172033] outline-none"
        >
          {connector.label ?? ''}
        </div>
      </foreignObject>
    </g>
  )
}

function renderElementContent(element: CanvasItem, updateElement: CanvasElementViewProps['updateElement']) {
  if (element.type === 'path') return <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${element.width} ${element.height}`}><path d={pathData(element)} fill={element.color ?? '#111827'} /></svg>
  if (element.type === 'shape') return renderShape(element)
  if (element.type === 'image') return <img src={element.src} alt="Imagen del canvas" draggable={false} className="h-full w-full rounded-xl object-cover" />
  if (element.type === 'sticky') {
    return (
      <div className="h-full w-full rounded-lg p-4 text-lg font-black leading-snug text-[#172033] shadow-xl outline-none" style={{ background: element.fill }}>
        <div contentEditable suppressContentEditableWarning onBlur={event => updateElement(element.id, { text: event.currentTarget.innerText, height: Math.max(120, event.currentTarget.scrollHeight + 34) }, true)}>{element.text}</div>
      </div>
    )
  }
  if (element.type === 'mind') {
    const radius = element.nodeStyle === 'pill' ? 'rounded-full' : element.nodeStyle === 'square' ? 'rounded' : 'rounded-2xl'
    return (
      <div contentEditable suppressContentEditableWarning onBlur={event => updateElement(element.id, { text: event.currentTarget.innerText }, true)} className={`flex h-full w-full items-center justify-center border-2 border-[#2563eb] bg-white px-3 text-center font-black text-[#172033] shadow-lg outline-none ${radius}`}>
        {element.text}
      </div>
    )
  }
  if (element.type === 'table') return <TableElement element={element} updateElement={updateElement} />
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={event => updateElement(element.id, { text: event.currentTarget.innerText }, true)}
      className="h-full w-full whitespace-pre-wrap leading-tight text-[#172033] outline-none"
      style={{ color: element.color, fontSize: element.fontSize, fontWeight: element.bold ? 800 : 500, fontStyle: element.italic ? 'italic' : 'normal' }}
    >
      {element.text}
    </div>
  )
}

function TableElement({ element, updateElement }: { element: CanvasItem; updateElement: CanvasElementViewProps['updateElement'] }) {
  const rows = element.rows ?? 3
  const cols = element.cols ?? 3
  const cells = element.cells ?? Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''))
  return (
    <div className="grid h-full w-full border border-slate-300 bg-white" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {cells.flatMap((row, rowIndex) => row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          contentEditable
          suppressContentEditableWarning
          className="min-h-10 border border-slate-200 p-2 text-sm text-[#172033] outline-none"
          onBlur={event => {
            const next = cells.map(item => [...item])
            next[rowIndex][colIndex] = event.currentTarget.innerText
            updateElement(element.id, { cells: next }, true)
          }}
        >
          {cell}
        </div>
      )))}
    </div>
  )
}

function handleClass(handle: string) {
  if (handle === 'nw') return '-left-2 -top-2 cursor-nwse-resize'
  if (handle === 'ne') return '-right-2 -top-2 cursor-nesw-resize'
  if (handle === 'sw') return '-bottom-2 -left-2 cursor-nesw-resize'
  return '-bottom-2 -right-2 cursor-nwse-resize'
}
