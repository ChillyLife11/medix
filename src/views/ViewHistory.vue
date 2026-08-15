<script setup>
import HistoryCard from '@/components/history/HistoryCard.vue';
import UiBtn from '@/components/ui/UiBtn.vue';
</script>

<template>
	<div class="flex flex-col p-2.5">
		<h1 class="section-title mb-7">История посещений</h1>

		<div class="space-y-2.5 pb-5">
			<HistoryCard
				service="Консультация врача"
				doctor="Врач: Иванов Максим Геннадьевич"
				date="13.07.2026 / 13:30"
			/>
			<HistoryCard
				service="Лечение кариеса"
				doctor="Врач: Иванов Максим Геннадьевич"
				date="13.07.2026 / 13:30"
				canceled
			/>
			<HistoryCard
				service="Лечение кариеса"
				doctor="Врач: Иванов Максим Геннадьевич"
				date="13.07.2026 / 13:30"
			/>
			<HistoryCard
				service="Лечение кариеса"
				doctor="Врач: Иванов Максим Геннадьевич"
				date="13.07.2026 / 13:30"
			/>
		</div>

		<UiBtn class="sticky bottom-2.5 left-0 mt-auto" fluid>
			Участвовать в акции
		</UiBtn>
	</div>
</template>