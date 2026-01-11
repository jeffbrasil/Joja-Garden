"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
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
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin // Adicionado para contexto
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

// Tipo para controlar o Modal de Feedback
interface FeedbackState {
  isOpen: boolean
  type: "success" | "error"
  title: string
  message: string
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
  const [isSubmitting, setIsSubmitting] = useState(false)
   
  // States para Deleção
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)

  // State Feedback
  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  })

  // Forms Data
  const [newAction, setNewAction] = useState({ tipo: "rega", descricao: "" })
  const [newImage, setNewImage] = useState({ url: "", titulo: "", descricao: "" })

  // --- FUNÇÃO DE FEEDBACK ---
  const showFeedback = (type: "success" | "error", title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message })
  }

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("joja_token")
      if (!token) return router.push("/login")
       
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
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchAllData()
  }, [params.id, router])

  // --- HANDLERS ---

  const handleRegisterAction = async () => {
    const token = localStorage.getItem("joja_token")
    if (!plant || !token) return

    setIsSubmitting(true)
    try {
        const payload = {
            tipo: newAction.tipo,
            descricao: newAction.descricao,
            data_hora: new Date().toISOString(),
        }

        const res = await axios.post(
            `http://localhost:8000/acao/${plant.id}/registrar`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        setActions([res.data, ...actions])
        setIsActionOpen(false)
        setNewAction({ tipo: "rega", descricao: "" })
        
        showFeedback("success", "Cuidado Registrado!", `Sua ação de ${payload.tipo} foi salva com sucesso.`)
    } catch (error) {
        showFeedback("error", "Erro ao registrar", "Não foi possível salvar o cuidado.")
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleAddImage = async () => {
    const token = localStorage.getItem("joja_token")
    if (!plant || !token) return

    setIsSubmitting(true)
    try {
        const payload = {
            url: newImage.url,
            titulo: newImage.titulo,
            descricao: newImage.descricao,
            data_hora: new Date().toISOString(),
        }

        const res = await axios.post(
            `http://localhost:8000/imagem/${plant.id}/adicionar`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        setGallery([res.data, ...gallery])
        setIsGalleryOpen(false)
        setNewImage({ url: "", titulo: "", descricao: "" })
        
        showFeedback("success", "Foto Adicionada!", "Sua galeria está ficando linda.")
    } catch (error) {
        showFeedback("error", "Erro ao salvar", "Verifique a URL da imagem e tente novamente.")
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleDeleteImage = async () => {
    const token = localStorage.getItem("joja_token")
    if (!imageToDelete || !token) return

    setIsSubmitting(true)
    try {
        await axios.delete(
            `http://localhost:8000/imagem/imagem/${imageToDelete}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )

        setGallery(gallery.filter((img) => img.id !== imageToDelete))
        setIsDeleteModalOpen(false)
        setImageToDelete(null)

        showFeedback("success", "Imagem Removida", "A foto foi excluída da galeria.")
    } catch (error) {
        showFeedback("error", "Erro ao excluir", "Não foi possível remover a imagem.")
    } finally {
        setIsSubmitting(false)
    }
  }

  // Função auxiliar para abrir o modal de delete
  const confirmDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation() 
    setImageToDelete(id)
    setIsDeleteModalOpen(true)
  }

  if (loading || !plant) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-quinquenary text-tertiary">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-secondary" />
        <span>Carregando detalhes...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-quinquenary pb-24">
       
      {/* --- HEADER VERDE (IDENTIDADE VISUAL) --- */}
      <div className="bg-primary pt-10 pb-24 px-6 shadow-xl relative">
        <div className="max-w-7xl mx-auto">
            {/* Botão Voltar */}
            <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 mb-6 h-auto"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para meus jardins
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-secondary text-white border-none px-3 py-1 rounded-full shadow-sm">
                            {plant.catalogo.categoria}
                        </Badge>
                        <span className="text-white/60 text-sm flex items-center">
                             <MapPin className="w-3 h-3 mr-1" /> Jardim #1 {/* Exemplo estático ou buscar do jardim */}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                        {plant.apelido}
                    </h1>
                    <p className="text-white/80 text-lg font-light italic flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-secondary" /> {plant.catalogo.nome_cientifico}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* --- CARD DE DESTAQUE DA PLANTA (OVERLAP) --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-8">
        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-primary/10 inline-block w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                 {/* Imagem de Destaque */}
                 <div className="w-full md:w-48 h-48 md:h-48 rounded-2xl overflow-hidden shrink-0 relative group">
                    <img 
                        src={plant.catalogo.img_url} 
                        alt={plant.apelido}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                 </div>
                 
                 {/* Resumo Rápido */}
                 <div className="flex-1 p-2 md:py-4 md:pr-6 w-full">
                    <h3 className="text-tertiary font-medium mb-4 text-sm uppercase tracking-wider">Cuidados Básicos</h3>
                    <div className="grid grid-cols-3 gap-4">
                         <div className="text-center p-3 bg-quinquenary rounded-2xl">
                            <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                            <span className="text-xs text-tertiary block">Rega</span>
                            <span className="font-bold text-primary text-sm">{plant.catalogo.periodicidade_rega}d</span>
                         </div>
                         <div className="text-center p-3 bg-quinquenary rounded-2xl">
                            <Scissors className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                            <span className="text-xs text-tertiary block">Poda</span>
                            <span className="font-bold text-primary text-sm">{plant.catalogo.periodicidade_poda}d</span>
                         </div>
                         <div className="text-center p-3 bg-quinquenary rounded-2xl">
                            <CalendarIcon className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                            <span className="text-xs text-tertiary block">Adubo</span>
                            <span className="font-bold text-primary text-sm">{plant.catalogo.periodicidade_adubo}d</span>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (TABS) --- */}
      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="overview" className="w-full space-y-8">
           
          {/* Menu das Abas */}
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-white shadow-sm border border-tertiary/10 p-1.5 rounded-2xl h-auto inline-flex min-w-full md:min-w-0">
                <TabsTrigger value="overview" className="gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-tertiary font-medium transition-all hover:text-primary">
                    <Sprout size={18} /> Visão Geral
                </TabsTrigger>
                <TabsTrigger value="diary" className="gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-tertiary font-medium transition-all hover:text-primary">
                    <History size={18} /> Diário
                </TabsTrigger>
                <TabsTrigger value="gallery" className="gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-tertiary font-medium transition-all hover:text-primary">
                    <ImageIcon size={18} /> Galeria
                </TabsTrigger>
            </TabsList>
          </div>

          {/* ABA: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sobre */}
              <Card className="lg:col-span-2 border-none shadow-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-quinquenary pb-2">
                  <CardTitle className="text-xl text-primary font-bold flex items-center gap-2">
                     <div className="p-2 bg-quaternary rounded-full"><Leaf className="w-4 h-4 text-secondary"/></div>
                     Sobre a espécie
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div>
                    <h4 className="font-semibold text-primary/80 mb-2 text-sm uppercase tracking-wide">Descrição</h4>
                    <p className="text-secondary leading-relaxed text-lg font-light">{plant.catalogo.descricao}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary/80 mb-2 text-sm uppercase tracking-wide">Como Cuidar</h4>
                    <div className="bg-quaternary p-6 rounded-2xl border border-tertiary/5">
                      <p className="text-primary leading-relaxed whitespace-pre-line font-medium">
                        {plant.catalogo.instrucoes_cuidado}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ficha Técnica */}
              <Card className="border-none shadow-md h-fit rounded-3xl bg-white">
                <CardHeader>
                  <CardTitle className="text-xl text-primary font-bold">Ficha Técnica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <div className="flex justify-between py-4 border-b border-tertiary/10">
                    <span className="text-tertiary font-medium">Família</span>
                    <span className="font-semibold text-primary">{plant.catalogo.familia}</span>
                  </div>
                  <div className="flex justify-between py-4 border-b border-tertiary/10">
                    <span className="text-tertiary font-medium">Categoria</span>
                    <span className="font-semibold text-primary">{plant.catalogo.categoria}</span>
                  </div>
                  <div className="flex justify-between py-4">
                    <span className="text-tertiary font-medium">ID do Sistema</span>
                    <span className="font-mono text-secondary bg-quinquenary px-2 py-1 rounded-lg">#{plant.id}</span>
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
                  <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6 shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5">
                    <Plus className="mr-2 h-5 w-5" /> Registrar Cuidado
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="bg-white border-none sm:rounded-2xl shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-primary text-xl">Registrar nova ação</DialogTitle>
                    <DialogDescription className="text-tertiary">
                      O que você fez pela <strong>{plant.apelido}</strong> hoje?
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo" className="text-primary font-medium">Tipo de Cuidado</Label>
                      <Select 
                        value={newAction.tipo} 
                        onValueChange={(val) => setNewAction({...newAction, tipo: val})}
                      >
                        <SelectTrigger className="bg-quinquenary/50 border-tertiary/20 text-primary rounded-xl h-12">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-tertiary/10 rounded-xl">
                          <SelectItem value="rega">Rega 💧</SelectItem>
                          <SelectItem value="poda">Poda ✂️</SelectItem>
                          <SelectItem value="adubo">Adubação 💊</SelectItem>
                          <SelectItem value="limpeza">Limpeza ✨</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc" className="text-primary font-medium">Observação</Label>
                      <Textarea 
                        id="desc"
                        className="bg-quinquenary/50 border-tertiary/20 min-h-[100px] text-primary placeholder:text-tertiary/50 rounded-xl"
                        placeholder="Ex: Usei 500ml de água, podei as pontas secas..." 
                        value={newAction.descricao}
                        onChange={(e) => setNewAction({...newAction, descricao: e.target.value})}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsActionOpen(false)} className="text-tertiary rounded-xl">Cancelar</Button>
                    <Button onClick={handleRegisterAction} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Salvar Registro"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {actions.length === 0 ? (
              <EmptyState message="Nenhuma ação registrada ainda. Cuide da sua planta!" />
            ) : (
              <div className="relative border-l-2 border-tertiary/10 ml-4 space-y-8 pb-10">
                {actions.map((action, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    <div className="absolute -left-[9px] top-0 bg-white border-4 border-secondary rounded-full w-5 h-5 group-hover:scale-125 transition-transform shadow-sm"></div>
                    
                    <Card className="w-full hover:shadow-lg transition-all duration-300 bg-white border-none shadow-sm rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className="uppercase font-bold tracking-wider bg-quinquenary text-secondary border-none px-3 py-1">
                            {action.tipo}
                          </Badge>
                          <div className="flex items-center text-xs font-medium text-tertiary gap-1 bg-quinquenary/50 px-3 py-1 rounded-full">
                            <Clock size={12} />
                            {new Date(action.data_hora).toLocaleDateString("pt-BR")} às {new Date(action.data_hora).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <p className="text-primary/90 leading-relaxed text-lg">{action.descricao}</p>
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
                  <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl transition-colors">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Foto
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="bg-white border-none sm:rounded-2xl shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-primary text-xl">Nova Foto</DialogTitle>
                    <DialogDescription className="text-tertiary">Adicione o link da imagem para acompanhar o crescimento.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-primary font-medium">Título</Label>
                      <Input 
                        className="bg-quinquenary/50 border-tertiary/20 text-primary rounded-xl"
                        placeholder="Ex: Folha nova" 
                        value={newImage.titulo}
                        onChange={(e) => setNewImage({...newImage, titulo: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-primary font-medium">URL da Imagem</Label>
                      <Input 
                        className="bg-quinquenary/50 border-tertiary/20 text-primary rounded-xl"
                        placeholder="https://..." 
                        value={newImage.url}
                        onChange={(e) => setNewImage({...newImage, url: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-primary font-medium">Descrição (Opcional)</Label>
                      <Input 
                        className="bg-quinquenary/50 border-tertiary/20 text-primary rounded-xl"
                        placeholder="Detalhes..." 
                        value={newImage.descricao}
                        onChange={(e) => setNewImage({...newImage, descricao: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsGalleryOpen(false)} className="text-tertiary rounded-xl">Cancelar</Button>
                    <Button onClick={handleAddImage} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Salvar Foto"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {gallery.length === 0 ? (
              <EmptyState message="Nenhuma foto adicionada ainda." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((img) => (
                  <div key={img.id} className="group relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <img
                      src={img.url}
                      alt={img.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Botão de Deletar (Só aparece no hover) */}
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-10 w-10 rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white border-2 border-white"
                        onClick={(e) => confirmDelete(e, img.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white pointer-events-none">
                      <p className="font-bold text-xl leading-tight">{img.titulo}</p>
                      <p className="text-sm text-white/80 line-clamp-1 mt-1">{img.descricao}</p>
                      <span className="text-xs text-primary bg-white px-3 py-1 rounded-full mt-3 block font-bold w-fit">
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

      {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (VERMELHO) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-red-100">
             <div className="bg-red-50/50 p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">Apagar Foto?</h2>
                <p className="text-tertiary">
                  Essa imagem será removida permanentemente da sua galeria.
                </p>
             </div>
             <div className="p-6 bg-white">
                <div className="flex gap-3">
                   <Button 
                     variant="outline" 
                     className="flex-1 h-12 rounded-xl border-tertiary/20 hover:bg-gray-50 text-tertiary font-medium"
                     onClick={() => setIsDeleteModalOpen(false)}
                   >
                     Cancelar
                   </Button>
                   <Button 
                     className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 font-semibold border-0"
                     onClick={handleDeleteImage}
                     disabled={isSubmitting}
                   >
                     {isSubmitting ? <Loader2 className="animate-spin" /> : "Sim, Apagar"}
                   </Button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE FEEDBACK (Estilo MyGardens) --- */}
      <AlertDialog 
        open={feedback.isOpen} 
        onOpenChange={(open) => setFeedback(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className="bg-white sm:rounded-3xl shadow-2xl border-none">
            <div className="flex flex-col items-center text-center p-2">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 ${
                    feedback.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-10 h-10" />
                  ) : (
                      <XCircle className="w-10 h-10" />
                  )}
                </div>
                
                <AlertDialogTitle className={`text-2xl font-bold ${
                    feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                    {feedback.title}
                </AlertDialogTitle>
                
                <AlertDialogDescription className="text-tertiary text-lg mt-2 mb-6">
                    {feedback.message}
                </AlertDialogDescription>

                <AlertDialogAction 
                    onClick={() => setFeedback(prev => ({ ...prev, isOpen: false }))} 
                    className={`rounded-xl w-full h-12 text-white font-semibold text-lg shadow-lg ${
                        feedback.type === 'success' 
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                        : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                    }`}
                >
                    Ok!
                </AlertDialogAction>
            </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

// --- COMPONENTE ESTADO VAZIO ---
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-tertiary/20 shadow-sm">
      <div className="bg-quinquenary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sprout size={32} className="text-secondary" />
      </div>
      <p className="text-tertiary font-medium text-lg">{message}</p>
    </div>
  )
}