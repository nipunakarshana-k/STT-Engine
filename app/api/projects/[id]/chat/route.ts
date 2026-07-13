import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        segments: true,
        chatMessages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        projectId: id,
        role: "user",
        text: message,
      },
    });

    const fullTranscript = project.segments.map((s) => `[${s.time}] ${s.text}`).join("\n");
    const chatHistory = project.chatMessages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    let aiResponse = "";

    try {
      // Contact FastAPI chat service
      const response = await fetch(`${FASTAPI_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: fullTranscript,
          chat_history: chatHistory,
          new_message: message,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiResponse = data.response;
      } else {
        throw new Error(`FastAPI chat failed with status ${response.status}`);
      }
    } catch (apiError) {
      console.warn("Failed to communicate with FastAPI chat. Using local fallback.");
      
      // Simple fallback answer generation logic based on message keyword detection
      const lowercaseMsg = message.toLowerCase();
      if (lowercaseMsg.includes("summary") || lowercaseMsg.includes("summarize") || lowercaseMsg.includes("about")) {
        aiResponse = "This video is about creating the STT Engine platform. It highlights how we can upload media files, transcribe them, translate the text, extract key facts, chat with the content, and export files. Currently, the FastAPI backend is simulated by Next.js, allowing full interaction.";
      } else if (lowercaseMsg.includes("takeaway") || lowercaseMsg.includes("key point") || lowercaseMsg.includes("points")) {
        aiResponse = "The key takeaways are:\n1. Speech alone is not the final product; the value lies in extracting searchable structure.\n2. The workspace is built to streamline transcription, translation, and export in a calm environment.\n3. The backend is designed with a FastAPI microservice and Next.js routing.";
      } else if (lowercaseMsg.includes("export") || lowercaseMsg.includes("format")) {
        aiResponse = "The system supports exporting transcripts in PDF, Word (DOCX), plain text (TXT), and subtitle formats like SRT and VTT.";
      } else {
        aiResponse = `Thanks for asking: "${message}". The STT Engine assistant is running in local fallback mode. Once the FastAPI microservice and GEMINI_API_KEY are configured, I will read the entire transcript to answer your question with detailed references.`;
      }
    }

    // Save assistant reply to database
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        projectId: id,
        role: "assistant",
        text: aiResponse,
      },
    });

    return NextResponse.json(assistantMessage);

  } catch (error) {
    console.error("Chat handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export const maxDuration = 60;
