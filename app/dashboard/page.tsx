'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Repo {
  id: number
  name: string
  fullName: string
  description: string | null
  private: boolean
  language: string | null
  stars: number
}

interface Changelog {
  id: string
  slug: string
  repoName: string
  repoOwner: string
  createdAt: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState<Repo[]>([])
  const [changelogs, setChangelogs] = useState<Changelog[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ slug: string; content: string } | null>(null)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    Promise.all([
      fetch('/api/repos').then(r => r.json()),
      fetch('/api/changelogs').then(r => r.json()),
    ])
      .then(([reposData, changelogsData]) => {
        setRepos(Array.isArray(reposData) ? reposData : [])
        setChangelogs(Array.isArray(changelogsData) ? changelogsData : [])
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [status])

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleGenerate = async () => {
    if (!selectedRepo) return
    setGenerating(true)
    setResult(null)
    const [owner, repo] = selectedRepo.fullName.split('/')
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo }),
    })
    const data = await res.json()
    if (data.slug) {
      setResult({ slug: data.slug, content: data.content })
      setChangelogs(prev => [{
        id: data.id,
        slug: data.slug,
        repoName: repo,
        repoOwner: owner,
        createdAt: new Date().toISOString(),
      }, ...prev])
    }
    setGenerating(false)
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/changelog/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-[#1e1e2e] bg-[#0d0d14] px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 text-lg">⚡</span>
          <span className="font-black text-lg tracking-tight">GitLogAI</span>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <img
              src={session.user.image}
              className="w-8 h-8 rounded-full border border-[#1e1e2e]"
              alt={session.user.username}
            />
          )}
          <span className="text-sm text-gray-400">{session?.user?.username}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Repo picker */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Your Repositories
          </h2>
          <input
            type="text"
            placeholder="Search repos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#13131a] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-gray-600 text-sm py-4 text-center">Loading repos...</div>
            ) : filteredRepos.map(repo => (
              <button
                key={repo.id}
                onClick={() => { setSelectedRepo(repo); setResult(null) }}
                className={`w-full text-left bg-[#13131a] border rounded-xl px-4 py-3 transition-all ${selectedRepo?.id === repo.id
                  ? 'border-violet-500 bg-violet-950/30'
                  : 'border-[#1e1e2e] hover:border-gray-600'
                  }`}
              >
                <div className="font-medium text-sm text-white truncate">{repo.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  {repo.language && (
                    <span className="text-xs text-gray-500">{repo.language}</span>
                  )}
                  {repo.private && (
                    <span className="text-xs text-gray-600 bg-[#1e1e2e] px-1.5 py-0.5 rounded">Private</span>
                  )}
                  <span className="text-xs text-gray-600">⭐ {repo.stars}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Generator + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generator Card */}
          <div className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Generate Changelog
            </h2>
            {selectedRepo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-4 py-3">
                  <span className="text-violet-400">📁</span>
                  <div>
                    <div className="font-semibold text-sm">{selectedRepo.name}</div>
                    <div className="text-xs text-gray-500">{selectedRepo.fullName}</div>
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>⚡ Generate Changelog</>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-600 text-sm">
                ← Select a repository to get started
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-green-400">
                    ✓ Changelog Generated
                  </span>
                  <button
                    onClick={() => copyLink(result.slug)}
                    className="text-xs bg-[#1e1e2e] hover:bg-[#2a2a3e] text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? '✓ Copied!' : '🔗 Copy Link'}
                  </button>
                </div>
                <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4 max-h-72 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {result.content}
                  </pre>
                </div>
                <a
                  href={`/changelog/${result.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  View public page →
                </a>
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
              Recent Changelogs
            </h2>
            {changelogs.length === 0 ? (
              <div className="text-gray-600 text-sm text-center py-6">
                No changelogs yet — generate your first one above!
              </div>
            ) : (
              <div className="space-y-2">
                {changelogs.map(cl => (
                  <div
                    key={cl.id}
                    className="flex items-center justify-between bg-[#0d0d14] border border-[#1e1e2e] rounded-xl px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{cl.repoOwner}/{cl.repoName}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {new Date(cl.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(cl.slug)}
                        className="text-xs text-gray-500 hover:text-white bg-[#1e1e2e] px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Copy link
                      </button>
                      <a
                        href={`/changelog/${cl.slug}`}
                        target="_blank"
                        className="text-xs text-violet-400 hover:text-violet-300 bg-violet-950/30 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
