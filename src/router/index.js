import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'
import Home from '../views/Home.vue'
import DishCatalog from '../views/DishCatalog.vue'
import DishDetail from '../views/DishDetail.vue'
import CreateDish from '../views/CreateDish.vue'
import EditDish from '../views/EditDish.vue'
import Datenschutz from '../views/Datenschutz.vue'
import Impressum from '../views/Impressum.vue'
import Profile from '../views/Profile.vue'
import Admin from '../views/Admin.vue'
import MealPlanList from '../views/MealPlanList.vue'
import MealPlanWizard from '../views/MealPlanWizard.vue'
import AdminMealPlans from '../views/AdminMealPlans.vue'
import AdminMealPlanDetail from '../views/AdminMealPlanDetail.vue'
import AdminUsers from '../views/AdminUsers.vue'
import AdminDishes from '../views/AdminDishes.vue'
import { adminGuard } from './adminGuard.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/gerichte', name: 'dish-catalog', component: DishCatalog },
    { path: '/dish/new', name: 'dish-create', component: CreateDish, beforeEnter: authGuard },
    { path: '/dish/:id', name: 'dish-detail', component: DishDetail },
    { path: '/dish/:id/edit', name: 'dish-edit', component: EditDish, beforeEnter: authGuard },
    { path: '/profil', name: 'profile', component: Profile, beforeEnter: authGuard },
    // Komplexer Vorgang: Ernährungsplan-Wizard (jeder Schritt eine eigene Seite/Maske)
    { path: '/ernaehrungsplan', name: 'mealplans', component: MealPlanList, beforeEnter: authGuard },
    { path: '/ernaehrungsplan/neu', name: 'mealplan-new', component: MealPlanWizard, beforeEnter: authGuard },
    { path: '/ernaehrungsplan/:id', name: 'mealplan-edit', component: MealPlanWizard, beforeEnter: authGuard },
    { path: '/admin', name: 'admin', component: Admin, beforeEnter: adminGuard },
    // Stammdatenverwaltung (Admin-Bereich)
    { path: '/admin/gerichte', name: 'admin-dishes', component: AdminDishes, beforeEnter: adminGuard },
    { path: '/admin/benutzer', name: 'admin-users', component: AdminUsers, beforeEnter: adminGuard },
    // Admin-Nachverfolgung der Vorgänge
    { path: '/admin/ernaehrungsplaene', name: 'admin-mealplans', component: AdminMealPlans, beforeEnter: adminGuard },
    { path: '/admin/ernaehrungsplaene/:id', name: 'admin-mealplan-detail', component: AdminMealPlanDetail, beforeEnter: adminGuard },
    { path: '/datenschutz', name: 'datenschutz', component: Datenschutz },
    { path: '/impressum', name: 'impressum', component: Impressum }
  ],
  // Bei Hash-Links (z. B. #kontakt) sanft zur Ziel-Sektion scrollen
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

export default router
