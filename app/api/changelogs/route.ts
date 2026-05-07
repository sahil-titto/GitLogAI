import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.githubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const changelogs = await prisma.changelog.findMany({
    where: { user: { githubId: session.user.githubId } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      repoName: true,
      repoOwner: true,
      createdAt: true,
      isPublic: true,
    },
  })

  return NextResponse.json(changelogs)
}
