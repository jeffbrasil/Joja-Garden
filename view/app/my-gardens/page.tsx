"use client";

import { useState } from "react";
import { Plus, Sprout, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Certifique-se de ter o Dialog do shadcn instalado
import Link from "next/link"; // <--- Adicione isso junto com os outros imports

export default function GardenPage() {
  // Estado para simular a lista de jardins (inicia vazia conforme pedido)
  const [jardins, setJardins] = useState<
    { id: number; nome: string; qtdPlantas: number }[]
  >([]);
  const [novoNome, setNovoNome] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Função para criar um novo jardim (simulação)
  const handleCriarJardim = () => {
    if (!novoNome.trim()) return;

    const novoJardim = {
      id: Date.now(),
      nome: novoNome,
      qtdPlantas: 0,
    };

    setJardins([...jardins, novoJardim]);
    setNovoNome("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] p-6 md:p-12">
      {/* --- HEADER --- */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Meus Jardins</h1>
          <p className="text-tertiary mt-1">
            Gerencie suas coleções e acompanhe o crescimento.
          </p>
        </div>
      </div>

      {/* --- ÁREA DE CONTEÚDO --- */}
      <div className="w-full max-w-7xl">
        {jardins.length === 0 ? (
          // --- ESTADO VAZIO (EMPTY STATE) ---
          // Isso aparece quando não há nenhum jardim criado
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-tertiary/40 rounded-3xl bg-quaternary/50">
            <div className="bg-quinquenary p-6 rounded-full mb-6">
              <Sprout className="w-16 h-16 text-tertiary" />
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">
              Você ainda não tem jardins
            </h2>
            <p className="text-tertiary text-center max-w-md mb-8">
              Crie seu primeiro espaço para organizar suas plantas, receber
              dicas personalizadas e acompanhar o desenvolvimento delas.
            </p>

            {/* Botão que abre o Modal de Criação */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-secondary text-white h-12 px-8 rounded-full shadow-lg hover:shadow-secondary/40 transition-all flex items-center gap-2 text-base">
                  <Plus className="w-5 h-5" />
                  Criar meu primeiro jardim
                </Button>
              </DialogTrigger>

              {/* Conteúdo do Modal */}
              <DialogContent className="bg-quaternary border-tertiary text-primary sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Novo Jardim</DialogTitle>
                  <DialogDescription className="text-tertiary">
                    Dê um nome para o seu novo espaço verde (ex: "Varanda",
                    "Horta").
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="name"
                      className="text-primary font-semibold"
                    >
                      Nome do Jardim
                    </Label>
                    <Input
                      id="name"
                      placeholder="Minha Selva Particular"
                      className="col-span-3 border-tertiary focus:border-secondary"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleCriarJardim}
                    className="bg-primary hover:bg-secondary text-white w-full"
                  >
                    Criar Jardim
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          // --- GRID DE JARDINS (QUANDO JÁ EXISTEM) ---
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card para Adicionar Mais (Sempre visível no grid) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-tertiary/50 rounded-xl hover:bg-tertiary/10 hover:border-secondary transition-all group cursor-pointer">
                  <div className="bg-primary text-white p-3 rounded-full mb-3 shadow-md group-hover:scale-110 transition-transform bg-secondary">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-primary">
                    Novo Jardim
                  </span>
                </button>
              </DialogTrigger>
              {/* Mesmo conteúdo do modal acima (poderia ser componentizado) */}
              <DialogContent className="bg-quaternary border-tertiary text-primary">
                <DialogHeader>
                  <DialogTitle>Novo Jardim</DialogTitle>
                  <DialogDescription>Crie uma nova coleção.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Nome do jardim"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="border-tertiary"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCriarJardim}
                    className="bg-primary text-white w-full"
                  >
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Lista dos Jardins Criados */}
            {jardins.map((jardim) => (
              <Card
                key={jardim.id}
                className="h-64 bg-quaternary border-none shadow-md shadow-tertiary/20 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-secondary"></div>
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-primary">
                        {jardim.nome}
                      </h3>
                      <Sprout className="text-tertiary w-6 h-6" />
                    </div>
                    <p className="text-sm text-tertiary">
                      {jardim.qtdPlantas} plantas
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex -space-x-2">
                      {/* Fake avatars de plantas */}
                      <div className="w-8 h-8 rounded-full bg-tertiary/30 border-2 border-quaternary"></div>
                      <div className="w-8 h-8 rounded-full bg-secondary/30 border-2 border-quaternary"></div>
                    </div>
                    <Link href={`/my-gardens/${jardim.id}`}>
                      <Button
                        variant="ghost"
                        className="text-secondary hover:text-primary hover:bg-transparent p-0 flex items-center gap-1"
                      >
                        Ver detalhes <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
