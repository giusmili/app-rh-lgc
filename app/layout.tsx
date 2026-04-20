import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  title: "Intranet RH - Aide à la décision",
  description:
    "Outil intranet RH d'aide à la décision pour comparer des candidatures sans stockage permanent.",
  manifest: "/favicon/manifest.json",
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/favicon/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ],
    apple: [{ url: "/favicon/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;})();` }} />
      </head>
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
