import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('@/views/ViewHome.vue'),
	},
	{
		path: '/profile',
		name: 'profile',
		component: () => import('@/views/ViewProfile.vue'),
	},
	{
		path: '/sale',
		name: 'sale',
		component: () => import('@/views/ViewSale.vue'),
	},
	{
		path: '/active',
		name: 'active',
		component: () => import('@/views/ViewActive.vue'),
	},
	{
		path: '/branch',
		name: 'branch',
		component: () => import('@/views/ViewBranch.vue'),
	},
	{
		path: '/service',
		name: 'service',
		component: () => import('@/views/ViewService.vue'),
	},
	{
		path: '/category',
		name: 'category',
		component: () => import('@/views/ViewCategory.vue'),
	},
	{
		path: '/doctors',
		name: 'doctors',
		component: () => import('@/views/ViewDoctors.vue'),
	},
	{
		path: '/datetime',
		name: 'datetime',
		component: () => import('@/views/ViewDatetime.vue'),
	},
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})

// После перезагрузки страницы всегда стартуем со сплэша: он делает проверку
// клиента и сам решает, куда вести дальше. Флаг ловит только первую навигацию.
let isFirstNavigation = true
router.beforeEach((to) => {
	if (!isFirstNavigation) return
	isFirstNavigation = false
	if (to.path !== '/') return '/'
})

export default router
