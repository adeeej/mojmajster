<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      :disabled="!interactive"
      :class="[
        'transition-colors',
        interactive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default',
      ]"
      @click="interactive && $emit('update:modelValue', star)"
    >
      <svg
        class="w-5 h-5"
        :class="star <= (modelValue || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
    <span v-if="showCount" class="text-sm text-muted-foreground ml-1">({{ count }})</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: number
  interactive?: boolean
  showCount?: boolean
  count?: number
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>
