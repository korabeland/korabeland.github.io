import { afterEach, describe, expect, it, vi } from 'vitest';
import { githubApiHeaders } from '../src/lib/github-api';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('githubApiHeaders', () => {
  it('omits Authorization when neither GITHUB_TOKEN nor GH_TOKEN is set', () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    vi.stubEnv('GH_TOKEN', '');
    const headers = githubApiHeaders();
    expect(headers.Authorization).toBeUndefined();
    expect(headers.Accept).toBe('application/vnd.github+json');
  });

  it('includes a Bearer token when GITHUB_TOKEN is set', () => {
    vi.stubEnv('GITHUB_TOKEN', 'gh-token-value');
    vi.stubEnv('GH_TOKEN', '');
    expect(githubApiHeaders().Authorization).toBe('Bearer gh-token-value');
  });

  it('includes a Bearer token when only GH_TOKEN is set (the name the gh CLI and these workflows actually use)', () => {
    vi.stubEnv('GITHUB_TOKEN', '');
    vi.stubEnv('GH_TOKEN', 'gh-cli-token-value');
    expect(githubApiHeaders().Authorization).toBe('Bearer gh-cli-token-value');
  });
});
