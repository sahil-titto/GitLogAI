import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getRepoCommits } from '@/lib/github'
import { generateChangelog } from '@/lib/groq'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { owner, repo, since } = await req.json()
  if (!owner || !repo) {
    return NextResponse.json({ error: 'owner and repo are required' }, { status: 400 })
  }

  try {
    // 1. Fetch commits from GitHub
    const commits = await getRepoCommits(session.accessToken, owner, repo, since)
    if (commits.length === 0) {
      return NextResponse.json({ error: 'No commits found' }, { status: 404 })
    }

    // 2. Generate changelog with Claude
    const content = await generateChangelog(commits, repo)

    // 3. Save to database
    const slug = nanoid(10)
    const changelog = await prisma.changelog.create({
      data: {
        repoName: repo,
        repoOwner: owner,
        content,
        slug,
        isPublic: true,
        user: {
          connectOrCreate: {
            where: { githubId: session.user.githubId },
            create: {
              githubId: session.user.githubId,
              username: session.user.username,
              email: session.user.email ?? '',
              avatarUrl: session.user.image ?? '',
              accessToken: session.accessToken,
            },
          },
        },
      },
    })

    return NextResponse.json({
      id: changelog.id,
      slug: changelog.slug,
      content: changelog.content,
      commitCount: commits.length,
    })
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
