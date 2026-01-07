"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Droplets,
  Scissors,
  Calendar as CalendarIcon,
  Sprout,
  History,
  Image as ImageIcon,
  Plus,
  Clock,
  Leaf,
  Loader2
} from "lucide-react"

// Componentes Shadcn UI
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// --- TIPAGEM ---
interface Catalogo {
  id: number
  nome: string
  nome_cientifico: string
  categoria: string
  familia: string
  descricao: string
  instrucoes_cuidado: string
  img_url: string
  periodicidade_rega: number
  periodicidade_poda: number
  periodicidade_adubo: number
}

interface MinhaPlantaDetalhe {
  id: number
  apelido: string
  catalogo: Catalogo
}

interface Acao {
  id: number
  tipo: string
  descricao: string
  data_hora: string
}

interface GaleriaImagem {
  id: number
  url: string
  descricao: string
  titulo: string
  data_hora: string
}

export default function PlantDetailsPage() {
  const params = useParams()
  const router = useRouter()

  // Dados
  const [plant, setPlant] = useState<MinhaPlantaDetalhe | null>(null)
  const [actions, setActions] = useState<Acao[]>([])
  const [gallery, setGallery] = useState<GaleriaImagem[]>([])

  // UI States
  const [loading, setLoading] = useState(true)
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  // Forms Data
  const [newAction, setNewAction] = useState({ tipo: "rega", descricao: "" })
  const [newImage, setNewImage] = useState({ url: "", titulo: "", descricao: "" })

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("joja_token")
      if (!token) {
        toast.error("Sessão expirada", { description: "Faça login novamente." })
        router.push("/login")
        return
      }
      
      const plantId = params.id

      try {
        setLoading(true)
        
        const [plantRes, actionsRes, galleryRes] = await Promise.all([
          axios.get(`http://localhost:8000/planta/${plantId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:8000/acao/${plantId}/acoes`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:8000/imagem/${plantId}/galeria`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        setPlant(plantRes.data)
        
        // Ordenar ações (mais recente primeiro)
        setActions(
          actionsRes.data.sort(
            (a: Acao, b: Acao) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
          )
        )
        
        setGallery(galleryRes.data)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast.error("Erro ao carregar dados", { description: "Não foi possível buscar as informações da planta." })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchAllData()
  }, [params.id, router])

  // --- FUNÇÕES DE REGISTRO ---

  const handleRegisterAction = async () => {
    const token = localStorage.getItem("joja_token")
    if (!plant || !token) return

    const payload = {
      tipo: newAction.tipo,
      descricao: newAction.descricao,
      data_hora: new Date().toISOString(),
    }

    const promise = axios.post(
      `http://localhost:8000/acao/${plant.id}/registrar`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    toast.promise(promise, {
      loading: 'Registrando cuidado...',
      success: (res) => {
        setActions([res.data, ...actions])
        setIsActionOpen(false)
        setNewAction({ tipo: "rega", descricao: "" })
        return `Ação de ${newAction.tipo} registrada!`
      },
      error: 'Erro ao registrar ação.'
    })
  }

  const handleAddImage = async () => {
    const token = localStorage.getItem("joja_token")
    if (!plant || !token) return

    const payload = {
      url: newImage.url,
      titulo: newImage.titulo,
      descricao: newImage.descricao,
      data_hora: new Date().toISOString(),
    }

    const promise = axios.post(
      `http://localhost:8000/imagem/${plant.id}/adicionar`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    toast.promise(promise, {
      loading: 'Salvando foto...',
      success: (res) => {
        setGallery([res.data, ...gallery])
        setIsGalleryOpen(false)
        setNewImage({ url: "", titulo: "", descricao: "" })
        return 'Foto adicionada à galeria!'
      },
      error: 'Erro ao salvar foto.'
    })
  }

  if (loading || !plant) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-quaternary text-tertiary">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <span>Carregando detalhes da planta...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* --- HERO HEADER --- */}
      <div className="relative h-72 md:h-96 w-full bg-primary overflow-hidden shadow-md">
        <img
          src={plant.catalogo.img_url}
          alt={plant.catalogo.nome}
          className="w-full h-full object-cover opacity-50 blur-[2px] scale-105"
        />
        {/* Gradiente usando a cor Primary para suavizar */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

        <div className="absolute top-6 left-4 md:left-8 z-10">
          <Button
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 container mx-auto">
          <Badge className="mb-3 bg-secondary hover:bg-secondary/90 border-none text-white px-3 py-1 text-sm font-medium shadow-sm">
            {plant.catalogo.categoria}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
            {plant.apelido}
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-medium italic flex items-center gap-2 drop-shadow-sm">
            <Leaf className="h-5 w-5 text-secondary" /> {plant.catalogo.nome_cientifico}
          </p>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="container mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <Tabs defaultValue="overview" className="w-full space-y-8">
          
          <TabsList className="bg-quaternary shadow-md shadow-tertiary/10 border border-tertiary/10 p-1.5 rounded-xl h-auto flex justify-start md:inline-flex w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="overview" className="gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-tertiary font-medium transition-all hover:text-primary">
              <Sprout size={18} /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="diary" className="gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-tertiary font-medium transition-all hover:text-primary">
              <History size={18} /> Diário
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-tertiary font-medium transition-all hover:text-primary">
              <ImageIcon size={18} /> Galeria
            </TabsTrigger>
          </TabsList>

          {/* ABA: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cards de Métricas */}
              <InfoCard 
                icon={<Droplets className="h-6 w-6 text-blue-500" />} 
                title="Rega" 
                value={`A cada ${plant.catalogo.periodicidade_rega} dias`} 
                sub="Mantenha o solo úmido"
              />
              <InfoCard 
                icon={<Scissors className="h-6 w-6 text-orange-500" />} 
                title="Poda" 
                value={`A cada ${plant.catalogo.periodicidade_poda} dias`} 
                sub="Remova folhas secas"
              />
              <InfoCard 
                icon={<CalendarIcon className="h-6 w-6 text-purple-500" />} 
                title="Adubação" 
                value={`A cada ${plant.catalogo.periodicidade_adubo} dias`} 
                sub="Rico em nutrientes"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border border-tertiary/20 shadow-sm bg-quaternary/30">
                <CardHeader>
                  <CardTitle className="text-xl text-primary font-bold">Sobre a espécie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-primary/80 mb-2">Descrição</h4>
                    <p className="text-tertiary leading-relaxed">{plant.catalogo.descricao}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary/80 mb-2">Como Cuidar</h4>
                    <div className="bg-quinquenary p-5 rounded-lg border border-tertiary/10">
                      <p className="text-primary leading-relaxed whitespace-pre-line font-medium">
                        {plant.catalogo.instrucoes_cuidado}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-tertiary/20 shadow-sm h-fit bg-white">
                <CardHeader>
                  <CardTitle className="text-xl text-primary font-bold">Ficha Técnica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-tertiary/10">
                    <span className="text-tertiary font-medium">Família</span>
                    <span className="font-semibold text-primary">{plant.catalogo.familia}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-tertiary/10">
                    <span className="text-tertiary font-medium">Categoria</span>
                    <span className="font-semibold text-primary">{plant.catalogo.categoria}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-tertiary font-medium">ID do Sistema</span>
                    <span className="font-mono text-secondary bg-quinquenary px-2 py-1 rounded">#{plant.id}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA: DIÁRIO */}
          <TabsContent value="diary" className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-primary">Linha do Tempo</h2>
              
              <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-secondary text-white rounded-full px-6 shadow-md shadow-primary/20 transition-all hover:scale-105">
                    <Plus className="mr-2 h-5 w-5" /> Registrar Cuidado
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="bg-white border-tertiary/20 sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-primary">Registrar nova ação</DialogTitle>
                    <DialogDescription className="text-tertiary">
                      O que você fez pela {plant.apelido} hoje?
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-tertiary">Tipo de Cuidado</Label>
                      <Select 
                        value={newAction.tipo} 
                        onValueChange={(val) => setNewAction({...newAction, tipo: val})}
                      >
                        <SelectTrigger className="bg-white border-tertiary/30 text-primary">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-tertiary/20">
                          <SelectItem value="rega">Rega 💧</SelectItem>
                          <SelectItem value="poda">Poda ✂️</SelectItem>
                          <SelectItem value="adubo">Adubação 💊</SelectItem>
                          <SelectItem value="limpeza">Limpeza ✨</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc" className="text-tertiary">Observação</Label>
                      <Textarea 
                        id="desc"
                        className="bg-white border-tertiary/30 min-h-[100px] text-primary placeholder:text-tertiary/50"
                        placeholder="Ex: Usei 500ml de água, podei as pontas secas..." 
                        value={newAction.descricao}
                        onChange={(e) => setNewAction({...newAction, descricao: e.target.value})}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsActionOpen(false)} className="border-tertiary/30 text-tertiary">Cancelar</Button>
                    <Button onClick={handleRegisterAction} className="bg-primary hover:bg-secondary text-white">Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {actions.length === 0 ? (
              <EmptyState message="Nenhuma ação registrada ainda. Cuide da sua planta!" />
            ) : (
              <div className="relative border-l-2 border-tertiary/20 ml-4 space-y-8 pb-10">
                {actions.map((action, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    <div className="absolute -left-[9px] top-0 bg-white border-4 border-secondary rounded-full w-5 h-5 group-hover:scale-110 transition-transform shadow-sm"></div>
                    
                    <Card className="w-full hover:shadow-md transition-shadow bg-quaternary/30 border-tertiary/20">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className="uppercase font-bold tracking-wider bg-white text-secondary border-secondary/30">
                            {action.tipo}
                          </Badge>
                          <div className="flex items-center text-xs font-medium text-tertiary gap-1 bg-white border border-tertiary/10 px-2 py-1 rounded-full">
                            <Clock size={12} />
                            {new Date(action.data_hora).toLocaleDateString("pt-BR")} às {new Date(action.data_hora).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <p className="text-primary/90 leading-relaxed">{action.descricao}</p>
                      </CardContent>
                    </Card>

                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ABA: GALERIA */}
          <TabsContent value="gallery" className="animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-primary">Álbum de Fotos</h2>
              
              <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 bg-white">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Foto
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="bg-white border-tertiary/20 sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-primary">Nova Foto</DialogTitle>
                    <DialogDescription className="text-tertiary">Adicione o link da imagem para acompanhar o crescimento.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-tertiary">Título</Label>
                      <Input 
                        className="bg-white border-tertiary/30 text-primary"
                        placeholder="Ex: Folha nova" 
                        value={newImage.titulo}
                        onChange={(e) => setNewImage({...newImage, titulo: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-tertiary">URL da Imagem</Label>
                      <Input 
                        className="bg-white border-tertiary/30 text-primary"
                        placeholder="https://..." 
                        value={newImage.url}
                        onChange={(e) => setNewImage({...newImage, url: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-tertiary">Descrição (Opcional)</Label>
                      <Input 
                        className="bg-white border-tertiary/30 text-primary"
                        placeholder="Detalhes..." 
                        value={newImage.descricao}
                        onChange={(e) => setNewImage({...newImage, descricao: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsGalleryOpen(false)} className="border-tertiary/30 text-tertiary">Cancelar</Button>
                    <Button onClick={handleAddImage} className="bg-primary hover:bg-secondary text-white">Salvar Foto</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {gallery.length === 0 ? (
              <EmptyState message="Nenhuma foto adicionada ainda." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((img) => (
                  <div key={img.id} className="group relative aspect-square bg-quaternary rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-tertiary/20">
                    <img
                      src={img.url}
                      alt={img.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                      <p className="font-bold text-lg leading-tight">{img.titulo}</p>
                      <p className="text-sm text-white/80 line-clamp-1 mt-1">{img.descricao}</p>
                      <span className="text-xs text-secondary bg-white px-2 py-1 rounded mt-2 block font-medium w-fit">
                        {new Date(img.data_hora).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTES AUXILIARES ---

function InfoCard({ icon, title, value, sub }: any) {
  return (
    <Card className="border border-tertiary/20 shadow-sm shadow-tertiary/5 hover:shadow-tertiary/10 transition-shadow bg-quaternary/50">
      <CardContent className="p-6 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-white shadow-sm border border-tertiary/10">
          {icon}
        </div>
        <div>
          <p className="text-xs text-tertiary uppercase font-bold tracking-wider mb-1">{title}</p>
          <p className="text-primary font-bold text-lg leading-none mb-1">{value}</p>
          <p className="text-tertiary/80 text-xs font-medium">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 bg-quaternary/30 rounded-2xl border-2 border-dashed border-tertiary/20">
      <div className="bg-white border border-tertiary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-tertiary/50">
        <Sprout size={32} />
      </div>
      <p className="text-tertiary font-medium">{message}</p>
    </div>
  )
}