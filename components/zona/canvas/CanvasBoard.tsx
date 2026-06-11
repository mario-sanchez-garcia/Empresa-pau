'use client'

import { Focus, Minus, Plus, StickyNote, Type, FunctionSquare } from 'lucide-react'
import { CanvasElementView, ConnectorElement } from '@/components/zona/canvas/CanvasElement'
import { CanvasToolbar } from '@/components/zona/canvas/CanvasToolbar'
import { CANVAS_SIZE, useCanvas } from '@/components/zona/canvas/useCanvas'
import type { ZonaCanvas } from '@/components/zona/types'

interface CanvasBoardProps {
  userId: string
  initialCanvases: ZonaCanvas[]
}

export default function CanvasBoard({ userId, initialCanvases }: CanvasBoardProps) {
  const canvas = useCanvas(userId, initialCanvases)

  return (
    <div className="relative flex h-[calc(100vh-78px)] min-h-[680px] overflow-hidden rounded-3xl border border-[#dbe7fb] bg-white shadow-[0_24px_70px_rgba(37,99,235,0.12)] max-md:block">
      <CanvasToolbar {...canvas} />

      <input ref={canvas.fileRef} type="file" accept="image/*" onChange={canvas.handleFileInput} className="hidden" />

      <div
        ref={canvas.viewportRef}
        className={`relative h-full flex-1 touch-none overflow-hidden bg-white ${canvas.isPanning ? 'cursor-grabbing select-none' : canvas.tool === 'select' ? 'cursor-grab' : 'cursor-crosshair'}`}
        onPointerDown={canvas.onStagePointerDown}
        onPointerMove={canvas.onPointerMove}
        onPointerUp={canvas.onPointerUp}
        onPointerLeave={canvas.onPointerUp}
        onDrop={canvas.onDrop}
        onDragOver={event => event.preventDefault()}
        style={{
          backgroundImage: `radial-gradient(#E5E7EB ${Math.max(1, canvas.zoom)}px, transparent ${Math.max(1, canvas.zoom)}px)`,
          backgroundSize: `${24 * canvas.zoom}px ${24 * canvas.zoom}px`,
          backgroundPosition: `${canvas.pan.x}px ${canvas.pan.y}px`
        }}
      >
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, transform: `translate(${canvas.pan.x}px, ${canvas.pan.y}px) scale(${canvas.zoom})` }}>
          <svg className="absolute left-0 top-0 overflow-visible" width={CANVAS_SIZE} height={CANVAS_SIZE}>
            <defs>
              <marker id="zona-arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#2563eb" />
              </marker>
            </defs>
            {canvas.elements.filter(element => element.type === 'connector').map(connector => (
              <ConnectorElement
                key={connector.id}
                connector={connector}
                elements={canvas.elements}
                selected={canvas.selectedIds.includes(connector.id)}
                onSelect={() => canvas.selectOnly(connector.id)}
                updateElement={canvas.updateElement}
              />
            ))}
          </svg>

          {canvas.elements.filter(element => element.type !== 'connector').map(element => (
            <CanvasElementView
              key={element.id}
              element={element}
              selected={canvas.selectedIds.includes(element.id)}
              onPointerDown={canvas.onElementPointerDown}
              updateElement={canvas.updateElement}
              startResize={(event, handle) => canvas.startResize(element.id, event, handle)}
            />
          ))}

          {canvas.selectionBox && (
            <div className="pointer-events-none absolute border-2 border-dashed border-[#2563eb] bg-[#2563eb]/10" style={canvas.selectionBox} />
          )}
        </div>

        {!canvas.elements.length && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
            <div className="pointer-events-auto max-w-md rounded-3xl border border-blue-100 bg-white/95 p-7 text-center shadow-[0_24px_65px_rgba(37,99,235,0.14)] backdrop-blur-xl">
              <h2 className="text-xl font-black text-slate-900">Empieza tu mapa de estudio</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Añade notas, fórmulas o ideas y organízalas como en un tablero.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <QuickButton onClick={() => canvas.addQuickElement('sticky')} icon={<StickyNote size={15} />} label="Añadir nota" />
                <QuickButton onClick={() => canvas.addQuickElement('formula')} icon={<FunctionSquare size={15} />} label="Añadir fórmula" />
                <QuickButton onClick={() => canvas.addQuickElement('text')} icon={<Type size={15} />} label="Añadir título" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-40 grid gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-[#dbe7fb] bg-white/95 p-1.5 shadow-[0_18px_45px_rgba(37,99,235,0.14)]">
            <CanvasControl title="Alejar" onClick={() => canvas.setZoomValue(canvas.zoom - 0.1)}><Minus size={16} /></CanvasControl>
            <button type="button" title="Restablecer al 100%" onClick={() => canvas.setZoomValue(1)} className="min-w-16 rounded-xl px-2 py-2 text-xs font-black text-blue-700 hover:bg-blue-50">{Math.round(canvas.zoom * 100)}%</button>
            <CanvasControl title="Acercar" onClick={() => canvas.setZoomValue(canvas.zoom + 0.1)}><Plus size={16} /></CanvasControl>
            <CanvasControl title="Ajustar vista" onClick={canvas.fitToScreen}><Focus size={16} /></CanvasControl>
          </div>
          <div className="max-w-72 rounded-xl border border-blue-100 bg-white/90 px-3 py-2 text-[11px] font-bold text-slate-500 shadow-sm">Rueda para moverte · Ctrl/trackpad para zoom · arrastra el fondo para desplazarte</div>
        </div>

        <div className="absolute bottom-24 right-4 z-30 overflow-hidden rounded-2xl border border-[#dbe7fb] bg-white/95 shadow-[0_18px_45px_rgba(37,99,235,0.12)] max-sm:hidden" style={{ width: canvas.minimap.width, height: canvas.minimap.height }}>
          {canvas.elements.filter(element => element.type !== 'connector').map(element => (
            <span
              key={element.id}
              className="absolute rounded bg-[#2563eb]/25"
              style={{
                left: (element.x - canvas.minimap.bounds.x) * canvas.minimap.scale,
                top: (element.y - canvas.minimap.bounds.y) * canvas.minimap.scale,
                width: Math.max(3, element.width * canvas.minimap.scale),
                height: Math.max(3, element.height * canvas.minimap.scale)
              }}
            />
          ))}
          <div className="absolute rounded-md border-2 border-[#2563eb] bg-[#2563eb]/10" style={canvas.minimap.view} />
        </div>
      </div>
    </div>
  )
}

function CanvasControl({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return <button type="button" title={title} onClick={onClick} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">{children}</button>
}

function QuickButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white">{icon}{label}</button>
}
