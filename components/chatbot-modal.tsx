"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import styles from "./chatbot-modal.module.css";

type Role = "bot" | "user";

interface Message {
  id: number;
  role: Role;
  text: string;
}

interface KBEntry {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

const KB: KBEntry[] = [
  {
    id: "overview",
    question: "Comment fonctionne l'interface ?",
    keywords: ["fonctionne", "interface", "comment", "presentation", "overview", "fonctionnement", "etape", "etapes", "wizard", "general"],
    answer: "L'interface se déroule en **4 étapes** :\n\n**Étape 1** — Choisissez le métier cible (ex : Restauration, Comptabilité…)\n\n**Étape 2** — Ajustez les critères pondérés selon vos priorités de recrutement\n\n**Étape 3** — Importez les CV des candidats (PDF, DOCX ou TXT)\n\n**Étape 4** — Consultez le comparatif, le classement et exportez le rapport",
  },
  {
    id: "ponderation",
    question: "Qu'est-ce que la pondération ?",
    keywords: ["ponderation", "poids", "critere", "criteres", "ponderes", "ajuster", "modifier", "pourcentage", "total", "100", "test"],
    answer: "La **pondération** définit l'importance relative de chaque critère d'évaluation. Chaque critère reçoit un poids en % (ex : Expérience terrain : 30 %, Relation client : 20 %).\n\nLa somme idéale est **100 %**. Si elle diffère, l'analyse fonctionne quand même, mais un total à 100 % donne un classement plus lisible.\n\nVous pouvez modifier les libellés, descriptions et poids, puis cliquer sur **« Réinitialiser les critères »** pour retrouver les valeurs par défaut.",
  },
  {
    id: "score",
    question: "Comment est calculé le score ?",
    keywords: ["score", "calcul", "calcule", "note", "points", "formule", "algorithme", "classement", "moyenne"],
    answer: "Le score final est une **moyenne pondérée** :\n\n**Score = Σ (score_critère × poids) / total_poids**\n\nExemple : si un candidat obtient 85 sur « Expérience » (poids 30) et 90 sur « Relation client » (poids 20), son score est (85×30 + 90×20) / 50 = **87 points**.\n\nLes candidats sont ensuite classés du meilleur au moins bon score.",
  },
  {
    id: "profils",
    question: "Quels métiers sont disponibles ?",
    keywords: ["metier", "profil", "poste", "job", "disponible", "liste", "restauration", "comptabilite", "informatique", "formateur", "formation"],
    answer: "5 profils de métiers sont disponibles par défaut :\n\n1. **Restauration** — expérience terrain, cadence, hygiène, relation client\n2. **Comptabilité** — rigueur, fiscalité, logiciels, communication\n3. **Prof / Formateur** — pédagogie, discipline, programme, communication\n4. **Informatique** — compétences tech, autonomie, veille, collaboration\n5. **Chargé de Formation** — ingénierie, coordination, budget, bilan\n\nChaque profil a ses propres critères et poids par défaut, modifiables à l'étape 2.",
  },
  {
    id: "documents",
    question: "Quels fichiers puis-je importer ?",
    keywords: ["fichier", "format", "pdf", "docx", "word", "txt", "upload", "importer", "document", "cv", "import"],
    answer: "L'outil accepte ces formats :\n\n- **PDF** (.pdf)\n- **Word** (.docx)\n- **Texte brut** (.txt)\n\nVous pouvez importer **plusieurs fichiers simultanément** (un CV par candidat). Le texte est extrait automatiquement. Les **16 000 premiers caractères** de chaque document sont analysés par l'IA.",
  },
  {
    id: "resultats",
    question: "Comment lire les résultats ?",
    keywords: ["resultat", "resultats", "lire", "interpreter", "comprendre", "tableau", "carte", "candidat", "analyse", "rang"],
    answer: "Les résultats s'affichent en deux sections :\n\n**Tableau comparatif** : rang, nom, score final, confiance IA, score par critère.\n\n**Cartes candidats** : pour chaque profil, vous trouvez :\n- Points forts\n- Points de vigilance (risques)\n- Axes d'entretien recommandés\n- Commentaire global de l'IA\n- Détail par critère avec justification\n- Aperçu du texte extrait du document",
  },
  {
    id: "rapport",
    question: "Comment exporter le rapport ?",
    keywords: ["rapport", "exporter", "export", "telecharger", "markdown", "md", "download", "imprimer"],
    answer: "Depuis l'**étape 4**, deux formats sont disponibles :\n\n- **Markdown (.md)** : rapport texte structuré, idéal pour l'archivage ou l'envoi\n- **PDF** : rapport mis en forme, prêt à imprimer ou partager\n\nLes deux exports contiennent le classement complet, les scores par critère et les analyses détaillées de chaque candidat.",
  },
  {
    id: "confidentialite",
    question: "Les données sont-elles stockées ?",
    keywords: ["donnee", "donnees", "stockage", "stocker", "prive", "confidentialite", "rgpd", "securite", "permanent", "conserve", "supprime"],
    answer: "**Aucun stockage permanent.** Les documents uploadés sont analysés en mémoire temporaire et supprimés immédiatement après l'analyse.\n\nLa clé API IA est protégée **côté serveur** et n'est jamais exposée au navigateur.\n\nCet outil est une **aide à la décision uniquement** — il ne remplace pas le jugement humain et ne prend aucune décision d'embauche.",
  },
  {
    id: "ia",
    question: "Comment fonctionne l'IA ?",
    keywords: ["ia", "intelligence", "artificielle", "ai", "modele", "llm", "automatique", "confiance"],
    answer: "L'IA analyse le texte de chaque CV et produit pour chaque critère :\n\n- Un **score** de 0 à 100\n- Une **justification** basée uniquement sur le document\n- Un **niveau de confiance** global\n\nElle génère aussi des points forts, des points de vigilance et des axes d'entretien.\n\nL'IA signale explicitement quand une information est **absente ou incertaine** dans le document.",
  },
];

const GREETING: Message = {
  id: 0,
  role: "bot",
  text: "Bonjour ! Je suis l'assistant de l'**Intranet RH**.\n\nJe peux vous expliquer le fonctionnement de l'interface, notamment le **test de pondération des critères**. Que souhaitez-vous savoir ?",
};

const FALLBACK =
  "Je n'ai pas trouvé de réponse précise. Essayez de reformuler votre question, ou choisissez un sujet dans les suggestions ci-dessous.";

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function findAnswer(input: string): string {
  const norm = normalizeStr(input);
  for (const entry of KB) {
    if (entry.keywords.some((kw) => norm.includes(normalizeStr(kw)))) {
      return entry.answer;
    }
  }
  return FALLBACK;
}

function formatBotText(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

let msgIdCounter = 1;

export function ChatbotModal() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [messages, open]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: msgIdCounter++, role: "user", text: trimmed };
    const botMsg: Message = { id: msgIdCounter++, role: "bot", text: findAnswer(trimmed) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setOpen(false);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <button
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Ouvrir l'assistant"
        title="Assistant — Aide à la navigation"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.overlay}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label="Assistant Intranet RH"
        >
          <div className={styles.modal}>
            <div className={styles.header}>
              <div className={styles.avatar} aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div className={styles.headerTitle}>
                <p className={styles.headerName}>Assistant Intranet RH</p>
                <p className={styles.headerSub}>Aide à la navigation</p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Fermer l'assistant"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.messages} role="log" aria-live="polite">
              {messages.map((msg) =>
                msg.role === "bot" ? (
                  <div
                    key={msg.id}
                    className={`${styles.bubble} ${styles.bubbleBot}`}
                    dangerouslySetInnerHTML={{ __html: formatBotText(msg.text) }}
                  />
                ) : (
                  <div key={msg.id} className={`${styles.bubble} ${styles.bubbleUser}`}>
                    {msg.text}
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.quickReplies} aria-label="Sujets suggérés">
              {KB.map((entry) => (
                <button
                  key={entry.id}
                  className={styles.chip}
                  onClick={() => sendMessage(entry.question)}
                >
                  {entry.question}
                </button>
              ))}
            </div>

            <div className={styles.inputArea}>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                placeholder="Posez votre question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Votre question"
              />
              <button
                className={styles.sendBtn}
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                aria-label="Envoyer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
