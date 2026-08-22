<script setup>
import { computed, resolveComponent } from 'vue';


const $props = defineProps({
    to: [String, Object], // RouterLink to: '/path' | {}
    disabled: Boolean,
    loading: Boolean,
    fluid: Boolean,
    soft: Boolean,
    icon: Boolean,
    outline: Boolean,
    color: {
        default: 'brand',
        validator(v) {
            return ['brand', 'secondary', 'soft'].includes(v);
        }
    }
});

const tag = computed(() => $props.to ? resolveComponent('RouterLink') : 'button');

const color = computed(() => {
    if ($props.outline) {
        return 'border border-brand text-brand';
    }
    switch ($props.color) {
        case 'brand':
            return 'bg-brand text-brand-foreground';
        case 'secondary':
            return $props.soft ? 'bg-secondary-soft text-gray' : 'bg-secondary' + ' text-secondary-foreground';
    }
});

</script>

<template>
    <component
		:is="tag"
        :to="$props.to"
        :disabled="$props.disabled"
        :class="[
            {
                'w-full': $props.fluid,
                'w-14 h-14': $props.icon,
                'py-3.5 px-2.5': !$props.icon,
            },
            color
        ]"
        class="
            inline-flex justify-center items-center rounded-full text-center duration-50
            active:scale-[0.98]
            disabled:opacity-60 disabled:pointer-events-none
        "
    >
        <slot />
    </component>
</template>