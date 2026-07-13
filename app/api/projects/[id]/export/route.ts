import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "txt").toLowerCase();

    // Verify project belongs to user
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        segments: { orderBy: { time: "asc" } },
        summary: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const safeTitle = project.title.replace(/[^a-zA-Z0-9.-]/g, "_");

    if (format === "txt") {
      let content = `STT ENGINE TRANSCRIPT REPORT\n`;
      content += `=============================\n`;
      content += `Project: ${project.title}\n`;
      content += `Created At: ${project.createdAt.toISOString()}\n`;
      content += `Source Language: ${project.sourceLanguage || "English"}\n\n`;

      if (project.summary) {
        content += `SUMMARY:\n`;
        content += `--------\n`;
        content += `${project.summary.medium}\n\n`;
      }

      content += `TRANSCRIPT:\n`;
      content += `-----------\n`;
      for (const seg of project.segments) {
        content += `[${seg.time}] ${seg.text}\n`;
      }

      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeTitle}_transcript.txt"`,
        },
      });
    }

    if (format === "srt" || format === "vtt") {
      const isVtt = format === "vtt";
      let content = isVtt ? "WEBVTT\n\n" : "";

      const helperMsToTimestamp = (ms: number, isVttFormat: boolean) => {
        const totalSecs = Math.floor(ms / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        const milliseconds = ms % 1000;

        const pad = (num: number, size: number) => {
          let s = num + "";
          while (s.length < size) s = "0" + s;
          return s;
        };

        const divider = isVttFormat ? "." : ",";
        return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}${divider}${pad(milliseconds, 3)}`;
      };

      project.segments.forEach((seg, index) => {
        const startMs = seg.startMs ?? (index * 10000); // fallback 10s gap
        const nextSeg = project.segments[index + 1];
        const endMs = nextSeg?.startMs ?? (startMs + 5000); // 5s duration fallback for last segment

        const startTimeStr = helperMsToTimestamp(startMs, isVtt);
        const endTimeStr = helperMsToTimestamp(endMs, isVtt);

        if (isVtt) {
          content += `${startTimeStr} --> ${endTimeStr}\n${seg.text}\n\n`;
        } else {
          content += `${index + 1}\n${startTimeStr} --> ${endTimeStr}\n${seg.text}\n\n`;
        }
      });

      return new NextResponse(content, {
        headers: {
          "Content-Type": isVtt ? "text/vtt; charset=utf-8" : "text/srt; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeTitle}_subtitles.${format}"`,
        },
      });
    }

    if (format === "docx" || format === "pdf") {
      // Create a print-styled HTML document
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${project.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 40px; }
            h1 { color: #2f6f46; border-bottom: 2px solid #2f6f46; padding-bottom: 10px; }
            h2 { color: #577c5f; margin-top: 30px; }
            .meta { color: #66736a; margin-bottom: 20px; font-size: 0.9em; }
            .summary-box { background: #f4f8f4; border-left: 4px solid #2f6f46; padding: 15px; margin-bottom: 30px; }
            .segment { margin-bottom: 15px; }
            .timestamp { color: #2f6f46; font-weight: bold; font-family: monospace; margin-right: 10px; }
          </style>
        </head>
        <body>
          <h1>STT Engine: Knowledge Extraction Report</h1>
          <div class="meta">
            <strong>Project Title:</strong> ${project.title}<br>
            <strong>Date Generated:</strong> ${project.createdAt.toLocaleDateString()}<br>
            <strong>Language:</strong> ${project.sourceLanguage || "English"}
          </div>
      `;

      if (project.summary) {
        htmlContent += `
          <h2>Executive Summary</h2>
          <div class="summary-box">
            <p><strong>Short:</strong> ${project.summary.short}</p>
            <p><strong>Detailed:</strong> ${project.summary.medium}</p>
          </div>
        `;
      }

      htmlContent += `<h2>Full Transcript</h2>`;
      for (const seg of project.segments) {
        htmlContent += `
          <div class="segment">
            <span class="timestamp">[${seg.time}]</span>
            <span class="text">${seg.text}</span>
          </div>
        `;
      }

      htmlContent += `
        </body>
        </html>
      `;

      if (format === "docx") {
        return new NextResponse(htmlContent, {
          headers: {
            "Content-Type": "application/msword; charset=utf-8",
            "Content-Disposition": `attachment; filename="${safeTitle}_report.doc"`, // Word reads .doc HTML perfectly
          },
        });
      }

      // PDF: We return HTML but with pdf disposition, browsers will render PDF download or allow print. 
      // To provide a native PDF download, returning HTML with pdf content-type allows browsers to open printing direct
      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeTitle}_report.html"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });

  } catch (error) {
    console.error("Export handler error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
