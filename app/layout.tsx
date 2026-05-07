import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'GitLogAI',
  description: 'Turn your GitHub commits into beautiful changelogs with AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

