import PDFDocument from "pdfkit";
import type { AnalyzeResponse } from "@/lib/types";

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function rule(doc: PDFKit.PDFDocument, color = "#e2e8f0") {
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .strokeColor(color)
    .lineWidth(0.5)
    .stroke()
    .moveDown(0.6);
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string) {
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text(text);
  doc.moveDown(0.4);
}

function listItems(doc: PDFKit.PDFDocument, items: string[], color = "#1e3a5f") {
  for (const item of items) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(color)
      .text(`- ${item}`, { indent: 12, width: CONTENT_WIDTH - 12 });
  }
}

export function buildPdfReport(result: AnalyzeResponse): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Page 1 : résumé ──────────────────────────────────────
    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#0f172a")
      .text("Rapport comparatif RH", { align: "center" });

    doc.moveDown(0.4);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#64748b")
      .text(
        `Métier : ${result.targetJob.label}   |   Généré le ${new Date(result.generatedAt).toLocaleString("fr-FR")}   |   ${result.candidates.length} candidat(s)`,
        { align: "center" }
      );

    doc.moveDown(0.8);
    rule(doc, "#cbd5e1");

    doc
      .font("Helvetica-Oblique")
      .fontSize(8.5)
      .fillColor("#475569")
      .text(result.disclaimer, { width: CONTENT_WIDTH });
    doc.moveDown(1.2);

    // Critères
    sectionTitle(doc, "Critères et pondérations");
    for (const c of result.targetJob.criteria) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor("#0f172a")
        .text(`${c.label}  (${c.weight} %)`);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#64748b")
        .text(c.description, { indent: 12, width: CONTENT_WIDTH - 12 });
      doc.moveDown(0.2);
    }
    doc.moveDown(0.8);

    // Classement
    sectionTitle(doc, "Classement");
    for (const candidate of result.candidates) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#334155")
        .text(`${candidate.rank}.  ${candidate.fileName}`);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#64748b")
        .text(
          `    Score : ${candidate.normalizedScore.toFixed(1)}/100   Confiance IA : ${candidate.analysis.confidence}/100`,
          { indent: 12 }
        );
      doc.moveDown(0.2);
    }

    // ── Une page par candidat ───────────────────────────────
    for (const candidate of result.candidates) {
      doc.addPage();

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#0f172a")
        .text(`${candidate.rank}. ${candidate.fileName}`);
      doc.moveDown(0.3);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#64748b")
        .text(
          `Score pondéré : ${candidate.normalizedScore.toFixed(1)} / 100   |   Confiance IA : ${candidate.analysis.confidence} / 100`
        );
      doc.moveDown(0.6);
      rule(doc);

      sectionTitle(doc, "Synthèse");
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#475569")
        .text(candidate.analysis.summary, { width: CONTENT_WIDTH });
      doc.moveDown(0.6);

      sectionTitle(doc, "Commentaire global");
      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#475569")
        .text(candidate.analysis.globalComment, { width: CONTENT_WIDTH });
      doc.moveDown(0.7);

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#166534").text("Forces");
      doc.moveDown(0.2);
      listItems(doc, candidate.analysis.strengths, "#166534");
      doc.moveDown(0.5);

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#9a3412").text("Risques");
      doc.moveDown(0.2);
      listItems(doc, candidate.analysis.risks, "#9a3412");
      doc.moveDown(0.5);

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e40af").text("Axes d'entretien");
      doc.moveDown(0.2);
      listItems(doc, candidate.analysis.recommendedInterviewFocus, "#1e40af");
      doc.moveDown(0.7);

      sectionTitle(doc, "Détail par critère");
      for (const criterion of candidate.analysis.criteria) {
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor("#0f172a")
          .text(`${criterion.label} — ${criterion.score}/100  (poids ${criterion.weight} %)`);
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor("#94a3b8")
          .text(criterion.rationale, { indent: 12, width: CONTENT_WIDTH - 12 });
        doc.moveDown(0.3);
      }
    }

    doc.end();
  });
}
