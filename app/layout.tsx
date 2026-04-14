import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intranet RH - Aide à la décision",
  description:
    "Outil intranet RH d'aide à la décision pour comparer des candidatures sans stockage permanent."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
