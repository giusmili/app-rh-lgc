"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./logout-button.module.css";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.replace("/login");
    });
  }

  return (
    <button className={styles.button} onClick={handleLogout} disabled={isPending}>
      {isPending ? (
        <>
          <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className={styles.spinnerTrack} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className={styles.spinnerHead} d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Déconnexion…
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Se déconnecter
        </>
      )}
    </button>
  );
}
