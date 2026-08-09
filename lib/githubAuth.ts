export function getGitHubOAuthRedirectUri(requestUrl: string) {
  const configuredUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI?.trim();
  return configuredUri || new URL("/api/github/callback", requestUrl).toString();
}
