import React from "react";
import {
  CheckCircle2,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Search,
  Filter,
  ChevronRight,
} from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type BadgeTone = "mint" | "peach" | "blue" | "pink" | "yellow" | "neutral";

type ButtonProps = {
  variant?: ButtonVariant;
  children: React.ReactNode;
};

type BadgeProps = {
  tone?: BadgeTone;
  children: React.ReactNode;
};

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

type StatCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  note: string;
};

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

const colors = [
  { name: "Navy", hex: "#00476B", use: "Primary action / admin nav" },
  { name: "Mint", hex: "#A8EBBC", use: "Completion / success" },
  { name: "Peach", hex: "#FBBD80", use: "Warm CTA / feeding topic" },
  { name: "Blue", hex: "#80D2E4", use: "Info / screen-time topic" },
  { name: "Pink", hex: "#F2BBD6", use: "Care / sleep topic" },
  { name: "Yellow", hex: "#EFE98F", use: "In-progress / attention" },
];

function Button({ variant = "primary", children }: ButtonProps) {
  const base = "px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm";
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-[#00476B] text-white",
    secondary: "bg-[#FBBD80] text-[#003552]",
    outline: "border border-[#00476B] text-[#00476B] bg-white",
    ghost: "text-[#00476B] bg-[#F5F4F2]",
  };

  return <button className={`${base} ${styles[variant]}`}>{children}</button>;
}

function Badge({ children, tone = "mint" }: BadgeProps) {
  const tones: Record<BadgeTone, string> = {
    mint: "bg-[#E0F8EB] text-[#00476B]",
    peach: "bg-[#FDE8CE] text-[#00476B]",
    blue: "bg-[#D5F1F8] text-[#00476B]",
    pink: "bg-[#FCE8F1] text-[#00476B]",
    yellow: "bg-[#F9F7D3] text-[#00476B]",
    neutral: "bg-[#EFEDE9] text-[#57534E]",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Card({ children, className = "" }: CardProps) {
  return <div className={`rounded-2xl border border-[#E8E5E0] bg-white shadow-sm ${className}`}>{children}</div>;
}

function StatCard({ icon: Icon, label, value, note }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#78716C]">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#00476B]">{value}</p>
          <p className="mt-1 text-sm text-[#78716C]">{note}</p>
        </div>
        <div className="rounded-2xl bg-[#E0F8EB] p-3 text-[#00476B]">
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ value = 68 }: { value?: number }) {
  return (
    <div className="h-3 w-full rounded-full bg-[#EFEDE9]">
      <div className="h-3 rounded-full bg-[#00476B]" style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionTitle({ eyebrow, title, children }: SectionTitleProps) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FBBD80]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold text-[#1C1917]">{title}</h2>
      {children ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57534E]">{children}</p> : null}
    </div>
  );
}

const participantRows: Array<[string, string, string, BadgeTone]> = [
  ["Maya Chen", "Active", "72%", "mint"],
  ["Jordan Lee", "In Progress", "48%", "yellow"],
  ["Avery Smith", "Completed", "100%", "blue"],
];

export default function ThrivesUILibraryPortfolioPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] p-8 font-sans text-[#292524]">
      <main className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-white shadow-xl">
        <section className="relative overflow-hidden bg-[#00476B] px-10 py-10 text-white">
          <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#80D2E4]/30" />
          <div className="absolute bottom-[-90px] right-[160px] h-56 w-56 rounded-full bg-[#FBBD80]/30" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <Badge tone="blue">THRIVES Design System</Badge>
              <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight">
                UI Design Library for a Dual-Sided Learning Platform
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
                A reusable component system supporting two connected experiences: a warm, low-friction caregiver learning flow and a structured researcher/admin management dashboard.
              </p>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/15 p-4">
                  <p className="text-white/70">Users</p>
                  <p className="mt-1 font-bold">Caregivers + Researchers</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4">
                  <p className="text-white/70">Platform</p>
                  <p className="mt-1 font-bold">Learning + Data Tracking</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4">
                  <p className="text-white/70">Tone</p>
                  <p className="mt-1 font-bold">Calm, Clear, Supportive</p>
                </div>
                <div className="rounded-2xl bg-white/15 p-4">
                  <p className="text-white/70">System Goal</p>
                  <p className="mt-1 font-bold">Reusable + Scalable</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 px-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionTitle eyebrow="01 / Foundations" title="Visual language">
              Soft health-education colors are paired with strong navy actions, rounded cards, and clear information hierarchy to work across both participant and admin experiences.
            </SectionTitle>

            <div className="grid gap-3">
              <Card className="p-5">
                <p className="text-sm font-bold text-[#1C1917]">Typography</p>
                <div className="mt-4 space-y-2">
                  <p className="text-3xl font-black text-[#00476B]">Page Title / 32–48 Bold</p>
                  <p className="text-xl font-bold text-[#292524]">Section Title / 20–24 Semibold</p>
                  <p className="text-sm leading-6 text-[#57534E]">
                    Body text uses a simple, readable sans-serif style for instructions, descriptions, and learning content.
                  </p>
                </div>
              </Card>

              <Card className="p-5">
                <p className="text-sm font-bold text-[#1C1917]">Shape + elevation</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg border border-[#E8E5E0] bg-[#FAFAF9]" />
                  <div className="h-16 w-16 rounded-2xl border border-[#E8E5E0] bg-[#FAFAF9] shadow-sm" />
                  <div className="h-16 w-16 rounded-[24px] border border-[#E8E5E0] bg-[#FAFAF9] shadow-md" />
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-6">
            <p className="mb-5 text-sm font-bold text-[#1C1917]">Color tokens</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {colors.map((color) => (
                <div key={color.name} className="overflow-hidden rounded-2xl border border-[#E8E5E0]">
                  <div className="h-24" style={{ background: color.hex }} />
                  <div className="bg-white p-4">
                    <p className="font-bold text-[#292524]">{color.name}</p>
                    <p className="mt-1 font-mono text-xs text-[#78716C]">{color.hex}</p>
                    <p className="mt-2 text-xs leading-5 text-[#57534E]">{color.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="bg-[#FAFAF9] px-10 py-10">
          <SectionTitle eyebrow="02 / Components" title="Reusable UI components">
            Shared components create consistency, while variants allow the admin side to feel structured and the participant side to feel more guided and friendly.
          </SectionTitle>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#00476B]">Buttons</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#57534E]">
                Primary actions use navy for confidence. Participant CTAs can use peach to feel warmer and less administrative.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#00476B]">Badges</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="mint">Completed</Badge>
                <Badge tone="yellow">In Progress</Badge>
                <Badge tone="peach">Infant Feeding</Badge>
                <Badge tone="blue">Screen Time</Badge>
                <Badge tone="pink">Sleep</Badge>
                <Badge tone="neutral">Locked</Badge>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#57534E]">
                Badges make module topic, status, and participant progress easier to scan without relying on color alone.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-[#00476B]">Form fields</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#57534E]">Module title</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-[#D4D0CA] px-3 py-2 text-sm outline-none focus:border-[#00476B]"
                    value="Infant Feeding Basics"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#57534E]">Topic category</label>
                  <div className="mt-1 flex items-center justify-between rounded-xl border border-[#D4D0CA] px-3 py-2 text-sm text-[#57534E]">
                    Feeding <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="px-10 py-10">
          <SectionTitle eyebrow="03 / Product Patterns" title="Patterns across two user groups">
            The same system supports different mental models: participants need clear next steps; researchers need fast scanning, filters, and progress visibility.
          </SectionTitle>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="overflow-hidden">
              <div className="border-b border-[#E8E5E0] bg-[#FDE8CE] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#00476B]">Participant pattern</p>
                    <h3 className="mt-1 text-xl font-bold text-[#003552]">Module learning card</h3>
                  </div>
                  <BookOpen className="text-[#00476B]" />
                </div>
              </div>

              <div className="p-6">
                <div className="rounded-3xl border border-[#E8E5E0] bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge tone="peach">Infant Feeding</Badge>
                      <h4 className="mt-4 text-xl font-bold text-[#1C1917]">Responsive Feeding Basics</h4>
                      <p className="mt-2 text-sm leading-6 text-[#57534E]">
                        Learn how to recognize hunger cues and build a supportive feeding routine.
                      </p>
                    </div>
                    <CheckCircle2 className="text-[#A8EBBC]" size={28} />
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-xs font-semibold text-[#57534E]">
                      <span>Progress</span>
                      <span>3 of 5 lessons</span>
                    </div>
                    <ProgressBar value={60} />
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button>Continue Module</Button>
                    <Button variant="outline">View Lessons</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-[#E8E5E0] bg-[#E0F8EB] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#00476B]">Admin pattern</p>
                    <h3 className="mt-1 text-xl font-bold text-[#003552]">Researcher dashboard + participant tracking</h3>
                  </div>
                  <LayoutDashboard className="text-[#00476B]" />
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard icon={Users} label="Participants" value="128" note="84 active" />
                  <StatCard icon={BookOpen} label="Modules" value="12" note="5 published" />
                  <StatCard icon={BarChart3} label="Completion" value="72%" note="Program avg." />
                </div>

                <div className="mt-5 rounded-2xl border border-[#E8E5E0] bg-white">
                  <div className="flex items-center justify-between border-b border-[#E8E5E0] p-4">
                    <div className="flex items-center gap-2 rounded-xl bg-[#F5F4F2] px-3 py-2 text-sm text-[#78716C]">
                      <Search size={16} /> Search participants
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-[#D4D0CA] px-3 py-2 text-sm font-semibold text-[#00476B]">
                      <Filter size={16} /> Filter
                    </div>
                  </div>

                  <div className="divide-y divide-[#E8E5E0]">
                    {participantRows.map(([name, status, progress, tone]) => (
                      <div key={name} className="grid grid-cols-[1.2fr_1fr_0.8fr_auto] items-center gap-4 px-4 py-3 text-sm">
                        <div className="font-semibold text-[#292524]">{name}</div>
                        <Badge tone={tone}>{status}</Badge>
                        <div className="font-semibold text-[#00476B]">{progress}</div>
                        <button className="text-[#00476B]" aria-label={`View ${name}`}>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="bg-[#00476B] px-10 py-10 text-white">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FBBD80]">04 / System Logic</p>
            <h2 className="mt-2 text-2xl font-bold">One shared library, two product experiences</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Components are shared at the system level, but examples and usage rules are separated by user context.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {[
              ["Foundations", "Color, type, radius, spacing, elevation"],
              ["Core Components", "Buttons, cards, badges, forms, progress"],
              ["Participant Patterns", "Modules, lessons, quiz states, progress summaries"],
              ["Admin Patterns", "Metrics, tables, filters, participant tracking"],
            ].map(([title, body], i) => (
              <div key={title} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#FBBD80] font-bold text-[#003552]">
                  {i + 1}
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 px-10 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FBBD80]">Portfolio takeaway</p>
            <h2 className="mt-2 text-3xl font-black text-[#1C1917]">From reusable UI to scalable product structure</h2>
          </div>
          <Card className="p-6">
            <p className="text-lg leading-8 text-[#292524]">
              I extracted repeated UI patterns from both the caregiver-facing learning flow and the researcher-facing management dashboard, then organized them into a lightweight design library. This unified the visual language across two user groups while supporting different goals: low-friction learning for participants and structured data management for researchers.
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}
