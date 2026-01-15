"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // 1. Importando o contexto
import {
  ArrowRight,
  Sprout,
  Leaf,
  Sun,
  CloudSun,
  Moon,
  Shovel,
  Sparkles,
  Search,
  Flower2,
  Droplets,
  Scissors,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { catalogoService } from "@/services/catalogoService";
import { api } from "@/services/api";

// --- TIPAGEM ---
interface CatalogoItem {
  id: number;
  nome: string;
  nome_cientifico: string;
  img_url: string;
  categoria?: string;
  descricao?: string;
  familia?: string;
  instrucoes_cuidado?: string;
  periodicidade_rega?: number;
  periodicidade_poda?: number;
  periodicidade_adubo?: number;
}

interface Jardim {
  id: number;
  nome: string;
  plantas: any[];
}

interface MinhaPlanta {
  id: number;
  apelido: string;
  catalogo: CatalogoItem;
}

export default function HomePage() {
  // 2. Usando o AuthContext em vez de estado local para o usuário
  const { user, isAdmin } = useAuth();

  // Estados de Dados
  const [gardens, setGardens] = useState<Jardim[]>([]);
  const [plants, setPlants] = useState<MinhaPlanta[]>([]);
  const [catalogPreview, setCatalogPreview] = useState<CatalogoItem[]>([]);

  // Estado para o Modal
  const [selectedPlant, setSelectedPlant] = useState<CatalogoItem | null>(null);

  // Estados de Carregamento
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(true);

  // --- SAUDAÇÃO ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        text: "Bom dia",
        icon: <Sun className="w-6 h-6 text-yellow-300 animate-pulse" />,
      };
    if (hour < 18)
      return {
        text: "Boa tarde",
        icon: <CloudSun className="w-6 h-6 text-orange-300 animate-pulse" />,
      };
    return {
      text: "Boa noite",
      icon: <Moon className="w-6 h-6 text-blue-300 animate-pulse" />,
    };
  };

  const greeting = getGreeting();

  // --- FETCH DATA ---
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("joja_token");

      // 1. Carregar Catálogo (Sempre carrega para todos)
      try {
        setLoadingCatalog(true);
        const catalogData = await catalogoService.getAll();

        const formattedData = Array.isArray(catalogData)
          ? catalogData.slice(0, 8)
          : [];

        setCatalogPreview(formattedData as unknown as CatalogoItem[]);
      } catch (error) {
        console.error("Erro ao carregar catálogo na home:", error);
      } finally {
        setLoadingCatalog(false);
      }

      // 2. Carregar Jardins e Plantas (APENAS SE NÃO FOR ADMIN)
      // Se for admin, não precisamos buscar esses dados, evitamos erro 403 ou processamento inútil
      if (token && !isAdmin) {
        try {
          setLoadingUserData(true);
          const [gardensRes, plantsRes] = await Promise.allSettled([
            api.get("/jardim/meus-jardins", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/planta/minhas-plantas", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (gardensRes.status === "fulfilled") {
            setGardens(gardensRes.value.data);
          }
          if (plantsRes.status === "fulfilled") {
            setPlants(plantsRes.value.data);
          }
        } catch (error) {
          console.error("Erro crítico ao carregar dados do dashboard:", error);
        } finally {
          setLoadingUserData(false);
        }
      } else {
        // Se for admin ou sem token, para o loading
        setLoadingUserData(false);
      }
    };

    loadData();
  }, [isAdmin]); // Adicionada dependência do isAdmin

  return (
    <div className="min-h-screen bg-quinquenary pb-24 font-poppins overflow-x-hidden relative">
      {/* --- HERO HEADER --- */}
      <div className="bg-primary pt-12 pb-24 px-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 animate-fade-in-up">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-white/90">
              {greeting.icon}
              <span className="text-lg font-medium tracking-wide uppercase opacity-80">
                {greeting.text}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              {/* Usa o user do contexto ou "Visitante" */}
              Olá, {user?.nome?.split(" ")[0] || "Visitante"}!
            </h1>
           
            <p className="text-white/80 text-lg font-light max-w-lg">
              {isAdmin 
                ? "Painel administrativo do JojaGarden." 
                : "Vamos cuidar do seu pedacinho de natureza hoje?"}
            </p>
          </div>

          {/* Stats Card - OCULTO PARA ADMIN */}
          {!isAdmin && (
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white text-center min-w-[100px]">
                <div className="text-3xl font-bold">{gardens.length}</div>
                <div className="text-xs opacity-80 uppercase tracking-wider">
                  Jardins
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white text-center min-w-[100px]">
                <div className="text-3xl font-bold">{plants.length}</div>
                <div className="text-xs opacity-80 uppercase tracking-wider">
                  Plantas
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-10">
        
        {/* 1. ATALHOS RÁPIDOS */}
        <div
          // Ajusta o grid: Se admin, usa colunas menores ou centraliza o único botão
          className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-1 max-w-md mx-auto' : 'md:grid-cols-3'} gap-4 animate-fade-in-up`}
          style={{ animationDelay: "100ms" }}
        >
          {/* SEÇÕES DE USUÁRIO - SÓ RENDERIZA SE !isAdmin */}
          {!isAdmin && (
            <>
              <Link href="/my-plants" className="group">
                <Button className="w-full h-auto py-4 bg-white hover:bg-white text-primary hover:text-secondary shadow-lg shadow-black/5 hover:shadow-xl border-none rounded-2xl flex flex-col items-center gap-2 transition-all hover:-translate-y-1">
                  <div className="p-3 bg-quinquenary/80 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors">
                    <Flower2 size={18} />
                  </div>
                  <span className="font-semibold">Minhas Plantas</span>
                </Button>
              </Link>
              <Link href="/my-gardens" className="group">
                <Button className="w-full h-auto py-4 bg-white hover:bg-white text-primary hover:text-secondary shadow-lg shadow-black/5 hover:shadow-xl border-none rounded-2xl flex flex-col items-center gap-2 transition-all hover:-translate-y-1">
                  <div className="p-3 bg-quinquenary/80 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors">
                    <Shovel className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <span className="font-semibold">Meus Jardins</span>
                </Button>
              </Link>
            </>
          )}

          {/* CATÁLOGO - DISPONÍVEL PARA TODOS */}
          <Link href="/catalog" className="group">
            <Button className="w-full h-auto py-4 bg-secondary hover:bg-secondary text-white shadow-lg shadow-secondary/30 border-none rounded-2xl flex flex-col items-center gap-2 transition-all hover:-translate-y-1 hover:scale-[1.02]">
              <div className="p-3 bg-quinquenary/80 rounded-full group-hover:text-white group-hover:bg-primary">
                <Search className="w-6 h-6 text-primary group-hover:text-white" />
              </div>
              <span className="font-semibold">
                {isAdmin ? "Gerenciar Catálogo" : "Explorar Catálogo"}
              </span>
            </Button>
          </Link>
        </div>

        {/* 2. PRÉVIA DO CATÁLOGO (CARROSSEL) - VISÍVEL PARA TODOS */}
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary fill-tertiary/20" />
              {isAdmin ? "Catálogo do Sistema" : "Descubra"}
            </h2>
            <Link
              href="/catalog"
              className="text-sm font-medium text-tertiary hover:text-secondary flex items-center transition-colors"
            >
              Ver catálogo <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loadingCatalog ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="w-64 h-24 rounded-3xl flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <Carousel
              opts={{ align: "start", loop: true }}
              className="w-full relative group/carousel flex items-center justify-center"
            >
              <CarouselContent className="-ml-4 pb-4">
                {catalogPreview.map((item) => (
                  <CarouselItem key={item.id} className="pl-4 basis-auto">
                    <div
                      onClick={() => setSelectedPlant(item)}
                      className="block group cursor-pointer"
                    >
                      {/* Card Horizontal do Catálogo */}
                      <div className="w-72 bg-white p-3 rounded-3xl shadow-sm hover:shadow-lg border border-tertiary/5 transition-all hover:-translate-y-1 flex items-center gap-4 select-none h-full">
                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          {item.img_url ? (
                            <img
                              src={item.img_url}
                              alt={item.nome}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                                (
                                  e.target as HTMLImageElement
                                ).nextElementSibling?.classList.remove(
                                  "hidden",
                                );
                              }}
                            />
                          ) : null}
                          <div
                            className={`absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-300 ${item.img_url ? "hidden" : ""}`}
                          >
                            <Leaf size={24} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-primary text-sm truncate">
                            {item.nome}
                          </h4>
                          <p className="text-xs text-tertiary italic truncate">
                            {item.nome_cientifico}
                          </p>
                          <div className="text-[10px] text-secondary mt-1 font-medium bg-secondary/10 inline-block px-2 py-0.5 rounded-md">
                            {item.categoria || "Ver detalhes"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden group-hover/carousel:flex -left-4 bg-white border-none shadow-lg text-primary hover:text-secondary items-center justify-center -mt-2" />
              <CarouselNext className="hidden group-hover/carousel:flex -right-4 bg-white border-none shadow-lg text-primary hover:text-secondary items-center justify-center -mt-2" />
            </Carousel>
          )}
        </div>

        {/* 3. E 4. SEÇÕES EXCLUSIVAS DE USUÁRIO (JARDINS E MINHAS PLANTAS) */}
        {!isAdmin && (
          <>
            {/* 3. MEUS JARDINS (CARROSSEL) */}
            <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Shovel className="w-6 h-6 text-secondary" />
                  Seus Jardins
                </h2>
                {gardens.length > 0 && (
                  <Link
                    href="/my-gardens"
                    className="text-sm font-medium text-tertiary hover:text-secondary flex items-center justify-center transition-colors"
                  >
                    Gerenciar <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </div>

              {loadingUserData ? (
                <div className="flex gap-4 overflow-hidden">
                  <Skeleton className="w-72 h-40 rounded-3xl flex-shrink-0" />
                  <Skeleton className="w-72 h-40 rounded-3xl flex-shrink-0" />
                </div>
              ) : gardens.length > 0 ? (
                <Carousel
                  opts={{ align: "start" }}
                  className="w-full relative group/carousel"
                >
                  <CarouselContent className="-ml-4 pb-4">
                    {gardens.map((garden) => (
                      <CarouselItem key={garden.id} className="pl-4 basis-auto">
                        <Link href={`/my-gardens/${garden.id}`}>
                          <div className="w-72 h-40 bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg border border-tertiary/5 transition-all hover:-translate-y-1 group cursor-pointer relative overflow-hidden select-none">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                              <Leaf size={80} className="text-secondary" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-primary truncate">
                                  {garden.nome}
                                </h3>
                                <p className="text-tertiary text-sm">
                                  {garden.plantas?.length || 0} plantas
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-secondary font-bold group-hover:translate-x-2 transition-transform">
                                Abrir <ArrowRight className="ml-1 w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden group-hover/carousel:flex -left-4 bg-white border-none shadow-lg text-primary hover:text-secondary -mt-2" />
                  <CarouselNext className="hidden group-hover/carousel:flex -right-4 bg-white border-none shadow-lg text-primary hover:text-secondary -mt-2" />
                </Carousel>
              ) : (
                <EmptySection
                  icon={<Shovel size={32} />}
                  title="Nenhum jardim criado"
                  link="/my-gardens"
                  linkText="Criar meu primeiro jardim"
                />
              )}
            </div>

            {/* 4. MINHAS PLANTAS (CARROSSEL) */}
            <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  <Sprout className="w-6 h-6 text-secondary" />
                  Suas Plantas
                </h2>
                {plants.length > 0 && (
                  <Link
                    href="/my-plants"
                    className="text-sm font-medium text-tertiary hover:text-secondary flex items-center transition-colors"
                  >
                    Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                )}
              </div>

              {loadingUserData ? (
                <div className="flex gap-4 overflow-hidden">
                  <Skeleton className="w-48 h-64 rounded-3xl flex-shrink-0" />
                  <Skeleton className="w-48 h-64 rounded-3xl flex-shrink-0" />
                </div>
              ) : plants.length > 0 ? (
                <Carousel
                  opts={{ align: "start" }}
                  className="w-full relative group/carousel"
                >
                  <CarouselContent className="-ml-4 pb-6">
                    {plants.map((plant) => (
                      <CarouselItem key={plant.id} className="pl-4 basis-auto">
                        <Link href={`/my-plants/${plant.id}`}>
                          <div className="w-48 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-tertiary/5 transition-all hover:-translate-y-2 group cursor-pointer select-none">
                            <div className="h-32 overflow-hidden relative bg-gray-100">
                              <img
                                src={
                                  plant.catalogo?.img_url ||
                                  "/placeholder-plant.jpg"
                                }
                                alt={plant.apelido}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=300&h=300";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-white text-xs font-medium">
                                  Cuidar
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-primary truncate mb-1">
                                {plant.apelido}
                              </h3>
                              <p className="text-xs text-tertiary italic truncate">
                                {plant.catalogo?.nome || "Planta desconhecida"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden group-hover/carousel:flex -left-4 bg-white border-none shadow-lg text-primary hover:text-secondary -mt-3" />
                  <CarouselNext className="hidden group-hover/carousel:flex -right-4 bg-white border-none shadow-lg text-primary hover:text-secondary -mt-3" />
                </Carousel>
              ) : (
                <EmptySection
                  icon={<Sprout size={32} />}
                  title="Sua coleção está vazia"
                  link="/catalog"
                  linkText="Explorar Catálogo"
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* --- MODAL PERSONALIZADO (Permanece igual) --- */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPlant(null)}
          />

          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedPlant(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all hover:rotate-90"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Coluna Visual */}
            <div className="w-full md:w-5/12 bg-gray-100 relative h-64 md:h-auto">
              {selectedPlant.img_url && selectedPlant.img_url.length > 10 ? (
                <img
                  src={selectedPlant.img_url}
                  alt={selectedPlant.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-quinquenary/20">
                  <Leaf className="w-24 h-24 mb-4" />
                  <span className="text-sm font-medium">
                    Sem imagem disponível
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-xs font-bold uppercase tracking-widest bg-primary/80 backdrop-blur-md px-3 py-1 rounded-lg">
                    {selectedPlant.categoria || "Geral"}
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna Dados */}
            <div className="w-full md:w-7/12 p-8 md:p-10 overflow-y-auto bg-white custom-scrollbar">
              <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-4xl font-bold text-primary mb-2">
                  {selectedPlant.nome}
                </h2>
                <div className="flex items-center gap-2 text-tertiary">
                  <span className="italic font-serif text-lg text-secondary">
                    {selectedPlant.nome_cientifico}
                  </span>
                  {selectedPlant.familia && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-sm">
                        Família {selectedPlant.familia}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sprout className="w-4 h-4" /> Sobre a Espécie
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-justify">
                    {selectedPlant.descricao || "Descrição não disponível."}
                  </p>
                </div>

                <div className="bg-[#FFF8F0] p-6 rounded-2xl border border-orange-100/50">
                  <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4" /> Guia de Cuidados
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedPlant.instrucoes_cuidado ||
                      "Consulte informações específicas para esta planta."}
                  </p>
                </div>

                {/* Cards de Periodicidade */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 mb-1">
                      Rega
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {selectedPlant.periodicidade_rega || "?"}{" "}
                      <span className="text-xs font-normal">dias</span>
                    </span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-green-50/50 rounded-2xl border border-green-100/50 hover:bg-green-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-green-500 mb-1">
                      Poda
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {selectedPlant.periodicidade_poda || "?"}{" "}
                      <span className="text-xs font-normal">dias</span>
                    </span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 hover:bg-amber-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-500 mb-1">
                      Adubo
                    </span>
                    <span className="text-lg font-bold text-amber-700">
                      {selectedPlant.periodicidade_adubo || "?"}{" "}
                      <span className="text-xs font-normal">dias</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pequeno componente auxiliar para seções vazias
function EmptySection({
  icon,
  title,
  link,
  linkText,
}: {
  icon: React.ReactNode;
  title: string;
  link: string;
  linkText: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center justify-center border border-dashed border-gray-300">
      <div className="text-gray-300 mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-500 mb-2">{title}</h3>
      <Link href={link}>
        <Button variant="outline" className="text-primary hover:text-secondary">
          {linkText}
        </Button>
      </Link>
    </div>
  );
}