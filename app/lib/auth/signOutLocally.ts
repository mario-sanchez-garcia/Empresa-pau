import { supabase } from '@/app/lib/supabase'

/** Sign out this browser session without revoking the user's other devices. */
export async function signOutLocally(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (!error || typeof window === 'undefined') return

  // auth-js deliberately keeps storage when its logout request fails. A user
  // who explicitly chose logout must still be logged out on this device when
  // offline; remove only this project's exact auth keys, never app data.
  try {
    const hostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname
    const projectRef = hostname.split('.')[0]
    const storageKey = `sb-${projectRef}-auth-token`
    localStorage.removeItem(storageKey)
    localStorage.removeItem(`${storageKey}-code-verifier`)
    sessionStorage.removeItem('kairo_password_recovery_authorized')
  } catch {
    // Navigation to /login still occurs. Do not log storage/session contents.
  }
}
