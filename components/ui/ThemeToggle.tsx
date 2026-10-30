'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sunrise } from 'lucide-react'
import { THEME_KEY, type Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dawn' ? 'dawn' : 'night'
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // private mode: the switch still works for this page view
  }
}

/** The theme lives on <html data-theme>; every switch on the page (and other tabs) follows it. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) document.documentElement.dataset.theme = e.newValue === 'dawn' ? 'dawn' : 'night'
  }
  window.addEventListener('storage', onStorage)
  return () => {
    observer.disconnect()
    window.removeEventListener('storage', onStorage)
  }
}

/**
 * Night / Dawn switch. Both icons are rendered and CSS shows the right one,
 * so the server HTML matches whatever theme the head script already set.
 * Switching plays a circular reveal from the button (View Transitions, where supported).
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null)

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = currentTheme() === 'dawn' ? 'night' : 'dawn'
    const swap = () => applyTheme(next)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !document.startViewTransition) {
      swap()
      return
    }

    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(swap).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' }
      )
    })
  }

  const label = theme === null ? 'Switch colour theme' : theme === 'dawn' ? 'Switch to Night theme' : 'Switch to Dawn theme'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ivory transition-colors hover:border-gold hover:text-gold',
        className
      )}
    >
      {/* Shows the theme you will switch to */}
      <Sunrise aria-hidden className="theme-when-night h-[18px] w-[18px]" />
      <Moon aria-hidden className="theme-when-dawn h-[18px] w-[18px]" />
    </button>
  )
}
