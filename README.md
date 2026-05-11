# ⚡ GitLogAI

AI-powered changelog generator. Connect a GitHub repo, click generate, get a clean markdown changelog written by AI — ready to share via a public link.

---

## What it does

- Sign in with your GitHub account
- Browse your repositories and select one
- Generate a professional changelog from the last 50 commits using Groq (Llama 3.3 70B)
- Each changelog gets a unique public URL you can share with anyone
- View your changelog history from the dashboard

---

## Tech stack

- **Framework** — Next.js 15 (App Router)
- **Auth** — NextAuth v5 with GitHub OAuth
- **Database** — PostgreSQL via [Neon](https://neon.tech) + Prisma ORM
- **AI** — [Groq](https://console.groq.com) (free, no credit card required)
- **Styling** — Tailwind CSS v4

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/gitlog-ai.git
cd gitlog-ai
npm install
```

### 2. Create a Neon database

1. Sign up at [neon.tech](https://neon.tech) — free tier is enough
2. Create a new project
3. Copy the **connection string** from the dashboard (looks like `postgresql://user:pass@host/neondb?sslmode=require`)

### 3. Create a GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Fill in:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. After creating, generate a **Client Secret**
4. Save the **Client ID** and **Client Secret**

### 4. Get a Groq API key

Sign up at [console.groq.com](https://console.groq.com) — free, no credit card needed. Copy your API key.

### 5. Configure environment variables

Create a `.env.local` file in the project root:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# NextAuth
AUTH_SECRET=your_random_secret        # generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_neon_connection_string

# Groq AI
GROQ_API_KEY=your_groq_api_key
```

### 6. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 7. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
├── app/
│   ├── page.tsx                      # Landing page
│   ├── dashboard/page.tsx            # Main app (repo picker + generator)
│   ├── changelog/[slug]/page.tsx     # Public changelog page
│   └── api/
│       ├── auth/[...nextauth]/       # GitHub OAuth handler
│       ├── repos/                    # List user's GitHub repos
│       ├── generate/                 # Generate changelog with AI
│       ├── changelogs/               # User's changelog history
│       └── changelog/[slug]/         # Public changelog API
├── lib/
│   ├── prisma.ts                     # Prisma client (PostgreSQL)
│   ├── github.ts                     # Octokit — fetch repos and commits
│   ├── groq.ts                       # Groq AI — changelog generation
│   └── gemini.ts                     # Gemini AI (alternative, unused by default)
├── auth.ts                           # NextAuth config
├── prisma/schema.prisma              # Database schema
└── prisma.config.ts                  # Prisma config (loads .env.local)
```

---

## Notes

- The app requests `repo` scope from GitHub OAuth to access private repositories
- Changelogs are public by default and accessible to anyone with the link
- Groq's free tier supports ~14,400 requests/day which is plenty for personal use
- If you want to use Gemini instead of Groq, swap the import in `app/api/generate/route.ts`
