'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Eraser, Highlighter } from 'lucide-react'
import MathMarkdown from './MathMarkdown'

type ExamStatementProps = {
  text?: string | null
  className?: string
  bodyClassName?: string
  components?: Record<string, any>
  format?: boolean
  storageKey?: string
  accentColor?: string
  softColor?: string
  readingMode?: boolean
  toolbar?: boolean
}

const MAX_HIGHLIGHTS = 40

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
  const bodyRef = useRef<HTMLDivElement>(null)
  const [highlights, setHighlights] = useState<string[]>([])
  const safeStorageKey = useMemo(() => storageKey ? `pausia:statement-highlights:${storageKey}` : '', [storageKey])

  useEffect(() => {
    if (!safeStorageKey || typeof window === 'undefined') {
      setHighlights([])
      return
    }
    try {
      const stored = window.localStorage.getItem(safeStorageKey)
      setHighlights(stored ? sanitizeHighlights(JSON.parse(stored)) : [])
    } catch {
      setHighlights([])
    }
  }, [safeStorageKey])

  useEffect(() => {
    const root = bodyRef.current
    if (!root) return
    applyHighlights(root, highlights)
  }, [text, format, highlights])

  function persist(next: string[]) {
    if (!safeStorageKey || typeof window === 'undefined') return
    try {
      if (next.length) window.localStorage.setItem(safeStorageKey, JSON.stringify(next))
      else window.localStorage.removeItem(safeStorageKey)
    } catch {}
  }

  function addHighlight() {
    if (typeof window === 'undefined') return
    const root = bodyRef.current
    const selection = window.getSelection()
    if (!root || !selection || selection.isCollapsed) return
    if (!selectionIsInside(root, selection) || selectionTouchesKatex(selection)) {
      selection.removeAllRanges()
      return
    }

    const selectedText = normalizeHighlight(selection.toString())
    selection.removeAllRanges()
    if (selectedText.length < 3) return

    setHighlights(current => {
      const next = sanitizeHighlights([...current, selectedText]).slice(-MAX_HIGHLIGHTS)
      persist(next)
      return next
    })
  }

  function clearHighlights() {
    setHighlights([])
    persist([])
  }

  const style = {
    '--statement-accent': accentColor,
    '--statement-soft': softColor,
  } as CSSProperties

  return (
    <div className={`exam-statement ${readingMode ? 'exam-statement-reading' : ''} ${className}`} style={style}>
      {toolbar && (
        <div className="exam-statement-toolbar">
          <button className="exam-statement-action" type="button" onClick={addHighlight}>
            <Highlighter size={15} />
            Subrayar
          </button>
          <button className="exam-statement-action exam-statement-action-muted" type="button" onClick={clearHighlights} disabled={!highlights.length}>
            <Eraser size={15} />
            Borrar
          </button>
        </div>
      )}
      <div ref={bodyRef} className={`exam-statement-body ${bodyClassName}`}>
        <MathMarkdown text={text} format={format} components={components} />
      </div>
    </div>
  )
}

function sanitizeHighlights(value: unknown) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(
    value
      .map(item => normalizeHighlight(String(item ?? '')))
      .filter(item => item.length >= 3)
  )).slice(0, MAX_HIGHLIGHTS)
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

function applyHighlights(root: HTMLElement, highlights: string[]) {
  unwrapHighlights(root)
  for (const highlight of highlights) {
    highlightSnippet(root, highlight)
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

function highlightSnippet(root: HTMLElement, snippet: string) {
  const pattern = snippet.split(/\s+/).filter(Boolean).map(escapeRegExp).join('\\s+')
  if (!pattern) return
  const regex = new RegExp(pattern, 'gi')

  for (const node of collectTextNodes(root)) {
    const text = node.textContent ?? ''
    const matches: Array<{ start: number; length: number }> = []
    regex.lastIndex = 0
    let match = regex.exec(text)
    while (match && matches.length < 8) {
      matches.push({ start: match.index, length: match[0].length })
      match = regex.exec(text)
    }
    for (const range of matches.reverse()) {
      const selected = node.splitText(range.start)
      selected.splitText(range.length)
      const mark = document.createElement('mark')
      mark.className = 'pausia-highlight'
      mark.dataset.pausiaHighlight = 'true'
      selected.parentNode?.replaceChild(mark, selected)
      mark.appendChild(selected)
    }
  }
}

function collectTextNodes(root: HTMLElement) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent
      const parent = node.parentElement
      if (!text?.trim() || !parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('.katex, .katex-display, mark[data-pausia-highlight="true"], script, style, textarea, button')) {
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
