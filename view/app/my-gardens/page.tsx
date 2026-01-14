"use client"

import React, { useEffect, useState } from "react"
import { api } from "@/services/api";
import { useRouter } from "next/navigation"
import {
  Plus,
  Loader2,
  Shovel,
  ArrowRight,
  Flower2,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  AlertTriangle,
  Sprout,
  Ban,
  CheckCircle2,
  XCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

// --- TIPOS ---
interface Jardim {
  id: number
  nome: string
  plantas: any[]
}

interface FeedbackState {
  isOpen: boolean
  type: "success" | "error"
  title: string
  message: string
}

export default function MyGardensPage() {
  const router = useRouter()
  const [gardens, setGardens] = useState<Jardim[]>([])
  const [loading, setLoading] = useState(true)
  
  // States de Ação
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newGardenName, setNewGardenName] = useState("")
  
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [gardenToRename, setGardenToRename] = useState<Jardim | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const [gardenToDelete, setGardenToDelete] = useState<Jardim | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State de Feedback
  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  })

  // --- FUNÇÕES AUXILIARES ---
  const showFeedback = (type: "success" | "error", title: string, message: string) => {
    setFeedback({ isOpen: true, type, title, message })
  }

  const fetchGardens = async () => {
    const token = localStorage.getItem("joja_token")
    if (!token) return router.push("/login")

    try {
      setLoading(true)
      const response = await api.get("/jardim/meus-jardins", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGardens(response.data)
    } catch (error) {
      console.error("Erro ao buscar jardins:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGardens()
  }, [])

  // --- HANDLERS ---
  const handleCreateGarden = async () => {
    if (!newGardenName.trim()) return
    const token = localStorage.getItem("joja_token")
    if (!token) return

    try {
      await api.post(
        "/jardim/criar_jardim",
        { nome: newGardenName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIsCreateOpen(false)
      setNewGardenName("")
      fetchGardens()
      showFeedback("success", "Jardim Criado!", "Seu novo espaço verde está pronto.")
    } catch (error) {
      console.error(error)
      showFeedback("error", "Erro ao criar", "Não foi possível criar o jardim.")
    }
  }

  const openRenameModal = (e: React.MouseEvent, garden: Jardim) => {
    e.stopPropagation() 
    setGardenToRename(garden)
    setRenameValue(garden.nome)
    setIsRenameOpen(true)
  }

  const handleRenameGarden = async () => {
    if (!gardenToRename || !renameValue.trim()) return
    const token = localStorage.getItem("joja_token")
    if (!token) return

    try {
      await api.put(
        `/jardim/${gardenToRename.id}/renomear`,
        null,
        { 
            headers: { Authorization: `Bearer ${token}` },
            params: { novo_nome: renameValue }
        }
      )
      setIsRenameOpen(false)
      fetchGardens()
      showFeedback("success", "Renomeado!", `Atualizado para "${renameValue}".`)
    } catch (error) {
      showFeedback("error", "Erro", "Falha ao renomear o jardim.")
    }
  }

  const openDeleteModal = (e: React.MouseEvent, garden: Jardim) => {
    e.stopPropagation() 
    setGardenToDelete(garden)
    if (garden.plantas && garden.plantas.length > 0) {
        setIsBlockedModalOpen(true)
    } else {
        setIsDeleteModalOpen(true)
    }
  }

  const handleDeleteGarden = async () => {
    if (!gardenToDelete) return
    const token = localStorage.getItem("joja_token")
    if (!token) return

    setIsDeleting(true)
    try {
      await api.delete(`/jardim/${gardenToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsDeleteModalOpen(false)
      showFeedback("success", "Jardim Excluído", `O espaço "${gardenToDelete.nome}" foi removido.`)
      setGardenToDelete(null)
      fetchGardens()
    } catch (error) {
      showFeedback("error", "Erro", "Não foi possível excluir o jardim.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-quinquenary pb-24">
      
      {/* --- HEADER COM FUNDO VERDE (IDENTIDADE VISUAL) --- */}
      <div className="bg-primary pt-10 pb-16 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              Meus Jardins
            </h1>
            <p className="text-white/80 text-lg font-light">
              Gerencie seus espaços e cultive suas plantas.
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold shadow-lg hover:shadow-secondary/30 transition-all hover:-translate-y-0.5 rounded-xl px-6 h-12 text-md">
                <Plus className="mr-2 h-5 w-5" /> Novo Jardim
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-none sm:rounded-2xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary font-bold">Criar novo jardim</DialogTitle>
                <DialogDescription className="text-tertiary">
                  Como você quer chamar seu novo espaço verde?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="name" className="text-primary font-medium mb-2 block">Nome do Jardim</Label>
                <Input
                  id="name"
                  value={newGardenName}
                  onChange={(e) => setNewGardenName(e.target.value)}
                  placeholder="Ex: Varanda Solar"
                  className="bg-quinquenary/50 border-tertiary/20 focus:border-secondary focus:ring-secondary/20 rounded-xl h-11"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-tertiary hover:text-primary rounded-xl">
                    Cancelar
                </Button>
                <Button onClick={handleCreateGarden} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6">
                    Criar Jardim
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- CONTEÚDO (CARDS) --- */}
      {/* Margem negativa para os cards entrarem um pouco no header (opcional, mas moderno) ou padding normal */}
      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="bg-white p-4 rounded-full shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          </div>
        ) : gardens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-tertiary/20 shadow-sm mt-8">
            <div className="bg-quinquenary p-6 rounded-full mb-4">
              <Shovel className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Nenhum jardim encontrado</h3>
            <p className="text-tertiary mb-6 text-center max-w-md">
              Você ainda não criou nenhum jardim. Comece agora!
            </p>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              variant="outline" 
              className="border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl transition-colors"
            >
              Criar meu primeiro jardim
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardens.map((garden) => (
              <Card 
                key={garden.id} 
                className="group relative hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-none ring-1 ring-tertiary/5 bg-white cursor-pointer hover:-translate-y-1 rounded-3xl overflow-hidden"
                onClick={() => router.push(`/my-gardens/${garden.id}`)}
              >
                {/* MENU DE OPÇÕES (3 PONTINHOS) */}
                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8 bg-white/90 hover:bg-white text-tertiary shadow-sm rounded-full"
                                onClick={(e) => e.stopPropagation()} 
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-tertiary/10 rounded-xl shadow-xl">
                            <DropdownMenuItem 
                                className="text-tertiary focus:text-primary focus:bg-quinquenary cursor-pointer py-2 px-3 rounded-lg mx-1 my-1"
                                onClick={(e) => openRenameModal(e, garden)}
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Renomear
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2 px-3 rounded-lg mx-1 my-1"
                                onClick={(e) => openDeleteModal(e, garden)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CardHeader className="pb-2 pt-6 px-6">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-quinquenary rounded-2xl text-secondary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                      <Flower2 className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-primary truncate pr-2">
                      {garden.nome}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-3 px-6">
                  <div className="flex items-center text-tertiary text-sm bg-quinquenary/50 w-fit px-3 py-1.5 rounded-lg border border-tertiary/5">
                    <Sprout className="w-3.5 h-3.5 mr-2 text-secondary" />
                    <span className="font-medium">{garden.plantas?.length || 0}</span>
                    <span className="ml-1 opacity-80">planta(s)</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 px-6 pb-6">
                  <div className="w-full flex items-center text-sm text-secondary font-bold group-hover:translate-x-1 transition-transform">
                    Ver detalhes <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DE RENOMEAR --- */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-white border-none sm:rounded-2xl shadow-2xl">
            <DialogHeader>
            <DialogTitle className="text-primary text-xl">Renomear Jardim</DialogTitle>
            <DialogDescription className="text-tertiary">
                Alterar o nome do jardim: <span className="font-semibold text-primary">{gardenToRename?.nome}</span>
            </DialogDescription>
            </DialogHeader>
            <div className="py-4">
            <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="bg-quinquenary/50 border-tertiary/20 focus:border-secondary rounded-xl"
            />
            </div>
            <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameOpen(false)} className="text-tertiary rounded-xl">Cancelar</Button>
            <Button onClick={handleRenameGarden} className="bg-primary hover:bg-primary/90 text-white rounded-xl">Salvar Alterações</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE BLOQUEIO (Amarelo) --- */}
      <AlertDialog open={isBlockedModalOpen} onOpenChange={setIsBlockedModalOpen}>
        <AlertDialogContent className="bg-white border-l-4 border-l-amber-500 sm:rounded-2xl shadow-xl">
            <AlertDialogHeader className="items-start">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-full">
                        <Ban className="w-6 h-6 text-amber-600" />
                    </div>
                    <AlertDialogTitle className="text-amber-900 text-xl font-bold">Ação Bloqueada</AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-tertiary text-base">
                    Este jardim <strong>não está vazio</strong>. Por segurança, você precisa mover ou excluir as plantas dele antes de excluir o jardim inteiro.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <AlertDialogAction 
                    onClick={() => setIsBlockedModalOpen(false)} 
                    className="bg-amber-500 text-white hover:bg-amber-600 rounded-xl w-full sm:w-auto"
                >
                    Entendi
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- MODAL DE EXCLUSÃO (Vermelho) --- */}
      {isDeleteModalOpen && gardenToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-red-100">
             <div className="bg-red-50/50 p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">Tem certeza?</h2>
                <p className="text-tertiary">
                  Você vai excluir <strong>{gardenToDelete.nome}</strong>.<br/>
                  Essa ação não pode ser desfeita.
                </p>
             </div>
             <div className="p-6 bg-white">
                <div className="flex gap-3">
                   <Button 
                     variant="outline" 
                     className="flex-1 h-12 rounded-xl border-tertiary/20 hover:bg-gray-50 text-tertiary font-medium"
                     onClick={() => setIsDeleteModalOpen(false)}
                     disabled={isDeleting}
                   >
                     Cancelar
                   </Button>
                   <Button 
                     className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 font-semibold border-0"
                     onClick={handleDeleteGarden}
                     disabled={isDeleting}
                   >
                     {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sim, Excluir"}
                   </Button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE FEEDBACK (Sucesso/Erro) --- */}
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