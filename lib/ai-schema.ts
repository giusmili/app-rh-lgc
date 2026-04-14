import { z } from "zod";

export const aiCandidateSchema = z.object({
  summary: z.string().min(1),
  globalComment: z.string().min(1),
  confidence: z.number().min(0).max(100),
  strengths: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  recommendedInterviewFocus: z.array(z.string()).min(1),
  criteria: z.array(
    z.object({
      criterionId: z.string().min(1),
      label: z.string().min(1),
      score: z.number().min(0).max(100),
      rationale: z.string().min(1)
    })
  )
});

export type AiCandidatePayload = z.infer<typeof aiCandidateSchema>;
