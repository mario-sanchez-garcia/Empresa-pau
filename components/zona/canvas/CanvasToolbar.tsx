import {
  Circle,
  Download,
  Eraser,
  Image as ImageIcon,
  Minus,
  MousePointer2,
  Move,
  Network,
  PenLine,
  Plus,
  Redo2,
  Save,
  Shapes,
  StickyNote,
  Table2,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { CanvasTool, ZonaCanvas } from '@/components/zona/types'
import { DrawTool } from '@/components/zona/canvas/tools/DrawTool'
import { TextTool } from '@/components/zona/canvas/tools/TextTool'
import { StickyNoteTool } from '@/components/zona/canvas/tools/StickyNote'
import { ShapeTool } from '@/components/zona/canvas/tools/ShapeTool'
import { ArrowTool } from '@/components/zona/canvas/tools/ArrowTool'

export const TOOL_ITEMS: Array<{ id: CanvasTool; label: string; icon: typeof MousePointer2 }> = [
  { id: 'select', label: 'Seleccionar', icon: MousePointer2 },
  { id: 'pen', label: 'Dibujar', icon: PenLine },
  { id: 'eraser', label: 'Borrar', icon: Eraser },
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'sticky', label: 'Nota', icon: StickyNote },
  { id: 'rect', label: 'Rectangulo', icon: Shapes },
  { id: 'circle', label: 'Circulo', icon: Circle },
  { id: 'triangle', label: 'Triangulo', icon: Shapes },
  { id: 'arrow', label: 'Flecha', icon: Minus },
  { id: 'connector', label: 'Conector', icon: Minus },
  { id: 'mind', label: 'Mind map', icon: Network },
  { id: 'table', label: 'Tabla', icon: Table2 },
  { id: 'image', label: 'Imagen', icon: ImageIcon }
]

interface CanvasToolbarProps {
  canvases: ZonaCanvas[]
  activeId: string
  canvasName: string
  tool: CanvasTool
  zoom: number
  saveStatus: string
  pastCount: number
  futureCount: number
  connectorFrom: string | null
  drawColor: string
  strokeWidth: number
  textColor: string
  fontSize: number
  textBold: boolean
  textItalic: boolean
  stickyColor: string
  fillColor: string
  borderColor: string
  connectorCurved: boolean
  arrowHead: 'arrow' | 'dot' | 'none'
  setTool: (tool: CanvasTool) => void
  setActiveId: (id: string) => void
  createCanvas: (name?: string) => void
  deleteCanvas: (canvas: ZonaCanvas) => void
  renameCanvas: (name: string) => void
  undo: () => void
  redo: () => void
  setZoomValue: (zoom: number) => void
  fitToScreen: () => void
  exportPng: () => void
  selectAll: () => void
  setDrawColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setTextColor: (color: string) => void
  setFontSize: (size: number) => void
  setTextBold: (active: boolean) => void
  setTextItalic: (active: boolean) => void
  setStickyColor: (color: string) => void
  setFillColor: (color: string) => void
  setBorderColor: (color: string) => void
  setConnectorCurved: (active: boolean) => void
  setArrowHead: (head: 'arrow' | 'dot' | 'none') => void
}

export function CanvasToolbar(props: CanvasToolbarProps) {
  const currentTool = TOOL_ITEMS.find(item => item.id === props.tool) ?? TOOL_ITEMS[0]
  const CurrentIcon = currentTool.icon

  return (
    <>
      <aside className="w-56 shrink-0 overflow-hidden border-r border-[#dbe7fb] bg-white/95 p-3 max-md:w-full max-md:border-b max-md:border-r-0">
        <div className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Mis espacios</div>
        <button type="button" onClick={() => props.createCanvas('Nuevo canvas')} className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5"><Plus size={15} />Nuevo</button>
        <div className="space-y-2">
          {props.canvases.map(canvas => (
            <div key={canvas.id} className={`flex items-center gap-1 rounded-2xl border p-1 transition ${canvas.id === props.activeId ? 'border-blue-200 bg-blue-50' : 'border-[#dbe7fb] bg-white hover:border-blue-300 hover:bg-blue-50/60'}`}>
              <button type="button" onClick={() => props.setActiveId(canvas.id)} className="min-w-0 flex-1 px-2 py-1 text-left">
                <strong className="block truncate text-sm text-[#172033]">{canvas.name}</strong>
                <small className="text-xs text-slate-400">{canvas.updated_at ? new Date(canvas.updated_at).toLocaleDateString('es-ES') : 'Nuevo'}</small>
              </button>
              {props.canvases.length > 1 && <button type="button" onClick={() => props.deleteCanvas(canvas)} className="rounded-xl p-2 text-blue-700 transition hover:bg-blue-100"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>
      </aside>

      <div className="absolute left-60 right-4 top-4 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-[#dbe7fb] bg-white/95 p-2 shadow-[0_18px_45px_rgba(37,99,235,0.12)] max-md:left-3">
        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-black text-blue-700"><CurrentIcon size={16} />{currentTool.label}</div>
        <input className="min-w-36 flex-1 rounded-xl border border-[#dbe7fb] bg-white px-3 py-2 text-sm font-black text-[#172033] outline-none transition focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(96,165,250,0.14)]" value={props.canvasName} onChange={event => props.renameCanvas(event.target.value)} />
        <ToolbarButton onClick={props.undo} disabled={!props.pastCount}><Undo2 size={16} /></ToolbarButton>
        <ToolbarButton onClick={props.redo} disabled={!props.futureCount}><Redo2 size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => props.setZoomValue(props.zoom - 0.1)}><ZoomOut size={16} /></ToolbarButton>
        <span className="min-w-14 text-center text-sm font-black text-slate-500">{Math.round(props.zoom * 100)}%</span>
        <ToolbarButton onClick={() => props.setZoomValue(props.zoom + 0.1)}><ZoomIn size={16} /></ToolbarButton>
        <ToolbarButton onClick={props.fitToScreen}><Move size={16} /></ToolbarButton>
        <button type="button" onClick={props.exportPng} className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5"><Download size={16} />PNG</button>
        <div className="ml-auto flex items-center gap-1 text-xs font-black text-slate-500"><Save size={14} />{props.saveStatus}</div>
      </div>

      <div className="absolute left-60 top-24 z-30 grid grid-cols-1 gap-2 rounded-2xl border border-[#dbe7fb] bg-white/95 p-2 shadow-[0_18px_45px_rgba(37,99,235,0.12)] max-md:bottom-3 max-md:left-3 max-md:right-3 max-md:top-auto max-md:grid-cols-7">
        {TOOL_ITEMS.map(item => {
          const Icon = item.icon
          return <button key={item.id} type="button" title={item.label} onClick={() => props.setTool(item.id)} className={`flex h-11 w-11 items-center justify-center rounded-2xl transition hover:-translate-y-0.5 ${props.tool === item.id ? 'bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]' : 'bg-[#f8fbff] text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}><Icon size={18} /></button>
        })}
      </div>

      <div className="absolute left-80 top-24 z-30 flex max-w-[calc(100%-22rem)] flex-wrap items-center gap-2 rounded-2xl border border-[#dbe7fb] bg-white/95 p-2 shadow-[0_18px_45px_rgba(37,99,235,0.12)] max-md:left-3 max-md:right-3 max-md:top-28 max-md:max-w-none">
        {(props.tool === 'pen' || props.tool === 'eraser') && <DrawTool color={props.drawColor} width={props.strokeWidth} setColor={props.setDrawColor} setWidth={props.setStrokeWidth} />}
        {props.tool === 'text' && <TextTool color={props.textColor} fontSize={props.fontSize} bold={props.textBold} italic={props.textItalic} setColor={props.setTextColor} setFontSize={props.setFontSize} setBold={props.setTextBold} setItalic={props.setTextItalic} />}
        {props.tool === 'sticky' && <StickyNoteTool color={props.stickyColor} setColor={props.setStickyColor} />}
        {['rect', 'circle', 'triangle', 'arrow'].includes(props.tool) && <ShapeTool fill={props.fillColor} border={props.borderColor} setFill={props.setFillColor} setBorder={props.setBorderColor} />}
        {props.tool === 'connector' && <ArrowTool curved={props.connectorCurved} arrowHead={props.arrowHead} connectorFrom={props.connectorFrom} setCurved={props.setConnectorCurved} setArrowHead={props.setArrowHead} />}
        <button type="button" onClick={props.selectAll} className="rounded-xl border border-[#dbe7fb] bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">Seleccionar todo</button>
      </div>
    </>
  )
}

function ToolbarButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dbe7fb] bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-35">{children}</button>
}
