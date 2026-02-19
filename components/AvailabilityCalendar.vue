<template>
  <div class="select-none" @mouseleave="cancelDrag">
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

    <!-- Toggle whole month + Reset all (edit mode only) -->
    <div v-if="editable" class="flex justify-between mb-2">
      <button
        type="button"
        class="text-xs text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
        @click="resetAllDates"
      >
        {{ $t('availability.resetAll') }}
      </button>
      <button
        type="button"
        class="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        @click="toggleWholeMonth"
      >
        {{ isWholeMonthBusy ? $t('availability.clearMonth') : $t('availability.markMonthBusy') }}
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
              ? 'cursor-pointer'
              : 'cursor-default',
          isHighlighted(day)
            ? 'bg-red-100 text-red-700 font-semibold ring-1 ring-red-300'
            : editable && !isPast(day)
              ? 'hover:bg-muted'
              : '',
        ]"
        :disabled="!editable || isPast(day)"
        @mousedown="onDayMouseDown(day)"
        @mouseenter="onDayMouseEnter(day)"
        @mouseup="onMouseUp"
        @click.prevent
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
        <div class="w-3 h-3 rounded bg-red-100 border border-red-300" />
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

// Drag state
const isDragging = ref(false)
const dragAction = ref<'add' | 'remove'>('add')
const pendingDates = ref<Set<string>>(new Set())

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
  const labels: string[] = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date(2024, 0, i)
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
  return day === 0 ? 6 : day - 1
})

const daysInMonth = computed(() =>
  new Date(year.value, month.value + 1, 0).getDate()
)

const canGoPrev = computed(() =>
  year.value > currentYear || month.value > currentMonth
)

const futureDatesInMonth = computed(() => {
  const dates: string[] = []
  for (let d = 1; d <= daysInMonth.value; d++) {
    if (!isPast(d)) dates.push(dateKey(d))
  }
  return dates
})

const isWholeMonthBusy = computed(() =>
  futureDatesInMonth.value.length > 0 &&
  futureDatesInMonth.value.every(d => busyDates.value.has(d))
)

function prevMonth() {
  if (!canGoPrev.value) return
  if (month.value === 0) { month.value = 11; year.value-- }
  else month.value--
}

function nextMonth() {
  if (month.value === 11) { month.value = 0; year.value++ }
  else month.value++
}

function dateKey(day: number): string {
  return `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isPast(day: number): boolean {
  const d = new Date(year.value, month.value, day)
  d.setHours(0, 0, 0, 0)
  return d < today
}

function isHighlighted(day: number): boolean {
  const key = dateKey(day)
  if (isDragging.value && pendingDates.value.has(key)) {
    return dragAction.value === 'add'
  }
  if (isDragging.value && pendingDates.value.has(key) && dragAction.value === 'remove') {
    return false
  }
  return busyDates.value.has(key)
}

function onDayMouseDown(day: number) {
  if (!props.editable || isPast(day)) return
  const key = dateKey(day)
  dragAction.value = busyDates.value.has(key) ? 'remove' : 'add'
  pendingDates.value = new Set([key])
  isDragging.value = true
  window.addEventListener('mouseup', onMouseUp, { once: true })
}

function onDayMouseEnter(day: number) {
  if (!isDragging.value || !props.editable || isPast(day)) return
  pendingDates.value.add(dateKey(day))
  pendingDates.value = new Set(pendingDates.value)
}

function cancelDrag() {
  if (!isDragging.value) return
  isDragging.value = false
  pendingDates.value = new Set()
}

async function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false

  const dates = Array.from(pendingDates.value)
  pendingDates.value = new Set()

  if (dragAction.value === 'add') {
    const toInsert = dates.filter(d => !busyDates.value.has(d))
    if (toInsert.length > 0) {
      await client.from('master_availability').insert(
        toInsert.map(date => ({ master_id: props.masterId, date }))
      )
      toInsert.forEach(d => busyDates.value.add(d))
    }
  } else {
    const toDelete = dates.filter(d => busyDates.value.has(d))
    if (toDelete.length > 0) {
      await client.from('master_availability').delete()
        .eq('master_id', props.masterId)
        .in('date', toDelete)
      toDelete.forEach(d => busyDates.value.delete(d))
    }
  }

  busyDates.value = new Set(busyDates.value)
}

async function resetAllDates() {
  await client.from('master_availability').delete().eq('master_id', props.masterId)
  await fetchBusyDates()
}

async function toggleWholeMonth() {
  const dates = futureDatesInMonth.value
  if (dates.length === 0) return

  if (isWholeMonthBusy.value) {
    await client.from('master_availability').delete()
      .eq('master_id', props.masterId)
      .in('date', dates)
    dates.forEach(d => busyDates.value.delete(d))
  } else {
    const toInsert = dates.filter(d => !busyDates.value.has(d))
    if (toInsert.length > 0) {
      await client.from('master_availability').insert(
        toInsert.map(date => ({ master_id: props.masterId, date }))
      )
      toInsert.forEach(d => busyDates.value.add(d))
    }
  }

  busyDates.value = new Set(busyDates.value)
}
</script>
