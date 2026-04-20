"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur de connexion.");
      return;
    }

    startTransition(() => {
      router.replace("/");
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <Image
            src="/assets/logo-lgc-only.webp"
            alt="Logo LGC"
            width={36}
            height={36}
            className={styles.logo}
          />
          <span className={styles.brand}>Intranet RH</span>
        </div>

        <div className={styles.headerText}>
          <h1 className={styles.title}>Connexion</h1>
          <p className={styles.subtitle}>Accès réservé aux collaborateurs LGC.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Identifiant</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className={styles.input}
              placeholder="Votre identifiant"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className={styles.input}
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={isPending}>
            {isPending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}
