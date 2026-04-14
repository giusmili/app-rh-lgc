import { HrWizard } from "@/components/hr-wizard";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <section className="glass-panel subtle-grid relative overflow-hidden rounded-[36px] px-6 py-8 md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.35))]" />
        <div className="absolute right-10 top-10 hidden h-32 w-32 rounded-full bg-[rgba(15,118,110,0.08)] blur-3xl lg:block" />
        <div className="absolute bottom-0 right-0 hidden h-40 w-40 rounded-full bg-[rgba(148,163,184,0.14)] blur-3xl lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <span className="section-title">Intranet RH</span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
                Analysez plusieurs candidatures avec une IA côté serveur, sans
                stockage permanent.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                Sélection du métier cible, critères pondérés, import multi-documents,
                comparaison lisible, classement final et rapport exportable.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700">
                Pas de stockage permanent
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700">
                Clé API protégée côté serveur
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700">
                Aide à la décision uniquement
              </span>
            </div>
          </div>

          <div className="soft-card grid gap-4 rounded-[30px] p-6">
            {[
              "Métier et critères modifiables",
              "Import PDF, DOCX, TXT",
              "Analyse IA structurée en JSON",
              "Comparatif, classement, export"
            ].map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/90 px-4 py-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <p className="text-sm font-medium tracking-[-0.01em] text-slate-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HrWizard />
    </main>
  );
}
