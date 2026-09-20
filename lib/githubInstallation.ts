import { db } from "@/lib/db";

export type GitHubInstallationData = {
  id: number;
  account?: { id?: number; login?: string; type?: string };
  target_id?: number;
  target_type?: string;
  permissions?: Record<string, string>;
  events?: string[];
  suspended_at?: string | null;
};

export async function persistGitHubInstallation(
  userId: string,
  installation: GitHubInstallationData
) {
  const account = installation.account;
  if (!installation.id || !account?.id || !account.login) {
    throw new Error("GitHub returned an incomplete installation");
  }

  const installationId = String(installation.id);
  const data = {
    accountId: String(account.id),
    accountLogin: account.login,
    accountType: account.type ?? "User",
    targetId: installation.target_id ? String(installation.target_id) : null,
    targetType: installation.target_type ?? null,
    permissions: installation.permissions ?? {},
    events: installation.events ?? [],
    suspendedAt: installation.suspended_at ? new Date(installation.suspended_at) : null,
  };
  await db.$transaction(async (tx) => {
    await tx.gitHubInstallation.upsert({
      where: { id: installationId },
      update: { ...data, deletedAt: null },
      create: { id: installationId, ...data },
    });

    await tx.user.update({ where: { id: userId }, data: { installationId } });
  });

  return installationId;
}
