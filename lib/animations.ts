'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function registerGSAP() {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
  }
}

/** Character reveal without SplitText (Club GSAP); splits text into spans. */
export function revealHeading(element: HTMLElement | null, delay = 0) {
  if (!element || typeof window === 'undefined') return

  const text = element.textContent ?? ''
  element.textContent = ''
  const chars = [...text].map((c) => {
    const span = document.createElement('span')
    span.textContent = c === ' ' ? '\u00a0' : c
    span.style.display = 'inline-block'
    span.style.overflow = 'hidden'
    element.appendChild(span)
    return span
  })

  return gsap.from(chars, {
    y: 100,
    opacity: 0,
    rotateX: -90,
    stagger: 0.035,
    duration: 1.0,
    ease: 'power4.out',
    delay,
  })
}

export function fadeUpOnScroll(
  elements: HTMLElement | HTMLElement[] | string,
  stagger = 0.1
) {
  const els =
    typeof elements === 'string'
      ? (gsap.utils.toArray(elements) as HTMLElement[])
      : Array.isArray(elements)
        ? elements
        : [elements]

  const trigger = els[0]
  if (!trigger) return

  return gsap.from(els, {
    y: 60,
    opacity: 0,
    stagger,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger,
      start: 'top 85%',
      once: true,
    },
  })
}

export function slideInFromLeft(element: HTMLElement | null) {
  if (!element) return
  return gsap.from(element, {
    x: -80,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
  })
}

export function slideInFromRight(element: HTMLElement | null) {
  if (!element) return
  return gsap.from(element, {
    x: 80,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
  })
}

export function scaleInOnScroll(element: HTMLElement | null) {
  if (!element) return
  return gsap.from(element, {
    scale: 0.88,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 85%',
      once: true,
    },
  })
}

export function parallaxElement(element: HTMLElement | null, speed = 0.5) {
  if (!element) return
  return gsap.to(element, {
    y: () => element.offsetHeight * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
}

export function animateCounter(element: HTMLElement | null, target: number, duration = 2) {
  if (!element) return
  const obj = { val: 0 }
  return gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.val).toString()
    },
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
  })
}
