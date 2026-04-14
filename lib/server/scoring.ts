import { clamp } from "@/lib/utils";
import type { AiCandidatePayload } from "@/lib/ai-schema";
import type {
  AnalyzeResponse,
  CandidateAnalysis,
  JobCriterion,
  RankedCandidate,
  TargetJob
} from "@/lib/types";

export function buildRankedCandidates(args: {
  targetJob: TargetJob;
  criteria: JobCriterion[];
  analyses: Array<{
    id: string;
    fileName: string;
    extractedText: string;
    ai: AiCandidatePayload;
  }>;
}): AnalyzeResponse {
  const candidates: RankedCandidate[] = args.analyses
    .map((entry) => {
      const criteria = args.criteria.map((criterion) => {
        const fromAi = entry.ai.criteria.find((item) => item.criterionId === criterion.id);

        return {
          criterionId: criterion.id,
          label: criterion.label,
          score: clamp(fromAi?.score ?? 0, 0, 100),
          weight: criterion.weight,
          rationale: fromAi?.rationale ?? "Aucune justification exploitable n'a été produite."
        };
      });

      const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0) || 1;
      const weightedScore =
        criteria.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;

      const analysis: CandidateAnalysis = {
        summary: entry.ai.summary,
        globalComment: entry.ai.globalComment,
        confidence: entry.ai.confidence,
        strengths: entry.ai.strengths,
        risks: entry.ai.risks,
        recommendedInterviewFocus: entry.ai.recommendedInterviewFocus,
        criteria
      };

      return {
        id: entry.id,
        fileName: entry.fileName,
        extractedTextPreview: entry.extractedText.slice(0, 400),
        analysis,
        weightedScore,
        normalizedScore: clamp(weightedScore, 0, 100),
        rank: 0
      };
    })
    .sort((left, right) => right.weightedScore - left.weightedScore)
    .map((candidate, index) => ({
      ...candidate,
      rank: index + 1
    }));

  return {
    targetJob: {
      ...args.targetJob,
      criteria: args.criteria
    },
    generatedAt: new Date().toISOString(),
    candidates,
    disclaimer:
      "Cet outil fournit une aide structurée à la décision RH. La décision finale reste humaine, contextualisée et non automatisée."
  };
}
