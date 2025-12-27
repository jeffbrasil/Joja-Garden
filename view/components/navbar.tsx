"use client";

import Link from "next/link";
import { Leaf } from "lucide-react"; // Se não tiver o ícone instalado, pode remover esta linha e a tag <Leaf />

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-quaternary/95 backdrop-blur-sm shadow-sm shadow-tertiary/20 z-50 px-6 md:px-12 flex items-center justify-between font-poppins transition-all">
      {/* --- LOGO --- */}
      <Link href="/" className="flex items-center gap-2 group cursor-pointer">
        <div className="bg-primary text-white p-1 rounded-full group-hover:bg-secondary transition-colors">
          {/* Se der erro no Leaf, remova ou troque por um <span>🌿</span> */}
          <Leaf size={18} />
        </div>
        <span className="text-xl font-bold text-primary tracking-tight group-hover:text-secondary transition-colors">
          JojaGarden
        </span>
      </Link>

      {/* --- LINKS --- */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-primary font-medium hover:text-secondary hover:scale-105 transition-all text-sm"
        >
          Home
        </Link>

        {/* Aponta para a pasta garden-view que vi na imagem */}
        <Link
          href="/my-gardens"
          className="text-primary font-medium hover:text-secondary hover:scale-105 transition-all text-sm"
        >
          Jardins
        </Link>

        {/* Aponta para a pasta catalog que vi na imagem */}
        <Link
          href="/catalog"
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-secondary hover:shadow-md hover:shadow-tertiary/40 transition-all transform hover:-translate-y-0.5"
        >
          Catálogo
        </Link>
      </div>
    </nav>
  );
}
