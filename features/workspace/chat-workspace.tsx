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
  Paperclip,
  Menu,
  ChevronLeft,
  Settings,
} from "lucide-react";

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
  
  // Navigation / UI States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  
  // Client Gemini Key State
  const [geminiKey, setGeminiKey] = useState("");

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active option clicked in chat
  const [processingOption, setProcessingOption] = useState<"transcript" | "summary" | "translate" | "">("");
  const [processingState, setProcessingState] = useState<"idle" | "running" | "success" | "failed">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Inline Translation State
  const [selectedTranslationLang, setSelectedTranslationLang] = useState("Spanish");
  const [translating, setTranslating] = useState(false);
  const [translationText, setTranslationText] = useState("");

  // Chat message submit state
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Summary Toggle Level
  const [summaryLevel, setSummaryLevel] = useState<"short" | "medium" | "detailed">("medium");

  // Media Playback element ref
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  // Load Key from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("stt_gemini_key") || "");
    }
  }, []);

  function handleSaveKey(val: string) {
    setGeminiKey(val);
    localStorage.setItem("stt_gemini_key", val);
  }

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
    if (projectDetail && (projectDetail.status === "processing" || projectDetail.status === "uploading") && processingOption !== "") {
      intervalId = setInterval(async () => {
        const res = await fetch(`/api/projects/${projectDetail.id}`);
        if (res.ok) {
          const updated = await res.json();
          setProjectDetail(updated);
          if (updated.status === "ready") {
            setProcessingState("success");
            loadProjects();
          } else if (updated.status === "failed") {
            setProcessingState("failed");
            loadProjects();
          }
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [projectDetail, processingOption]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [projectDetail?.chatMessages, uploading, processingOption, processingState, translationText]);

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
    setProcessingOption("");
    setProcessingState("idle");
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const detail = await res.json();
        setProjectDetail(detail);
        if (detail.status === "ready") {
          setProcessingOption("transcript");
          setProcessingState("success");
        }
      }
    } catch (err) {
      console.error("Select project error:", err);
    }
  }

  async function createProjectAndGetId(title: string, sourceLang: string): Promise<string | null> {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, language: sourceLang }),
      });

      if (res.ok) {
        const created = await res.json();
        setProjects([created, ...projects]);
        setSelectedProjectId(created.id);
        return created.id;
      }
    } catch (err) {
      console.error("Create project error:", err);
    }
    return null;
  }

  async function handleDeleteProject(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat session?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
          setProjectDetail(null);
          setProcessingOption("");
          setProcessingState("idle");
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

  // Handle URL or message submission
  async function handleInputSubmit(e: FormEvent) {
    e.preventDefault();
    const inputVal = chatInput.trim();
    if (!inputVal) return;
    setChatInput("");

    // If no active project/chat, we assume this is a new video URL to start processing
    if (!selectedProjectId) {
      // Check if it's a URL
      const isUrl = inputVal.startsWith("http://") || inputVal.startsWith("https://");
      const title = isUrl ? `Video URL: ${inputVal.slice(0, 30)}...` : `Text Chat: ${inputVal.slice(0, 20)}...`;
      
      const newId = await createProjectAndGetId(title, "English");
      if (newId) {
        // Create optimistic project detail
        const initialDetail: FullProjectDetail = {
          id: newId,
          userId: currentUser?.email || "",
          title,
          mediaFileName: isUrl ? inputVal : null,
          sourceLanguage: "English",
          durationSeconds: null,
          status: "uploading", // Wait for option selection
          createdAt: new Date().toISOString(),
          segments: [],
          summary: null,
          translations: [],
          keyPoints: [],
          chatMessages: [
            { id: "1", role: "user", text: inputVal },
            { id: "2", role: "assistant", text: isUrl ? "I received your video URL! Please choose what you'd like to do with the video content below:" : "How can I help you with this project today?" }
          ]
        };
        setProjectDetail(initialDetail);
      }
    } else {
      // If project is already active and processed, send normal chat assistant query
      if (projectDetail && projectDetail.status === "ready") {
        sendChatToAssistant(inputVal);
      } else {
        // If project exists but is not processed, show warning
        alert("Please select a media processing option first!");
      }
    }
  }

  // File upload trigger
  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingFileName(file.name);
      
      // 1. Create a project first
      const title = `Upload: ${file.name}`;
      const newId = await createProjectAndGetId(title, "English");
      
      if (newId) {
        // Optimistic detail
        const initialDetail: FullProjectDetail = {
          id: newId,
          userId: currentUser?.email || "",
          title,
          mediaFileName: file.name,
          sourceLanguage: "English",
          durationSeconds: null,
          status: "uploading",
          createdAt: new Date().toISOString(),
          segments: [],
          summary: null,
          translations: [],
          keyPoints: [],
          chatMessages: [
            { id: "1", role: "user", text: `[Attached Media File: ${file.name}]` },
          ]
        };
        setProjectDetail(initialDetail);
        
        // 2. Perform the upload
        uploadFile(newId, file);
      }
    }
  }

  async function uploadFile(projectId: string, file: File) {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/projects/${projectId}/upload`, true);

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
        
        // Append Bot prompt to select options
        const updatedDetail: FullProjectDetail = {
          ...data.project,
          segments: [],
          summary: null,
          translations: [],
          keyPoints: [],
          chatMessages: [
            { id: "1", role: "user", text: `[Uploaded File: ${file.name}]` },
            { id: "2", role: "assistant", text: "Media file uploaded successfully! Please choose an option below to extract its contents:" }
          ]
        };
        setProjectDetail(updatedDetail);
        loadProjects();
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

  // Trigger processing based on selected option
  async function handleOptionSelect(option: "transcript" | "summary" | "translate") {
    if (!projectDetail) return;
    setProcessingOption(option);
    setProcessingState("running");
    setTranslationText("");

    // Call process API
    try {
      const res = await fetch(`/api/projects/${projectDetail.id}/process`, {
        method: "POST",
        headers: {
          "x-gemini-key": geminiKey,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const finalProject = data.project;
        setProjectDetail({
          ...projectDetail,
          ...finalProject,
          status: "ready"
        });
        setProcessingState("success");
        loadProjects();

        // If translate was chosen, fetch target language
        if (option === "translate") {
          handleTranslateLanguage("Spanish", finalProject.id);
        }
      } else {
        setProcessingState("failed");
      }
    } catch (err) {
      setProcessingState("failed");
    }
  }

  // Translate transcript in chat
  async function handleTranslateLanguage(lang: string, projId?: string) {
    const id = projId || selectedProjectId;
    if (!id) return;
    setTranslating(true);
    setTranslationText("");
    try {
      const res = await fetch(`/api/projects/${id}/translate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-key": geminiKey
        },
        body: JSON.stringify({ language: lang }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslationText(data.text);
      } else {
        setTranslationText("Translation failed.");
      }
    } catch (err) {
      setTranslationText("Server connection failed.");
    } finally {
      setTranslating(false);
    }
  }

  // Chat conversation
  async function sendChatToAssistant(message: string) {
    if (!selectedProjectId || sendingChat || !projectDetail) return;
    setSendingChat(true);

    // Optimistically insert user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: message,
    };
    const updatedMessages = [...projectDetail.chatMessages, userMsg];
    setProjectDetail({
      ...projectDetail,
      chatMessages: updatedMessages,
    });

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-key": geminiKey
        },
        body: JSON.stringify({ message }),
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
      console.error("Chat assistant error:", err);
    } finally {
      setSendingChat(false);
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

  // Search Match Highlighter
  function highlightText(text: string, query: string) {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-sage/75 text-ink rounded px-0.5 font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  }

  function startNewChat() {
    setSelectedProjectId(null);
    setProjectDetail(null);
    setProcessingOption("");
    setProcessingState("idle");
    setTranslationText("");
  }

  return (
    <main className="min-h-screen bg-canvas flex">
      {/* LEFT SIDEBAR - COLLAPSIBLE CHAT HISTORY */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-paper border-r border-sage/75 flex flex-col transform transition-transform duration-300 md:relative md:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sage/70 p-4">
          <span className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-fern text-paper">
              <FileAudio size={18} />
            </span>
            <span className="font-bold text-ink text-sm">STT Engine Chat</span>
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-muted hover:text-ink p-1"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* User Session Info */}
        {currentUser && (
          <div className="flex items-center justify-between bg-mint/30 border-b border-sage/50 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-sage text-fern">
                <User size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{currentUser.name || "Developer"}</p>
                <p className="text-[10px] text-muted truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted hover:text-red-700 p-1"
              title="Log Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {/* Gemini API Key input */}
        <div className="px-4 py-3 border-b border-sage/40 bg-canvas/10">
          <label className="block text-[10px] font-bold text-moss uppercase mb-1">
            Gemini API Key (Free Tier)
          </label>
          <input
            type="password"
            placeholder="Paste your AI Studio Key..."
            value={geminiKey}
            onChange={(e) => handleSaveKey(e.target.value)}
            className="w-full rounded border border-sage bg-paper px-2 py-1.5 text-[10px] text-ink outline-none placeholder-muted focus:border-fern"
          />
          <p className="text-[9px] text-muted mt-1 leading-normal">
            🔑 Stored locally in your browser. Get a free key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-fern underline font-bold">Google AI Studio</a>.
          </p>
        </div>

        <div className="p-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-sage bg-paper py-2.5 text-xs font-semibold text-ink hover:bg-mint/40 transition"
          >
            <Plus size={14} />
            New Chat Session
          </button>
        </div>

        {/* Chat History list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <p className="text-[10px] font-bold text-moss uppercase tracking-wider px-2 mb-2">History</p>
          {projects.length === 0 ? (
            <p className="text-xs text-muted px-2 py-4">No past sessions.</p>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelectProject(proj.id)}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer border text-left transition ${
                  selectedProjectId === proj.id
                    ? "bg-mint border-sage/60 text-fern"
                    : "border-transparent text-ink hover:bg-mint/20"
                }`}
              >
                <span className="text-xs truncate flex-1 font-semibold pr-2">{proj.title}</span>
                <button
                  onClick={(e) => handleDeleteProject(proj.id, e)}
                  className="text-muted hover:text-red-700 opacity-0 group-hover:opacity-100 transition p-0.5"
                  title="Delete Session"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <section className="flex-1 flex flex-col h-screen min-w-0 bg-[#F7F5EE]/30">
        {/* Top Navbar */}
        <header className="flex h-14 items-center justify-between border-b border-sage/70 bg-paper px-4">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-mint/30"
              >
                <Menu size={18} />
              </button>
            )}
            <h2 className="text-sm font-semibold text-ink">
              {projectDetail ? projectDetail.title : "New Chat Session"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-md border border-sage bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-mint/30"
            >
              Home
            </Link>
          </div>
        </header>

        {/* Chat Messages Panel */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {!projectDetail ? (
              // Welcome Screen (If no active chat)
              <div className="flex flex-col items-center justify-center text-center py-20 max-w-lg mx-auto">
                <div className="grid size-14 place-items-center rounded-2xl bg-mint text-fern shadow-soft mb-5">
                  <Bot size={30} />
                </div>
                <h2 className="text-2xl font-bold text-ink">STT Engine AI Assistant</h2>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  I can analyze video and audio files to extract structured knowledge. Paste a video URL (MP4/YouTube) in the input at the bottom or click the paperclip to upload a media file.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 w-full text-left">
                  <div className="border border-sage/70 rounded-xl p-4 bg-paper/80 shadow-sm">
                    <p className="text-xs font-bold text-fern">💡 Paste Video URLs</p>
                    <p className="text-[11px] text-muted mt-1">Paste any URL link to a video file and select translation or summaries.</p>
                  </div>
                  <div className="border border-sage/70 rounded-xl p-4 bg-paper/80 shadow-sm">
                    <p className="text-xs font-bold text-fern">📎 Local Uploads</p>
                    <p className="text-[11px] text-muted mt-1">Upload files (MP3, MP4, WAV) directly from your device securely.</p>
                  </div>
                </div>
              </div>
            ) : (
              // Chat Message History
              <>
                {projectDetail.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern shadow-sm">
                        <Bot size={16} />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-fern text-paper"
                          : "bg-paper border border-sage/60 text-ink"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {/* File uploading status bubble */}
                {uploading && (
                  <div className="flex gap-3.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[85%] w-80 rounded-2xl bg-paper border border-sage/60 p-4 shadow-sm space-y-2.5">
                      <p className="text-xs font-semibold text-ink">Uploading {uploadingFileName}...</p>
                      <div className="w-full h-2 bg-sage/35 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fern rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted text-right font-mono font-bold">{uploadProgress}%</p>
                    </div>
                  </div>
                )}

                {/* Bot option selectors after upload / url reception */}
                {projectDetail && !uploading && processingOption === "" && (
                  <div className="flex gap-3.5 animate-fade-in">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern shadow-sm">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[85%] w-full rounded-2xl bg-paper border border-sage/60 p-4 shadow-sm">
                      <p className="text-xs font-bold text-ink mb-1">Select Media Action</p>
                      <p className="text-xs text-muted mb-4">Choose what you want to extract from this video file:</p>
                      
                      <div className="grid gap-2 sm:grid-cols-3">
                        <button
                          onClick={() => handleOptionSelect("transcript")}
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-sage bg-paper p-3 text-center transition hover:bg-mint/40 hover:border-fern"
                        >
                          <FileText size={18} className="text-fern" />
                          <span className="text-[10px] font-bold text-ink">Full Transcript</span>
                        </button>
                        <button
                          onClick={() => handleOptionSelect("summary")}
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-sage bg-paper p-3 text-center transition hover:bg-mint/40 hover:border-fern"
                        >
                          <Sparkles size={18} className="text-fern" />
                          <span className="text-[10px] font-bold text-ink">Description Summary</span>
                        </button>
                        <button
                          onClick={() => handleOptionSelect("translate")}
                          className="flex flex-col items-center gap-1.5 rounded-xl border border-sage bg-paper p-3 text-center transition hover:bg-mint/40 hover:border-fern"
                        >
                          <Languages size={18} className="text-fern" />
                          <span className="text-[10px] font-bold text-ink">Translate Content</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing State */}
                {processingState === "running" && (
                  <div className="flex gap-3.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[85%] rounded-2xl bg-paper border border-sage/60 p-4 shadow-sm flex items-center gap-3 text-xs text-ink font-semibold">
                      <Loader2 size={16} className="animate-spin text-fern" />
                      <span>Reading video content and extracting data...</span>
                    </div>
                  </div>
                )}

                {/* Processing Result Display */}
                {processingState === "success" && processingOption !== "" && (
                  <div className="flex gap-3.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern shadow-sm">
                      <Bot size={16} />
                    </div>
                    
                    <div className="max-w-[85%] w-full rounded-2xl bg-paper border border-sage/60 p-4 shadow-sm space-y-4">
                      
                      {/* Media player for playback if present */}
                      {projectDetail.mediaFileName && (
                        <div className="rounded-lg border border-sage bg-canvas/30 p-2.5">
                          <p className="text-[10px] font-bold text-moss truncate mb-1">
                            Media File: {projectDetail.mediaFileName}
                          </p>
                          {projectDetail.mediaFileName.toLowerCase().endsWith(".mp4") ? (
                            <video
                              ref={mediaRef as any}
                              controls
                              src={`/uploads/${projectDetail.mediaFileName}`}
                              className="w-full max-h-48 bg-black rounded outline-none"
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

                      {/* Display 1: FULL TRANSCRIPT SHEET */}
                      {processingOption === "transcript" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3 border-b border-sage/40 pb-2">
                            <h4 className="text-xs font-bold text-fern">📄 Full Video Transcript</h4>
                            <div className="flex gap-1.5">
                              {["txt", "srt", "docx", "pdf"].map((fmt) => (
                                <a
                                  key={fmt}
                                  href={`/api/projects/${projectDetail.id}/export?format=${fmt}`}
                                  download
                                  className="text-[9px] font-bold bg-mint hover:bg-sage/40 text-fern px-2 py-0.5 rounded uppercase"
                                >
                                  {fmt}
                                </a>
                              ))}
                            </div>
                          </div>

                          <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                              type="text"
                              placeholder="Search transcript..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full rounded border border-sage bg-canvas/20 py-1 pl-8 pr-2.5 text-[11px] outline-none"
                            />
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-sage/30 rounded p-2 bg-canvas/10">
                            {(projectDetail.segments || []).filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                              <p className="text-[10px] text-muted text-center py-4">No matches found.</p>
                            ) : (
                              (projectDetail.segments || [])
                                .filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((seg) => (
                                  <div key={seg.id} className="flex gap-3 text-[11px] leading-relaxed">
                                    <button
                                      onClick={() => seekTo(seg.time)}
                                      className="font-mono font-bold text-fern hover:underline shrink-0 bg-mint/40 px-1.5 py-0.5 rounded h-fit"
                                    >
                                      {seg.time}
                                    </button>
                                    <span className="text-ink flex-1">{highlightText(seg.text, searchQuery)}</span>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* Display 2: DESCRIPTION SUMMARY */}
                      {processingOption === "summary" && projectDetail.summary && (
                        <div className="space-y-3">
                          <div className="flex gap-1.5 border-b border-sage/40 pb-2">
                            {(["short", "medium", "detailed"] as const).map((level) => (
                              <button
                                key={level}
                                onClick={() => setSummaryLevel(level)}
                                className={`rounded px-2.5 py-1 text-[10px] font-semibold capitalize border ${
                                  summaryLevel === level
                                    ? "bg-fern text-paper border-fern"
                                    : "bg-paper text-ink border-sage hover:bg-mint/20"
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                          <div className="text-[11px] leading-relaxed text-ink bg-canvas/15 p-3 rounded-lg border border-sage/30 whitespace-pre-line">
                            {projectDetail.summary[summaryLevel]}
                          </div>
                        </div>
                      )}

                      {/* Display 3: TRANSLATE CONTENT */}
                      {processingOption === "translate" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedTranslationLang}
                              onChange={(e) => {
                                setSelectedTranslationLang(e.target.value);
                                handleTranslateLanguage(e.target.value);
                              }}
                              className="rounded border border-sage bg-paper px-2 py-1 text-[11px] outline-none"
                            >
                              {languages.map((lang) => (
                                <option key={lang} value={lang}>
                                  {lang}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleTranslateLanguage(selectedTranslationLang)}
                              disabled={translating}
                              className="rounded bg-fern px-3 py-1 text-[10px] font-semibold text-paper hover:bg-[#285f3c] disabled:bg-sage"
                            >
                              {translating ? "Translating..." : "Translate"}
                            </button>
                          </div>

                          {translating ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 size={16} className="animate-spin text-fern" />
                            </div>
                          ) : (
                            <div className="text-[11px] leading-relaxed text-ink bg-canvas/15 p-3 rounded-lg border border-sage/30 whitespace-pre-line">
                              {translationText || "Select language and click translate to view."}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Alternate navigation toggle in card */}
                      <div className="flex gap-2 pt-2 border-t border-sage/40 text-[9px] font-bold text-muted uppercase">
                        <button
                          onClick={() => setProcessingOption("transcript")}
                          className={`hover:text-fern transition ${processingOption === "transcript" ? "text-fern underline" : ""}`}
                        >
                          Transcript
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => setProcessingOption("summary")}
                          className={`hover:text-fern transition ${processingOption === "summary" ? "text-fern underline" : ""}`}
                        >
                          Summary
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => {
                            setProcessingOption("translate");
                            if (!translationText) handleTranslateLanguage(selectedTranslationLang);
                          }}
                          className={`hover:text-fern transition ${processingOption === "translate" ? "text-fern underline" : ""}`}
                        >
                          Translate
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* Normal follow-up chat loader */}
                {sendingChat && (
                  <div className="flex gap-3.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-mint text-fern">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[85%] rounded-2xl bg-paper border border-sage/60 p-3 text-xs text-muted flex items-center gap-2 shadow-sm">
                      <Loader2 size={12} className="animate-spin text-fern" />
                      <span>Assistant is thinking...</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* BOTTOM INPUT CONTAINER */}
        <footer className="p-4 bg-paper border-t border-sage/75">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleInputSubmit} className="flex items-center gap-2 rounded-xl border border-sage bg-canvas/30 p-1.5 pl-3 pr-2 shadow-sm focus-within:border-fern transition">
              
              <button
                type="button"
                onClick={triggerFileInput}
                className="text-muted hover:text-fern p-1 rounded-md transition"
                title="Upload video or audio file"
              >
                <Paperclip size={18} />
              </button>
              
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={selectedProjectId ? "Ask a question about the video..." : "Paste video URL link here..."}
                className="flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-muted"
              />
              
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-fern text-paper hover:bg-[#285f3c] transition disabled:bg-sage/40"
              >
                <Send size={15} />
              </button>
            </form>

            <p className="text-[10px] text-muted text-center mt-2 leading-relaxed">
              💡 Hint: Paste a video URL (e.g. YouTube or MP4 link) or click the clip icon to upload.
            </p>
          </div>
        </footer>

        {/* HIDDEN FILE INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </section>
    </main>
  );
}
