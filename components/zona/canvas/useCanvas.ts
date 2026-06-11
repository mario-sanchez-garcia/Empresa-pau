import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ChangeEvent,
  DragEvent as ReactDragEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { supabase } from '@/app/lib/supabase'
import type { CanvasElement, CanvasTool, ZonaCanvas, ZonaCanvasData } from '@/components/zona/types'
import { appendPathPoint, CANVAS_SIZE, createPath, finalizePath } from '@/components/zona/canvas/tools/DrawTool'
import { createText } from '@/components/zona/canvas/tools/TextTool'
import { createSticky, STICKY_COLORS } from '@/components/zona/canvas/tools/StickyNote'
import { createShape } from '@/components/zona/canvas/tools/ShapeTool'
import { createConnector } from '@/components/zona/canvas/tools/ArrowTool'

export { CANVAS_SIZE }

type Point = { x: number; y: number }
type SaveStatus = 'Guardado' | 'Guardando...' | 'Cambios sin guardar'
type DragState = {
  type: 'move' | 'resize' | 'select' | 'pan' | 'draw'
  start: Point
  ids?: string[]
  snapshot?: CanvasElement[]
  handle?: 'nw' | 'ne' | 'sw' | 'se'
}

export function useCanvas(userId: string, initialCanvases: ZonaCanvas[]) {
  const normalized = useMemo(() => initialCanvases.map(normalizeCanvas), [initialCanvases])
  const [canvases, setCanvases] = useState<ZonaCanvas[]>(normalized)
  const [activeId, setActiveId] = useState(normalized[0]?.id ?? '')
  const [elements, setElements] = useState<CanvasElement[]>(normalized[0]?.data.elements ?? [])
  const [canvasName, setCanvasName] = useState(normalized[0]?.name ?? 'Mi espacio')
  const [tool, setTool] = useState<CanvasTool>('select')
  const [pan, setPan] = useState(normalized[0]?.data.viewport?.pan ?? { x: 120, y: 90 })
  const [zoom, setZoom] = useState(normalized[0]?.data.viewport?.zoom ?? 1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectionBox, setSelectionBox] = useState<null | Box>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('Guardado')
  const [connectorFrom, setConnectorFrom] = useState<string | null>(null)
  const [drawColor, setDrawColor] = useState('#2563eb')
  const [strokeWidth, setStrokeWidth] = useState(6)
  const [textColor, setTextColor] = useState('#172033')
  const [fontSize, setFontSize] = useState(22)
  const [textBold, setTextBold] = useState(false)
  const [textItalic, setTextItalic] = useState(false)
  const [stickyColor, setStickyColor] = useState(STICKY_COLORS[0])
  const [fillColor, setFillColor] = useState('#ffffff')
  const [borderColor, setBorderColor] = useState('#2563eb')
  const [connectorCurved, setConnectorCurved] = useState(false)
  const [arrowHead, setArrowHead] = useState<'arrow' | 'dot' | 'none'>('arrow')
  const [past, setPast] = useState<CanvasElement[][]>([])
  const [future, setFuture] = useState<CanvasElement[][]>([])
  const [isPanning, setIsPanning] = useState(false)

  const dragRef = useRef<DragState | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingImagePoint = useRef<Point>({ x: 220, y: 180 })
  const elementsRef = useRef(elements)
  const panRef = useRef(pan)
  const zoomRef = useRef(zoom)
  const nameRef = useRef(canvasName)
  const dirtyRef = useRef(false)
  const spaceDownRef = useRef(false)

  useEffect(() => { elementsRef.current = elements }, [elements])
  useEffect(() => { panRef.current = pan }, [pan])
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { nameRef.current = canvasName }, [canvasName])

  useEffect(() => {
    if (!canvases.length) void createCanvas('Mi primer espacio')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvases.find(item => item.id === activeId)
    if (!canvas) return
    setCanvasName(canvas.name)
    setElements(canvas.data.elements ?? [])
    setPan(canvas.data.viewport?.pan ?? { x: 120, y: 90 })
    setZoom(canvas.data.viewport?.zoom ?? 1)
    setSelectedIds([])
    setPast([])
    setFuture([])
    void hydrateImageUrls(canvas.data.elements ?? [])
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const markDirty = useCallback(() => {
    dirtyRef.current = true
    setSaveStatus('Cambios sin guardar')
  }, [])

  async function createCanvas(name = 'Nuevo canvas') {
    const data = emptyData()
    const { data: row } = await supabase
      .from('canvases')
      .insert({ user_id: userId, name: name.trim() || 'Nuevo canvas', data })
      .select()
      .single()
    if (!row) return
    const canvas = normalizeCanvas(row as ZonaCanvas)
    setCanvases(prev => [canvas, ...prev])
    setActiveId(canvas.id)
  }

  async function deleteCanvas(canvas: ZonaCanvas) {
    await supabase.from('canvases').delete().eq('id', canvas.id).eq('user_id', userId)
    const next = canvases.filter(item => item.id !== canvas.id)
    setCanvases(next)
    if (canvas.id === activeId) setActiveId(next[0]?.id ?? '')
  }

  function renameCanvas(name: string) {
    setCanvasName(name)
    setCanvases(prev => prev.map(canvas => canvas.id === activeId ? { ...canvas, name } : canvas))
    markDirty()
  }

  async function saveCanvas() {
    if (!activeId) return
    setSaveStatus('Guardando...')
    const data: ZonaCanvasData = { elements: stripRuntimeImages(elementsRef.current), viewport: { pan: panRef.current, zoom: zoomRef.current } }
    const { error } = await supabase.from('canvases').update({ name: nameRef.current.trim() || 'Mi espacio', data, updated_at: new Date().toISOString() }).eq('id', activeId).eq('user_id', userId)
    if (error) {
      setSaveStatus('Cambios sin guardar')
      return
    }
    dirtyRef.current = false
    setSaveStatus('Guardado')
    setCanvases(prev => prev.map(canvas => canvas.id === activeId ? { ...canvas, name: nameRef.current, data, updated_at: new Date().toISOString() } : canvas))
  }

  useEffect(() => {
    if (!dirtyRef.current) return
    const timer = window.setTimeout(() => void saveCanvas(), 2000)
    return () => window.clearTimeout(timer)
  }, [elements, pan, zoom, canvasName]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const beforeUnload = () => { if (dirtyRef.current) void saveCanvas() }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      if (event.ctrlKey || event.metaKey) {
        const factor = Math.exp(-event.deltaY * 0.002)
        setZoomValue(zoomRef.current * factor, { x: event.clientX, y: event.clientY })
        return
      }
      setPan(current => ({ x: current.x - event.deltaX, y: current.y - event.deltaY }))
      markDirty()
    }
    viewport.addEventListener('wheel', wheel, { passive: false })
    return () => viewport.removeEventListener('wheel', wheel)
  }, [markDirty]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const down = (event: KeyboardEvent) => handleKey(event)
    const up = (event: KeyboardEvent) => { if (event.code === 'Space') spaceDownRef.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  })

  function applyElements(next: CanvasElement[], track = true) {
    if (track) {
      setPast(prev => [...prev.slice(-49), clone(elementsRef.current)])
      setFuture([])
    }
    setElements(next)
    markDirty()
  }

  function updateElement(id: string, patch: Partial<CanvasElement>, track = false) {
    const next = elementsRef.current.map(element => element.id === id ? { ...element, ...patch } : element)
    applyElements(next, track)
  }

  function onStagePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const point = screenToWorld(event.clientX, event.clientY)
    pendingImagePoint.current = point
    if (spaceDownRef.current || event.button === 1) return startDrag({ type: 'pan', start: { x: event.clientX, y: event.clientY } })
    if (tool === 'pen') return startDraw(point)
    if (tool === 'eraser') return startEraser(point)
    if (tool === 'text') return addElement(createText(point, { color: textColor, fontSize, bold: textBold, italic: textItalic }))
    if (tool === 'sticky') return addElement(createSticky(point, stickyColor))
    if (tool === 'formula') return addElement(createFormula(point))
    if (['rect', 'circle', 'triangle', 'arrow'].includes(tool)) return addElement(createShape(point, tool, fillColor, borderColor))
    if (tool === 'mind') return addElement(createMind(point, 'Idea central'))
    if (tool === 'table') return addElement(createTable(point))
    if (tool === 'image') return fileRef.current?.click()
    setSelectedIds([])
    if (event.shiftKey) {
      setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0 })
      return startDrag({ type: 'select', start: point })
    }
    startDrag({ type: 'pan', start: { x: event.clientX, y: event.clientY } })
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    const point = screenToWorld(event.clientX, event.clientY)
    if (drag.type === 'pan') {
      setIsPanning(true)
      setPan(prev => ({ x: prev.x + event.clientX - drag.start.x, y: prev.y + event.clientY - drag.start.y }))
      dragRef.current = { ...drag, start: { x: event.clientX, y: event.clientY } }
      return markDirty()
    }
    if (drag.type === 'draw') return continueDraw(point)
    if (drag.type === 'select') return setSelectionBox(normalizeBox(drag.start, point))
    if (drag.type === 'move' && drag.snapshot && drag.ids) {
      const dx = point.x - drag.start.x
      const dy = point.y - drag.start.y
      setElements(drag.snapshot.map(element => drag.ids!.includes(element.id) ? { ...element, x: element.x + dx, y: element.y + dy } : element))
      return markDirty()
    }
    if (drag.type === 'resize' && drag.snapshot && drag.ids?.[0] && drag.handle) {
      const target = drag.snapshot.find(element => element.id === drag.ids![0])
      if (target) setElements(drag.snapshot.map(element => element.id === target.id ? resizeElement(target, point, drag.handle!) : element))
      markDirty()
    }
  }

  function onPointerUp() {
    const drag = dragRef.current
    if (!drag) return
    if (drag.type === 'select' && selectionBox) setSelectedIds(elementsRef.current.filter(element => element.type !== 'connector' && intersects(selectionBox, elementBox(element))).map(element => element.id))
    if ((drag.type === 'move' || drag.type === 'resize' || drag.type === 'draw') && drag.snapshot) {
      if (drag.type === 'draw' && tool === 'pen') setElements(prev => prev.map((element, index) => index === prev.length - 1 && element.type === 'path' ? finalizePath(element) : element))
      setPast(prev => [...prev.slice(-49), drag.snapshot!])
      setFuture([])
    }
    dragRef.current = null
    setIsPanning(false)
    setSelectionBox(null)
  }

  function onElementPointerDown(event: ReactPointerEvent<HTMLDivElement>, element: CanvasElement) {
    event.stopPropagation()
    const point = screenToWorld(event.clientX, event.clientY)
    if (spaceDownRef.current || event.button === 1) return startDrag({ type: 'pan', start: { x: event.clientX, y: event.clientY } })
    if (tool === 'connector') return connectElement(element.id)
    if (tool === 'mind' && element.type === 'mind') return addMindChild(element)
    if (tool !== 'select') return
    const ids = event.shiftKey ? toggleId(selectedIds, element.id) : selectedIds.includes(element.id) ? selectedIds : [element.id]
    setSelectedIds(ids)
    startDrag({ type: 'move', start: point, ids, snapshot: clone(elementsRef.current) })
  }

  function startResize(id: string, event: ReactPointerEvent<HTMLElement>, handle: 'nw' | 'ne' | 'sw' | 'se') {
    event.stopPropagation()
    startDrag({ type: 'resize', start: screenToWorld(event.clientX, event.clientY), ids: [id], handle, snapshot: clone(elementsRef.current) })
  }

  function setZoomValue(value: number, anchor?: Point) {
    const next = Math.min(4, Math.max(0.25, value))
    if (anchor && viewportRef.current) {
      const world = screenToWorld(anchor.x, anchor.y)
      setPan({ x: anchor.x - viewportRef.current.getBoundingClientRect().left - world.x * next, y: anchor.y - viewportRef.current.getBoundingClientRect().top - world.y * next })
    }
    setZoom(next)
    markDirty()
  }

  function fitToScreen() {
    if (!viewportRef.current || !elementsRef.current.length) {
      setPan({ x: 120, y: 90 })
      setZoomValue(1)
      return
    }
    const bounds = boundsOf(elementsRef.current)
    const rect = viewportRef.current.getBoundingClientRect()
    const nextZoom = Math.min(1.25, Math.max(0.25, Math.min((rect.width - 160) / bounds.width, (rect.height - 160) / bounds.height)))
    setZoom(nextZoom)
    setPan({ x: rect.width / 2 - (bounds.x + bounds.width / 2) * nextZoom, y: rect.height / 2 - (bounds.y + bounds.height / 2) * nextZoom })
    markDirty()
  }

  async function exportPng() {
    if (!viewportRef.current) return
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(viewportRef.current, { cacheBust: true, pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `${canvasName || 'mi-espacio'}.png`
    link.href = dataUrl
    link.click()
  }

  async function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) await uploadImage(file, pendingImagePoint.current)
    event.target.value = ''
  }

  async function onDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) await uploadImage(file, screenToWorld(event.clientX, event.clientY))
  }

  const minimap = useMemo(() => makeMinimap(elements, pan, zoom, viewportRef.current), [elements, pan, zoom])

  return {
    canvases, activeId, elements, canvasName, tool, pan, zoom, selectedIds, selectionBox, saveStatus, connectorFrom, isPanning,
    drawColor, strokeWidth, textColor, fontSize, textBold, textItalic, stickyColor, fillColor, borderColor, connectorCurved, arrowHead,
    pastCount: past.length, futureCount: future.length, viewportRef, fileRef, minimap,
    selectOnly: (id: string) => setSelectedIds([id]),
    setActiveId, setTool: (next: CanvasTool) => { setTool(next); setConnectorFrom(null) }, createCanvas, deleteCanvas, renameCanvas,
    undo, redo, setZoomValue, fitToScreen, exportPng, selectAll: () => setSelectedIds(elementsRef.current.map(element => element.id)),
    setDrawColor, setStrokeWidth, setTextColor, setFontSize, setTextBold, setTextItalic, setStickyColor, setFillColor, setBorderColor, setConnectorCurved, setArrowHead,
    addQuickElement, onStagePointerDown, onPointerMove, onPointerUp, onElementPointerDown, startResize, updateElement, handleFileInput, onDrop
  }

  function addElement(element: CanvasElement) {
    applyElements([...elementsRef.current, element])
    setSelectedIds([element.id])
  }

  function addQuickElement(kind: 'sticky' | 'formula' | 'text') {
    const rect = viewportRef.current?.getBoundingClientRect()
    const point = rect ? screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2) : { x: 300, y: 220 }
    if (kind === 'sticky') addElement(createSticky(point, stickyColor))
    else if (kind === 'formula') addElement(createFormula(point))
    else addElement(createText(point, { color: textColor, fontSize: 30, bold: true, italic: false }))
    setTool('select')
  }

  function startDraw(point: Point) {
    startDrag({ type: 'draw', start: point, snapshot: clone(elementsRef.current) })
    setElements(prev => [...prev, createPath(point, drawColor, strokeWidth)])
    markDirty()
  }

  function startEraser(point: Point) {
    startDrag({ type: 'draw', start: point, snapshot: clone(elementsRef.current) })
    eraseAt(point)
  }

  function continueDraw(point: Point) {
    if (tool === 'pen') setElements(prev => prev.map((element, index) => index === prev.length - 1 && element.type === 'path' ? appendPathPoint(element, point) : element))
    if (tool === 'eraser') eraseAt(point)
    markDirty()
  }

  function eraseAt(point: Point) {
    setElements(prev => prev.filter(element => distanceToElement(point, element) > 24))
    markDirty()
  }

  function connectElement(id: string) {
    if (!connectorFrom) return setConnectorFrom(id)
    if (connectorFrom !== id) addElement(createConnector(connectorFrom, id, connectorCurved, arrowHead))
    setConnectorFrom(null)
  }

  function addMindChild(parent: CanvasElement) {
    const children = elementsRef.current.filter(element => element.parentId === parent.id).length
    const angle = children * 0.85
    const child = createMind({ x: parent.x + Math.cos(angle) * 250, y: parent.y + Math.sin(angle) * 170 }, 'Nueva rama', parent.id)
    applyElements([...elementsRef.current, child, createConnector(parent.id, child.id, true, 'none')])
    setSelectedIds([child.id])
  }

  function createMind(point: Point, text: string, parentId?: string): CanvasElement {
    return { id: makeId('mind'), type: 'mind', x: point.x, y: point.y, width: 170, height: 78, text, parentId, nodeStyle: 'rounded' }
  }

  function createTable(point: Point): CanvasElement {
    return { id: makeId('table'), type: 'table', x: point.x, y: point.y, width: 360, height: 210, rows: 3, cols: 3, cells: Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => '')) }
  }

  function undo() {
    setPast(prev => {
      const last = prev.at(-1)
      if (!last) return prev
      setFuture(next => [clone(elementsRef.current), ...next].slice(0, 50))
      setElements(clone(last))
      markDirty()
      return prev.slice(0, -1)
    })
  }

  function redo() {
    setFuture(prev => {
      const next = prev[0]
      if (!next) return prev
      setPast(history => [...history.slice(-49), clone(elementsRef.current)])
      setElements(clone(next))
      markDirty()
      return prev.slice(1)
    })
  }

  function handleKey(event: KeyboardEvent) {
    if (isEditing(event.target)) return
    if (event.code === 'Space') { spaceDownRef.current = true; event.preventDefault() }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo() }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') { event.preventDefault(); redo() }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') { event.preventDefault(); setSelectedIds(elementsRef.current.map(element => element.id)) }
    if ((event.key === 'Backspace' || event.key === 'Delete') && selectedIds.length) applyElements(elementsRef.current.filter(element => !selectedIds.includes(element.id)))
    if ((event.metaKey || event.ctrlKey) && event.key === '0') { event.preventDefault(); fitToScreen() }
    if ((event.metaKey || event.ctrlKey) && event.key === '1') { event.preventDefault(); setZoomValue(1) }
    if (!event.metaKey && !event.ctrlKey) keyTool(event.key)
  }

  function keyTool(key: string) {
    const map: Record<string, CanvasTool> = { v: 'select', p: 'pen', t: 'text', n: 'sticky', f: 'formula', m: 'mind' }
    const next = map[key.toLowerCase()]
    if (next) setTool(next)
  }

  async function hydrateImageUrls(items: CanvasElement[]) {
    const imageItems = items.filter(item => item.type === 'image' && item.storagePath)
    if (!imageItems.length) return
    const hydrated = await Promise.all(imageItems.map(async item => {
      const signed = await supabase.storage.from('zona-images').createSignedUrl(item.storagePath!, 60 * 60 * 24)
      return { id: item.id, src: signed.data?.signedUrl }
    }))
    setElements(prev => prev.map(item => hydrated.find(image => image.id === item.id)?.src ? { ...item, src: hydrated.find(image => image.id === item.id)!.src } : item))
  }

  async function uploadImage(file: File, point: Point) {
    if (!activeId) return
    const path = `${userId}/${activeId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const { error } = await supabase.storage.from('zona-images').upload(path, file, { upsert: true })
    let src = URL.createObjectURL(file)
    if (!error) {
      const signed = await supabase.storage.from('zona-images').createSignedUrl(path, 60 * 60 * 24)
      src = signed.data?.signedUrl ?? src
      await supabase.from('canvas_images').insert({ user_id: userId, canvas_id: activeId, storage_path: path })
    }
    addElement({ id: makeId('img'), type: 'image', x: point.x, y: point.y, width: 270, height: 190, src, storagePath: error ? undefined : path })
  }

  function screenToWorld(clientX: number, clientY: number): Point {
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: (clientX - rect.left - panRef.current.x) / zoomRef.current, y: (clientY - rect.top - panRef.current.y) / zoomRef.current }
  }

  function startDrag(next: DragState) {
    dragRef.current = next
  }
}

function createFormula(point: Point): CanvasElement {
  return { id: makeId('formula'), type: 'formula', x: point.x, y: point.y, width: 320, height: 150, text: '$$\\frac{1}{2}mv^2$$' }
}

type Box = { x: number; y: number; width: number; height: number }

function emptyData(): ZonaCanvasData {
  return { elements: [], viewport: { pan: { x: 120, y: 90 }, zoom: 1 } }
}

function normalizeCanvas(row: ZonaCanvas): ZonaCanvas {
  return { ...row, data: row.data?.elements ? row.data : emptyData() }
}

function clone(items: CanvasElement[]) {
  return items.map(item => ({ ...item, points: item.points ? [...item.points] : undefined, cells: item.cells ? item.cells.map(row => [...row]) : undefined }))
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

function stripRuntimeImages(items: CanvasElement[]) {
  return items.map(item => item.type === 'image' && item.storagePath ? { ...item, src: undefined } : item)
}

function normalizeBox(a: Point, b: Point): Box {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(a.x - b.x), height: Math.abs(a.y - b.y) }
}

function elementBox(element: CanvasElement): Box {
  return { x: element.x, y: element.y, width: element.width, height: element.height }
}

function intersects(a: Box, b: Box) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

function resizeElement(element: CanvasElement, point: Point, handle: 'nw' | 'ne' | 'sw' | 'se'): CanvasElement {
  const right = element.x + element.width
  const bottom = element.y + element.height
  const x = handle.includes('w') ? Math.min(point.x, right - 30) : element.x
  const y = handle.includes('n') ? Math.min(point.y, bottom - 30) : element.y
  const width = handle.includes('e') ? Math.max(30, point.x - element.x) : Math.max(30, right - x)
  const height = handle.includes('s') ? Math.max(30, point.y - element.y) : Math.max(30, bottom - y)
  return { ...element, x, y, width, height }
}

function distanceToElement(point: Point, element: CanvasElement) {
  const box = elementBox(element)
  const cx = Math.max(box.x, Math.min(point.x, box.x + box.width))
  const cy = Math.max(box.y, Math.min(point.y, box.y + box.height))
  return Math.hypot(point.x - cx, point.y - cy)
}

function toggleId(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]
}

function boundsOf(items: CanvasElement[]) {
  const visible = items.filter(item => item.type !== 'connector')
  if (!visible.length) return { x: 0, y: 0, width: 1200, height: 800 }
  const minX = Math.min(...visible.map(item => item.x))
  const minY = Math.min(...visible.map(item => item.y))
  const maxX = Math.max(...visible.map(item => item.x + item.width))
  const maxY = Math.max(...visible.map(item => item.y + item.height))
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
}

function makeMinimap(elements: CanvasElement[], pan: Point, zoom: number, viewport: HTMLDivElement | null) {
  const bounds = boundsOf(elements)
  const width = 170
  const height = 112
  const scale = Math.min(width / Math.max(bounds.width, 1), height / Math.max(bounds.height, 1))
  const rect = viewport?.getBoundingClientRect()
  return {
    width,
    height,
    scale,
    bounds,
    view: rect ? { left: (-pan.x / zoom - bounds.x) * scale, top: (-pan.y / zoom - bounds.y) * scale, width: rect.width / zoom * scale, height: rect.height / zoom * scale } : { left: 0, top: 0, width: 42, height: 30 }
  }
}

function isEditing(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}
