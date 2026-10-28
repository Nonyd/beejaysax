import { Gloock, Hanken_Grotesk } from 'next/font/google'

/** Display: Gloock — warm, high-contrast serif. Single weight, no italic (so no swash "J"). */
export const gloock = Gloock({
  subsets: ['latin'],
  variable: '--font-gloock',
  display: 'swap',
  weight: '400',
})

/** Body / UI: Hanken Grotesk. */
export const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})
