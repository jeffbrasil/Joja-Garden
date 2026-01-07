"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Leaf,
  Menu,
  Home,
  Sprout,
  BookOpen,
  UserPlus,
  ShieldCheck,
  Users,
  Flower2,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";

// Componentes do Shadcn
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPlantsOpen, setIsPlantsOpen] = React.useState(false);

  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/login");
  };

  // Função para fechar o Sheet ao clicar em um link
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-quaternary/95 backdrop-blur-sm shadow-sm shadow-tertiary/20 z-50 px-6 md:px-12 flex items-center justify-between font-poppins transition-all">
      {/* --- LOGO --- */}
      <Link
        href="/"
        className="flex items-center gap-2 group cursor-pointer"
        onClick={closeMenu}
      >
        <div className="bg-primary text-white p-1 rounded-full group-hover:bg-secondary transition-colors">
          <Leaf size={18} />
        </div>
        <span className="text-xl font-bold text-primary tracking-tight group-hover:text-secondary transition-colors">
          JojaGarden
        </span>
      </Link>

      {/* --- LINKS DESKTOP (Apenas telas grandes) --- */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          href="/"
          className="text-primary font-medium hover:text-secondary hover:scale-105 transition-all text-sm"
        >
          Home
        </Link>
        <Link
          href="/my-gardens"
          className="text-primary font-medium hover:text-secondary hover:scale-105 transition-all text-sm"
        >
          Jardins
        </Link>
        <Link
          href="/catalog"
          className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-secondary hover:shadow-md hover:shadow-tertiary/40 transition-all transform hover:-translate-y-0.5"
        >
          Catálogo
        </Link>
      </div>

      {/* --- MENU HAMBÚRGUER (SHADCN SHEET) --- */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className="text-primary hover:text-secondary hover:bg-tertiary/10 rounded-full"
          >
            <Menu size={28} />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-80 p-0 font-poppins border-l-tertiary/20"
        >
          <SheetHeader className="p-6 bg-quaternary/50 border-b border-tertiary/10 text-left">
            <SheetTitle className="flex items-center gap-2 text-primary">
              <Leaf size={18} className="fill-primary" /> Menu
            </SheetTitle>
          </SheetHeader>

          {/* Área de Scroll para menus longos */}
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="flex flex-col gap-6 p-6">
              {/* 1. NAVEGAÇÃO BÁSICA */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-tertiary uppercase tracking-wider">
                  Navegação
                </p>
                <Link href="/" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-primary hover:text-secondary font-normal"
                  >
                    <Home size={18} /> Home
                  </Button>
                </Link>
                <Link href="/my-gardens" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-primary hover:text-secondary font-normal"
                  >
                    <Sprout size={18} /> Meus Jardins
                  </Button>
                </Link>
                <Link href="/catalog" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-primary hover:text-secondary font-normal"
                  >
                    <BookOpen size={18} /> Catálogo
                  </Button>
                </Link>
              </div>

              <Separator className="bg-tertiary/10" />

              {/* 2. ÁREA DO ADMINISTRADOR */}
              {isAdmin && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                        Administração
                      </span>
                      <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">
                        ADMIN
                      </span>
                    </div>

                    <Link href="/sign-up-user" onClick={closeMenu}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:text-primary font-normal"
                      >
                        <UserPlus size={18} /> Novo Usuário
                      </Button>
                    </Link>

                    <Link href="/sign-up-admin" onClick={closeMenu}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:text-primary font-normal"
                      >
                        <ShieldCheck size={18} /> Novo Admin
                      </Button>
                    </Link>

                    <Link href="/list-users" onClick={closeMenu}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:text-primary font-normal"
                      >
                        <Users size={18} /> Gerenciar Usuários
                      </Button>
                    </Link>

                    {/* Submenu Plantas (Collapsible) */}
                    <Collapsible
                      open={isPlantsOpen}
                      onOpenChange={setIsPlantsOpen}
                      className="space-y-1"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-gray-600 hover:text-primary font-normal"
                        >
                          <span className="flex items-center gap-3">
                            <Flower2 size={18} /> Adicionar Plantas
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isPlantsOpen ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 space-y-1">
                        <Link
                          href="/catalogo/adicionar_planta_catalogo"
                          onClick={closeMenu}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-gray-500 hover:text-secondary font-light pl-9"
                          >
                            • Ao Catálogo Geral
                          </Button>
                        </Link>
                        <Link href="/admin/atribuir-planta" onClick={closeMenu}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-gray-500 hover:text-secondary font-light pl-9"
                          >
                            • A um Usuário
                          </Button>
                        </Link>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  <Separator className="bg-tertiary/10" />
                </>
              )}

              {/* 3. CONTA / LOGOUT */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-tertiary uppercase tracking-wider">
                  Conta
                </p>
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-quaternary/50 rounded-lg border border-tertiary/5">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <User size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-primary truncate">
                          {user.nome}
                        </p>
                        <p className="text-xs text-tertiary truncate">
                          {user.email || user.tipo_usuario}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-center gap-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 font-medium"
                    >
                      <LogOut size={18} /> Sair
                    </Button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full block"
                  >
                    <Button className="w-full rounded-full bg-primary hover:bg-secondary text-white font-semibold">
                      Fazer Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
