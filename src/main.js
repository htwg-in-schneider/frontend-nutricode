import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { auth0 } from './auth/auth0.js'
import './assets/style.css'

const pinia = createPinia()

createApp(App).use(pinia).use(auth0).use(router).mount('#app')
