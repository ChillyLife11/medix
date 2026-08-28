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

// База сборки может быть полным адресом (`https://host/max/app-1/`) — так файлы
// раздаются с хоста клиники. Роутеру нужен только путь, иначе он приклеит его
// к текущему адресу целиком.
const basePath = import.meta.env.BASE_URL.replace(/^\w+:\/\/[^/]+/, '')

const router = createRouter({
	history: createWebHistory(basePath),
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
