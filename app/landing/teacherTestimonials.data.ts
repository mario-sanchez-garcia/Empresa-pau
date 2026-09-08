export type TeacherTestimonial = {
  quote: string
  displayName: string
  role: string
  subject?: string
  school?: string
  image?: string
  verified?: boolean
}

// Publicar solo testimonios con consentimiento y procedencia verificados.
// Mientras esté vacío, la landing muestra un mensaje institucional sin cita.
export const teacherTestimonials: TeacherTestimonial[] = [
  {
    quote: 'Muy buena experiencia con Kairo. Una app muy intuitiva y útil para preparar la PAU de forma autónoma y eficaz. Ejercicios y simulacros de exámenes, corrección inmediata con feedback basado en las rúbricas de la PAU y la posibilidad de organizar tiempos y tareas de estudio. Motivación desde el principio.',
    displayName: 'Judith Martínez',
    role: 'Profesora de Bachillerato',
  },
  {
    quote: 'Propuesta muy interesante y necesaria para alumnos de 2º Bach.',
    displayName: 'Bea',
    role: 'Exalumna de 2º de Bachillerato',
  },
  {
    quote: 'El temario está bien y la explicación también.',
    displayName: 'Alejandra',
    role: 'Alumna de 2º de Bachillerato',
  },
]
