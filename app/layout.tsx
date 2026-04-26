import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neuvesca | Scented Candles",
  description:
    "Quietly luxurious scented candles poured for evening rituals, slow mornings, and softened spaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
