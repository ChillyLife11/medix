<script setup>
import { useRoute, useRouter } from 'vue-router'
import UiBtn from '@/components/ui/UiBtn.vue'
import { House, Plus, GalleryHorizontalEnd } from '@lucide/vue'
import { useBooking } from '@/composables/useBooking'

const route = useRoute()
const router = useRouter()
const { startBooking } = useBooking()

// Плюс — обычный сценарий записи: филиал → услуга → врач → дата/время.
function startFromBranch() {
	startBooking('branch')
	router.push('/branch')
}

// На своём же экране кнопка остаётся на месте, но ссылкой не становится.
const linkTo = (path) => (route.path === path ? undefined : path)

// Текущий экран подсвечиваем: обводка и иконка брендовым цветом вместо
// серой заливки. Отдаём набором пропсов, а не классом: у UiBtn цвет собирается
// внутри, и дописанный сверху text-* конфликтовал бы с ним.
const tabLook = (path) =>
	route.path === path ? { outline: true } : { color: 'secondary', soft: true }
</script>

<template>
	<!-- sticky, а не fixed: плашка остаётся в потоке, поэтому контент под ней
	     не прячется и нижний отступ страницы не нужно подгонять руками.
	     mt-auto прижимает её к низу, когда контента меньше экрана. -->
	<div class="sticky bottom-7.5 z-10 mt-auto mb-7.5 px-2.5">
		<div class="flex items-center justify-between p-4 rounded-full shadow-accent bg-card">
			<UiBtn v-bind="tabLook('/profile')" :to="linkTo('/profile')" icon>
				<House stroke-width="1.1" size="26" />
			</UiBtn>
			<UiBtn icon @click="startFromBranch"><Plus size="32" /></UiBtn>
			<UiBtn v-bind="tabLook('/active')" :to="linkTo('/active')" icon>
				<GalleryHorizontalEnd stroke-width="1.1" size="26" />
			</UiBtn>
		</div>
	</div>
</template>
