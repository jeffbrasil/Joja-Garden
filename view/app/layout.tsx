import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";

import Navbar from "../components/navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Joja Garden",
  description: "Cuide do seu jardim de forma simples e agradável",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      {/* Adicionei a cor de fundo e fonte aqui para garantir consistência */}
      <body className="font-poppins bg-quinquenary antialiased">
        <Navbar />

        {/* O padding-top (pt-16) é necessário porque o Navbar é fixo */}
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
