'use client'

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
        className="relative h-full flex-1 cursor-crosshair overflow-hidden bg-white"
        onWheel={canvas.onWheel}
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

        <div className="absolute bottom-4 right-4 z-30 overflow-hidden rounded-2xl border border-[#dbe7fb] bg-white/95 shadow-[0_18px_45px_rgba(37,99,235,0.12)]" style={{ width: canvas.minimap.width, height: canvas.minimap.height }}>
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
