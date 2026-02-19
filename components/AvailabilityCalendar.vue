<template>
  <div class="select-none">
    <!-- Month navigation -->
    <div class="flex items-center justify-between mb-3">
      <button
        type="button"
        class="p-2 rounded hover:bg-muted transition-colors disabled:opacity-30"
        :disabled="!canGoPrev"
        @click="prevMonth"
      >
        &#8592;
      </button>
      <span class="font-medium text-sm capitalize">{{ monthLabel }}</span>
      <button
        type="button"
        class="p-2 rounded hover:bg-muted transition-colors"
        @click="nextMonth"
      >
        &#8594;
      </button>
    </div>

    <!-- Day labels (Mon–Sun) -->
    <div class="grid grid-cols-7 gap-1 mb-1">
      <div
        v-for="label in dayLabels"
        :key="label"
        class="text-center text-xs text-muted-foreground font-medium py-1"
      >
        {{ label }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-1">
      <!-- Empty leading cells -->
      <div v-for="i in firstDayOffset" :key="`e-${i}`" />

      <!-- Day cells -->
      <button
        v-for="day in daysInMonth"
        :key="day"
        type="button"
        :class="[
          'aspect-square flex items-center justify-center text-sm rounded transition-colors',
          isPast(day)
            ? 'opacity-25 cursor-default'
            : editable
              ? 'cursor-pointer hover:ring-1 hover:ring-primary'
              : 'cursor-default',
          isBusy(day)
            ? 'bg-red-100 text-red-700 font-semibold'
            : 'hover:bg-muted',
        ]"
        :disabled="!editable || isPast(day)"
        @click="toggleDay(day)"
      >
        {{ day }}
      </button>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded bg-background border border-border" />
        <span>{{ $t('availability.free') }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded bg-red-100 border border-red-200" />
        <span>{{ $t('availability.busy') }}</span>
      </div>
    </div>

    <p v-if="editable" class="text-xs text-muted-foreground mt-2">
      {{ $t('availability.editHint') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  masterId: number
  editable?: boolean
}>()

const client = useSupabaseClient()
const { locale } = useI18n()

const today = new Date()
today.setHours(0, 0, 0, 0)
const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

const year = ref(currentYear)
const month = ref(currentMonth)
const busyDates = ref<Set<string>>(new Set())

async function fetchBusyDates() {
  const startDate = new Date(year.value, month.value, 1).toISOString().split('T')[0]
  const endDate = new Date(year.value, month.value + 1, 0).toISOString().split('T')[0]

  const { data } = await client
    .from('master_availability')
    .select('date')
    .eq('master_id', props.masterId)
    .gte('date', startDate)
    .lte('date', endDate)

  busyDates.value = new Set((data || []).map((r: { date: string }) => r.date))
}

await fetchBusyDates()
watch([year, month], fetchBusyDates)

const dayLabels = computed(() => {
  // Get Mon–Sun short labels based on current locale
  const labels: string[] = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date(2024, 0, i) // Jan 2024 starts on Monday
    labels.push(d.toLocaleDateString(locale.value, { weekday: 'short' }))
  }
  return labels
})

const monthLabel = computed(() =>
  new Date(year.value, month.value, 1).toLocaleDateString(locale.value, {
    month: 'long',
    year: 'numeric',
  })
)

const firstDayOffset = computed(() => {
  const day = new Date(year.value, month.value, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
})

const daysInMonth = computed(() =>
  new Date(year.value, month.value + 1, 0).getDate()
)

const canGoPrev = computed(() =>
  year.value > currentYear || month.value > currentMonth
)

function prevMonth() {
  if (!canGoPrev.value) return
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
}

function dateKey(day: number): string {
  return `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isPast(day: number): boolean {
  const d = new Date(year.value, month.value, day)
  d.setHours(0, 0, 0, 0)
  return d < today
}

function isBusy(day: number): boolean {
  return busyDates.value.has(dateKey(day))
}

async function toggleDay(day: number) {
  if (!props.editable || isPast(day)) return
  const key = dateKey(day)
  if (busyDates.value.has(key)) {
    await client
      .from('master_availability')
      .delete()
      .eq('master_id', props.masterId)
      .eq('date', key)
    busyDates.value.delete(key)
  } else {
    await client
      .from('master_availability')
      .insert({ master_id: props.masterId, date: key })
    busyDates.value.add(key)
  }
  busyDates.value = new Set(busyDates.value)
}
</script>
