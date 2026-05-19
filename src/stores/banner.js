import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBannerStore = defineStore('banner', () => {
  const isVisible = ref(true)

  function hideBanner() {
    isVisible.value = false
  }

  return { isVisible, hideBanner }
})
