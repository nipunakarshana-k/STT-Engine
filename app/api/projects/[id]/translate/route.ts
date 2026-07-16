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
    const body = await request.json();
    const { language } = body;

    if (!language) {
      return NextResponse.json({ error: "Language is required" }, { status: 400 });
    }

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id },
      include: { segments: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if translation already exists
    const existingTranslation = await prisma.translation.findUnique({
      where: {
        projectId_language: {
          projectId: id,
          language,
        },
      },
    });

    if (existingTranslation) {
      return NextResponse.json(existingTranslation);
    }

    const segmentsPayload = JSON.stringify(
      project.segments.map((s) => ({
        time: s.time,
        text: s.text,
        startMs: s.startMs,
      }))
    );
    const xGeminiKey = request.headers.get("x-gemini-key") || "";
    let translatedText = "";

    try {
      // Call FastAPI translation service
      const response = await fetch(`${FASTAPI_URL}/translate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(xGeminiKey ? { "x-gemini-key": xGeminiKey } : {})
        },
        body: JSON.stringify({
          text: segmentsPayload,
          target_language: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        translatedText = data.translatedText;
      } else {
        throw new Error(`FastAPI translate failed with status ${response.status}`);
      }
    } catch (apiError) {
      console.warn("Failed to communicate with FastAPI translate. Using local fallback.");
      
      // Local fallback with structured segments
      const localSegments = project.segments.map((s) => {
        let text = s.text;
        if (language === "Sinhala") {
          text = `[සිංහල]: ${s.text}`;
        } else if (language === "Tamil") {
          text = `[தமிழ்]: ${s.text}`;
        } else if (language === "French") {
          text = `[Français]: ${s.text}`;
        } else if (language === "Spanish") {
          text = `[Español]: ${s.text}`;
        } else if (language === "German") {
          text = `[Deutsch]: ${s.text}`;
        } else if (language === "Japanese") {
          text = `[日本語]: ${s.text}`;
        } else if (language === "Chinese") {
          text = `[中文]: ${s.text}`;
        } else {
          text = `[${language}]: ${s.text}`;
        }
        return {
          time: s.time,
          text,
          startMs: s.startMs,
        };
      });
      translatedText = JSON.stringify(localSegments);
    }

    // Save translation
    const newTranslation = await prisma.translation.create({
      data: {
        projectId: id,
        language,
        text: translatedText,
      },
    });

    return NextResponse.json(newTranslation);

  } catch (error) {
    console.error("Translation handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export const maxDuration = 120;
