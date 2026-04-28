import Image from "next/image";
import { HrWizard } from "@/components/hr-wizard";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatbotModal } from "@/components/chatbot-modal";
import styles from "./page.module.css";

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroGlowOne} />
        <div className={styles.heroGlowTwo} />
        <div className={styles.heroTopBar}>
          <ThemeToggle />
          <LogoutButton />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>
              <Image
                src="/assets/logo-lgc-only.webp"
                alt="Logo LGC"
                width={20}
                height={20}
                className={styles.eyebrowLogo}
              />
              Intranet RH
            </span>
            <div className={styles.heroHeading}>
              <h1 className={styles.title}>
                Analysez plusieurs candidatures et choisissez 
                le meilleur profil pour vos besoins professionnels.
              </h1>
              <p className={styles.lead}>
                Sélection du métier cible, critères pondérés, import multi-documents,
                comparaison lisible, classement final et rapport exportable.
              </p>
            </div>

            <div className={styles.pillRow}>
              <span className={styles.pill}>
                Pas de stockage permanent
              </span>
              <span className={styles.pill}>
                Clé API protégée côté serveur
              </span>
              <span className={styles.pill}>
                Aide à la décision uniquement
              </span>
            </div>
          </div>

          <div className={styles.featureCard}>
            {[
              "Métier et critères modifiables",
              "Import PDF, DOCX, TXT",
              "Analyse IA structurée en JSON",
              "Comparatif, classement, export"
            ].map((item, index) => (
              <div
                key={item}
                className={styles.featureItem}
              >
                <div className={styles.featureIndex}>
                  0{index + 1}
                </div>
                <p className={styles.featureText}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HrWizard />

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          © LGC - recherche & développement {year}
        </div>
      </footer>

      <ChatbotModal />
    </main>
  );
}
