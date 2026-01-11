"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Info, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title: string
  description: string
  variant?: "danger" | "warning" | "success" | "info"
  confirmText?: string
  cancelText?: string
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  variant = "danger",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  
  const onChange = (open: boolean) => {
    if (!open) onClose()
  }

  // Configuração visual baseada na variante
  const variantConfig = {
    danger: {
      // Usa a cor SENARY (Vermelho)
      icon: <Trash2 className="h-6 w-6 text-senary" />,
      btnClass: "bg-senary hover:bg-senary/90 text-white border-none shadow-md shadow-senary/20",
      titleColor: "text-senary"
    },
    warning: {
      // Usa a cor SEPTENARY (Amarelo)
      // Nota: Usei text-primary no botão amarelo para garantir leitura, pois branco no amarelo fica ruim
      icon: <AlertTriangle className="h-6 w-6 text-septenary" />,
      btnClass: "bg-septenary hover:bg-septenary/80 text-primary font-bold shadow-md shadow-septenary/20",
      titleColor: "text-amber-500" // Um tom um pouco mais escuro para o texto do título ficar legível
    },
    success: {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      btnClass: "bg-green-600 hover:bg-green-700 text-white",
      titleColor: "text-green-700"
    },
    info: {
      icon: <Info className="h-6 w-6 text-blue-500" />,
      btnClass: "bg-blue-500 hover:bg-blue-600 text-white",
      titleColor: "text-blue-600"
    }
  }

  const config = variantConfig[variant]

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="bg-white border-tertiary/20 sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", config.titleColor)}>
            {config.icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-tertiary pt-2 font-medium">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-4 sm:gap-0 mt-4">
          <Button
            disabled={loading}
            variant="outline"
            onClick={onClose}
            className="border-tertiary/30 mx-2 text-tertiary hover:bg-tertiary/5"
          >
            {cancelText}
          </Button>
          <Button
            disabled={loading}
            onClick={onConfirm}
            className={cn("transition-all", config.btnClass)}
          >
            {loading ? "Processando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}