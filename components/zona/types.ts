export type ZonaSubject = 'mates' | 'fisica' | 'historia'

export interface ZonaUser {
  id: string
  email?: string
}

export interface Flashcard {
  id: string
  user_id: string
  subject: ZonaSubject
  topic: string
  front: string
  back: string
  created_at?: string
  ease?: number
}

export type CanvasTool =
  | 'select'
  | 'pen'
  | 'eraser'
  | 'text'
  | 'sticky'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'arrow'
  | 'connector'
  | 'mind'
  | 'table'
  | 'image'

export type CanvasElementType = 'path' | 'text' | 'sticky' | 'shape' | 'connector' | 'mind' | 'table' | 'image'

export interface CanvasElement {
  id: string
  type: CanvasElementType
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  text?: string
  color?: string
  fill?: string
  border?: string
  strokeWidth?: number
  bold?: boolean
  italic?: boolean
  fontSize?: number
  shape?: 'rect' | 'circle' | 'triangle' | 'arrow'
  points?: [number, number][]
  from?: string
  to?: string
  curved?: boolean
  arrowHead?: 'arrow' | 'dot' | 'none'
  label?: string
  parentId?: string
  nodeStyle?: 'rounded' | 'square' | 'pill'
  rows?: number
  cols?: number
  cells?: string[][]
  src?: string
  storagePath?: string
}

export interface ZonaCanvasData {
  elements: CanvasElement[]
  viewport?: {
    pan: { x: number; y: number }
    zoom: number
  }
}

export interface ZonaCanvas {
  id: string
  user_id: string
  name: string
  data: ZonaCanvasData
  updated_at?: string
  created_at?: string
}
