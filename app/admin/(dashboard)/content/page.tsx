import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { CONTENT, CONTENT_KEYS } from '@/lib/content/registry'
import { contentEditTimes } from '@/lib/content/store'
import { fmt } from '@/lib/time'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const edits = await contentEditTimes()
  const groups = new Map<string, typeof CONTENT_KEYS>()
  for (const k of CONTENT_KEYS) groups.set(CONTENT[k].group, [...(groups.get(CONTENT[k].group) ?? []), k])

  return (
    <div>
      <AdminPageHeader
        eyebrow="Website"
        title="Content"
        subtitle="Change the words and photos on the website. Events, music, videos and gallery photos have their own pages in the menu."
      />
      <div className="space-y-10">
        {[...groups].map(([group, keys]) => (
          <section key={group}>
            <h3 className="mb-4 font-display text-xl text-[#F7F1E3]">{group}</h3>
            <ul className="grid gap-4 md:grid-cols-2">
              {keys.map((k) => {
                const s = CONTENT[k]
                const e = edits.get(k)
                return (
                  <li key={k}>
                    <Link
                      href={`/admin/content/${k}`}
                      className="block h-full rounded-[18px] border border-[rgba(247,241,227,0.12)] bg-[#1B1F4B] p-5 no-underline transition-colors hover:border-[#E3B23C]"
                    >
                      <p className="font-semibold text-[#F7F1E3]">{s.title}</p>
                      <p className="mt-1 text-[14px] text-[rgba(247,241,227,0.65)]">{s.description}</p>
                      <p className="mt-3 text-[12px] text-[rgba(247,241,227,0.5)]">
                        {e ? `Edited ${fmt(e.updatedAt, 'd MMM yyyy, HH:mm')}${e.updatedBy ? ` by ${e.updatedBy}` : ''}` : 'Original text'}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
