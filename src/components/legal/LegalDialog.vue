<script setup>
// Шторка «Правовая информация» с профиля.
//
// ⚠️ Содержимое — рыба (lorem ipsum) для проверки вёрстки длинного документа:
// сколько занимает прокрутка, как ложатся заголовки и абзацы. Перед релизом
// заменить на документы, согласованные клиникой.
import {
	DialogRoot,
	DialogTrigger,
	DialogPortal,
	DialogOverlay,
	DialogContent,
	DialogTitle,
	DialogClose,
} from 'reka-ui'
import { X } from '@lucide/vue'
import UiBtn from '@/components/ui/UiBtn.vue'

const company = [
	['Lorem ipsum dolor', 'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore'],
	['Ut enim ad minim', 'Veniam quis nostrud exercitation ullamco laboris nisi ut aliquip'],
	['Duis aute irure', 'Dolor in reprehenderit in voluptate velit esse cillum dolore'],
	['Excepteur sint occaecat', 'Cupidatat non proident sunt in culpa qui officia deserunt'],
	['Mollit anim id est', 'Laborum sed ut perspiciatis unde omnis iste natus error'],
	['Sit voluptatem', 'Accusantium doloremque laudantium totam rem aperiam eaque ipsa'],
]

const sections = [
	{
		title: '1. Lorem ipsum dolor sit amet',
		text: [
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
			'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
		],
	},
	{
		title: '2. Nemo enim ipsam voluptatem',
		text: [
			'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
			'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
			'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.',
			'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.',
		],
	},
	{
		title: '3. At vero eos et accusamus',
		text: [
			'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
			'Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
		],
	},
	{
		title: '4. Nam libero tempore',
		text: [
			'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
			'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
			'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.',
		],
	},
	{
		title: '5. Sed ut perspiciatis unde',
		text: [
			'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam. Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
			'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
			'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
		],
	},
	{
		title: '6. Quis nostrud exercitation',
		text: [
			'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
			'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		],
	},
	{
		title: '7. Ut aliquip ex ea commodo',
		text: [
			'Ut aliquip ex ea commodo consequat, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
			'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, excepteur sint occaecat cupidatat non proident.',
			'Sunt in culpa qui officia deserunt mollit anim id est laborum, sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
			'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
		],
	},
	{
		title: '8. Consectetur adipiscing elit',
		text: [
			'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida risus commodo viverra maecenas accumsan lacus.',
			'Vel facilisis volutpat est velit egestas dui id ornare arcu. Odio ut sem nulla pharetra diam sit amet nisl suscipit adipiscing.',
		],
	},
	{
		title: '9. Vestibulum ante ipsum primis',
		text: [
			'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae, donec velit neque auctor sit amet aliquam vel ullamcorper sit amet ligula.',
			'Curabitur aliquet quam id dui posuere blandit. Vivamus suscipit tortor eget felis porttitor volutpat. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.',
			'Nulla porttitor accumsan tincidunt. Donec sollicitudin molestie malesuada. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
		],
	},
	{
		title: '10. Pellentesque in ipsum id',
		text: [
			'Pellentesque in ipsum id orci porta dapibus. Cras ultricies ligula sed magna dictum porta. Proin eget tortor risus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.',
			'Quisque velit nisi, pretium ut lacinia in, elementum id enim. Sed porttitor lectus nibh. Donec rutrum congue leo eget malesuada.',
		],
	},
	{
		title: '11. Curabitur non nulla sit',
		text: [
			'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Vivamus suscipit tortor eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat.',
			'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Donec sollicitudin molestie malesuada. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a.',
			'Sed porttitor lectus nibh. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.',
		],
	},
	{
		title: '12. Proin eget tortor risus',
		text: [
			'Proin eget tortor risus. Cras ultricies ligula sed magna dictum porta. Donec rutrum congue leo eget malesuada. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus.',
			'Quisque velit nisi, pretium ut lacinia in, elementum id enim. Pellentesque in ipsum id orci porta dapibus.',
		],
	},
	{
		title: '13. Mauris blandit aliquet elit',
		text: [
			'Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Nulla porttitor accumsan tincidunt. Curabitur aliquet quam id dui posuere blandit.',
			'Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.',
			'Nulla quis lorem ut libero malesuada feugiat. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.',
		],
	},
	{
		title: '14. Vivamus suscipit tortor',
		text: [
			'Vivamus suscipit tortor eget felis porttitor volutpat. Cras ultricies ligula sed magna dictum porta. Sed porttitor lectus nibh. Donec sollicitudin molestie malesuada.',
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		],
	},
]
</script>

<template>
	<DialogRoot>
		<DialogTrigger class="text-xl underline text-brand duration-75 active:scale-95">
			Правовая информация
		</DialogTrigger>

		<DialogPortal>
			<DialogOverlay
				class="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-[overlay-in_0.2s_ease] data-[state=closed]:animate-[overlay-out_0.2s_ease]"
			/>
			<DialogContent
				aria-describedby="undefined"
				class="fixed inset-x-0 bottom-0 top-10 z-50 flex flex-col rounded-t-4xl bg-page data-[state=open]:animate-[sheet-in_0.25s_ease] data-[state=closed]:animate-[sheet-out_0.2s_ease]"
			>
				<div class="shrink-0 flex items-center gap-2.5 p-5 rounded-t-4xl bg-card">
					<DialogTitle class="grow text-xl text-brand">Правовая информация</DialogTitle>
					<DialogClose
						class="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-card-darker text-gray duration-75 active:scale-90"
						aria-label="Закрыть"
					>
						<X :size="20" :stroke-width="1.5" />
					</DialogClose>
				</div>

				<div class="grow overflow-y-auto overscroll-contain p-2.5 space-y-2.5">
					<section
						v-for="section in sections"
						:key="section.title"
						class="p-5 rounded-4xl bg-card space-y-2.5"
					>
						<h3 class="text-15 text-brand">{{ section.title }}</h3>
						<p
							v-for="(paragraph, index) in section.text"
							:key="index"
							class="text-13 text-gray leading-relaxed"
						>
							{{ paragraph }}
						</p>
					</section>

					<section class="p-5 rounded-4xl bg-card space-y-2.5">
						<h3 class="text-15 text-brand">Lorem ipsum</h3>
						<dl class="space-y-2">
							<div v-for="[label, value] in company" :key="label">
								<dt class="text-13 text-gray opacity-70">{{ label }}</dt>
								<dd class="text-13 text-gray">{{ value }}</dd>
							</div>
						</dl>
					</section>
				</div>

				<div class="shrink-0 p-2.5 bg-card">
					<DialogClose as-child>
						<UiBtn fluid>Понятно</UiBtn>
					</DialogClose>
				</div>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
