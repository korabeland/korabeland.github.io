// Shared GitHub REST API request headers, used by scripts/enrich-projects.ts
// and scripts/scan-repos.ts — both independently built the identical
// Accept + optional Bearer-token block.

export function githubApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
