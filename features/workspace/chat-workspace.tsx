"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Download,
  FileText,
  Languages,
  Link2,
  MessageSquareText,
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

export function ChatWorkspace() {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      return;
    }

    setSubmittedUrl(cleanUrl);
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
                    {options.map((option) => (
                      <button
                        key={option.title}
                        className="flex min-h-28 items-start gap-3 rounded-lg border border-sage bg-paper p-4 text-left transition hover:bg-mint"
                        type="button"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mint text-fern">
                          <option.icon size={18} />
                        </span>
                        <span>
                          <span className="block font-semibold text-ink">{option.title}</span>
                          <span className="mt-1 block text-sm leading-6 text-muted">{option.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
