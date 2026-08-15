<script setup>
import UiBtn from '@/components/ui/UiBtn.vue';
import { Plus, GalleryHorizontalEnd, House } from '@lucide/vue';

</script>

<template>
    <div class="flex flex-col space-y-5">
        <div class="flex flex-col items-center py-5 px-2.5 space-y-2.5 rounded-b-4xl bg-card">
            <div class="relative w-23.25 rounded-full">
                <span class="block w-full pt-[100%]" />
                <img
                    src="/doctor-img.png"
                    alt="Врач"
                    class="absolute inset-0 w-full h-full rounded-full object-cover object-center"
                >
            </div>
            <div class="text-2xl text-gray">Иванов Иван</div>
            <div class="w-full p-3 rounded-full shadow-accent">
                <UiBtn to="/branch" fluid>Записаться</UiBtn>
            </div>
        </div>

        <div class="px-2.5 space-y-2.5">
            <RouterLink to="/sale" class="block p-5 rounded-full bg-card shadow-accent">
                <div class="text-center text-xl text-brand">Акции</div>
                <div class="mt-2.5 mx-auto text-15 text-center text-gray opacity-70">Актуальные акции программы <br>стоматологической клиники</div>
            </RouterLink>
            <div class="p-5 rounded-full bg-card shadow-accent">
                <div class="text-center text-xl text-brand">Услуги</div>
                <div class="mt-2.5 mx-auto text-15 text-center text-gray opacity-70">Выберите интересующую услугу из списка <br>или запишитесь на консультацию</div>
            </div>
        </div>

        <div class="flex flex-col items-center px-2.5 space-y-2.5">
            <div class="text-xl underline text-brand">Правовая информация</div>
            <div class="text-xl underline text-brand">Обратная связь</div>
        </div>

        <div class="mt-auto mb-2.5 px-2.5">
            <div class="flex items-center justify-between p-4 rounded-full shadow-accent bg-card">
                <UiBtn color="secondary" soft icon><House stroke-width="1.1" size="26" /></UiBtn>
                <UiBtn to="/branch" icon><Plus size="32" /></UiBtn>
                <UiBtn color="secondary" soft icon><GalleryHorizontalEnd stroke-width="1.1" size="26" /></UiBtn>
            </div>
        </div>
    </div>
</template>