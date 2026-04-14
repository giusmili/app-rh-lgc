import type { AnalyzeResponse } from "@/lib/types";

export function buildMarkdownReport(result: AnalyzeResponse) {
  const lines: string[] = [];

  lines.push(`# Rapport comparatif RH`);
  lines.push("");
  lines.push(`- Métier cible : ${result.targetJob.label}`);
  lines.push(`- Généré le : ${new Date(result.generatedAt).toLocaleString("fr-FR")}`);
  lines.push(`- Candidats analysés : ${result.candidates.length}`);
  lines.push(`- Avertissement : ${result.disclaimer}`);
  lines.push("");
  lines.push(`## Critères et pondérations`);
  lines.push("");

  for (const criterion of result.targetJob.criteria) {
    lines.push(`- ${criterion.label} (${criterion.weight} %) : ${criterion.description}`);
  }

  for (const candidate of result.candidates) {
    lines.push("");
    lines.push(`## ${candidate.rank}. ${candidate.fileName}`);
    lines.push("");
    lines.push(`- Score pondéré : ${candidate.normalizedScore.toFixed(1)} / 100`);
    lines.push(`- Confiance de l'analyse : ${candidate.analysis.confidence} / 100`);
    lines.push(`- Synthèse : ${candidate.analysis.summary}`);
    lines.push(`- Commentaire global : ${candidate.analysis.globalComment}`);
    lines.push("");
    lines.push(`### Forces`);
    for (const item of candidate.analysis.strengths) {
      lines.push(`- ${item}`);
    }
    lines.push("");
    lines.push(`### Risques`);
    for (const item of candidate.analysis.risks) {
      lines.push(`- ${item}`);
    }
    lines.push("");
    lines.push(`### Axes d'entretien`);
    for (const item of candidate.analysis.recommendedInterviewFocus) {
      lines.push(`- ${item}`);
    }
    lines.push("");
    lines.push(`### Détail par critère`);
    for (const criterion of candidate.analysis.criteria) {
      lines.push(`- ${criterion.label} : ${criterion.score}/100, poids ${criterion.weight} %, justification : ${criterion.rationale}`);
    }
  }

  return lines.join("\n");
}
