"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Loader2,
  Sprout,
  Leaf,
  MoreVertical,
  ArrowRightLeft, // Ícone de mover
  CheckCircle2,
  XCircle,
  AlertTriangle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// --- TIPOS ---
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

// Tipo para o Feedback Visual
interface FeedbackState {
  isOpen: boolean
  type: "success" | "error"
  title: string
  message: string
}

export default function GardenDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const gardenId = params.id

  // --- STATES DE DADOS ---
  const [garden, setGarden] = useState<JardimDetalhe | null>(null)
  const [allGardens, setAllGardens] = useState<JardimDetalhe[]>([]) // Para listar no "Mover"
  const [myPlants, setMyPlants] = useState<PlantaResumo[]>([]) // Plantas "soltas" para adicionar
  const [loading, setLoading] = useState(true)
  
  // --- STATE DE ADICIONAR (Do Menu Principal) ---
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedPlantIdToAdd, setSelectedPlantIdToAdd] = useState<string>("")

  // --- STATE DE MOVER (Do Card da Planta) ---
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [plantToMove, setPlantToMove] = useState<PlantaResumo | null>(null)
  const [targetGardenId, setTargetGardenId] = useState<string>("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- STATE DE FEEDBACK (Modal Bonito) ---
  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  })

  // Função auxiliar de feedback
  const showFeedback = (type: "success" | "error", title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message })
  }

  // 1. CARREGAR DADOS
  const loadData = async () => {
    const token = localStorage.getItem("joja_token")
    if (!token) return router.push("/login")

    try {
      setLoading(true)
      
      const [gardensRes, plantsRes] = await Promise.all([
        axios.get("http://localhost:8000/jardim/meus-jardins", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:8000/planta/minhas-plantas", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      setAllGardens(gardensRes.data) // Guarda todos para o modal de mover

      const currentGarden = gardensRes.data.find((j: any) => j.id.toString() === gardenId)
      
      if (currentGarden) {
        setGarden(currentGarden)
      } else {
        router.push("/my-gardens")
      }

      setMyPlants(plantsRes.data)

    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      showFeedback("error", "Erro de conexão", "Não foi possível carregar as informações do jardim.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (gardenId) loadData()
  }, [gardenId])

  // 2. ADICIONAR PLANTA (Do banco para este jardim)
  const handleAddPlantToGarden = async () => {
    if (!selectedPlantIdToAdd) return
    const token = localStorage.getItem("joja_token")
    if (!token || !garden) return

    setIsSubmitting(true)
    try {
      await axios.post(
        `http://localhost:8000/jardim/${garden.id}/adicionar-planta/${selectedPlantIdToAdd}`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setIsAddOpen(false)
      setSelectedPlantIdToAdd("")
      loadData()
      showFeedback("success", "Planta Adicionada!", "Sua planta agora faz parte deste jardim.")

    } catch (error) {
      console.error(error)
      showFeedback("error", "Erro ao adicionar", "Verifique se a planta já não está neste jardim.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. MOVER PLANTA (Deste jardim para outro)
  const openMoveModal = (e: React.MouseEvent, planta: PlantaResumo) => {
    e.stopPropagation() // Impede que abra o detalhe da planta
    setPlantToMove(planta)
    setTargetGardenId("") // Reseta a seleção anterior
    setIsMoveOpen(true)
  }

  const handleMovePlant = async () => {
    if (!plantToMove || !targetGardenId) return
    const token = localStorage.getItem("joja_token")
    if (!token) return

    setIsSubmitting(true)
    try {
      // Para mover, geralmente usamos a lógica de adicionar ao novo (o backend atualiza a FK)
      await axios.post(
        `http://localhost:8000/jardim/${targetGardenId}/adicionar-planta/${plantToMove.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setIsMoveOpen(false)
      
      // Encontrar nome do jardim destino para mensagem bonita
      const targetName = allGardens.find(g => g.id.toString() === targetGardenId)?.nome || "novo jardim"
      
      showFeedback("success", "Planta Movida!", `"${plantToMove.apelido}" foi movida para ${targetName} com sucesso.`)
      
      setPlantToMove(null)
      loadData()

    } catch (error) {
      console.error(error)
      showFeedback("error", "Erro ao mover", "Não foi possível transferir a planta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-quinquenary text-tertiary">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <span>Abrindo o portão do jardim...</span>
      </div>
    )
  }

  if (!garden) return null

  return (
    <div className="min-h-screen bg-quinquenary pb-20">
      
      {/* HEADER DO JARDIM */}
      <div className="bg-primary text-white py-10 px-6 shadow-md relative overflow-hidden">
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

            {/* MODAL DE ADICIONAR NOVA PLANTA (EXISTENTE) */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-primary hover:bg-gray-100 shadow-lg font-semibold rounded-xl">
                  <Plus className="mr-2 h-5 w-5" /> Adicionar Planta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-tertiary/20 sm:rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-primary">Adicionar ao {garden.nome}</DialogTitle>
                  <DialogDescription className="text-tertiary">
                    Escolha uma das suas plantas existentes para trazer para este jardim.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-tertiary">Selecione a Planta</Label>
                    <Select onValueChange={setSelectedPlantIdToAdd} value={selectedPlantIdToAdd}>
                      <SelectTrigger className="bg-white border-tertiary/30 text-primary rounded-xl">
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
                            Você não tem plantas soltas.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-tertiary/30 text-tertiary rounded-xl">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddPlantToGarden} 
                    className="bg-primary hover:bg-secondary text-white rounded-xl"
                    disabled={isSubmitting || !selectedPlantIdToAdd}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
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
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-tertiary/30 shadow-sm">
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
                className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-tertiary/10 bg-white cursor-pointer hover:-translate-y-1 rounded-3xl"
                onClick={() => router.push(`/my-plants/${planta.id}`)}
              >
                {/* MENU DE OPÇÕES (TRÊS PONTINHOS) */}
                <div className="absolute top-3 right-3 z-20">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white text-tertiary hover:text-primary rounded-full shadow-sm"
                        onClick={(e) => e.stopPropagation()} // IMPEDE O CLIQUE DE ABRIR O CARD
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-tertiary/20 rounded-xl shadow-lg w-48">
                      <DropdownMenuItem 
                        className="text-tertiary focus:text-primary cursor-pointer py-2.5"
                        onClick={(e) => openMoveModal(e, planta)}
                      >
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Mover planta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Imagem da Planta (Topo do Card) */}
                <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                  <img 
                    src={planta.catalogo.img_url} 
                    alt={planta.apelido} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-secondary text-xs font-bold px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider">
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
                    <span className="text-xs text-tertiary bg-quinquenary px-2 py-1 rounded-md">
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

      {/* --- MODAL DE MOVER PLANTA --- */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent className="bg-white border-tertiary/20 sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
               <ArrowRightLeft className="w-5 h-5 text-secondary" /> 
               Mover Planta
            </DialogTitle>
            <DialogDescription className="text-tertiary">
              Deseja mover <strong>{plantToMove?.apelido}</strong> para outro jardim?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-tertiary">Selecione o Jardim de Destino</Label>
              <Select onValueChange={setTargetGardenId} value={targetGardenId}>
                <SelectTrigger className="bg-white border-tertiary/30 text-primary rounded-xl h-11">
                  <SelectValue placeholder="Selecione o jardim..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-tertiary/20 max-h-[200px]">
                  {allGardens
                    .filter(g => g.id.toString() !== gardenId) // Filtra o jardim atual
                    .map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.nome}
                      </SelectItem>
                  ))}
                  {allGardens.filter(g => g.id.toString() !== gardenId).length === 0 && (
                     <div className="p-3 text-sm text-tertiary text-center">
                        Sem outros jardins disponíveis.
                     </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            {targetGardenId && (
                <div className="bg-yellow-50 text-yellow-700 text-xs p-3 rounded-lg flex items-start gap-2 border border-yellow-100">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Ao confirmar, a planta será removida deste jardim e enviada para o destino selecionado.</span>
                </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveOpen(false)} className="border-tertiary/30 text-tertiary rounded-xl">
              Cancelar
            </Button>
            <Button 
              onClick={handleMovePlant} 
              className="bg-primary hover:bg-secondary text-white rounded-xl"
              disabled={isSubmitting || !targetGardenId}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mover Planta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE FEEDBACK (O Bonitão) --- */}
      <AlertDialog 
        open={feedback.isOpen} 
        onOpenChange={(open) => setFeedback(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className={`bg-white sm:rounded-3xl shadow-xl border ${
            feedback.type === 'success' ? 'border-green-100' : 'border-red-100'
        }`}>
            <AlertDialogHeader className="items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300 ${
                    feedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {feedback.type === 'success' ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <AlertDialogTitle className={`text-xl ${
                    feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                    {feedback.title}
                </AlertDialogTitle>
                
                <AlertDialogDescription className="text-tertiary mt-2 text-center">
                    {feedback.message}
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter className="justify-center sm:justify-center mt-4">
                <AlertDialogAction 
                    onClick={() => setFeedback(prev => ({ ...prev, isOpen: false }))} 
                    className={`rounded-xl min-w-[140px] text-white ${
                        feedback.type === 'success' 
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-200 shadow-lg' 
                        : 'bg-red-600 hover:bg-red-700 shadow-red-200 shadow-lg'
                    }`}
                >
                    Ok, entendi
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}