"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  ChevronRight,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/login");
  };

  const closeMenu = () => setIsOpen(false);

  // Lógica dos links do Desktop (Topo)
  const navLinks = [
    { name: "Home", href: "/" },
    ...(!isAdmin
      ? [
          { name: "Minhas Plantas", href: "/my-plants" },
          { name: "Jardins", href: "/my-gardens" },
        ]
      : []),
    { name: "Catálogo", href: "/catalog" },
  ];

  // Helper para gerar as classes de estilo ativo/inativo consistentemente
  const getLinkClasses = (path: string, isAdminLink = false) => {
    const isActive = pathname === path;
    const baseClasses = "w-full justify-start gap-3 font-normal transition-all";
    
    // Estilo quando está ATIVO (selecionado)
    const activeClasses = "bg-primary/10 text-primary font-semibold";
    
    // Estilo quando INATIVO
    // Links de admin costumam ser cinza (text-gray-600) para diferenciar, links normais são primary
    const inactiveClasses = isAdminLink 
        ? "text-gray-600 hover:text-primary hover:bg-gray-50" 
        : "text-primary hover:text-secondary hover:bg-primary/5";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

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

      {/* --- LINKS DESKTOP --- */}
      <div className="hidden md:flex items-center gap-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-tertiary/40 transform scale-105"
                    : "text-primary hover:bg-primary/10 hover:text-primary hover:scale-105"
                }
              `}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* --- MENU HAMBÚRGUER --- */}
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

          {/* Área de Scroll */}
          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="flex flex-col gap-6 p-6">
              
              {/* 1. NAVEGAÇÃO BÁSICA */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-tertiary uppercase tracking-wider">
                  Navegação
                </p>

                <Link href="/" onClick={closeMenu}>
                  <Button variant="ghost" className={getLinkClasses("/")}>
                    <Home size={18} /> Home
                  </Button>
                </Link>

                {!isAdmin && (
                  <>
                    <Link href="/my-plants" onClick={closeMenu}>
                      <Button variant="ghost" className={getLinkClasses("/my-plants")}>
                        <Flower2 size={18} /> Minhas Plantas
                      </Button>
                    </Link>

                    <Link href="/my-gardens" onClick={closeMenu}>
                      <Button variant="ghost" className={getLinkClasses("/my-gardens")}>
                        <Sprout size={18} /> Meus Jardins
                      </Button>
                    </Link>
                  </>
                )}

                <Link href="/catalog" onClick={closeMenu}>
                  <Button variant="ghost" className={getLinkClasses("/catalog")}>
                    <BookOpen size={18} /> Catálogo
                  </Button>
                </Link>
              </div>

              <Separator className="bg-tertiary/10" />

              {/* 2. ÁREA DO ADMINISTRADOR (CORRIGIDO) */}
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
                      <Button variant="ghost" className={getLinkClasses("/sign-up-user", true)}>
                        <UserPlus size={18} /> Novo Usuário
                      </Button>
                    </Link>

                    <Link href="/sign-up-admin" onClick={closeMenu}>
                      <Button variant="ghost" className={getLinkClasses("/sign-up-admin", true)}>
                        <ShieldCheck size={18} /> Novo Admin
                      </Button>
                    </Link>

                    <Link href="/manage-users" onClick={closeMenu}>
                      <Button variant="ghost" className={getLinkClasses("/manage-users", true)}>
                        <Users size={18} /> Gerenciar Usuários
                      </Button>
                    </Link>

                    <Link href="/manage-admins" onClick={closeMenu}>
                      <Button variant="ghost" className={getLinkClasses("/manage-admins", true)}>
                        <ShieldCheck size={18} /> Gerenciar Admins
                      </Button>
                    </Link>
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
                  <div className="space-y-3">
                    <Link
                      href="/account-details"
                      onClick={closeMenu}
                      className="group block"
                    >
                      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${pathname === "/account-details" ? "bg-primary/10 border-primary/20" : "bg-quaternary/50 border-tertiary/5 hover:bg-primary/5 hover:border-primary/20"}`}>
                        <div className={`p-2.5 rounded-full transition-colors ${pathname === "/account-details" ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"}`}>
                          <User size={20} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-primary truncate group-hover:text-secondary transition-colors">
                            {user.nome}
                          </p>
                          <p className="text-xs text-tertiary truncate capitalize">
                            {user.tipo_usuario}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-tertiary/50 group-hover:text-primary group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    </Link>

                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 font-medium pl-4"
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