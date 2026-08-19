import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// Хост бэкенда берём из .env (VITE_API_HOST), чтобы он был в одном месте
	// с MEDIA_BASE в src/config.js.
	const env = loadEnv(mode, process.cwd(), 'VITE_')
	const apiHost = env.VITE_API_HOST ?? 'https://dental-web.pro'

	return {
		// На GitHub Pages приложение живёт в подпапке (/<repo>/), поэтому база
		// приходит из VITE_BASE (её задаёт workflow). Локально — корень.
		base: env.VITE_BASE ?? '/',
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
