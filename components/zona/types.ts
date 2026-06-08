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
