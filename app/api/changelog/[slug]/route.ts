import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const changelog = await prisma.changelog.findUnique({
    where: { slug },
    include: { user: { select: { username: true, avatarUrl: true } } },
  })

  if (!changelog || !changelog.isPublic) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(changelog)
}
