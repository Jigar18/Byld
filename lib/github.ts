import { importPKCS8, SignJWT } from "jose";

export async function getGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID ?? process.env.APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error("GitHub App credentials are not configured");
  }

  const signingKey = await importPKCS8(privateKey.replace(/\\n/g, "\n"), "RS256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(appId)
    .setIssuedAt(Math.floor(Date.now() / 1000) - 30)
    .setExpirationTime(Math.floor(Date.now() / 1000) + 9 * 60)
    .sign(signingKey);
}
