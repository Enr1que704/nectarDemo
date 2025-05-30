import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import WeatherView from '../views/WeatherView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/view-users',
      name: 'view-users',
      component: () => import('../views/ViewUsers.vue'),
    },
    {
      path: '/add-user',
      name: 'add-user',
      component: () => import('../components/AddUser.vue'),
    },
    {
      path: '/weather',
      name: 'weather',
      component: () => import('../views/WeatherView.vue'),
    },
  ],
})

export default router
