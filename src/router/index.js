import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import DishDetail from '../views/DishDetail.vue'
import CreateDish from '../views/CreateDish.vue'
import EditDish from '../views/EditDish.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/dish/new', name: 'dish-create', component: CreateDish },
    { path: '/dish/:id', name: 'dish-detail', component: DishDetail },
    { path: '/dish/:id/edit', name: 'dish-edit', component: EditDish }
  ]
})

export default router
