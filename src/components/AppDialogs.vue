<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useDialog } from '../composables/useDialog.js'

/**
 * Rendert global den zentralen Bestätigungsdialog und die Toast-Einblendungen
 * (siehe composables/useDialog.js). Einmal in App.vue eingebunden; ersetzt die
 * nativen Browser-Popups confirm/alert durch gestaltete, markenkonforme UI.
 */
const { state, resolveConfirm, removeToast } = useDialog()

// Esc bricht einen offenen Bestätigungsdialog ab (entspricht "Abbrechen").
function onKeydown(e) {
  if (e.key === 'Escape' && state.confirm) resolveConfirm(false)
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- Bestätigungsdialog (modal) -->
  <Teleport to="body">
    <Transition name="dlg-fade">
      <div
        v-if="state.confirm"
        class="dlg-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="resolveConfirm(false)"
      >
        <div class="dlg-box">
          <h2 class="dlg-title">{{ state.confirm.title }}</h2>
          <p class="dlg-message">{{ state.confirm.message }}</p>
          <div class="dlg-actions">
            <button type="button" class="btn btn-outline" @click="resolveConfirm(false)">
              {{ state.confirm.cancelText }}
            </button>
            <button
              type="button"
              :class="state.confirm.danger ? 'btn btn-danger' : 'btn btn-accent'"
              @click="resolveConfirm(true)"
            >
              {{ state.confirm.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Toast-Einblendungen -->
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="t in state.toasts"
          :key="t.id"
          :class="['toast', `toast-${t.type}`]"
          @click="removeToast(t.id)"
        >
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* ===== Modal ===== */
.dlg-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}
.dlg-box {
  background: #fff;
  border-radius: 14px;
  padding: 1.6rem 1.6rem 1.3rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}
.dlg-title {
  margin: 0 0 0.6rem;
  font-size: 1.2rem;
  color: var(--color-primary-dark);
}
.dlg-message {
  margin: 0 0 1.4rem;
  color: #444;
  line-height: 1.5;
}
.dlg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  flex-wrap: wrap;
}

/* ===== Toasts ===== */
.toast-stack {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 1100;
  max-width: min(360px, calc(100vw - 2rem));
}
.toast {
  padding: 0.8rem 1rem;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}
.toast-success {
  background: var(--color-primary-dark);
}
.toast-error {
  background: var(--color-danger);
}
.toast-info {
  background: #37474f;
}

/* ===== Übergänge ===== */
.dlg-fade-enter-active,
.dlg-fade-leave-active {
  transition: opacity 0.18s ease;
}
.dlg-fade-enter-from,
.dlg-fade-leave-to {
  opacity: 0;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
