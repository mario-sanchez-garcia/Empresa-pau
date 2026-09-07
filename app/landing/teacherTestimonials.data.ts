export type TeacherTestimonial = {
  quote: string
  displayName: string
  role: string
  subject: string
  school?: string
  image?: string
  verified?: boolean
}

// Publicar solo testimonios con consentimiento y procedencia verificados.
// Mientras esté vacío, la landing muestra un mensaje institucional sin cita.
export const teacherTestimonials: TeacherTestimonial[] = []
