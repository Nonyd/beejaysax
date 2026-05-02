'use client'

import { useEffect, useRef, useState } from 'react'
import type { Video } from '@prisma/client'
import SectionLabel from '@/components/ui/SectionLabel'
import Image from 'next/image'
import OutlineButton from '@/components/ui/OutlineButton'
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
    <section className="border-y border-bjs-border bg-bjs-surface py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12">
        <SectionLabel>Watch</SectionLabel>
        <h2 className="mt-3">
          <span className="h2-text block text-bjs-white">Experience The</span>
          <span className="h2-text block text-bjs-gold">Performance.</span>
        </h2>

        <div ref={featuredRef} className="relative mt-12 aspect-video w-full overflow-hidden bg-bjs-black">
          {!playMain ? (
            <>
              <button
                type="button"
                className="group absolute inset-0 z-10 flex flex-col items-center justify-center"
                onClick={() => setPlayMain(true)}
                aria-label={`Play video: ${main.title}`}
              >
                <span className="absolute inset-0 bg-[rgba(8,8,8,0.5)]" />
                <span className="relative z-[1] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-bjs-gold text-bjs-black transition-all duration-200 hover:scale-110 hover:bg-bjs-gold-lt">
                  <Play className="ml-1 h-7 w-7 fill-current" />
                </span>
              </button>
              <Image src={thumb(main.youtubeId)} alt="" fill className="object-cover" sizes="100vw" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(8,8,8,0.8)] to-transparent px-6 py-4">
                <p className="relative z-[1] font-sans text-[13px] text-bjs-white">{main.title}</p>
              </div>
            </>
          ) : (
            <iframe
              title={main.title}
              src={`https://www.youtube.com/embed/${main.youtubeId}?autoplay=1`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {rest.length > 0 && (
          <div ref={rowRef} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {rest.map((v, i) => (
              <div key={v.id} data-video-tile className="relative aspect-video overflow-hidden bg-bjs-black">
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
                    <button
                      type="button"
                      className="group absolute inset-0 z-10 flex items-center justify-center bg-[rgba(8,8,8,0.5)]"
                      onClick={() => setPlayIdx(i)}
                      aria-label={`Play video: ${v.title}`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bjs-gold text-bjs-black transition-all duration-200 hover:scale-110 hover:bg-bjs-gold-lt">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </button>
                    <Image src={thumb(v.youtubeId)} alt="" fill className="object-cover" sizes="50vw" />
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(8,8,8,0.8)] to-transparent px-4 py-3">
                      <p className="font-sans text-[13px] text-bjs-white">{v.title}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center">
          <OutlineButton href="https://www.youtube.com/@beejaysax" target="_blank" rel="noopener noreferrer">
            View All Videos
          </OutlineButton>
        </p>
      </div>
    </section>
  )
}
