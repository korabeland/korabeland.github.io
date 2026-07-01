// Shared GitHub REST API request headers, used by scripts/enrich-projects.ts
// and scripts/scan-repos.ts — both independently built the identical
// Accept + optional Bearer-token block.

export function githubApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  // Check both names: `gh` CLI (used elsewhere in these scripts for PR
  // listing) requires GH_TOKEN specifically, so that's what the calling
  // workflows set — but this function's own callers (fetch, not gh) were
  // documented as reading GITHUB_TOKEN. Checking only one name meant these
  // fetch() calls ran unauthenticated in CI even though a token was present
  // in the environment under the other name.
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
