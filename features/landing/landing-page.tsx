import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  FileAudio,
  FileText,
  Globe2,
  Languages,
  MessageSquareText,
  PlayCircle,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Accurate transcripts",
    description: "Convert audio and video into clean, timestamped text that is easy to scan and reuse.",
  },
  {
    icon: Languages,
    title: "Translation",
    description: "Turn one transcript into multiple languages for study, publishing, or team sharing.",
  },
  {
    icon: Bot,
    title: "AI chat",
    description: "Ask natural questions about the content and get answers based on the transcript.",
  },
  {
    icon: Download,
    title: "Smart exports",
    description: "Save transcripts, summaries, key points, and notes as useful document formats.",
  },
];

const steps = [
  "Paste a video URL or upload media",
  "Let AI create the transcript",
  "Choose summary, translation, chat, or export",
  "Save the result in your workspace",
];

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-sage/70 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-fern text-paper shadow-soft">
              <FileAudio size={21} />
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">STT Engine</span>
              <span className="block text-xs font-medium text-muted">Speech into knowledge</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 text-sm font-medium text-muted md:flex">
            <a className="rounded-md px-3 py-2 hover:bg-mint hover:text-ink" href="#about">
              About
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-mint hover:text-ink" href="#features">
              Features
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-mint hover:text-ink" href="#how-it-works">
              How it works
            </a>
          </nav>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-md bg-fern px-4 py-2.5 text-sm font-semibold text-paper shadow-soft transition hover:bg-[#285f3c]"
          >
            Get Started
            <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-md border border-sage bg-mint px-3 py-2 text-sm font-semibold text-fern">
            <Sparkles size={16} />
            AI-powered speech understanding
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            Turn any spoken content into searchable notes, summaries, and answers.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            STT Engine helps you understand long videos, lectures, podcasts, interviews, and meetings
            faster. Paste a video URL, generate a transcript, summarize the content, translate it,
            ask questions, and export the results.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-md bg-fern px-5 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-[#285f3c]"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-md border border-sage bg-paper px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mint"
            >
              <PlayCircle size={18} />
              See How It Works
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-sage/80 bg-paper/90 p-4 shadow-soft sm:p-5">
          <div className="rounded-lg border border-sage/70 bg-[#fbfaf5] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-moss">Preview Workspace</p>
                <h2 className="text-xl font-semibold text-ink">Analyze a video</h2>
              </div>
              <div className="grid size-10 place-items-center rounded-lg bg-mint text-fern">
                <MessageSquareText size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="max-w-[86%] rounded-lg bg-mint p-4 text-sm leading-6 text-ink">
                Paste a video link and I will prepare transcript, summary, translation, and chat options.
              </div>
              <div className="ml-auto max-w-[90%] rounded-lg bg-fern p-4 text-sm leading-6 text-paper">
                https://example.com/product-demo-video
              </div>
              <div className="rounded-lg border border-sage bg-paper p-4">
                <p className="text-sm font-semibold text-ink">Ready to process</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {["Transcript", "Summary", "Translate", "Ask AI"].map((item) => (
                    <span key={item} className="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-fern">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-sage/70 bg-paper/70">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">About</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Built for turning speech into useful knowledge.</h2>
          </div>
          <p className="text-base leading-8 text-muted">
            STT Engine is a personal AI productivity tool for working with spoken content. It brings
            transcription, search, summaries, translation, and AI chat into one calm workspace so you
            can move from raw media to clear understanding without jumping between different tools.
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Features</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Everything after transcription matters too.</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted">
            The transcript is only the start. STT Engine helps you search, understand, transform, and save it.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-sage/80 bg-paper/90 p-5 shadow-soft">
              <div className="mb-4 grid size-10 place-items-center rounded-lg bg-mint text-fern">
                <feature.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
        <div className="rounded-lg border border-sage/80 bg-ink p-5 text-paper shadow-soft sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sage">How It Works</p>
              <h2 className="mt-3 text-3xl font-semibold">From video link to organized output.</h2>
            </div>
            <Globe2 className="text-sage" size={28} />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-lg border border-sage/30 bg-paper/10 p-4">
                <div className="mb-4 grid size-8 place-items-center rounded-md bg-sage text-ink">
                  <CheckCircle2 size={17} />
                </div>
                <p className="text-xs font-semibold text-sage">Step {index + 1}</p>
                <p className="mt-2 font-semibold text-paper">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
