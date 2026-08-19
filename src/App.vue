<script setup>
import { ref } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'

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
	<div class="flex min-h-screen *:w-full">
		<RouterView v-slot="{ Component }">
			<Transition :name="transition" mode="out-in">
				<component :is="Component" :key="route.fullPath" />
			</Transition>
		</RouterView>
	</div>
</template>
