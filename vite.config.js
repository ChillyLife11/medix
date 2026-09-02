import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
	// Хост бэкенда берём из .env (VITE_API_HOST), чтобы он был в одном месте
	// с MEDIA_BASE в src/config.js.
	const env = loadEnv(mode, process.cwd(), 'VITE_')
	const apiHost = env.VITE_API_HOST ?? 'https://medix.amgs.online'
	const companyId = env.VITE_COMPANY_ID ?? '3'
	// Хост, с которого раздаются файлы сборки. По умолчанию тот же, что у API.
	const assetHost = env.VITE_ASSET_HOST ?? apiHost

	return {
		// На сервере мини-апп живёт в подпапке компании — туда её распаковывает
		// company/unzip после деплоя. Ссылки на файлы делаем полными, вместе с
		// хостом: <host>/max/app-<company_id>/assets/... Локально dev-сервер
		// отдаёт всё из корня. VITE_BASE перебивает оба варианта.
		base: env.VITE_BASE ?? (command === 'build' ? `${assetHost}/max/app-${companyId}/` : '/'),
		plugins: [vue(), tailwindcss()],
		build: {
			rollupOptions: {
				output: {
					// Картинки складываем в dist/images, остальное (шрифты, css)
					// остаётся в dist/assets. svg не берём — у нас это
					// шрифтовые файлы Amstelvar/OpenSans.
					assetFileNames: (asset) => {
						const name = asset.names?.[0] ?? asset.name ?? ''
						return /\.(png|jpe?g|webp|gif|avif)$/i.test(name)
							? 'images/[name]-[hash][extname]'
							: 'assets/[name]-[hash][extname]'
					},
				},
			},
		},
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		server: {
			// доступ по сети (для телефона в той же сети) и через туннель (cloudflared/ngrok),
			// чтобы открывать мини-апп в реальном клиенте MAX
			host: true,
			allowedHosts: true,
			// прокси на бэкенд — обход CORS в dev (как в React-оригинале)
			port: '5174',
			proxy: {
				'/api': {
					target: apiHost,
					changeOrigin: true,
					secure: true,
				},
			},
		},
	}
})
