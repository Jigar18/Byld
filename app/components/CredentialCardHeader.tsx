import type { ReactNode } from "react";

export const credentialEditButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-700/80 p-2 text-slate-300 opacity-100 transition-all duration-200 hover:scale-105 hover:bg-slate-600 hover:text-white sm:opacity-0 sm:group-hover:opacity-100";

interface CredentialCardHeaderProps {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
}

export default function CredentialCardHeader({
  title,
  icon,
  action,
}: CredentialCardHeaderProps) {
  return (
    <div className="profile-card-header flex h-12 shrink-0 items-center justify-between gap-3 border-b">
      <h2 className="profile-section-label flex min-w-0 items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]">
        <span className="profile-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
          {icon}
        </span>
        <span className="truncate">{title}</span>
      </h2>
      {action}
    </div>
  );
}
