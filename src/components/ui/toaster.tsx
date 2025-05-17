
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dispatch } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, isDismissing, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            open={!isDismissing}
            onOpenChange={(open) => {
              if (!open) {
                dispatch({
                  type: "REMOVE_TOAST",
                  toastId: id,
                })
              }
            }}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
