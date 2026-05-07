'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 bg-[#13131a] border border-[#1e1e2e] rounded-full px-4 py-2 mb-8">
          <span className="text-violet-400 text-lg">⚡</span>
          <span className="text-sm font-semibold tracking-widest text-violet-300">GitLogAI</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
          Turn commits into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">
            changelogs
          </span>
        </h1>

        <p className="text-lg text-gray-400 mb-10 leading-relaxed">
          Connect your GitHub repo. Click generate. Get a beautiful,
          AI-written changelog in seconds — ready to share with your users.
        </p>

        <button
          onClick={() => signIn('github')}
          className="inline-flex items-center gap-3 bg-white text-black font-bold px-8 py-4 rounded-xl text-base hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* Features row */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-sm">
          {[
            { icon: '🔗', text: 'Connect any GitHub repo' },
            { icon: '🤖', text: 'AI writes the changelog' },
            { icon: '🔗', text: 'Share a public link' },
          ].map((f, i) => (
            <div key={i} className="bg-[#13131a] border border-[#1e1e2e] rounded-xl p-4 text-gray-400">
              <div className="text-2xl mb-2">{f.icon}</div>
              {f.text}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
