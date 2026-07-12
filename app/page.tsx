import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Download,
  FileAudio,
  FileText,
  Globe2,
  Languages,
  MessageSquareText,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { FeatureTile } from "@/components/feature-tile";
import { mockProjects, recentActivity, transcriptSegments } from "@/lib/mock-data";

const workflow = [
  "Upload media",
  "Generate transcript",
  "Translate and summarize",
  "Chat and export",
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-sage/70 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-fern text-paper shadow-soft">
              <FileAudio size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">STT Engine</p>
              <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Speech to knowledge workspace</h1>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <a className="rounded-md px-3 py-2 hover:bg-mint hover:text-ink" href="#projects">
              Projects
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-mint hover:text-ink" href="#transcript">
              Transcript
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-mint hover:text-ink" href="#roadmap">
              Roadmap
            </a>
          </nav>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex min-h-[520px] flex-col justify-between rounded-lg border border-sage/80 bg-paper/85 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-md border border-sage bg-mint px-3 py-2 text-sm font-medium text-fern">
                <Sparkles size={16} />
                AI knowledge extraction platform
              </div>

              <div className="max-w-3xl space-y-5">
                <h2 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                  Turn lectures, meetings, and videos into searchable knowledge.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                  Upload audio or video, generate accurate transcripts, translate content, extract key
                  points, chat with the recording, and export everything for study or work.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-md bg-fern px-4 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-[#285f3c]">
                  <UploadCloud size={18} />
                  New transcription
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-sage bg-paper px-4 py-3 text-sm font-semibold text-ink transition hover:bg-mint">
                  <Search size={18} />
                  Search projects
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {workflow.map((step, index) => (
                <div key={step} className="rounded-lg border border-sage/70 bg-[#fbfaf5] p-4">
                  <p className="text-xs font-semibold text-moss">0{index + 1}</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-lg border border-sage/80 bg-paper/90 p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-moss">Upload Queue</p>
                  <h3 className="text-xl font-semibold text-ink">Research interview.mp4</h3>
                </div>
                <div className="grid size-10 place-items-center rounded-lg bg-mint text-fern">
                  <UploadCloud size={20} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-mint">
                  <div className="h-full w-[72%] rounded-full bg-fern" />
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Processing speech segments</span>
                  <span className="font-semibold text-fern">72%</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard icon={FileText} label="Transcripts" value="24" note="8 this month" />
              <StatCard icon={Languages} label="Translations" value="11" note="Sinhala, Tamil, English" />
              <StatCard icon={MessageSquareText} label="AI chats" value="96" note="Saved with projects" />
              <StatCard icon={Download} label="Exports" value="18" note="PDF, DOCX, TXT" />
            </div>
          </aside>
        </section>

        <section id="projects" className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-lg border border-sage/80 bg-paper/90 p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-moss">Recent Activity</p>
                <h2 className="text-2xl font-semibold text-ink">Workspace flow</h2>
              </div>
              <Activity className="text-fern" size={22} />
            </div>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.title} className="flex gap-3 border-b border-sage/60 pb-4 last:border-0 last:pb-0">
                  <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-mint text-fern">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="text-sm leading-6 text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-sage/80 bg-paper/90 p-5 shadow-soft">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-moss">Projects</p>
                <h2 className="text-2xl font-semibold text-ink">Knowledge library</h2>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-sage bg-[#fbfaf5] px-3 py-2 text-sm text-muted">
                <Search size={16} />
                Search by keyword, speaker, topic
              </div>
            </div>

            <div className="grid gap-3">
              {mockProjects.map((project) => (
                <article
                  key={project.title}
                  className="grid gap-4 rounded-lg border border-sage/70 bg-[#fbfaf5] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-mint px-2.5 py-1 text-xs font-semibold text-fern">
                        {project.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Clock3 size={13} />
                        {project.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-ink">{project.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{project.summary}</p>
                  </div>
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-sage bg-paper px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint sm:w-auto">
                    Open
                    <ArrowRight size={16} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="transcript" className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-sage/80 bg-paper/90 p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-moss">Transcript Preview</p>
                <h2 className="text-2xl font-semibold text-ink">Timestamped transcript</h2>
              </div>
              <FileText className="text-fern" size={22} />
            </div>
            <div className="space-y-3">
              {transcriptSegments.map((segment) => (
                <div key={segment.time} className="rounded-lg border border-sage/70 bg-[#fbfaf5] p-4">
                  <p className="mb-2 text-xs font-semibold text-fern">{segment.time}</p>
                  <p className="text-sm leading-6 text-muted">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <FeatureTile
              icon={Globe2}
              title="Translate"
              description="Create English, Sinhala, Tamil, and global language versions from one transcript."
            />
            <FeatureTile
              icon={Bot}
              title="Ask the recording"
              description="Use AI chat to answer questions, explain sections, and extract important facts."
            />
            <FeatureTile
              icon={Download}
              title="Export documents"
              description="Save transcripts, summaries, and key points as PDF, DOCX, or TXT files."
            />
          </div>
        </section>

        <section id="roadmap" className="rounded-lg border border-sage/80 bg-ink p-5 text-paper shadow-soft sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sage">Build Roadmap</p>
              <h2 className="text-2xl font-semibold">From prototype to final-year submission</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-sage">
              Start with the product experience, then connect authentication, database, uploads,
              FastAPI speech processing, AI summaries, chat, and exports.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {["Foundation", "Upload + STT", "Summaries", "AI Chat", "Deployment"].map((phase, index) => (
              <div key={phase} className="rounded-lg border border-sage/30 bg-paper/10 p-4">
                <p className="text-xs font-semibold text-sage">Phase {index + 1}</p>
                <p className="mt-2 font-semibold text-paper">{phase}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
