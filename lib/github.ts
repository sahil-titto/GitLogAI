import { Octokit } from '@octokit/rest'

export function getOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken })
}

export async function getUserRepos(accessToken: string) {
  const octokit = getOctokit(accessToken)
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'pushed',
    per_page: 50,
    type: 'all',
  })
  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    private: repo.private,
    language: repo.language,
    updatedAt: repo.updated_at,
    stars: repo.stargazers_count,
  }))
}

export async function getRepoCommits(
  accessToken: string,
  owner: string,
  repo: string,
  since?: string
) {
  const octokit = getOctokit(accessToken)
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: 50,
    ...(since ? { since } : {}),
  })
  return data.map((commit) => ({
    sha: commit.sha.slice(0, 7),
    message: commit.commit.message.split('\n')[0], // first line only
    author: commit.commit.author?.name || 'Unknown',
    date: commit.commit.author?.date?.slice(0, 10) || '',
  }))
}
