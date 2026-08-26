import 'server-only'

import { CalendarSyncGoneError, type BusySlot, type CalendarChangePage, type CalendarEvent, type CalendarEventInput, type CalendarProvider, type WatchChannel } from './types'

const GOOGLE_API = 'https://www.googleapis.com/calendar/v3'

type GoogleTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

async function googleFetch<T>(accessToken: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${GOOGLE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  if (res.status === 404) return null as T
  if (res.status === 410) throw new CalendarSyncGoneError()
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google Calendar error ${res.status}: ${text.slice(0, 300)}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function normalizeEvent(event: Record<string, unknown>): CalendarEvent {
  return {
    ...(event as CalendarEventInput),
    id: String(event.id),
    etag: typeof event.etag === 'string' ? event.etag : undefined,
    status: typeof event.status === 'string' ? event.status : undefined,
    updated: typeof event.updated === 'string' ? event.updated : undefined,
  }
}

export const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/calendar.app.created',
  'https://www.googleapis.com/auth/calendar.freebusy',
] as const

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) throw new Error('Google Calendar OAuth is not configured')
  return { clientId, clientSecret, redirectUri }
}

export function buildGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = getGoogleOAuthConfig()
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('include_granted_scopes', 'true')
  url.searchParams.set('scope', GOOGLE_CALENDAR_SCOPES.join(' '))
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig()
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Google OAuth exchange failed: ${res.status}`)
  return res.json() as Promise<GoogleTokenResponse>
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getGoogleOAuthConfig()
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Google OAuth refresh failed: ${res.status}`)
  return res.json() as Promise<GoogleTokenResponse>
}

export async function getGoogleAccountEmail(accessToken: string): Promise<string | null> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const json = await res.json() as { email?: string }
  return json.email ?? null
}

export class GoogleCalendarProvider implements CalendarProvider {
  id = 'google' as const

  constructor(private accessToken: string) {}

  createCalendar(summary: string, timeZone: string) {
    return googleFetch<{ id: string; summary?: string }>(this.accessToken, '/calendars', {
      method: 'POST',
      body: JSON.stringify({ summary, timeZone }),
    })
  }

  getCalendar(calendarId: string) {
    return googleFetch<{ id: string; summary?: string } | null>(this.accessToken, `/calendars/${encodeURIComponent(calendarId)}`)
  }

  createEvent(calendarId: string, event: CalendarEventInput) {
    return googleFetch<Record<string, unknown>>(this.accessToken, `/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    }).then(normalizeEvent)
  }

  updateEvent(calendarId: string, eventId: string, event: CalendarEventInput) {
    return googleFetch<Record<string, unknown>>(this.accessToken, `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    }).then(normalizeEvent)
  }

  async deleteEvent(calendarId: string, eventId: string) {
    await googleFetch<void>(this.accessToken, `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' })
  }

  getEvent(calendarId: string, eventId: string) {
    return googleFetch<Record<string, unknown> | null>(this.accessToken, `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`)
      .then(event => event ? normalizeEvent(event) : null)
  }

  async getChanges(calendarId: string, options: { syncToken?: string; pageToken?: string }): Promise<CalendarChangePage> {
    const params = new URLSearchParams({ showDeleted: 'true', maxResults: '250' })
    if (options.syncToken) params.set('syncToken', options.syncToken)
    if (options.pageToken) params.set('pageToken', options.pageToken)
    const json = await googleFetch<{ items?: Record<string, unknown>[]; nextPageToken?: string; nextSyncToken?: string }>(
      this.accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    )
    return {
      events: (json.items ?? []).map(normalizeEvent),
      nextPageToken: json.nextPageToken,
      nextSyncToken: json.nextSyncToken,
    }
  }

  async getAvailability(calendarIds: string[], timeMin: string, timeMax: string, timeZone: string): Promise<BusySlot[]> {
    const json = await googleFetch<{ calendars?: Record<string, { busy?: BusySlot[] }> }>(this.accessToken, '/freeBusy', {
      method: 'POST',
      body: JSON.stringify({ timeMin, timeMax, timeZone, items: calendarIds.map(id => ({ id })) }),
    })
    return Object.values(json.calendars ?? {}).flatMap(calendar => calendar.busy ?? [])
  }

  async watch(calendarId: string, webhookUrl: string, channelId: string): Promise<WatchChannel> {
    const json = await googleFetch<{ id: string; resourceId: string; expiration?: string }>(this.accessToken, `/calendars/${encodeURIComponent(calendarId)}/events/watch`, {
      method: 'POST',
      body: JSON.stringify({ id: channelId, type: 'web_hook', address: webhookUrl }),
    })
    return {
      channelId: json.id,
      resourceId: json.resourceId,
      expiration: json.expiration ? new Date(Number(json.expiration)).toISOString() : undefined,
    }
  }

  async unwatch(channelId: string, resourceId: string) {
    await googleFetch<void>(this.accessToken, '/channels/stop', {
      method: 'POST',
      body: JSON.stringify({ id: channelId, resourceId }),
    })
  }
}
