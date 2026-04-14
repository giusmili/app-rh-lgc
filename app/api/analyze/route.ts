import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { JOB_PROFILE_MAP } from "@/lib/job-profiles";
import { analyzeCandidateWithAi } from "@/lib/server/ai-client";
import { extractTextFromPath, withTemporaryFile } from "@/lib/server/document-parser";
import { buildRankedCandidates } from "@/lib/server/scoring";
import type { JobCriterion, TargetJobId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RawCriterion = {
  id: string;
  label: string;
  description: string;
  weight: number;
};

function normalizeCriteria(input: unknown): JobCriterion[] {
  if (!Array.isArray(input)) {
    throw new Error("Critères invalides.");
  }

  return input.map((criterion, index) => {
    const current = criterion as RawCriterion;
    return {
      id: current.id || `criterion-${index + 1}`,
      label: current.label?.trim() || `Critère ${index + 1}`,
      description: current.description?.trim() || "Sans description",
      weight: Number.isFinite(current.weight) ? Number(current.weight) : 0
    };
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const targetJobId = formData.get("targetJobId") as TargetJobId | null;
    const criteriaRaw = formData.get("criteria");
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (!targetJobId || !(targetJobId in JOB_PROFILE_MAP)) {
      return NextResponse.json({ error: "Métier cible invalide." }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Ajoutez au moins un document candidat." }, { status: 400 });
    }

    const parsedCriteria = normalizeCriteria(
      typeof criteriaRaw === "string" ? JSON.parse(criteriaRaw) : []
    );

    const targetJob = JOB_PROFILE_MAP[targetJobId];

    const analyses = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const extractedText = await withTemporaryFile(file.name, buffer, extractTextFromPath);

        if (!extractedText) {
          throw new Error(`Impossible d'extraire un texte exploitable pour ${file.name}.`);
        }

        const ai = await analyzeCandidateWithAi({
          targetJob,
          criteria: parsedCriteria,
          candidateText: extractedText
        });

        return {
          id: randomUUID(),
          fileName: file.name,
          extractedText,
          ai
        };
      })
    );

    const result = buildRankedCandidates({
      targetJob,
      criteria: parsedCriteria,
      analyses
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue pendant l'analyse.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
