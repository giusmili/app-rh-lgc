export type TargetJobId =
  | "restauration"
  | "comptabilite"
  | "prof-formateur"
  | "informatique"
  | "charge-formation";

export type JobCriterion = {
  id: string;
  label: string;
  description: string;
  weight: number;
};

export type TargetJob = {
  id: TargetJobId;
  label: string;
  summary: string;
  criteria: JobCriterion[];
};

export type CriterionEvaluation = {
  criterionId: string;
  label: string;
  score: number;
  weight: number;
  rationale: string;
};

export type CandidateAnalysis = {
  strengths: string[];
  risks: string[];
  summary: string;
  recommendedInterviewFocus: string[];
  globalComment: string;
  confidence: number;
  criteria: CriterionEvaluation[];
};

export type RankedCandidate = {
  id: string;
  fileName: string;
  extractedTextPreview: string;
  analysis: CandidateAnalysis;
  weightedScore: number;
  normalizedScore: number;
  rank: number;
};

export type AnalyzeResponse = {
  targetJob: TargetJob;
  generatedAt: string;
  candidates: RankedCandidate[];
  disclaimer: string;
};
