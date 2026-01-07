import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Navbar from "../components/navbar";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner"

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
    <html lang="pt">
      <body
        className={`font-poppins bg-quinquenary antialiased ${poppins.variable}`}
      >
        {/* 2. O AuthProvider deve abraçar TUDO (Navbar e Conteúdo) */}
        {/* Assim, tanto o Navbar quanto as páginas saberão quem está logado */}
        <AuthProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
