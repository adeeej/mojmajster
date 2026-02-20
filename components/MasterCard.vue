<template>
  <div class="relative">
    <NuxtLink :to="`/master/${master.slug}`">
      <UiCard :class="['overflow-hidden hover:shadow-md transition-shadow', selected && 'ring-2 ring-primary']">
        <div class="aspect-[4/3] bg-muted flex items-center justify-center">
          <img
            v-if="master.photo_url"
            :src="master.photo_url"
            :alt="master.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-4xl text-muted-foreground">
            {{ getCategoryIcon(master.category?.icon) }}
          </span>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="font-semibold truncate">{{ master.name }}</h3>
            <UiBadge v-if="master.verified" variant="success" class="shrink-0">
              {{ $t('search.verified') }}
            </UiBadge>
          </div>
          <p v-if="master.business_name" class="text-sm text-muted-foreground truncate mb-1">
            {{ master.business_name }}
          </p>
          <p class="text-sm text-muted-foreground mb-2">
            {{ master.category?.name }} &bull; {{ master.city }}
          </p>
          <div v-if="master.avg_rating" class="flex items-center gap-1">
            <StarRating :model-value="Math.round(Number(master.avg_rating))" />
            <span class="text-sm text-muted-foreground">({{ master.review_count }})</span>
          </div>
        </div>
      </UiCard>
    </NuxtLink>

    <!-- Select button (shown in selectable mode) -->
    <button
      v-if="selectable"
      class="absolute top-2 left-2 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm"
      :class="selected
        ? 'bg-primary border-primary text-white'
        : 'bg-white/90 border-gray-400 text-transparent hover:border-primary'"
      :aria-label="selected ? $t('search.deselect') : $t('search.select')"
      @click.prevent="$emit('toggle')"
    >
      ✓
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Master } from '~/types/database'
import { categoryIconMap } from '~/composables/useCategories'

defineProps<{
  master: Master
  selectable?: boolean
  selected?: boolean
}>()

defineEmits<{ toggle: [] }>()

function getCategoryIcon(icon?: string) {
  return categoryIconMap[icon || 'wrench'] || '🔧'
}
</script>
