import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateChangelog(
  commits: { message: string; date: string; author: string; sha: string }[],
  repoName: string
): Promise<string> {
  const commitList = commits
    .map((c) => `- [${c.date}] ${c.message} (by ${c.author})`)
    .join('\n')

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are a technical writer. Generate a clean, professional changelog for the GitHub repository "${repoName}" based on these commits:

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

Return only the markdown, no explanations.`,
      },
    ],
    temperature: 0.4,
    max_tokens: 1024,
  })

  return completion.choices[0]?.message?.content ?? ''
}
