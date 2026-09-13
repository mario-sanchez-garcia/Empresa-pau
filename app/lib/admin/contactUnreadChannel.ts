'use client'

// SidebarNav y /admin nunca están montados a la vez que /admin/contact-messages
// (páginas distintas, sin layout compartido, y a menudo en pestañas separadas
// cuando un admin tiene el panel de mensajes abierto aparte del dashboard) --
// un CustomEvent en window no llega a nadie en ese caso porque no hay ningún
// listener vivo en el momento del dispatch. BroadcastChannel sí funciona
// entre pestañas/documentos del mismo origen, así que el badge se actualiza
// en cuanto se marca un mensaje como leído, sin esperar a un reload.
const CHANNEL_NAME = 'kairo-contact-unread'

export function notifyContactUnreadChanged() {
  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel(CHANNEL_NAME)
  channel.postMessage('changed')
  channel.close()
}

export function onContactUnreadChanged(callback: () => void) {
  if (typeof BroadcastChannel === 'undefined') return () => {}
  const channel = new BroadcastChannel(CHANNEL_NAME)
  channel.onmessage = () => callback()
  return () => channel.close()
}
