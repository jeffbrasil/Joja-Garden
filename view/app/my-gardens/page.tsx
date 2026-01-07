"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus,
  Loader2,
  Shovel,
  ArrowRight,
  Flower2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Tipagem baseada no retorno da API
interface Jardim {
  id: number
  nome: string
  plantas: any[] // Array de plantas
}

export default function MyGardensPage() {
  const router = useRouter()
  const [gardens, setGardens] = useState<Jardim[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newGardenName, setNewGardenName] = useState("")

  // Buscar Jardins
  const fetchGardens = async () => {
    const token = localStorage.getItem("joja_token")
    if (!token) return router.push("/login")

    try {
      setLoading(true)
      // Endpoint baseado na imagem fornecida
      const response = await axios.get("http://localhost:8000/jardim/meus-jardins", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGardens(response.data)
    } catch (error) {
      console.error("Erro ao buscar jardins:", error)
      toast.error("Erro ao carregar seus jardins.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGardens()
  }, [])

  // Criar Jardim
  const handleCreateGarden = async () => {
    if (!newGardenName.trim()) return

    const token = localStorage.getItem("joja_token")
    if (!token) return

    try {
      await axios.post(
        "http://localhost:8000/jardim/criar_jardim",
        { nome: newGardenName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success("Jardim criado com sucesso!")
      setIsCreateOpen(false)
      setNewGardenName("")
      fetchGardens() // Recarrega a lista
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar jardim.")
    }
  }

  return (
    <div className="min-h-screen bg-quaternary pb-20">
      {/* HEADER */}
      <div className="bg-primary py-12 px-6 shadow-md mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meus Jardins</h1>
            <p className="text-white/80">Organize suas plantas em espaços dedicados.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90 text-white shadow-lg transition-transform hover:scale-105">
                <Plus className="mr-2 h-5 w-5" /> Novo Jardim
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-tertiary/20">
              <DialogHeader>
                <DialogTitle className="text-primary">Criar novo jardim</DialogTitle>
                <DialogDescription className="text-tertiary">
                  Dê um nome para o seu novo espaço (ex: Varanda, Sala, Quintal).
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="name" className="text-tertiary mb-2 block">Nome do Jardim</Label>
                <Input
                  id="name"
                  value={newGardenName}
                  onChange={(e) => setNewGardenName(e.target.value)}
                  placeholder="Ex: Minha Selva Particular"
                  className="bg-white border-tertiary/30 text-primary"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-tertiary/30 text-tertiary">Cancelar</Button>
                <Button onClick={handleCreateGarden} className="bg-primary hover:bg-secondary text-white">Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-tertiary">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Carregando jardins...</span>
          </div>
        ) : gardens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-tertiary/20 shadow-sm">
            <div className="bg-quinquenary p-6 rounded-full mb-4">
              <Shovel className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Nenhum jardim encontrado</h3>
            <p className="text-tertiary mb-6 text-center max-w-md">
              Você ainda não criou nenhum jardim. Crie espaços para organizar suas plantas por ambiente.
            </p>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              variant="outline" 
              className="border-secondary text-secondary hover:bg-secondary/10"
            >
              Criar meu primeiro jardim
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardens.map((garden) => (
              <Card 
                key={garden.id} 
                className="group hover:shadow-xl transition-all duration-300 border-tertiary/10 bg-white cursor-pointer hover:-translate-y-1"
                onClick={() => router.push(`/my-gardens/${garden.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-quinquenary rounded-lg text-secondary mb-2 group-hover:bg-secondary group-hover:text-white transition-colors">
                      <Flower2 className="w-6 h-6" />
                    </div>
                    <span className="bg-quaternary text-tertiary text-xs px-2 py-1 rounded font-medium">
                      #{garden.id}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-primary">{garden.nome}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-tertiary text-sm">
                    {garden.plantas?.length || 0} planta(s) neste jardim
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full flex items-center text-sm text-secondary font-medium group-hover:underline">
                    Ver detalhes <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}