# ⚡ GitLogAI — AI Changelog Generator

Turn your GitHub commits into beautiful, shareable changelogs using AI.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables

Fill in `.env.local` with your keys:

| Variable | Where to get it |
|---|---|
| `GITHUB_CLIENT_ID` | github.com/settings/developers → New OAuth App |
| `GITHUB_CLIENT_SECRET` | Same page after creating the app |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `DATABASE_URL` | Already set to `file:./dev.db` for SQLite |

### 3. GitHub OAuth App Setup
Go to: https://github.com/settings/developers → OAuth Apps → New OAuth App

- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback/github`

### 4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the app
```bash
npm run dev
```

Visit http://localhost:3000

---

## 🗂 Project Structure

```
logify/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── dashboard/page.tsx           # Main app
│   ├── changelog/[slug]/page.tsx    # Public changelog page
│   └── api/
│       ├── auth/[...nextauth]/      # GitHub OAuth
│       ├── repos/                   # List GitHub repos
│       ├── generate/                # Generate changelog
│       ├── changelogs/              # User's history
│       └── changelog/[slug]/        # Public changelog API
├── lib/
│   ├── prisma.ts                    # DB client
│   ├── anthropic.ts                 # Claude AI
│   └── github.ts                   # Octokit GitHub API
├── auth.ts                          # NextAuth config
├── types/next-auth.d.ts             # TypeScript extensions
└── prisma/schema.prisma             # DB schema
```

---

## 🚀 Deploying to Production

1. Push to GitHub
2. Connect repo to Vercel
3. Add all env variables in Vercel dashboard
4. Switch DATABASE_URL to PostgreSQL (Vercel Postgres / Supabase)
5. Update prisma schema provider to "postgresql"
6. Deploy!

---

## 📋 Features to add next

- [ ] Webhook — auto-generate on every git push
- [ ] Version grouping by release tags
- [ ] Markdown / PDF export
- [ ] Email subscribers
- [ ] Custom branding per changelog
