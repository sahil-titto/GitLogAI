import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function PublicChangelog({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const changelog = await prisma.changelog.findUnique({
    where: { slug },
    include: { user: { select: { username: true, avatarUrl: true } } },
  })

  if (!changelog || !changelog.isPublic) notFound()

  const lines = changelog.content.split('\n')

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-violet-400">⚡</span>
            <span className="text-sm font-semibold text-violet-300 tracking-widest uppercase">GitLogAI</span>
          </div>
          <h1 className="text-3xl font-black mb-2">
            {changelog.repoOwner}/{changelog.repoName}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {changelog.user.avatarUrl && (
              <img src={changelog.user.avatarUrl} className="w-5 h-5 rounded-full" alt={changelog.user.username} />
            )}
            <span>by {changelog.user.username}</span>
            <span>·</span>
            <span>{new Date(changelog.createdAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1e1e2e] mb-10" />

        {/* Content */}
        <div className="space-y-2">
          {lines.map((line: string, i: number) => {
            if (line.startsWith('## ')) {
              return (
                <h2 key={i} className="text-lg font-bold text-white mt-8 mb-3 first:mt-0">
                  {line.replace('## ', '')}
                </h2>
              )
            }
            if (line.startsWith('- ')) {
              return (
                <div key={i} className="flex gap-3 text-gray-400 text-sm py-1">
                  <span className="text-violet-500 mt-0.5 flex-shrink-0">→</span>
                  <span>{line.replace('- ', '')}</span>
                </div>
              )
            }
            if (line.trim()) {
              return (
                <p key={i} className="text-gray-300 text-sm leading-relaxed">
                  {line}
                </p>
              )
            }
            return null
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#1e1e2e] text-center">
          <p className="text-sm text-gray-600">
            Generated with{' '}
            <a href="/" className="text-violet-400 hover:text-violet-300 transition-colors">
              GitLogAI
            </a>{' '}
            — AI-powered changelogs for developers
          </p>
        </div>
      </div>
    </div>
  )
}
