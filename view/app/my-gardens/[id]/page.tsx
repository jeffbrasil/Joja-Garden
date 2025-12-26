"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Droplets,
  Sun,
  CloudRain,
  MoreVertical,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Se tiver shadcn progress, senão remova
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Se tiver shadcn dropdown

export default function SingleGardenPage({
  params,
}: {
  params: { id: string };
}) {
  // Mock dos dados do jardim (futuramente virá do banco pelo ID)
  const jardimInfo = {
    nome: "Minha Horta Vertical",
    descricao: "Jardim da varanda com temperos e medicinais.",
    clima: { temp: "24°C", condicao: "Nublado", umidade: "65%" },
    mensagem:
      "A umidade está ótima! Não precisa regar a maioria das plantas hoje.",
  };

  // Mock das plantas deste jardim
  const [plantas, setPlantas] = useState([
    {
      id: 1,
      nome: "Hortelã",
      especie: "Mentha spicata",
      status: "Saudável",
      proximaRega: "Hoje",
      img: "/placeholder.png",
      saude: 90,
    },
    {
      id: 2,
      nome: "Alecrim",
      especie: "Salvia rosmarinus",
      status: "Cuidado",
      proximaRega: "Amanhã",
      img: "/placeholder.png",
      saude: 45,
    },
    {
      id: 3,
      nome: "Manjericão",
      especie: "Ocimum basilicum",
      status: "Saudável",
      proximaRega: "2 dias",
      img: "/placeholder.png",
      saude: 80,
    },
  ]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen pb-20">
      {/* --- HEADER COM VOLTAR --- */}
      <div className="w-full bg-quaternary pt-8 pb-6 px-6 md:px-12 shadow-sm shadow-tertiary/10">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/my-gardens"
            className="inline-flex items-center text-tertiary hover:text-primary transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para meus jardins
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {jardimInfo.nome}
              </h1>
              <p className="text-tertiary">{jardimInfo.descricao}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors"
              >
                Editar Jardim
              </Button>
       
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl px-6 md:px-12 mt-8 flex flex-col gap-8">
        {/* --- WIDGET DE CLIMA E DICAS (Escopo Externo) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card do Clima */}
          <div className="bg-gradient-to-br from-[#E0F2F1] to-[#C8E6C9] rounded-2xl p-6 flex items-center justify-between shadow-sm border border-tertiary/20">
            <div>
              <p className="text-secondary font-semibold text-sm uppercase tracking-wide">
                Clima Local
              </p>
              <div className="text-4xl font-bold text-primary my-1">
                {jardimInfo.clima.temp}
              </div>
              <p className="text-primary/80 font-medium flex items-center gap-2">
                <CloudRain className="w-5 h-5" /> {jardimInfo.clima.condicao}
              </p>
            </div>
            <div className="bg-white/40 p-4 rounded-full">
              <Sun className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          {/* Card de Dicas/Avisos */}
          <div className="md:col-span-2 bg-quaternary rounded-2xl p-6 border-l-4 border-secondary shadow-sm flex flex-col justify-center">
            <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
              <span className="bg-secondary/10 p-1 rounded-md">
                <Droplets className="w-4 h-4 text-secondary" />
              </span>
              Dica do Dia
            </h3>
            <p className="text-tertiary text-sm md:text-base">
              {jardimInfo.mensagem}
            </p>
          </div>
        </div>

        {/* --- LISTA DE PLANTAS --- */}
        <div>
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            Minhas Plantas{" "}
            <span className="bg-quinquenary text-tertiary px-2 py-0.5 rounded-full text-xs border border-tertiary/20">
              {plantas.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantas.map((planta) => (
              <div
                key={planta.id}
                className="bg-quaternary rounded-xl p-4 shadow-sm hover:shadow-md border border-transparent hover:border-tertiary/30 transition-all group relative"
              >
                {/* Menu de Ações (3 pontinhos) */}
                <div className="absolute top-4 right-4 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 text-tertiary hover:text-primary rounded-full hover:bg-quinquenary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-4">
                  {/* Foto da Planta */}
                  <div className="w-24 h-24 bg-quinquenary rounded-lg flex-shrink-0 flex items-center justify-center text-4xl">
                    🌿
                  </div>

                  {/* Infos Principais */}
                  <div className="flex flex-col justify-center w-full">
                    <h3 className="font-bold text-primary text-lg leading-tight">
                      {planta.nome}
                    </h3>
                    <p className="text-xs text-tertiary italic mb-2">
                      {planta.especie}
                    </p>

                    {/* Status de Rega */}
                    <div className="flex items-center gap-2 text-xs font-medium text-secondary bg-secondary/10 w-fit px-2 py-1 rounded-md">
                      <Calendar className="w-3 h-3" />
                      Rega: {planta.proximaRega}
                    </div>
                  </div>
                </div>

                {/* Barra de Saúde (Opcional - Visual) */}
                <div className="mt-4 pt-4 border-t border-quinquenary">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-tertiary">
                      Saúde da planta
                    </span>
                    {planta.saude < 50 && (
                      <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Precisa de atenção
                      </span>
                    )}
                  </div>
                  {/* Simulando barra de progresso com divs se não tiver o componente */}
                  <div className="w-full h-2 bg-quinquenary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${planta.saude > 60 ? "bg-secondary" : "bg-yellow-500"}`}
                      style={{ width: `${planta.saude}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
