'use client'

import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        width: 44,
        height: 44,
        background: '#C9A84C',
        color: '#080808',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        zIndex: 100,
        transition: 'background 0.2s, transform 0.2s',
        boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#E8C96D'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#C9A84C'
      }}
    >
      ↑
    </button>
  )
}
