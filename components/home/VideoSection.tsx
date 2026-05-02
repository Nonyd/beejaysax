'use client'

import { useEffect, useRef, useState } from 'react'
import type { Video } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { registerGSAP, scaleInOnScroll, fadeUpOnScroll } from '@/lib/animations'

export default function VideoSection({ videos }: { videos: Video[] }) {
  const featuredRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const [playMain, setPlayMain] = useState(false)
  const [playIdx, setPlayIdx] = useState<number | null>(null)

  const main = videos[0]
  const rest = videos.slice(1, 3)

  useEffect(() => {
    if (typeof window === 'undefined') return
    registerGSAP()
    if (featuredRef.current) scaleInOnScroll(featuredRef.current)
    if (rowRef.current)
      fadeUpOnScroll(Array.from(rowRef.current.querySelectorAll<HTMLElement>('[data-video-tile]')))
  }, [videos.length])

  if (!main) return null

  const thumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`

  return (
    <section className="bg-bjs-surface py-32">
      <div className="mx-auto max-w-7xl px-8">
        <SectionLabel>Watch</SectionLabel>
        <h2 className="mt-6 font-serif text-[clamp(38px,6vw,80px)] font-semibold leading-[0.95] text-bjs-white">
          Experience The
          <br />
          Performance.
        </h2>

        <div ref={featuredRef} className="relative mt-12 aspect-video overflow-hidden border border-bjs-border bg-bjs-black">
          {!playMain ? (
            <button type="button" className="group absolute inset-0 z-10 flex flex-col items-center justify-center bg-bjs-black/60" onClick={() => setPlayMain(true)}>
              <span className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-bjs-gold text-bjs-black transition-transform group-hover:scale-105">
                <Play className="ml-1 h-8 w-8 fill-current" />
              </span>
              <span className="mt-4 max-w-xl px-4 text-center font-serif text-xl text-bjs-white">{main.title}</span>
            </button>
          ) : null}
          {playMain ? (
            <iframe
              title={main.title}
              src={`https://www.youtube.com/embed/${main.youtubeId}?autoplay=1`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Image src={thumb(main.youtubeId)} alt={`${main.title} — YouTube thumbnail`} fill className="object-cover" sizes="100vw" />
          )}
        </div>

        {rest.length > 0 && (
          <div ref={rowRef} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {rest.map((v, i) => (
              <div key={v.id} data-video-tile className="relative aspect-video overflow-hidden border border-bjs-border">
                {playIdx === i ? (
                  <iframe
                    title={v.title}
                    src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <button type="button" className="absolute inset-0 z-10 flex items-center justify-center bg-bjs-black/50" onClick={() => setPlayIdx(i)}>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bjs-gold text-bjs-black">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </button>
                    <Image src={thumb(v.youtubeId)} alt={`${v.title} — YouTube thumbnail`} fill className="object-cover" sizes="50vw" />
                    <p className="absolute bottom-2 left-2 right-2 font-serif text-sm text-bjs-white drop-shadow">{v.title}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-10 text-center">
          <a
            href="https://www.youtube.com/@beejaysax"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-bjs-gold underline-offset-4 hover:underline"
          >
            View All Videos
          </a>
        </p>
      </div>
    </section>
  )
}
