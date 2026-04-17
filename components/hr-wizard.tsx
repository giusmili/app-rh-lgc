"use client";

import { useMemo, useState, useTransition, type ChangeEvent } from "react";
import styles from "./hr-wizard.module.css";
import { JOB_PROFILES } from "@/lib/job-profiles";
import { formatPercent } from "@/lib/utils";
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
    setSelectedJobId(jobId);
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

  async function downloadFile(endpoint: string, filename: string) {
    if (!result) {
      return;
    }

    try {
      const response = await fetch(endpoint, {
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
      anchor.download = filename;
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

  function downloadReport() {
    return downloadFile("/api/report", `rapport-rh-${selectedJob.id}.md`);
  }

  function downloadPdfReport() {
    return downloadFile("/api/report-pdf", `rapport-rh-${selectedJob.id}.pdf`);
  }

  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        <aside className={`${styles.panel} ${styles.stickyPanel}`}>
          <p className={styles.sectionTitle}>Parcours</p>
          <div className={styles.stepList}>
            {STEPS.map((step, index) => {
              const enabled = index < 2 || files.length > 0 || Boolean(result);
              return (
                <div
                  key={step}
                  className={`${styles.stepItem} ${enabled ? styles.stepItemActive : styles.stepItemInactive}`}
                >
                  <span className={styles.stepLabel}>
                    Étape {index + 1}
                  </span>
                  <span className={styles.stepName}>{step.replace(/^\d+\.\s/, "")}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <div className={styles.stack}>
          <div className={styles.panel}>
            <p className={styles.sectionTitle}>Étape 1</p>
            <div className={styles.sectionHeader}>
              <div className={styles.headerText}>
                <h2 className={styles.heading}>
                  Choisissez le métier cible
                </h2>
                <p className={styles.subheading}>
                  Les critères et leurs poids sont préchargés par métier, puis modifiables avant l'analyse.
                </p>
              </div>
              <select
                value={selectedJobId}
                onChange={(event) => handleJobChange(event.target.value as TargetJobId)}
                className={styles.select}
              >
                {JOB_PROFILES.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.label}
                  </option>
                ))}
              </select>
            </div>
            <p className={styles.summaryBox}>
              {selectedJob.summary}
            </p>
          </div>

          <div className={styles.panel}>
            <div className={styles.sectionHeaderWide}>
              <div className={styles.headerText}>
                <p className={styles.sectionTitle}>Étape 2</p>
                <h2 className={styles.heading}>
                  Ajustez les critères pondérés
                </h2>
                <p className={styles.subheading}>
                  Le poids influence le score final. Le total conseillé est de 100 %.
                </p>
              </div>
              <button
                type="button"
                onClick={resetCriteria}
                className={styles.buttonSecondary}
              >
                Réinitialiser les critères
              </button>
            </div>

            <div className={styles.criteriaList}>
              {criteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className={styles.criteriaCard}
                >
                  <input
                    value={criterion.label}
                    onChange={(event) => updateCriterion(index, { label: event.target.value })}
                    className={styles.input}
                    aria-label={`Libellé du critère ${index + 1}`}
                  />
                  <input
                    value={criterion.description}
                    onChange={(event) =>
                      updateCriterion(index, { description: event.target.value })
                    }
                    className={styles.input}
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
                    className={styles.input}
                    aria-label={`Poids du critère ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className={totalWeight === 100 ? styles.weightAlert : styles.weightAlertWarning}>
              Total des poids: {formatPercent(totalWeight)}
              {totalWeight !== 100 &&
                " - l'analyse fonctionne tout de même, mais un total à 100 % reste plus lisible."}
            </div>
          </div>

          <div className={styles.panel}>
            <p className={styles.sectionTitle}>Étape 3</p>
            <div className={styles.sectionHeaderWide}>
              <div className={styles.headerText}>
                <h2 className={styles.heading}>
                  Importez les CV ou documents candidats
                </h2>
                <p className={styles.subheading}>
                  Formats acceptés : PDF, DOCX, TXT. Aucun document n'est stocké durablement et les fichiers temporaires sont supprimés après traitement.
                </p>
              </div>
              <button
                type="button"
                onClick={analyzeCandidates}
                disabled={files.length === 0 || isPending}
                className={styles.button}
              >
                {isPending && (
                  <svg
                    className={styles.spinner}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className={styles.spinnerTrack}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className={styles.spinnerHead}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {!isPending && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                  </svg>
                )}
                {isPending ? "Analyse en cours..." : "Lancer l'analyse"}
              </button>
            </div>

            <div className={styles.uploadZone}>
              <div className={styles.uploadStack}>
                <input
                  id="candidate-files"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  onChange={onFilesChange}
                  className={styles.srOnly}
                />
                <label
                  htmlFor="candidate-files"
                  className={styles.uploadButton}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5 20q-.825 0-1.412-.587T3 18v-3h2v3h14v-3h2v3q0 .825-.587 1.413T19 20H5Zm7-4-5-5 1.4-1.425 2.6 2.6V4h2v8.175l2.6-2.6L17 11l-5 5Z" />
                  </svg>
                  <span>Parcourir les fichiers</span>
                </label>
                <p className={styles.uploadStatus}>
                  {files.length === 0
                    ? "Aucun fichier sélectionné."
                    : `${files.length} fichier(s) sélectionné(s).`}
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className={styles.fileList}>
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className={styles.fileCard}
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className={styles.errorBox}>{error}</div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerText}>
                <p className={styles.sectionTitle}>Étape 4</p>
                <h2 className={styles.heading}>
                  Comparatif, classement et rapport
                </h2>
                <p className={styles.subheading}>
                  Le classement est indicatif et destiné à guider l'analyse RH, pas à automatiser la décision finale.
                </p>
              </div>
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  onClick={downloadPdfReport}
                  disabled={!result}
                  className={styles.button}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7Zm-14 9h14v2H5v-2Z" />
                  </svg>
                  Télécharger en PDF
                </button>
                <button
                  type="button"
                  onClick={downloadReport}
                  disabled={!result}
                  className={styles.buttonSecondary}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6Zm0 2.5L17.5 8H14V4.5ZM8 13h8v1.5H8V13Zm0 3h8v1.5H8V16Zm0-6h5v1.5H8V10Z" />
                  </svg>
                  Télécharger en Markdown
                </button>
              </div>
            </div>

            {!result ? (
              <div className={styles.placeholder}>
                Lancez une analyse pour afficher le classement, le détail par critère et le comparatif candidat par candidat.
              </div>
            ) : (
              <div className={styles.resultBody}>
                <div className={styles.disclaimerBox}>
                  {result.disclaimer}
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Rang</th>
                        <th>Candidat</th>
                        <th>Score final</th>
                        <th>Confiance IA</th>
                        {result.targetJob.criteria.map((criterion) => (
                          <th key={criterion.id}>
                            {criterion.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.candidates.map((candidate) => (
                        <tr key={candidate.id}>
                          <td className={styles.rankCell}>#{candidate.rank}</td>
                          <td>{candidate.fileName}</td>
                          <td className={styles.scoreCell}>
                            {candidate.normalizedScore.toFixed(1)} / 100
                          </td>
                          <td>{candidate.analysis.confidence} / 100</td>
                          {candidate.analysis.criteria.map((criterion) => (
                            <td key={criterion.criterionId}>
                              {criterion.score}/100
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.candidateCards}>
                  {result.candidates.map((candidate) => (
                    <article key={candidate.id} className={styles.candidateCard}>
                      <div className={styles.candidateHeader}>
                        <div className={styles.candidateMeta}>
                          <p className={styles.rankLabel}>
                            Rang {candidate.rank}
                          </p>
                          <h3 className={styles.candidateName}>
                            {candidate.fileName}
                          </h3>
                          <p className={styles.candidateSummary}>{candidate.analysis.summary}</p>
                        </div>
                        <div className={styles.scoreBox}>
                          <div className={styles.scoreCaption}>Score pondéré</div>
                          <div className={styles.scoreValue}>{candidate.normalizedScore.toFixed(1)}</div>
                        </div>
                      </div>

                      <div className={styles.infoGrid}>
                        <InfoCard title="Forces" items={candidate.analysis.strengths} />
                        <InfoCard title="Risques" items={candidate.analysis.risks} />
                        <InfoCard title="Axes d'entretien" items={candidate.analysis.recommendedInterviewFocus} />
                      </div>

                      <div className={styles.globalComment}>
                        {candidate.analysis.globalComment}
                      </div>

                      <div className={styles.criteriaGrid}>
                        {candidate.analysis.criteria.map((criterion) => (
                          <div key={criterion.criterionId} className={styles.criterionCard}>
                            <div className={styles.criterionHeader}>
                              <div>
                                <p className={styles.criterionTitle}>{criterion.label}</p>
                                <p className={styles.criterionWeight}>
                                  Poids {criterion.weight} %
                                </p>
                              </div>
                              <div className={styles.criterionBadge}>
                                {criterion.score}/100
                              </div>
                            </div>
                            <p className={styles.criterionText}>{criterion.rationale}</p>
                          </div>
                        ))}
                      </div>

                      <details className={styles.detailsBox}>
                        <summary className={styles.detailsSummary}>
                          Aperçu du texte extrait
                        </summary>
                        <p className={styles.detailsContent}>
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
    <div className={styles.infoCard}>
      <p className={styles.infoTitle}>{title}</p>
      <ul className={styles.infoList}>
        {items.map((item) => (
          <li key={item} className={styles.infoItem}>
            <span className={styles.infoDot} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
