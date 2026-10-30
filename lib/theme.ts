/**
 * Site-wide colour theme: "night" (indigo, the default) or "dawn" (the golden-hour palette).
 * The choice lives in localStorage so it is shared by the public site and the admin dashboard.
 * The palette itself is in app/globals.css, keyed off <html data-theme>.
 */
export type Theme = 'night' | 'dawn'

export const THEME_KEY = 'bjs-theme'

/** Runs in <head> before first paint so a saved Dawn choice never flashes Night first. */
export const themeInitScript = `try{var t=localStorage.getItem('${THEME_KEY}');document.documentElement.dataset.theme=t==='dawn'?'dawn':'night'}catch(e){document.documentElement.dataset.theme='night'}`
