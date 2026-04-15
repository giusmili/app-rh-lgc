import { NextResponse } from "next/server";
import { buildPdfReport } from "@/lib/server/report-pdf";
import { toSlug } from "@/lib/utils";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AnalyzeResponse;

    if (!payload?.targetJob?.label || !Array.isArray(payload?.candidates)) {
      return NextResponse.json({ error: "Payload de rapport invalide." }, { status: 400 });
    }

    const buffer = await buildPdfReport(payload);
    const filename = `rapport-rh-${toSlug(payload.targetJob.label)}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de générer le rapport PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
