import { Building2, FileText, Github, Globe, Mail, MapPin, Plus, Star, Users } from "lucide-react";
import { languageColors, type PortfolioPreview } from "./githubPreview";

type SheetProps = { portfolio: PortfolioPreview };

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const WEEKS = 53;
const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

// Integer hashing keeps the sample calendar identical on the server and in every browser.
function sampleContributionLevel(cell: number) {
  let hash = Math.imul(cell ^ 0x9e3779b9, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  const noise = (hash >>> 0) / 4294967296;

  const week = Math.floor(cell / 7);
  const weekday = cell % 7;
  const busySeason = 0.4 + 0.6 * Math.abs((week % 18) / 9 - 1);
  const intensity = noise * busySeason * (weekday === 0 || weekday === 6 ? 0.5 : 1);

  if (intensity < 0.14) return 0;
  if (intensity < 0.3) return 1;
  if (intensity < 0.48) return 2;
  if (intensity < 0.66) return 3;
  return 4;
}

const sampleCalendar = Array.from({ length: WEEKS * 7 }, (_, cell) => sampleContributionLevel(cell));

function SheetLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-medium text-[var(--sheet-soft)]">{children}</p>;
}

function EmptySlot({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[52px] items-center gap-[10px] rounded-[12px] border border-dashed border-[var(--sheet-line-strong)] px-[14px] text-[14px] text-[var(--sheet-soft)]">
      <Plus className="h-[15px] w-[15px]" />
      {children}
    </div>
  );
}

export function ProfileSheet({ portfolio }: SheetProps) {
  const initials = portfolio.name.split(/\s+/).map((word) => word[0]).slice(0, 2).join("");

  return (
    <div className="flex h-full flex-col justify-between p-[28px]">
      <div className="flex items-start gap-[22px]">
        {portfolio.avatarUrl ? (
          // GitHub's avatar host isn't in next/image remotePatterns, and this is a one-off preview.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portfolio.avatarUrl} alt="" className="h-[104px] w-[104px] shrink-0 rounded-[24px] object-cover" />
        ) : (
          <div className="lp-display grid h-[104px] w-[104px] shrink-0 place-items-center rounded-[24px] bg-[var(--blue)] text-[40px] font-semibold text-white">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="lp-display truncate text-[32px] font-semibold leading-[1.1] tracking-[-0.02em]">{portfolio.name}</p>
          <p className="mt-[4px] truncate text-[15px] text-[var(--sheet-soft)]">{portfolio.role ?? `@${portfolio.username}`}</p>
          <p className="mt-[12px] line-clamp-2 text-[15px] leading-[1.45] text-[var(--sheet-text)]">
            {portfolio.bio ?? <span className="text-[var(--sheet-soft)]">Add a short bio when you set up.</span>}
          </p>
        </div>
        <div className="flex shrink-0 gap-[8px] text-[var(--sheet-soft)]">
          {[Github, Globe, Mail].map((Icon, index) => (
            <span key={index} className="grid h-[36px] w-[36px] place-items-center rounded-full border border-[var(--sheet-line-strong)]">
              <Icon className="h-[16px] w-[16px]" />
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-[22px] border-t border-[var(--sheet-line)] pt-[18px] text-[14px] text-[var(--sheet-soft)]">
        {portfolio.location && (
          <span className="flex min-w-0 items-center gap-[7px]"><MapPin className="h-[15px] w-[15px] shrink-0" /><span className="truncate">{portfolio.location}</span></span>
        )}
        {portfolio.company && (
          <span className="flex min-w-0 items-center gap-[7px]"><Building2 className="h-[15px] w-[15px] shrink-0" /><span className="truncate">{portfolio.company}</span></span>
        )}
        <span className="flex shrink-0 items-center gap-[7px]"><Users className="h-[15px] w-[15px]" />{compactNumber.format(portfolio.followers)} followers</span>
      </div>
    </div>
  );
}

export function ProjectsSheet({ portfolio }: SheetProps) {
  return (
    <div className="flex h-full flex-col gap-[14px] p-[28px]">
      <SheetLabel>Projects</SheetLabel>
      {portfolio.projects.length === 0 ? (
        <EmptySlot>Import a repository to add your first project</EmptySlot>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-[14px]">
          {portfolio.projects.map((project) => {
            const color = (project.language && languageColors[project.language]) || "#6b7280";
            return (
              <div key={project.name} className="flex min-w-0 flex-col">
                <div
                  className="lp-display relative h-[92px] overflow-hidden rounded-[12px] border border-[var(--sheet-line)]"
                  style={{ background: `linear-gradient(140deg, color-mix(in srgb, ${color} 62%, #0e1016), #151823 78%)` }}
                >
                  <span className="absolute -bottom-[26px] right-[8px] text-[96px] font-semibold leading-none text-white/15">
                    {project.name[0].toUpperCase()}
                  </span>
                </div>
                <p className="mt-[10px] truncate text-[15px] font-semibold">{project.name}</p>
                <p className="mt-[3px] line-clamp-2 text-[12.5px] leading-[1.4] text-[var(--sheet-soft)]">
                  {project.description ?? "Describe it when you import it."}
                </p>
                <p className="mt-auto flex items-center gap-[12px] pt-[8px] text-[12px] text-[var(--sheet-soft)]">
                  {project.language && (
                    <span className="flex min-w-0 items-center gap-[6px]">
                      <span className="h-[8px] w-[8px] shrink-0 rounded-full" style={{ background: color }} />
                      <span className="truncate">{project.language}</span>
                    </span>
                  )}
                  <span className="flex shrink-0 items-center gap-[4px]"><Star className="h-[12px] w-[12px]" />{compactNumber.format(project.stars)}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ActivitySheet({ portfolio }: SheetProps) {
  return (
    <div className="flex h-full flex-col justify-between p-[28px]">
      <div className="flex items-end justify-between gap-[16px]">
        {portfolio.isSample ? (
          <p className="text-[15px] text-[var(--sheet-soft)]">
            <span className="lp-display mr-[10px] text-[44px] font-semibold leading-none tracking-[-0.03em] text-[var(--sheet-text)]">1,284</span>
            contributions in the last year
          </p>
        ) : (
          <p className="lp-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em]">Your contribution calendar</p>
        )}
        <p className="shrink-0 pb-[4px] text-[13px] text-[var(--sheet-soft)]">
          {portfolio.isSample ? "GitHub activity" : "Connects when you sign in"}
        </p>
      </div>
      <div>
        <div className="grid grid-flow-col grid-rows-7 gap-[2.6px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
          {sampleCalendar.map((level, cell) => (
            <span key={cell} className="lp-cell aspect-square rounded-[2px]" data-level={level} />
          ))}
        </div>
        <div className="mt-[10px] flex justify-between text-[12px] text-[var(--sheet-soft)]">
          {months.map((month) => <span key={month}>{month}</span>)}
        </div>
      </div>
    </div>
  );
}

const sampleExperience = [
  { title: "Senior engineer", place: "Harbor Labs", years: "2023 to now" },
  { title: "Software engineer", place: "Northwind Freight", years: "2020 to 2023" },
];

function HistoryRow({ title, place, years }: { title: string; place: string; years: string }) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="lp-display grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[11px] border border-[var(--sheet-line-strong)] text-[16px] font-semibold">
        {place[0]}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold">{title}</p>
        <p className="truncate text-[13px] text-[var(--sheet-soft)]">{place}, {years}</p>
      </div>
    </div>
  );
}

export function ExperienceSheet({ portfolio }: SheetProps) {
  return (
    <div className="grid h-full grid-cols-[1.15fr_1fr] gap-[28px] p-[28px]">
      <div className="flex flex-col gap-[16px]">
        <SheetLabel>Experience</SheetLabel>
        {portfolio.isSample ? (
          sampleExperience.map((role) => <HistoryRow key={role.place} {...role} />)
        ) : (
          <>
            <EmptySlot>Add your current role</EmptySlot>
            <EmptySlot>Add where you worked before</EmptySlot>
          </>
        )}
      </div>
      <div className="flex flex-col gap-[16px] border-l border-[var(--sheet-line)] pl-[28px]">
        <SheetLabel>Education</SheetLabel>
        {portfolio.isSample ? (
          <HistoryRow title="BSc Computer Science" place="University of Porto" years="2016 to 2020" />
        ) : (
          <EmptySlot>Add where you studied</EmptySlot>
        )}
      </div>
    </div>
  );
}

const sampleCertificates = [
  { title: "Solutions Architect", issuer: "Amazon Web Services" },
  { title: "Kubernetes Administrator", issuer: "Linux Foundation" },
];

export function SkillsSheet({ portfolio }: SheetProps) {
  return (
    <div className="grid h-full grid-cols-[1.15fr_1fr] gap-[28px] p-[28px]">
      <div className="flex min-h-0 flex-col gap-[16px]">
        <SheetLabel>Skills</SheetLabel>
        {portfolio.skills.length === 0 ? (
          <EmptySlot>Pick your skills during setup</EmptySlot>
        ) : (
          <div className="flex flex-wrap content-start gap-[8px] overflow-hidden">
            {portfolio.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-[var(--sheet-line-strong)] px-[13px] py-[6px] text-[14px]">{skill}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[16px] border-l border-[var(--sheet-line)] pl-[28px]">
        <SheetLabel>Certificates</SheetLabel>
        {portfolio.isSample ? (
          sampleCertificates.map((certificate) => (
            <div key={certificate.title} className="flex items-center gap-[12px]">
              <span className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[11px] bg-[var(--sheet-raised)] text-[var(--blue-soft)]">
                <FileText className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">{certificate.title}</p>
                <p className="truncate text-[13px] text-[var(--sheet-soft)]">{certificate.issuer}</p>
              </div>
            </div>
          ))
        ) : (
          <EmptySlot>Upload a certificate PDF</EmptySlot>
        )}
      </div>
    </div>
  );
}
