import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { auth0 } from './auth/auth0.js'
import './assets/style.css'

const pinia = createPinia()

// WICHTIG: Router VOR Auth0 registrieren. Auth0 liest beim Installieren
// app.config.globalProperties.$router, um nach dem Login zur ursprünglich
// gewünschten Seite (appState.target) zu navigieren. Steht .use(router) erst
// nach .use(auth0), kennt Auth0 den Router noch nicht und landet nach dem Login
// immer auf der Startseite – statt z. B. auf /ernaehrungsplan oder im Plan-Wizard.
createApp(App).use(pinia).use(router).use(auth0).mount('#app')
