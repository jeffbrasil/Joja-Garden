"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Loader2,
  Sprout,
  Trash2, // Caso queira implementar remoção futura
  Leaf
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Tipos
interface PlantaResumo {
  id: number
  apelido: string
  catalogo: {
    nome: string
    img_url: string
    categoria: string
  }
}

interface JardimDetalhe {
  id: number
  nome: string
  plantas: PlantaResumo[]
}

export default function GardenDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const gardenId = params.id

  const [garden, setGarden] = useState<JardimDetalhe | null>(null)
  const [myPlants, setMyPlants] = useState<PlantaResumo[]>([]) // Plantas disponíveis para add
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedPlantId, setSelectedPlantId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Carregar dados do Jardim e Plantas do Usuário
  const loadData = async () => {
    const token = localStorage.getItem("joja_token")
    if (!token) return router.push("/login")

    try {
      setLoading(true)
      
      // Buscar Jardins (para filtrar o atual) e Minhas Plantas (para o select)
      const [gardensRes, plantsRes] = await Promise.all([
        axios.get("http://localhost:8000/jardim/meus-jardins", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:8000/planta/minhas-plantas", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      // Encontrar o jardim atual na lista
      const currentGarden = gardensRes.data.find((j: any) => j.id.toString() === gardenId)
      
      if (currentGarden) {
        setGarden(currentGarden)
      } else {
        toast.error("Jardim não encontrado.")
        router.push("/my-gardens")
      }

      setMyPlants(plantsRes.data)

    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar informações.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (gardenId) loadData()
  }, [gardenId])

  // 2. Adicionar Planta ao Jardim
  const handleAddPlantToGarden = async () => {
    if (!selectedPlantId) return

    const token = localStorage.getItem("joja_token")
    if (!token || !garden) return

    setIsSubmitting(true)
    try {
      // Endpoint conforme imagem fornecida
      // POST /jardim/{jardim_id}/adicionar-planta/{planta_id}
      await axios.post(
        `http://localhost:8000/jardim/${garden.id}/adicionar-planta/${selectedPlantId}`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Planta adicionada ao jardim!")
      setIsAddOpen(false)
      setSelectedPlantId("")
      loadData() // Recarrega para mostrar a nova planta na lista

    } catch (error) {
      console.error(error)
      toast.error("Erro ao adicionar planta.", {
        description: "Verifique se a planta já não está neste jardim."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-quaternary text-tertiary">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <span>Abrindo o portão do jardim...</span>
      </div>
    )
  }

  if (!garden) return null

  return (
    <div className="min-h-screen bg-quaternary pb-20">
      
      {/* HEADER DO JARDIM */}
      <div className="bg-primary text-white py-10 px-6 shadow-md relative overflow-hidden">
        {/* Elemento decorativo de fundo */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Leaf size={200} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Button 
            variant="ghost" 
            className="text-white/70 hover:text-white hover:bg-white/10 mb-4 pl-0"
            onClick={() => router.push("/my-gardens")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para lista
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-secondary text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
                  Jardim
                </span>
                <span className="text-white/60 text-sm font-mono">#{garden.id}</span>
              </div>
              <h1 className="text-4xl font-bold">{garden.nome}</h1>
              <p className="text-white/80 mt-1">
                {garden.plantas?.length || 0} planta(s) cultivada(s) aqui.
              </p>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-primary hover:bg-gray-100 shadow-lg font-semibold">
                  <Plus className="mr-2 h-5 w-5" /> Adicionar Planta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-tertiary/20">
                <DialogHeader>
                  <DialogTitle className="text-primary">Adicionar ao {garden.nome}</DialogTitle>
                  <DialogDescription className="text-tertiary">
                    Escolha uma das suas plantas existentes para mover para este jardim.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-tertiary">Selecione a Planta</Label>
                    <Select onValueChange={setSelectedPlantId} value={selectedPlantId}>
                      <SelectTrigger className="bg-white border-tertiary/30 text-primary">
                        <SelectValue placeholder="Escolha uma planta..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-tertiary/20 max-h-[200px]">
                        {myPlants.length > 0 ? (
                          myPlants.map((plant) => (
                            <SelectItem key={plant.id} value={plant.id.toString()}>
                              {plant.apelido} ({plant.catalogo.nome})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-tertiary text-center">
                            Você não tem plantas cadastradas.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-tertiary/30 text-tertiary">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddPlantToGarden} 
                    className="bg-primary hover:bg-secondary text-white"
                    disabled={isSubmitting || !selectedPlantId}
                  >
                    {isSubmitting ? "Adicionando..." : "Confirmar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* LISTA DE PLANTAS DO JARDIM */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {!garden.plantas || garden.plantas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-tertiary/30 shadow-sm">
            <div className="bg-quinquenary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-tertiary/50">
              <Sprout size={32} />
            </div>
            <h3 className="text-lg font-semibold text-primary">Jardim vazio</h3>
            <p className="text-tertiary max-w-sm mx-auto mt-2">
              Este jardim está pronto para receber vida. Clique em "Adicionar Planta" para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {garden.plantas.map((planta) => (
              <Card 
                key={planta.id} 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-tertiary/10 bg-white cursor-pointer hover:-translate-y-1"
                onClick={() => router.push(`/my-plants/${planta.id}`)}
              >
                {/* Imagem da Planta (Topo do Card) */}
                <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                  <img 
                    src={planta.catalogo.img_url} 
                    alt={planta.apelido} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-secondary text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {planta.catalogo.categoria}
                    </span>
                  </div>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-primary mb-1 line-clamp-1">
                    {planta.apelido}
                  </h3>
                  <p className="text-sm text-tertiary italic mb-3 flex items-center gap-1">
                    <Leaf size={12} /> {planta.catalogo.nome}
                  </p>
                  
                  <div className="w-full h-px bg-quinquenary mb-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-tertiary bg-quaternary px-2 py-1 rounded">
                      ID: {planta.id}
                    </span>
                    <span className="text-xs font-medium text-secondary group-hover:underline">
                      Ver cuidados
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}