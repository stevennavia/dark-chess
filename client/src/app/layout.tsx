import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dark Chess - Cursed Ritual Battle",
  description: "A dark fantasy multiplayer chess game with Soulslike aesthetics",
  openGraph: {
    title: "Dark Chess",
    description: "A cursed ritual battle of strategy and darkness",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
