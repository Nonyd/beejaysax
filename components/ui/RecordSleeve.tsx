import Image from 'next/image'
import Adire from '@/components/ui/Adire'
import { cn } from '@/lib/utils'

/**
 * Album cover as a record sleeve with the vinyl sliding out to the right.
 * Falls back to an Adire-patterned sleeve with the title when there is no cover yet.
 */
export default function RecordSleeve({
  title,
  coverImage,
  sizes,
  showVinyl = true,
  className,
}: {
  title: string
  coverImage: string | null
  sizes: string
  showVinyl?: boolean
  className?: string
}) {
  return (
    <div className={cn('@container relative', showVinyl && 'pr-[22%]', className)}>
      {showVinyl && (
        <div
          aria-hidden
          className="absolute top-[3%] right-0 aspect-square w-[72%] rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          style={{
            background:
              'repeating-radial-gradient(circle at center, #0d0f22 0 2px, #171a3a 2px 4px), #0d0f22',
          }}
        >
          <div className="absolute inset-[34%] flex items-center justify-center rounded-full bg-clay">
            <div className="h-[14%] w-[14%] rounded-full bg-night" />
          </div>
        </div>
      )}
      <div className="relative aspect-square overflow-hidden bg-ink-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
        {coverImage ? (
          <Image src={coverImage} alt={`${title} cover art`} fill sizes={sizes} style={{ objectFit: 'cover' }} />
        ) : (
          <>
            <Adire variant="field" color="#E3B23C" opacity={0.16} />
            <div className="absolute inset-0 flex items-end p-[8%]">
              <p className="font-display text-[8cqw] leading-[1.02] break-words text-ivory">{title}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
