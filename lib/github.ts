import { createPrivateKey } from "node:crypto";
import { SignJWT } from "jose";

export async function getGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID ?? process.env.APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error("GitHub App credentials are not configured");
  }

  // GitHub downloads App keys as PKCS#1 (`BEGIN RSA PRIVATE KEY`), while
  // some hosting setups store a converted PKCS#8 key. Node accepts both.
  const signingKey = createPrivateKey(privateKey.replace(/\\n/g, "\n"));
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(appId)
    .setIssuedAt(Math.floor(Date.now() / 1000) - 30)
    .setExpirationTime(Math.floor(Date.now() / 1000) + 9 * 60)
    .sign(signingKey);
}
