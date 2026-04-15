"use client";

import { useMemo, useState, useTransition, type ChangeEvent } from "react";
import { JOB_PROFILES } from "@/lib/job-profiles";
import { cn, formatPercent } from "@/lib/utils";
import type {
  AnalyzeResponse,
  JobCriterion,
  TargetJob,
  TargetJobId
} from "@/lib/types";

const STEPS = [
  "1. Métier cible",
  "2. Critères pondérés",
  "3. Documents candidats",
  "4. Comparatif et rapport"
];

function cloneCriteria(criteria: JobCriterion[]) {
  return criteria.map((criterion) => ({ ...criterion }));
}

export function HrWizard() {
  const [selectedJobId, setSelectedJobId] = useState<TargetJobId>(JOB_PROFILES[0].id);
  const [criteria, setCriteria] = useState<JobCriterion[]>(cloneCriteria(JOB_PROFILES[0].criteria));
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedJob = useMemo<TargetJob>(
    () => JOB_PROFILES.find((job) => job.id === selectedJobId) ?? JOB_PROFILES[0],
    [selectedJobId]
  );

  const totalWeight = useMemo(
    () => criteria.reduce((sum, criterion) => sum + criterion.weight, 0),
    [criteria]
  );

  function handleJobChange(jobId: TargetJobId) {
    const nextJob = JOB_PROFILES.find((job) => job.id === jobId) ?? JOB_PROFILES[0];
    setSelectedJobId(nextJob.id);
    setCriteria(cloneCriteria(nextJob.criteria));
    setResult(null);
    setError(null);
  }

  function updateCriterion(index: number, patch: Partial<JobCriterion>) {
    setCriteria((current) =>
      current.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, ...patch } : criterion
      )
    );
  }

  function resetCriteria() {
    setCriteria(cloneCriteria(selectedJob.criteria));
    setResult(null);
    setError(null);
  }

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
    setResult(null);
    setError(null);
  }

  async function analyzeCandidates() {
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("targetJobId", selectedJob.id);
        formData.append("criteria", JSON.stringify(criteria));
        files.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData
        });

        const payload = (await response.json()) as AnalyzeResponse | { error?: string };

        if (!response.ok) {
          throw new Error(("error" in payload && payload.error) || "Analyse impossible.");
        }

        setResult(payload as AnalyzeResponse);
      } catch (analysisError) {
        setError(
          analysisError instanceof Error
            ? analysisError.message
            : "Erreur inattendue pendant l'analyse."
        );
      }
    });
  }

  async function downloadReport() {
    if (!result) {
      return;
    }

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error || "Impossible de générer le rapport.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `rapport-rh-${selectedJob.id}.md`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Erreur inattendue lors du téléchargement."
      );
    }
  }

  return (
    <section className="py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel h-fit rounded-[30px] p-5">
          <p className="section-title">Parcours</p>
          <div className="mt-5 space-y-3">
            {STEPS.map((step, index) => {
              const enabled = index < 2 || files.length > 0 || Boolean(result);
              return (
                <div
                  key={step}
                  className={cn(
                    "rounded-[22px] border px-4 py-4 text-sm font-medium transition-colors",
                    enabled
                      ? "border-slate-200 bg-white text-slate-900"
                      : "border-transparent bg-transparent text-slate-400"
                  )}
                >
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                    Étape {index + 1}
                  </span>
                  <span className="mt-1 block">{step.replace(/^\d+\.\s/, "")}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="glass-panel rounded-[30px] p-6 md:p-8">
            <p className="section-title">Étape 1</p>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Choisissez le métier cible
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Les critères et leurs poids sont préchargés par métier, puis modifiables avant l'analyse.
                </p>
              </div>
              <select
                value={selectedJobId}
                onChange={(event) => handleJobChange(event.target.value as TargetJobId)}
                className="field-base rounded-2xl px-4 py-3 text-sm text-slate-700"
              >
                {JOB_PROFILES.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-4 rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-600">
              {selectedJob.summary}
            </p>
          </div>

          <div className="glass-panel rounded-[30px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="section-title">Étape 2</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Ajustez les critères pondérés
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Le poids influence le score final. Le total conseillé est de 100 %.
                </p>
              </div>
              <button
                type="button"
                onClick={resetCriteria}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Réinitialiser les critères
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {criteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className="soft-card grid gap-3 rounded-[26px] px-4 py-4 md:grid-cols-[1.25fr_2fr_120px]"
                >
                  <input
                    value={criterion.label}
                    onChange={(event) => updateCriterion(index, { label: event.target.value })}
                    className="field-base rounded-2xl px-3 py-3 text-sm"
                    aria-label={`Libellé du critère ${index + 1}`}
                  />
                  <input
                    value={criterion.description}
                    onChange={(event) =>
                      updateCriterion(index, { description: event.target.value })
                    }
                    className="field-base rounded-2xl px-3 py-3 text-sm"
                    aria-label={`Description du critère ${index + 1}`}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={criterion.weight}
                    onChange={(event) =>
                      updateCriterion(index, { weight: Number(event.target.value) })
                    }
                    className="field-base rounded-2xl px-3 py-3 text-sm"
                    aria-label={`Poids du critère ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <div
              className={cn(
                "mt-4 rounded-[24px] px-4 py-4 text-sm font-medium",
                totalWeight === 100
                  ? "border border-emerald-100 bg-emerald-50/80 text-emerald-800"
                  : "border border-amber-100 bg-amber-50/90 text-amber-900"
              )}
            >
              Total des poids: {formatPercent(totalWeight)}
              {totalWeight !== 100 &&
                " - l'analyse fonctionne tout de même, mais un total à 100 % reste plus lisible."}
            </div>
          </div>

          <div className="glass-panel rounded-[30px] p-6 md:p-8">
            <p className="section-title">Étape 3</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Importez les CV ou documents candidats
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Formats acceptés : PDF, DOCX, TXT. Aucun document n'est stocké durablement et les fichiers temporaires sont supprimés après traitement.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeCandidates}
                disabled={files.length === 0 || isPending}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isPending ? "Analyse en cours..." : "Lancer l'analyse"}
              </button>
            </div>

            <div className="mt-5 rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-6">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={onFilesChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-950 file:px-4 file:py-3 file:text-sm file:font-medium file:text-white"
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="soft-card rounded-2xl px-4 py-3 text-sm text-slate-700"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 px-4 py-4 text-sm text-red-700">{error}</div>
            )}
          </div>

          <div className="glass-panel rounded-[30px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-title">Étape 4</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Comparatif, classement et rapport
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Le classement est indicatif et destiné à guider l'analyse RH, pas à automatiser la décision finale.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadReport}
                disabled={!result}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Télécharger le rapport
              </button>
            </div>

            {!result ? (
              <div className="mt-5 rounded-[24px] border border-slate-200 bg-white/80 px-4 py-6 text-sm leading-6 text-slate-500">
                Lancez une analyse pour afficher le classement, le détail par critère et le comparatif candidat par candidat.
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="rounded-[26px] border border-slate-200 bg-slate-950 px-5 py-5 text-sm leading-6 text-slate-100">
                  {result.disclaimer}
                </div>

                <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white/95">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50/90 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Rang</th>
                        <th className="px-4 py-3 font-medium">Candidat</th>
                        <th className="px-4 py-3 font-medium">Score final</th>
                        <th className="px-4 py-3 font-medium">Confiance IA</th>
                        {result.targetJob.criteria.map((criterion) => (
                          <th key={criterion.id} className="px-4 py-3 font-medium">
                            {criterion.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.candidates.map((candidate) => (
                        <tr key={candidate.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                          <td className="px-4 py-4 font-semibold text-slate-900">#{candidate.rank}</td>
                          <td className="px-4 py-4 text-slate-700">{candidate.fileName}</td>
                          <td className="px-4 py-4 font-medium text-slate-900">
                            {candidate.normalizedScore.toFixed(1)} / 100
                          </td>
                          <td className="px-4 py-4 text-slate-700">{candidate.analysis.confidence} / 100</td>
                          {candidate.analysis.criteria.map((criterion) => (
                            <td key={criterion.criterionId} className="px-4 py-4 text-slate-700">
                              {criterion.score}/100
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-4">
                  {result.candidates.map((candidate) => (
                    <article
                      key={candidate.id}
                      className="soft-card rounded-[30px] p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            Rang {candidate.rank}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                            {candidate.fileName}
                          </h3>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{candidate.analysis.summary}</p>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-slate-950">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Score pondéré</div>
                          <div className="mt-2 text-3xl font-semibold">{candidate.normalizedScore.toFixed(1)}</div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        <InfoCard title="Forces" items={candidate.analysis.strengths} />
                        <InfoCard title="Risques" items={candidate.analysis.risks} />
                        <InfoCard title="Axes d'entretien" items={candidate.analysis.recommendedInterviewFocus} />
                      </div>

                      <div className="mt-5 rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
                        {candidate.analysis.globalComment}
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {candidate.analysis.criteria.map((criterion) => (
                          <div
                            key={criterion.criterionId}
                            className="rounded-[22px] border border-slate-200 bg-white px-4 py-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-semibold text-slate-900">{criterion.label}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                                  Poids {criterion.weight} %
                                </p>
                              </div>
                              <div className="rounded-full bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                                {criterion.score}/100
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{criterion.rationale}</p>
                          </div>
                        ))}
                      </div>

                      <details className="mt-5 rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                        <summary className="cursor-pointer text-sm font-medium text-slate-700">
                          Aperçu du texte extrait
                        </summary>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {candidate.extractedTextPreview || "Aucun extrait disponible."}
                        </p>
                      </details>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
      <p className="text-sm font-semibold tracking-[-0.01em] text-slate-950">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
