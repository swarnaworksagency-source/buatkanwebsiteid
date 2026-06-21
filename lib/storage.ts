// Wrapper localStorage/sessionStorage yang aman: no-op saat SSR (window undefined)
// dan saat akses storage dilempar (Safari Private Mode / quota penuh) — supaya draft
// wizard tak meledakkan render. Selalu lewat helper ini, jangan akses storage langsung.
export const safeStorage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Safari Private Mode atau quota exceeded
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(key)
    } catch {}
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.clear()
    } catch {}
  }
}

export const safeSessionStorage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(key, value)
    } catch {}
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(key)
    } catch {}
  }
}
