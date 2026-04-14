import { NextResponse } from "next/server";
import { buildMarkdownReport } from "@/lib/server/report";
import { toSlug } from "@/lib/utils";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzeResponse;

    if (!payload?.targetJob?.label || !Array.isArray(payload?.candidates)) {
      return NextResponse.json({ error: "Payload de rapport invalide." }, { status: 400 });
    }

    const markdown = buildMarkdownReport(payload);
    const filename = `rapport-rh-${toSlug(payload.targetJob.label)}.md`;

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de générer le rapport.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
