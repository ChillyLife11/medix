<script setup>
import { ref } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import HttpToasts from '@/components/debug/HttpToasts.vue'
import { DEBUG_HTTP } from '@/config'

const router = useRouter()
const route = useRoute()

// направление перехода: вперёд — слайд влево, назад — слайд вправо
const transition = ref('slide-left')
let lastPosition = window.history.state?.position ?? 0

router.afterEach(() => {
	const current = window.history.state?.position ?? 0
	transition.value = current < lastPosition ? 'slide-right' : 'slide-left'
	lastPosition = current
})
</script>

<template>
	<!-- ВРЕМЕННО: отладочные тосты с обменом по API, см. DEBUG_HTTP в @/config -->
	<HttpToasts v-if="DEBUG_HTTP" />

	<div class="flex min-h-screen *:w-full">
		<RouterView v-slot="{ Component }">
			<Transition :name="transition" mode="out-in">
				<component :is="Component" :key="route.fullPath" />
			</Transition>
		</RouterView>
	</div>
</template>
