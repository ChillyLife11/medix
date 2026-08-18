<script setup>
import { useRoute } from 'vue-router'
import UiBtn from '@/components/ui/UiBtn.vue'
import { House, Plus, GalleryHorizontalEnd } from '@lucide/vue'

const route = useRoute()

// На своём же экране кнопка остаётся на месте, но ссылкой не становится.
const linkTo = (path) => (route.path === path ? undefined : path)
</script>

<template>
	<!-- sticky, а не fixed: плашка остаётся в потоке, поэтому контент под ней
	     не прячется и нижний отступ страницы не нужно подгонять руками.
	     mt-auto прижимает её к низу, когда контента меньше экрана. -->
	<div class="sticky bottom-2.5 z-10 mt-auto mb-2.5 px-2.5">
		<div class="flex items-center justify-between p-4 rounded-full shadow-accent bg-card">
			<UiBtn :to="linkTo('/profile')" color="secondary" soft icon>
				<House stroke-width="1.1" size="26" />
			</UiBtn>
			<UiBtn to="/branch" icon><Plus size="32" /></UiBtn>
			<UiBtn :to="linkTo('/active')" color="secondary" soft icon>
				<GalleryHorizontalEnd stroke-width="1.1" size="26" />
			</UiBtn>
		</div>
	</div>
</template>
