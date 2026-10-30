import { requireAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ContentEditor from '@/components/admin/content/ContentEditor'
import { CONTENT, type ContentKey } from '@/lib/content/registry'
import { getContent } from '@/lib/content/store'

export const dynamic = 'force-dynamic'

export default async function EditContentPage({ params }: { params: Promise<{ key: string }> }) {
  await requireAdmin('content')
  const { key } = await params
  if (!Object.prototype.hasOwnProperty.call(CONTENT, key)) notFound()
  const k = key as ContentKey
  const section = CONTENT[k]
  const values = await getContent(k)

  return (
    <div>
      <nav className="mb-8 text-[13px]">
        <Link href="/admin/content" className="text-ivory/65 no-underline">Content</Link>
        <span className="mx-2 text-ivory/35">/</span>
        <span className="text-gold">{section.title}</span>
      </nav>
      <AdminPageHeader
        eyebrow={section.group}
        title={section.title}
        subtitle={section.description}
        action={
          'page' in section && section.page ? (
            <a href={section.page} target="_blank" rel="noopener noreferrer" className="text-[14px] text-gold underline">
              View on site
            </a>
          ) : undefined
        }
      />
      <ContentEditor sectionKey={k} fields={JSON.parse(JSON.stringify(section.fields))} initial={JSON.parse(JSON.stringify(values))} />
    </div>
  )
}
