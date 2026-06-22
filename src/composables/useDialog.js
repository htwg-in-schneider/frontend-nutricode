import { reactive, readonly } from 'vue'

/**
 * Zentrale, gestylte Ersatz-UI für die nativen Browser-Popups window.confirm /
 * window.alert. Die nativen Dialoge lassen sich nicht gestalten und zeigen
 * „localhost:5173 sagt …“. Stattdessen hält dieser modulweite (Singleton-)
 * Zustand einen Bestätigungsdialog und eine Toast-Liste, die global von
 * <AppDialogs/> (in App.vue) gerendert werden.
 *
 * Verwendung:
 *   const { confirm, notify } = useDialog()
 *   if (await confirm('Wirklich löschen?', { danger: true })) { … }
 *   notify('Gespeichert ✓', 'success')
 */

const state = reactive({
  confirm: null, // { title, message, confirmText, cancelText, danger, resolve } | null
  toasts: [],    // [{ id, type, message }]
})

let toastId = 0

// Öffnet den Bestätigungsdialog und liefert ein Promise<boolean> (true = bestätigt).
function confirm(message, options = {}) {
  return new Promise((resolve) => {
    state.confirm = {
      title: options.title ?? 'Bestätigen',
      message,
      confirmText: options.confirmText ?? 'OK',
      cancelText: options.cancelText ?? 'Abbrechen',
      danger: options.danger ?? false,
      resolve,
    }
  })
}

// Schließt den Dialog und löst sein Promise mit dem Ergebnis auf.
function resolveConfirm(result) {
  if (state.confirm) {
    state.confirm.resolve(result)
    state.confirm = null
  }
}

// Kurze Einblendung. type: 'success' | 'error' | 'info'
function notify(message, type = 'info') {
  const id = ++toastId
  state.toasts.push({ id, type, message })
  setTimeout(() => removeToast(id), 4000)
}

function removeToast(id) {
  const i = state.toasts.findIndex((t) => t.id === id)
  if (i !== -1) state.toasts.splice(i, 1)
}

export function useDialog() {
  return { state: readonly(state), confirm, notify, resolveConfirm, removeToast }
}
