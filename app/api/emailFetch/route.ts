import { getAccessToken } from "@/lib/accessToken";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const accessToken = await getAccessToken(req);

    let userEmailsResponse;
    try {
      userEmailsResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
    } catch (emailError) {
      if (
        axios.isAxiosError(emailError) &&
        emailError.response?.status === 403
      ) {
        const authUrl = new URL(
          `/api/github/auth?return_to=/api/emailFetch`,
          req.url
        ).toString();
        return NextResponse.json(
          {
            error: "Email permission required",
            authUrl,
            needsAuth: true,
          },
          { status: 401 }
        );
      }
      throw emailError;
    }

    interface GithubEmail {
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string | null;
    }

    if (!Array.isArray(userEmailsResponse.data)) {
      return NextResponse.json(
        { error: "Unexpected response format from GitHub API" },
        { status: 500 }
      );
    }

    const primaryEmail = userEmailsResponse.data.find(
      (emailObj: GithubEmail) => emailObj.primary
    )?.email;

    const email = primaryEmail || userEmailsResponse.data.find(
      (emailObj: GithubEmail) => emailObj.verified,
    )?.email;
    return email
      ? NextResponse.json({ email })
      : NextResponse.json({ error: "No primary email found" }, { status: 404 });
  } catch (err: unknown) {
    console.error("  error:", err);

    if (axios.isAxiosError(err)) {
      // GitHub API error
      if (err.response) {
        return NextResponse.json(
          {
            error: `GitHub API error: ${err.response.status} - ${err.response.statusText}`,
          },
          { status: err.response.status }
        );
      }
    }

    if (
      err instanceof Error &&
      err.message.includes("Authentication token is missing")
    ) {
      return NextResponse.json(
        { error: "Authentication token is missing" },
        { status: 401 }
      );
    }

    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
