<script setup>
// ВРЕМЕННЫЙ отладочный слой: обмен с бэкендом поверх интерфейса. Внутри MAX нет
// консоли, поэтому тело запроса и ответ смотрим прямо на экране.
// Выключается флагом DEBUG_HTTP в @/config, удаляется вместе с ним.

import { ref } from 'vue'
import { useHttpLog } from '@/composables/useHttpLog'

const { entries, dismiss, clear } = useHttpLog()

// Свёрнутый тост показывает только строку статуса — развёрнутый тело и ответ.
// Раскрываем по тапу: на узком экране развёрнутые сразу перекрыли бы всё.
const opened = ref(new Set())

function toggle(id) {
	const next = new Set(opened.value)
	next.has(id) ? next.delete(id) : next.add(id)
	opened.value = next
}
</script>

<template>
	<!-- pointer-events-auto обязателен: пока открыто модальное окно (согласия,
	     шторки, подтверждение записи), reka-ui гасит указатель у всего body, и
	     тост не нажимался — тап уходил в подложку окна. @pointerdown.stop не даёт
	     этому же тапу закрыть само окно. -->
	<div
		v-if="entries.length"
		class="fixed top-2 right-2 z-[100] flex flex-col items-end gap-1 max-w-[92vw] w-80 pointer-events-auto"
		@pointerdown.stop
	>
		<button
			type="button"
			class="px-2 py-0.5 rounded-full bg-black/70 text-[10px] text-white"
			@click="clear"
		>
			очистить ({{ entries.length }})
		</button>

		<div
			v-for="entry in entries"
			:key="entry.id"
			:class="entry.ok ? 'border-brand' : 'border-[#FF0000]'"
			class="w-full p-2 rounded-xl border bg-white/95 shadow-accent"
			@click="toggle(entry.id)"
		>
			<div class="flex items-start gap-1">
				<span
					:class="entry.ok ? 'text-brand' : 'text-[#FF0000]'"
					class="shrink-0 text-[11px] font-semibold"
				>
					{{ entry.status }}
				</span>
				<span class="grow break-all text-[11px] text-gray">{{ entry.label }}</span>
				<span v-if="entry.ms !== null" class="shrink-0 text-[10px] text-gray/60">
					{{ entry.ms }}мс
				</span>
				<button
					type="button"
					class="shrink-0 px-1 text-[11px] text-gray/60"
					aria-label="Закрыть"
					@click.stop="dismiss(entry.id)"
				>
					✕
				</button>
			</div>

			<div v-if="opened.has(entry.id)" class="mt-1 space-y-1">
				<div v-if="entry.request">
					<div class="text-[10px] text-gray/60">запрос</div>
					<pre
						class="max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px] text-gray"
						>{{ entry.request }}</pre>
				</div>
				<div>
					<div class="text-[10px] text-gray/60">ответ</div>
					<pre
						class="max-h-60 overflow-auto whitespace-pre-wrap break-all text-[10px] text-gray"
						>{{ entry.response || '(пусто)' }}</pre>
				</div>
			</div>
			<div v-else class="text-[10px] text-gray/50">нажмите, чтобы раскрыть</div>
		</div>
	</div>
</template>
