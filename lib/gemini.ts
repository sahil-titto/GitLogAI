import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateChangelog(
  commits: { message: string; date: string; author: string; sha: string }[],
  repoName: string
): Promise<string> {
  const commitList = commits
    .map((c) => `- [${c.date}] ${c.message} (by ${c.author})`)
    .join('\n')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  const prompt = `You are a technical writer. Generate a clean, professional changelog for the GitHub repository "${repoName}" based on these commits:

${commitList}

Format the output as Markdown with these sections (only include sections that are relevant):
## ✨ New Features
## 🐛 Bug Fixes  
## 🔧 Improvements
## 🔒 Security
## 📦 Dependencies

Rules:
- Group related commits together
- Write in plain English, not developer jargon
- Skip trivial commits (typos, formatting, merge commits)
- Each item should be one concise line
- If there's nothing for a section, omit it entirely
- Add a one-line summary at the very top before the sections

Return only the markdown, no explanations.`

  // Retry up to 3 times on 429 rate limit errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err: any) {
      const is429 = err?.message?.includes('429') || err?.status === 429
      if (is429 && attempt < 3) {
        // Back off: 5s, then 15s
        await new Promise(resolve => setTimeout(resolve, attempt * 5000))
        continue
      }
      throw err
    }
  }

  throw new Error('Failed to generate changelog after retries')
}
