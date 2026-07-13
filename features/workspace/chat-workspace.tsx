"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useRef } from "react";
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
  UploadCloud,
  Plus,
  Trash2,
  LogOut,
  User,
  Loader2,
  Volume2,
  Video,
  FileAudio,
} from "lucide-react";

type ProjectStatus = "uploading" | "processing" | "ready" | "failed";

type SttProject = {
  id: string;
  userId: string;
  title: string;
  mediaFileName: string | null;
  sourceLanguage: string | null;
  durationSeconds: number | null;
  status: string;
  createdAt: string;
};

type TranscriptSegment = {
  id: string;
  time: string;
  text: string;
  startMs: number | null;
};

type Summary = {
  short: string;
  medium: string;
  detailed: string;
};

type KeyPoint = {
  id: string;
  category: string;
  text: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Translation = {
  language: string;
  text: string;
};

type FullProjectDetail = SttProject & {
  segments: TranscriptSegment[];
  summary: Summary | null;
  translations: Translation[];
  keyPoints: KeyPoint[];
  chatMessages: ChatMessage[];
};

const languages = ["English", "Sinhala", "Tamil", "French", "German", "Spanish", "Japanese", "Chinese"];

export function ChatWorkspace() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name?: string | null; email: string } | null>(null);
  const [projects, setProjects] = useState<SttProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<FullProjectDetail | null>(null);
  
  // Create project form
  const [newTitle, setNewTitle] = useState("");
  const [newLanguage, setNewLanguage] = useState("English");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search, Translate, Chat state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTranslationLang, setSelectedTranslationLang] = useState("French");
  const [translating, setTranslating] = useState(false);
  const [translationText, setTranslationText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tab views
  const [activeTab, setActiveTab] = useState<"transcript" | "summaries" | "keypoints" | "translate" | "chat">("transcript");
  const [summaryLevel, setSummaryLevel] = useState<"short" | "medium" | "detailed">("medium");

  // Media Playback element ref
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  // Check auth and load projects
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
        loadProjects();
      } catch (err) {
        router.push("/login");
      }
    }
    checkAuth();
  }, []);

  // Poll project status if it's processing
  useEffect(() => {
    let intervalId: any;
    if (projectDetail && (projectDetail.status === "processing" || projectDetail.status === "uploading")) {
      intervalId = setInterval(async () => {
        const res = await fetch(`/api/projects/${projectDetail.id}`);
        if (res.ok) {
          const updated = await res.json();
          setProjectDetail(updated);
          // If finished processing, reload projects list too
          if (updated.status === "ready" || updated.status === "failed") {
            loadProjects();
          }
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [projectDetail]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [projectDetail?.chatMessages, activeTab]);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const list = await res.json();
        setProjects(list);
      }
    } catch (err) {
      console.error("Load projects error:", err);
    }
  }

  async function handleSelectProject(id: string) {
    setSelectedProjectId(id);
    setTranslationText("");
    setSearchQuery("");
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const detail = await res.json();
        setProjectDetail(detail);
        
        // Auto select tab based on status
        if (detail.status === "ready") {
          setActiveTab("transcript");
        }
      }
    } catch (err) {
      console.error("Select project error:", err);
    }
  }

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, language: newLanguage }),
      });

      if (res.ok) {
        const created = await res.json();
        setProjects([created, ...projects]);
        setNewTitle("");
        setShowCreateModal(false);
        handleSelectProject(created.id);
      }
    } catch (err) {
      console.error("Create project error:", err);
    }
  }

  async function handleDeleteProject(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
          setProjectDetail(null);
        }
      }
    } catch (err) {
      console.error("Delete project error:", err);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  // Drag and Drop handlers
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  }

  async function uploadFile(file: File) {
    if (!selectedProjectId) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/projects/${selectedProjectId}/upload`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = async () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        setProjectDetail(data.project);
        
        // Trigger AI processing
        triggerProcessing(selectedProjectId);
      } else {
        alert("Upload failed. Please try again.");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert("Error occurred during file upload.");
    };

    xhr.send(formData);
  }

  async function triggerProcessing(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}/process`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setProjectDetail(data.project);
        loadProjects();
      }
    } catch (err) {
      console.error("AI processing trigger error:", err);
    }
  }

  // Seek audio/video to specific timestamp
  function seekTo(timeStr: string) {
    if (!mediaRef.current) return;
    const parts = timeStr.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    }
    mediaRef.current.currentTime = seconds;
    mediaRef.current.play().catch(() => {});
  }

  // Handle Translations
  async function handleTranslate() {
    if (!selectedProjectId || translating) return;
    setTranslating(true);
    setTranslationText("");
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedTranslationLang }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslationText(data.text);
      } else {
        setTranslationText("Translation failed. Please try again.");
      }
    } catch (err) {
      setTranslationText("Translation failed due to server connection.");
    } finally {
      setTranslating(false);
    }
  }

  // Handle Chat Submit
  async function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedProjectId || sendingChat) return;

    const userMsg = chatMessage.trim();
    setChatMessage("");
    setSendingChat(true);

    // Optimistically insert user message into view
    if (projectDetail) {
      const optimisticMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "user",
        text: userMsg,
      };
      setProjectDetail({
        ...projectDetail,
        chatMessages: [...projectDetail.chatMessages, optimisticMsg],
      });
    }

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const assistantReply = await res.json();
        // Load the actual detail to fetch the saved db ID and full history
        const refreshRes = await fetch(`/api/projects/${selectedProjectId}`);
        if (refreshRes.ok) {
          const detail = await refreshRes.json();
          setProjectDetail(detail);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setSendingChat(false);
    }
  }

  // Search Match Highlighter
  function highlightText(text: string, query: string) {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-sage/70 text-ink rounded px-0.5 font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 md:py-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-xl border border-sage/80 bg-paper/95 shadow-soft">
        
        {/* Left Sidebar - Projects list */}
        <aside className="hidden w-80 flex-col border-r border-sage/70 bg-canvas/30 md:flex">
          <div className="flex items-center justify-between border-b border-sage/70 p-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-fern text-paper">
                <FileAudio size={18} />
              </span>
              <span className="font-semibold text-ink text-sm">STT Engine</span>
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex size-8 items-center justify-center rounded-md bg-fern text-paper transition hover:bg-[#285f3c]"
              title="New Project"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* User Section */}
          {currentUser && (
            <div className="flex items-center justify-between bg-mint/40 border-b border-sage/50 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-sage text-fern">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink truncate">{currentUser.name || "User"}</p>
                  <p className="text-[10px] text-muted truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-muted hover:text-red-700 transition"
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {/* Projects Scroll list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <p className="text-[11px] font-semibold text-moss uppercase tracking-wider px-2 mb-2">Projects</p>
            {projects.length === 0 ? (
              <p className="text-xs text-muted px-2 py-4">No projects yet. Click the + icon above to start.</p>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProject(proj.id)}
                  className={`group flex items-center justify-between rounded-lg p-2.5 cursor-pointer border text-left transition ${
                    selectedProjectId === proj.id
                      ? "bg-mint border-sage/80"
                      : "border-transparent bg-transparent hover:bg-mint/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${selectedProjectId === proj.id ? "text-fern" : "text-ink"}`}>
                      {proj.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-block size-1.5 rounded-full ${
                        proj.status === "ready" ? "bg-fern" : proj.status === "processing" ? "bg-orange-500 animate-pulse" : "bg-red-500"
                      }`} />
                      <span className="text-[10px] text-muted capitalize truncate">{proj.status}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    className="text-muted hover:text-red-700 md:opacity-0 group-hover:opacity-100 transition px-1"
                    title="Delete Project"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right workspace area */}
        <section className="flex flex-1 flex-col overflow-hidden bg-paper">
          {/* Top Navbar */}
          <header className="flex h-14 items-center justify-between border-b border-sage/70 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="md:hidden grid size-8 place-items-center rounded-lg bg-fern text-paper">
                <ArrowLeft size={16} />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-ink">
                  {projectDetail ? projectDetail.title : "Workspace"}
                </h1>
                {projectDetail && (
                  <p className="text-[10px] text-muted">
                    Language: {projectDetail.sourceLanguage} {projectDetail.durationSeconds ? `• ${Math.round(projectDetail.durationSeconds)}s` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="md:hidden inline-flex items-center justify-center rounded-md bg-fern px-3 py-1.5 text-xs font-semibold text-paper"
              >
                New
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-md border border-sage bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-mint"
              >
                Home
              </Link>
            </div>
          </header>

          {/* Content panel */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
            {!projectDetail ? (
              // Empty State - Select or create project
              <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="grid size-14 place-items-center rounded-2xl bg-mint text-fern shadow-soft mb-4">
                  <Bot size={28} />
                </div>
                <h3 className="text-lg font-semibold text-ink">Select or create a project</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  Start extracting knowledge from your audio or video files. Click the button below to create a project, then upload your media to generate timestamps, summaries, and transcripts.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-fern px-4 py-2.5 text-sm font-semibold text-paper shadow-soft transition hover:bg-[#285f3c]"
                >
                  <Plus size={16} />
                  New Project
                </button>
              </div>
            ) : projectDetail.status === "uploading" ? (
              // Upload State
              <div className="flex h-full flex-col items-center justify-center max-w-lg mx-auto">
                <h3 className="text-lg font-semibold text-ink mb-1">Upload Media File</h3>
                <p className="text-xs text-muted mb-6 text-center">Upload an audio or video file (MP3, MP4, WAV, etc.) to start transcription.</p>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                    dragActive
                      ? "border-fern bg-mint/30"
                      : "border-sage/80 bg-canvas/10 hover:bg-mint/10"
                  } ${uploading ? "pointer-events-none opacity-50" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <UploadCloud size={40} className="text-fern mb-3" />
                  <p className="text-sm font-semibold text-ink">
                    {uploading ? "Uploading media file..." : "Drag & drop files here, or click to browse"}
                  </p>
                  <p className="text-xs text-muted mt-1.5">Supports WAV, MP3, MP4, M4A up to 100MB</p>
                </div>

                {uploading && (
                  <div className="w-full mt-6 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-moss">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-sage/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-fern rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : projectDetail.status === "processing" ? (
              // Processing State
              <div className="flex h-full flex-col items-center justify-center text-center max-w-sm mx-auto">
                <Loader2 size={36} className="text-fern animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-ink">AI Speech Extraction in Progress</h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">
                  We are converting speech to timestamped text, extracting main ideas, dates, and summarizing the details. This may take a minute depending on file size.
                </p>
                <div className="mt-6 flex flex-col gap-2 w-full">
                  {["1. Extracting speech patterns...", "2. Formatting transcript timestamps...", "3. Extrapolating summarization layers..."].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-left rounded-md border border-sage/40 bg-canvas/30 px-3 py-2 text-xs font-semibold text-moss">
                      <div className="size-2 bg-fern rounded-full animate-pulse" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Ready State
              <div className="flex flex-col h-full space-y-6">
                
                {/* Media Player Player Section */}
                {projectDetail.mediaFileName && (
                  <div className="rounded-xl border border-sage/75 bg-paper/95 p-4 shadow-soft">
                    <div className="flex items-center gap-2 mb-2">
                      {projectDetail.mediaFileName.toLowerCase().endsWith(".mp4") ? (
                        <Video size={16} className="text-fern" />
                      ) : (
                        <Volume2 size={16} className="text-fern" />
                      )}
                      <p className="text-xs font-semibold text-ink truncate">
                        Media Player: {projectDetail.mediaFileName}
                      </p>
                    </div>
                    
                    {projectDetail.mediaFileName.toLowerCase().endsWith(".mp4") ? (
                      <video
                        ref={mediaRef as any}
                        controls
                        src={`/uploads/${projectDetail.mediaFileName}`}
                        className="w-full max-h-64 bg-black rounded-lg outline-none"
                      />
                    ) : (
                      <audio
                        ref={mediaRef as any}
                        controls
                        src={`/uploads/${projectDetail.mediaFileName}`}
                        className="w-full outline-none"
                      />
                    )}
                  </div>
                )}

                {/* Main Tabs Navigation */}
                <div className="border-b border-sage/60">
                  <nav className="flex space-x-1.5 overflow-x-auto text-xs font-semibold">
                    {[
                      { id: "transcript", label: "Transcript", icon: FileText },
                      { id: "summaries", label: "Summaries", icon: Sparkles },
                      { id: "keypoints", label: "Key Points", icon: Bot },
                      { id: "translate", label: "Translation", icon: Languages },
                      { id: "chat", label: "Ask AI", icon: MessageSquareText },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 transition shrink-0 ${
                            activeTab === tab.id
                              ? "border-fern text-fern"
                              : "border-transparent text-muted hover:text-ink"
                          }`}
                        >
                          <Icon size={14} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab content viewer */}
                <div className="flex-1 min-h-0">
                  
                  {/* TRANSCRIPT VIEW */}
                  {activeTab === "transcript" && (
                    <div className="flex flex-col h-full space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                          <input
                            type="text"
                            placeholder="Search keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-sage bg-canvas/30 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-fern"
                          />
                        </div>

                        {/* Exports dropdown */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-muted">Export:</span>
                          {["txt", "srt", "vtt", "docx", "pdf"].map((fmt) => (
                            <a
                              key={fmt}
                              href={`/api/projects/${projectDetail.id}/export?format=${fmt}`}
                              download
                              className="rounded bg-mint hover:bg-sage/40 text-[10px] font-semibold text-fern px-2 py-1 uppercase"
                            >
                              {fmt}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {projectDetail.segments.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-muted text-center py-6">No matching transcript lines found.</p>
                        ) : (
                          projectDetail.segments
                            .filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((seg) => (
                              <div key={seg.id} className="flex gap-4 rounded-lg border border-sage/40 bg-canvas/10 p-3 hover:bg-canvas/30 transition">
                                <button
                                  onClick={() => seekTo(seg.time)}
                                  className="text-xs font-mono font-bold text-fern hover:underline shrink-0 bg-mint/50 px-2 py-0.5 rounded h-fit"
                                >
                                  {seg.time}
                                </button>
                                <p className="text-xs leading-relaxed text-ink flex-1">
                                  {highlightText(seg.text, searchQuery)}
                                </p>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUMMARIES VIEW */}
                  {activeTab === "summaries" && projectDetail.summary && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        {(["short", "medium", "detailed"] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => setSummaryLevel(level)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize border transition ${
                              summaryLevel === level
                                ? "bg-fern text-paper border-fern"
                                : "bg-paper text-ink border-sage hover:bg-mint/30"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-xl border border-sage/60 bg-canvas/10 p-5 leading-relaxed text-ink text-xs whitespace-pre-line shadow-inner">
                        {projectDetail.summary[summaryLevel] || "Summary details not available."}
                      </div>
                    </div>
                  )}

                  {/* KEY POINTS VIEW */}
                  {activeTab === "keypoints" && (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {[
                        { title: "Main Topics", key: "topics", color: "border-blue-200 bg-blue-50/50" },
                        { title: "Facts & Claims", key: "facts", color: "border-fern/30 bg-mint/20" },
                        { title: "Names & Techs", key: "names", color: "border-purple-200 bg-purple-50/50" },
                        { title: "Dates & Deadlines", key: "dates", color: "border-orange-200 bg-orange-50/50" },
                        { title: "Actions & Tasks", key: "actions", color: "border-green-200 bg-green-50/50" },
                        { title: "Important Quotes", key: "quotes", color: "border-yellow-200 bg-yellow-50/50" },
                      ].map((section) => {
                        const items = projectDetail.keyPoints.filter(kp => kp.category === section.key);
                        return (
                          <div key={section.key} className={`rounded-xl border p-4 shadow-sm flex flex-col ${section.color}`}>
                            <h4 className="text-xs font-bold text-ink mb-2.5 border-b border-black/5 pb-1">{section.title}</h4>
                            <div className="flex-1 overflow-y-auto max-h-48 text-[11px] space-y-1.5 pr-1">
                              {items.length === 0 ? (
                                <p className="text-muted italic">None extracted.</p>
                              ) : (
                                items.map((item) => (
                                  <div key={item.id} className="flex items-start gap-1.5">
                                    <span className="text-fern font-bold mt-0.5">•</span>
                                    <span className="text-ink leading-normal">{item.text}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TRANSLATIONS VIEW */}
                  {activeTab === "translate" && (
                    <div className="flex flex-col h-full space-y-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedTranslationLang}
                          onChange={(e) => setSelectedTranslationLang(e.target.value)}
                          className="rounded-lg border border-sage bg-paper px-3 py-1.5 text-xs outline-none"
                        >
                          {languages.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleTranslate}
                          disabled={translating}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-fern px-4 py-1.5 text-xs font-semibold text-paper hover:bg-[#285f3c] disabled:bg-sage"
                        >
                          {translating ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Translating...
                            </>
                          ) : (
                            <>
                              <Languages size={12} />
                              Translate
                            </>
                          )}
                        </button>
                      </div>

                      {/* Display Cached Translations */}
                      {translationText ? (
                        <div className="flex-1 overflow-y-auto rounded-xl border border-sage/60 bg-canvas/10 p-5 text-xs leading-relaxed text-ink shadow-inner">
                          <p className="font-semibold text-fern mb-3 border-b border-sage/40 pb-1">{selectedTranslationLang} Translation</p>
                          <p className="whitespace-pre-line">{translationText}</p>
                        </div>
                      ) : (
                        <div className="flex-1 border border-dashed border-sage/80 rounded-xl flex items-center justify-center p-6 text-center">
                          <p className="text-xs text-muted max-w-xs">
                            Select a target language above and click "Translate" to translate the transcript using AI.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI CHAT ASSISTANT VIEW */}
                  {activeTab === "chat" && (
                    <div className="flex flex-col h-full border border-sage/75 rounded-xl bg-canvas/10 overflow-hidden">
                      {/* Message History Panel */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] max-h-[380px]">
                        <div className="flex gap-2">
                          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                            <Bot size={15} />
                          </div>
                          <div className="max-w-[85%] rounded-xl bg-paper border border-sage/50 p-3 text-xs leading-relaxed text-ink shadow-sm">
                            Hello! I am your AI Knowledge Assistant. You can ask me questions about this media's transcript. Try asking for action items, key technologies, or a detailed breakdown!
                          </div>
                        </div>

                        {projectDetail.chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                          >
                            {msg.role === "assistant" && (
                              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                                <Bot size={15} />
                              </div>
                            )}
                            <div
                              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed shadow-sm ${
                                msg.role === "user"
                                  ? "bg-fern text-paper"
                                  : "bg-paper border border-sage/50 text-ink"
                              }`}
                            >
                              <p className="whitespace-pre-line">{msg.text}</p>
                            </div>
                          </div>
                        ))}

                        {sendingChat && (
                          <div className="flex gap-2">
                            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                              <Bot size={15} />
                            </div>
                            <div className="max-w-[85%] rounded-xl bg-paper border border-sage/50 p-3 text-xs text-muted flex items-center gap-1.5 shadow-sm">
                              <Loader2 size={12} className="animate-spin" />
                              Thinking...
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Message input Form */}
                      <form onSubmit={handleChatSubmit} className="border-t border-sage/60 p-3 bg-paper">
                        <div className="flex items-center gap-2 rounded-lg border border-sage bg-canvas/30 p-1.5 pr-2 pl-3">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Ask a question about the transcript..."
                            className="flex-1 bg-transparent text-xs text-ink outline-none"
                            disabled={sendingChat}
                          />
                          <button
                            type="submit"
                            disabled={sendingChat || !chatMessage.trim()}
                            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-fern text-paper hover:bg-[#285f3c] transition disabled:bg-sage/40"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>
        </section>

      </div>

      {/* CREATE PROJECT DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-sage bg-paper p-6 shadow-soft">
            <h3 className="text-base font-semibold text-ink">Create New Project</h3>
            <p className="text-xs text-muted mt-1">Setup a workspace for your next speech processing job.</p>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neural Networks Lecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full rounded-lg border border-sage bg-canvas/30 px-3 py-2 text-xs text-ink outline-none focus:border-fern"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Source Language</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="block w-full rounded-lg border border-sage bg-canvas/30 px-3 py-2 text-xs text-ink outline-none focus:border-fern"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-sage bg-paper px-4 py-2 text-ink hover:bg-mint/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-fern px-4 py-2 text-paper hover:bg-[#285f3c]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
