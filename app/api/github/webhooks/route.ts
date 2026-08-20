import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type InstallationPayload = {
  action: "created" | "deleted" | "suspend" | "unsuspend" | "new_permissions_accepted";
  installation?: {
    id: number;
    target_id?: number;
    target_type?: string;
    account?: { id?: number; login?: string; type?: string };
    permissions?: Record<string, string>;
    events?: string[];
    suspended_at?: string | null;
  };
  sender?: { id?: number };
};

function isValidSignature(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!signature || !secret || !signature.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const received = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer);
}

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 1024 * 1024) {
    return NextResponse.json({ error: "Webhook payload is too large" }, { status: 413 });
  }
  const rawBody = await req.text();
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET ?? process.env.WEBHOOK_SECRET;
  if (!isValidSignature(rawBody, req.headers.get("x-hub-signature-256"), webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  if (req.headers.get("x-github-event") !== "installation") {
    return NextResponse.json({ received: true });
  }

  let payload: InstallationPayload;
  try {
    payload = JSON.parse(rawBody) as InstallationPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const installation = payload.installation;
  if (!installation?.id || !installation.account?.id || !installation.account.login) {
    return NextResponse.json({ error: "Incomplete installation payload" }, { status: 400 });
  }
  const account = installation.account;
  const accountId = String(account.id);
  const accountLogin = account.login!;

  const isDeleted = payload.action === "deleted";
  const installationId = String(installation.id);
  const senderGithubId = payload.sender?.id ? String(payload.sender.id) : null;

  await db.$transaction(async (tx) => {
    await tx.gitHubInstallation.upsert({
      where: { id: installationId },
      update: {
        accountId,
        accountLogin,
        accountType: account.type ?? "User",
        targetId: installation.target_id ? String(installation.target_id) : null,
        targetType: installation.target_type ?? null,
        permissions: installation.permissions ?? {},
        events: installation.events ?? [],
        suspendedAt: installation.suspended_at ? new Date(installation.suspended_at) : null,
        deletedAt: isDeleted ? new Date() : null,
        senderGithubId,
      },
      create: {
        id: installationId,
        accountId,
        accountLogin,
        accountType: account.type ?? "User",
        targetId: installation.target_id ? String(installation.target_id) : null,
        targetType: installation.target_type ?? null,
        permissions: installation.permissions ?? {},
        events: installation.events ?? [],
        suspendedAt: installation.suspended_at ? new Date(installation.suspended_at) : null,
        deletedAt: isDeleted ? new Date() : null,
        senderGithubId,
      },
    });

    if (senderGithubId) {
      await tx.user.updateMany({
        where: { githubId: senderGithubId },
        data: { installationId: isDeleted ? null : installationId },
      });
    }
  });

  return NextResponse.json({ received: true });
}
