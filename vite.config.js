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
		plugins: [vue(), tailwindcss()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		base: 'max/app-1/', // 👈 Базовый путь для сборки
		build: {
			outDir: 'dist/max/app-1', // 👈 Папка для сборки в Yii2
			assetsDir: 'assets',
			manifest: true, // 👈 Включаем манифест
			rollupOptions: {
				input: {
					main: fileURLToPath(new URL('./src/main.js', import.meta.url)),
				},
				output: {
					entryFileNames: 'assets/[name].[hash].js',
					chunkFileNames: 'assets/[name].[hash].js',
					assetFileNames: 'assets/[name].[hash].[ext]',
				},
			},
			emptyOutDir: true,
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
