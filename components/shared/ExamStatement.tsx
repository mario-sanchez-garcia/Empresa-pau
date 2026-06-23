'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { Eraser, Highlighter, Trash2, X } from 'lucide-react'
import MathMarkdown from './MathMarkdown'

type ExamStatementProps = {
  text?: string | null
  className?: string
  bodyClassName?: string
  components?: Record<string, any>
  format?: boolean | 'raw'
  storageKey?: string
  accentColor?: string
  softColor?: string
  readingMode?: boolean
  toolbar?: boolean
}

const MAX_HIGHLIGHTS = 40

type HighlightRange = {
  id: string
  start: number
  end: number
  text: string
}

type SelectedHighlight = {
  id: string
  text: string
  left: number
  top: number
  placement: 'above' | 'below'
}

export default function ExamStatement({
  text,
  className = '',
  bodyClassName = '',
  components,
  format = true,
  storageKey,
  accentColor = '#2563eb',
  softColor = '#eff6ff',
  readingMode = false,
  toolbar = true,
}: ExamStatementProps) {
  const statementRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [highlighterActive, setHighlighterActive] = useState(false)
  const [highlights, setHighlights] = useState<HighlightRange[]>([])
  const [selectedHighlight, setSelectedHighlight] = useState<SelectedHighlight | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const safeStorageKey = useMemo(() => storageKey ? `pausia:statement-highlights:${storageKey}` : '', [storageKey])

  useEffect(() => {
    if (!safeStorageKey || typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(safeStorageKey)
      // setState síncrono desde localStorage con cancelled guard
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlights(stored ? sanitizeHighlights(JSON.parse(stored)) : [])
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlights([])
    }
  }, [safeStorageKey])

  useEffect(() => {
    const root = bodyRef.current
    if (!root) return
    applyHighlights(root, highlights)
  }, [text, format, highlights])

  useEffect(() => {
    function closeHighlightMenu(event: PointerEvent) {
      if (!statementRef.current?.contains(event.target as Node)) setSelectedHighlight(null)
    }
    document.addEventListener('pointerdown', closeHighlightMenu)
    return () => document.removeEventListener('pointerdown', closeHighlightMenu)
  }, [])

  function persist(next: HighlightRange[]) {
    if (!safeStorageKey || typeof window === 'undefined') return
    try {
      if (next.length) window.localStorage.setItem(safeStorageKey, JSON.stringify(next))
      else window.localStorage.removeItem(safeStorageKey)
    } catch {}
  }

  function addHighlightFromSelection() {
    if (!highlighterActive) return
    if (typeof window === 'undefined') return
    const root = bodyRef.current
    const selection = window.getSelection()
    if (!root || !selection || selection.isCollapsed) return
    if (!selectionIsInside(root, selection) || selectionTouchesKatex(selection)) {
      selection.removeAllRanges()
      return
    }

    const selectedText = normalizeHighlight(selection.toString())
    if (selectedText.length < 3) return
    const selectedRange = selectionToHighlightRange(root, selection, selectedText)
    selection.removeAllRanges()
    if (!selectedRange) return

    setHighlights(current => {
      const next = sanitizeHighlights([...current, selectedRange]).slice(-MAX_HIGHLIGHTS)
      persist(next)
      return next
    })
  }

  function clearHighlights() {
    setHighlights([])
    persist([])
    setSelectedHighlight(null)
    setConfirmClear(false)
  }

  function removeHighlight(highlightId: string) {
    setHighlights(current => {
      const next = current.filter(highlight => highlight.id !== highlightId)
      persist(next)
      return next
    })
    setSelectedHighlight(null)
  }

  function selectHighlight(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target as Element
    const mark = target.closest<HTMLElement>('mark[data-pausia-highlight="true"]')
    if (!mark || !bodyRef.current?.contains(mark)) {
      setSelectedHighlight(null)
      return
    }

    const highlight = highlights.find(item => item.id === mark.dataset.pausiaHighlightId)
    const statement = statementRef.current
    if (!highlight || !statement) return
    const statementRect = statement.getBoundingClientRect()
    const markRect = mark.getBoundingClientRect()
    const placement = markRect.top - statementRect.top > 110 ? 'above' : 'below'
    setSelectedHighlight({
      id: highlight.id,
      text: highlight.text,
      left: Math.min(Math.max(markRect.left - statementRect.left, 8), Math.max(statementRect.width - 220, 8)),
      top: placement === 'above' ? markRect.top - statementRect.top - 8 : markRect.bottom - statementRect.top + 8,
      placement,
    })
  }

  const style = {
    '--statement-accent': accentColor,
    '--statement-soft': softColor,
  } as CSSProperties

  return (
    <div ref={statementRef} className={`exam-statement ${readingMode ? 'exam-statement-reading' : ''} ${className}`} style={style}>
      {toolbar && (
        <div className="exam-statement-toolbar">
          <button
            aria-pressed={highlighterActive}
            className={`exam-statement-action ${highlighterActive ? 'exam-statement-action-active' : ''}`}
            type="button"
            onClick={() => setHighlighterActive(active => !active)}
          >
            <Highlighter size={15} />
            {highlighterActive ? 'Marcador activo' : 'Subrayar'}
          </button>
          <button className="exam-statement-action exam-statement-action-muted" type="button" onClick={() => setConfirmClear(true)} disabled={!highlights.length}>
            <Eraser size={15} />
            Borrar todos
          </button>
          <span className="exam-statement-help">Para quitar uno, haz click sobre el subrayado y pulsa &quot;Quitar subrayado&quot;.</span>
        </div>
      )}
      {confirmClear && (
        <div className="exam-statement-confirm" role="dialog" aria-label="Confirmar borrado de subrayados">
          <span>¿Seguro que quieres borrar todos los subrayados de este enunciado?</span>
          <button type="button" onClick={clearHighlights}><Trash2 size={14} />Borrar todos</button>
          <button type="button" onClick={() => setConfirmClear(false)}><X size={14} />Cancelar</button>
        </div>
      )}
      {selectedHighlight && (
        <div className={`exam-statement-highlight-menu exam-statement-highlight-menu-${selectedHighlight.placement}`} style={{ left: selectedHighlight.left, top: selectedHighlight.top }}>
          <span title={selectedHighlight.text}>{selectedHighlight.text}</span>
          <button type="button" onClick={() => removeHighlight(selectedHighlight.id)}>
            <Eraser size={14} />
            Quitar subrayado
          </button>
        </div>
      )}
      <div
        ref={bodyRef}
        className={`exam-statement-body ${highlighterActive ? 'exam-statement-body-marking' : ''} ${bodyClassName}`}
        onClick={selectHighlight}
        onKeyUp={addHighlightFromSelection}
        onMouseUp={addHighlightFromSelection}
      >
        <MathMarkdown text={text} format={format} components={components} />
      </div>
    </div>
  )
}

function sanitizeHighlights(value: unknown) {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const clean: HighlightRange[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const candidate = item as Partial<HighlightRange>
    const start = Number(candidate.start)
    const end = Number(candidate.end)
    const text = normalizeHighlight(String(candidate.text ?? ''))
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || text.length < 3) continue
    const key = `${start}:${end}:${text}`
    if (seen.has(key)) continue
    seen.add(key)
    clean.push({ id: String(candidate.id ?? key), start, end, text })
  }
  return clean.slice(0, MAX_HIGHLIGHTS)
}

function normalizeHighlight(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function selectionIsInside(root: HTMLElement, selection: Selection) {
  const anchor = selection.anchorNode
  const focus = selection.focusNode
  return Boolean(anchor && focus && root.contains(anchor) && root.contains(focus))
}

function selectionTouchesKatex(selection: Selection) {
  return nodeInsideSelector(selection.anchorNode, '.katex, .katex-display') ||
    nodeInsideSelector(selection.focusNode, '.katex, .katex-display') ||
    nodeInsideSelector(selection.getRangeAt(0).commonAncestorContainer, '.katex, .katex-display')
}

function nodeInsideSelector(node: Node | null, selector: string) {
  if (!node) return false
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
  return Boolean(element?.closest(selector))
}

function applyHighlights(root: HTMLElement, highlights: HighlightRange[]) {
  unwrapHighlights(root)
  for (const highlight of highlights) {
    highlightRange(root, highlight)
  }
}

function unwrapHighlights(root: HTMLElement) {
  root.querySelectorAll('mark[data-pausia-highlight="true"]').forEach(mark => {
    const parent = mark.parentNode
    if (!parent) return
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
    parent.removeChild(mark)
    parent.normalize()
  })
}

function highlightRange(root: HTMLElement, highlight: HighlightRange) {
  if (highlight.end <= highlight.start) return
  for (const part of rangeToTextParts(root, highlight).reverse()) {
    const selected = part.node.splitText(part.start)
    selected.splitText(part.length)
    const mark = document.createElement('mark')
    mark.className = 'pausia-highlight'
    mark.dataset.pausiaHighlight = 'true'
    mark.dataset.pausiaHighlightId = highlight.id
    selected.parentNode?.replaceChild(mark, selected)
    mark.appendChild(selected)
  }
}

function selectionToHighlightRange(root: HTMLElement, selection: Selection, text: string): HighlightRange | null {
  const range = selection.getRangeAt(0)
  const nodes = collectTextNodes(root, { includeExistingHighlights: true })
  let start: number | null = null
  let end: number | null = null
  let offset = 0

  for (const node of nodes) {
    const length = node.textContent?.length ?? 0
    if (node === range.startContainer) start = offset + range.startOffset
    if (node === range.endContainer) end = offset + range.endOffset
    offset += length
  }

  if (start === null || end === null || end <= start) return null
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${start}-${end}`,
    start,
    end,
    text,
  }
}

function rangeToTextParts(root: HTMLElement, highlight: HighlightRange) {
  const parts: Array<{ node: Text; start: number; length: number }> = []
  let offset = 0
  for (const node of collectTextNodes(root)) {
    const length = node.textContent?.length ?? 0
    const nodeStart = offset
    const nodeEnd = offset + length
    const start = Math.max(highlight.start, nodeStart)
    const end = Math.min(highlight.end, nodeEnd)
    if (end > start) parts.push({ node, start: start - nodeStart, length: end - start })
    offset = nodeEnd
  }
  return parts
}

function collectTextNodes(root: HTMLElement, options: { includeExistingHighlights?: boolean } = {}) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent
      const parent = node.parentElement
      if (!text?.trim() || !parent) return NodeFilter.FILTER_REJECT
      const excluded = options.includeExistingHighlights
        ? '.katex, .katex-display, script, style, textarea, button'
        : '.katex, .katex-display, mark[data-pausia-highlight="true"], script, style, textarea, button'
      if (parent.closest(excluded)) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  let node = walker.nextNode()
  while (node) {
    nodes.push(node as Text)
    node = walker.nextNode()
  }
  return nodes
}
