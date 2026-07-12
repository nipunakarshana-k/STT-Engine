"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Download,
  FileText,
  Languages,
  Link2,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
} from "lucide-react";

const options = [
  {
    icon: FileText,
    title: "Generate transcript",
    description: "Create a timestamped transcript from the video audio.",
  },
  {
    icon: Sparkles,
    title: "Summarize video",
    description: "Get short, medium, or detailed summaries.",
  },
  {
    icon: Languages,
    title: "Translate transcript",
    description: "Translate into English, Sinhala, Tamil, and more.",
  },
  {
    icon: MessageSquareText,
    title: "Ask questions",
    description: "Chat with the video and find key facts fast.",
  },
  {
    icon: Download,
    title: "Export results",
    description: "Prepare PDF, DOCX, TXT, SRT, or VTT output.",
  },
];

const mockTranscript = [
  {
    time: "00:00:08",
    text: "Today we are looking at how spoken content can become searchable notes and useful summaries.",
  },
  {
    time: "00:00:42",
    text: "The main benefit is speed. Instead of watching a full video again, users can ask questions and jump to the important parts.",
  },
  {
    time: "00:01:19",
    text: "A good workflow combines transcription, translation, key points, and export in one place.",
  },
];

const translations = ["English", "Sinhala", "Tamil", "French", "German", "Spanish"];

type ActiveOption = "Generate transcript" | "Summarize video" | "Translate transcript" | "Ask questions" | "Export results";

export function ChatWorkspace() {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [activeOption, setActiveOption] = useState<ActiveOption | "">("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      return;
    }

    setSubmittedUrl(cleanUrl);
    setActiveOption("");
    setUrl("");
  }

  return (
    <main className="min-h-screen px-5 py-5 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col rounded-lg border border-sage/80 bg-paper/90 shadow-soft">
        <header className="flex flex-col gap-4 border-b border-sage/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-fern text-paper">
              <Bot size={21} />
            </div>
            <div>
              <p className="font-semibold text-ink">STT Engine Assistant</p>
              <p className="text-sm text-muted">Paste a video URL to begin</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-sage bg-paper px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint"
          >
            <ArrowLeft size={16} />
            Landing
          </Link>
        </header>

        <section className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <div className="flex gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint text-fern">
              <Bot size={18} />
            </div>
            <div className="max-w-2xl rounded-lg bg-mint p-4 text-sm leading-6 text-ink">
              Hey, paste a video URL here. I will inspect it and show the actions you can run next:
              transcript, summary, translation, AI chat, and export.
            </div>
          </div>

          {submittedUrl ? (
            <>
              <div className="flex justify-end">
                <div className="max-w-2xl break-all rounded-lg bg-fern p-4 text-sm leading-6 text-paper">
                  {submittedUrl}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                  <Bot size={18} />
                </div>
                <div className="w-full max-w-3xl rounded-lg border border-sage bg-[#fbfaf5] p-4">
                  <p className="font-semibold text-ink">Video received. Choose what you want to do next.</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    These are prototype actions for now. Next we can connect real video processing and AI services.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {options.map((option) => {
                      const Icon = option.icon;

                      return (
                        <button
                          key={option.title}
                          onClick={() => setActiveOption(option.title as ActiveOption)}
                          className="flex min-h-28 items-start gap-3 rounded-lg border border-sage bg-paper p-4 text-left transition hover:bg-mint"
                          type="button"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mint text-fern">
                            <Icon size={18} />
                          </span>
                          <span>
                            <span className="block font-semibold text-ink">{option.title}</span>
                            <span className="mt-1 block text-sm leading-6 text-muted">{option.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {activeOption ? (
                <div className="flex gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                    <Bot size={18} />
                  </div>
                  <div className="w-full max-w-3xl rounded-lg border border-sage bg-paper p-4">
                    <MockResult activeOption={activeOption} />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </section>

        <form onSubmit={handleSubmit} className="border-t border-sage/70 p-4">
          <div className="flex flex-col gap-3 rounded-lg border border-sage bg-[#fbfaf5] p-3 sm:flex-row sm:items-center">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-mint text-fern">
              <Link2 size={18} />
            </div>
            <input
              aria-label="Video URL"
              className="min-h-11 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Paste video URL here..."
              type="url"
              value={url}
            />
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fern px-4 text-sm font-semibold text-paper transition hover:bg-[#285f3c]"
              type="submit"
            >
              Send
              <Send size={17} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function MockResult({ activeOption }: { activeOption: ActiveOption }) {
  if (activeOption === "Generate transcript") {
    return (
      <div>
        <ResultHeader title="Transcript preview" description="Frontend mock output for a timestamped transcript." />
        <div className="mt-4 space-y-3">
          {mockTranscript.map((segment) => (
            <div key={segment.time} className="rounded-lg border border-sage bg-[#fbfaf5] p-4">
              <p className="text-xs font-semibold text-fern">{segment.time}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{segment.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeOption === "Summarize video") {
    return (
      <div>
        <ResultHeader title="Summary preview" description="A clean summary layout for the future AI output." />
        <div className="mt-4 grid gap-3">
          {["Short", "Medium", "Detailed"].map((level) => (
            <div key={level} className="rounded-lg border border-sage bg-[#fbfaf5] p-4">
              <p className="font-semibold text-ink">{level} summary</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                This video explains how speech can be converted into organized knowledge using transcript,
                search, summary, translation, and chat tools.
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeOption === "Translate transcript") {
    return (
      <div>
        <ResultHeader title="Translation preview" description="Language choices are ready in the frontend." />
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {translations.map((language) => (
            <button
              key={language}
              className="inline-flex items-center gap-2 rounded-md border border-sage bg-[#fbfaf5] px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint"
              type="button"
            >
              <Languages size={16} />
              {language}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeOption === "Ask questions") {
    return (
      <div>
        <ResultHeader title="Ask AI preview" description="Question suggestions for transcript chat." />
        <div className="mt-4 space-y-2">
          {[
            "What is this video about?",
            "What are the key takeaways?",
            "Explain the most important section.",
            "Find action items mentioned in the video.",
          ].map((question) => (
            <button
              key={question}
              className="flex w-full items-center gap-2 rounded-md border border-sage bg-[#fbfaf5] px-3 py-2 text-left text-sm font-semibold text-ink transition hover:bg-mint"
              type="button"
            >
              <Search size={16} />
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ResultHeader title="Export preview" description="Frontend export actions for generated content." />
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {["PDF", "DOCX", "TXT", "SRT", "VTT"].map((format) => (
          <button
            key={format}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-sage bg-[#fbfaf5] px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint"
            type="button"
          >
            <Download size={16} />
            {format}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-mint text-fern">
        <CheckCircle2 size={17} />
      </div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
    </div>
  );
}
