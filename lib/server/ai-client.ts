import { aiCandidateSchema, type AiCandidatePayload } from "@/lib/ai-schema";
import type { JobCriterion, TargetJob } from "@/lib/types";

type AiConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
};

function getAiConfig(): AiConfig {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;
  const model = process.env.AI_MODEL;

  if (!apiKey || !apiUrl || !model) {
    throw new Error(
      "Variables AI_API_KEY, AI_API_URL et AI_MODEL requises côté serveur."
    );
  }

  return { apiKey, apiUrl, model };
}

function buildPrompt(targetJob: TargetJob, criteria: JobCriterion[], candidateText: string) {
  return [
    "Tu es un assistant RH d'aide à la décision.",
    "Analyse le document candidat ci-dessous pour le métier cible.",
    "Retourne exclusivement un JSON valide sans markdown.",
    "Le JSON doit contenir exactement les propriétés suivantes :",
    JSON.stringify(
      {
        summary: "Synthèse courte",
        globalComment: "Commentaire global argumenté",
        confidence: 78,
        strengths: ["point fort 1"],
        risks: ["point de vigilance 1"],
        recommendedInterviewFocus: ["question ou axe d'entretien 1"],
        criteria: criteria.map((criterion) => ({
          criterionId: criterion.id,
          label: criterion.label,
          score: 0,
          rationale: "Justification courte et factuelle"
        }))
      },
      null,
      2
    ),
    `Métier cible : ${targetJob.label}`,
    `Contexte métier : ${targetJob.summary}`,
    "Critères et pondérations :",
    ...criteria.map(
      (criterion) =>
        `- ${criterion.id} | ${criterion.label} | poids=${criterion.weight} | ${criterion.description}`
    ),
    "Règles :",
    "- Ne prends jamais de décision finale de recrutement.",
    "- Évalue uniquement à partir des informations présentes ou inférées prudemment du document.",
    "- Les scores doivent être compris entre 0 et 100.",
    "- Si une information manque, indique l'incertitude dans rationale ou risks.",
    "Document candidat :",
    candidateText.slice(0, 16000)
  ].join("\n");
}

export async function analyzeCandidateWithAi(args: {
  targetJob: TargetJob;
  criteria: JobCriterion[];
  candidateText: string;
}): Promise<AiCandidatePayload> {
  const config = getAiConfig();
  const prompt = buildPrompt(args.targetJob, args.criteria, args.candidateText);

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Tu réponds toujours par du JSON strict, sans texte additionnel."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Erreur IA: ${response.status} ${details}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Réponse IA vide ou illisible.");
  }

  return aiCandidateSchema.parse(JSON.parse(content));
}
