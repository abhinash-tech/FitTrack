/**
 * useToast hook — wraps sonner's toast for a consistent API.
 * Components call: toast({ title, description, variant })
 */
import { toast as sonnerToast } from "sonner"

type ToastVariant = "default" | "success" | "error" | "warning"

interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    const message = description ? `${title} — ${description}` : title
    switch (variant) {
      case "success":
        sonnerToast.success(message)
        break
      case "error":
        sonnerToast.error(message)
        break
      case "warning":
        sonnerToast.warning(message)
        break
      default:
        sonnerToast(message)
    }
  }
  return { toast }
}
