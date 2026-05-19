import { reactive } from 'vue'

export type ToastType = 'error' | 'warning' | 'success'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastState {
  items: Toast[]
  nextId: number
}

const state = reactive<ToastState>({
  items: [],
  nextId: 0,
})

const DISMISS_MS = 3000

export function useToast() {
  function add(type: ToastType, message: string) {
    const id = state.nextId++
    const toast: Toast = { id, type, message }
    state.items.push(toast)
    setTimeout(() => remove(id), DISMISS_MS)
    return id
  }

  function remove(id: number) {
    const idx = state.items.findIndex(t => t.id === id)
    if (idx !== -1) state.items.splice(idx, 1)
  }

  return {
    items: state.items,
    error: (msg: string) => add('error', msg),
    warning: (msg: string) => add('warning', msg),
    success: (msg: string) => add('success', msg),
    remove,
  }
}
