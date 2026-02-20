<template>
  <div class="container mx-auto px-4 py-8 pb-32">
    <h1 class="text-3xl font-bold mb-6">{{ $t('search.title') }}</h1>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-8">
      <UiSelect v-model="filters.category" class="sm:w-48" @change="applyFilters">
        <option value="">{{ $t('search.allCategories') }}</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
          {{ cat.name }}
        </option>
      </UiSelect>
      <UiInput
        v-model="filters.city"
        :placeholder="$t('search.location')"
        class="sm:w-48"
        @keyup.enter="applyFilters"
      />
      <UiSelect v-model="filters.radius" class="sm:w-36" @change="applyFilters">
        <option value="10">10 {{ $t('search.km') }}</option>
        <option value="20">20 {{ $t('search.km') }}</option>
        <option value="30">30 {{ $t('search.km') }}</option>
        <option value="50">50 {{ $t('search.km') }}</option>
        <option value="100">100 {{ $t('search.km') }}</option>
      </UiSelect>
      <UiButton @click="applyFilters">{{ $t('hero.searchButton') }}</UiButton>
    </div>

    <!-- Results -->
    <p class="text-sm text-muted-foreground mb-4">
      {{ masters?.length || 0 }} {{ $t('search.results') }}
    </p>

    <div v-if="masters && masters.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MasterCard
        v-for="master in masters"
        :key="master.id"
        :master="master"
        :selectable="true"
        :selected="selectedIds.includes(master.id)"
        @toggle="toggleMaster(master.id)"
      />
    </div>
    <div v-else class="text-center py-16 text-muted-foreground">
      {{ $t('search.noResults') }}
    </div>
  </div>

  <!-- Sticky bottom bar -->
  <Transition name="slide-up">
    <div
      v-if="selectedIds.length > 0"
      class="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40"
    >
      <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <span class="text-sm font-medium">
          {{ $t('search.selectedCount', { n: selectedIds.length }) }}
        </span>
        <div class="flex gap-2">
          <UiButton variant="outline" size="sm" @click="selectedIds = []">
            {{ $t('search.clearSelection') }}
          </UiButton>
          <UiButton size="sm" @click="showModal = true">
            {{ $t('search.sendToSelected') }}
          </UiButton>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Multi-lead modal -->
  <Transition name="fade">
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showModal = false"
    >
      <UiCard class="w-full max-w-lg p-6">
        <h2 class="text-xl font-semibold mb-1">
          {{ $t('search.multiLeadTitle', { n: selectedIds.length }) }}
        </h2>
        <p class="text-sm text-muted-foreground mb-4">{{ $t('search.multiLeadSubtitle') }}</p>

        <div v-if="multiLeadSuccess" class="text-center py-6">
          <p class="text-green-600 font-medium text-lg mb-4">{{ $t('search.multiLeadSuccess') }}</p>
          <UiButton @click="closeModal">{{ $t('common.back') }}</UiButton>
        </div>

        <form v-else class="space-y-3" @submit.prevent="submitMultiLead">
          <UiInput v-model="form.name" :placeholder="$t('contact.name')" required />
          <UiInput v-model="form.email" type="email" :placeholder="$t('contact.email')" required />
          <UiInput v-model="form.phone" :placeholder="$t('contact.phone')" />
          <UiTextarea v-model="form.message" :placeholder="$t('contact.messagePlaceholder')" required />
          <div class="flex gap-2 pt-1">
            <UiButton type="button" variant="outline" class="flex-1" @click="showModal = false">
              {{ $t('common.cancel') }}
            </UiButton>
            <UiButton type="submit" class="flex-1" :disabled="submitting">
              {{ $t('contact.send') }}
            </UiButton>
          </div>
        </form>
      </UiCard>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Category, Master } from '~/types/database'

const route = useRoute()
const client = useSupabaseClient()

const filters = reactive({
  category: (route.query.category as string) || '',
  city: (route.query.city as string) || '',
  radius: '30',
})

const selectedIds = ref<number[]>([])
const showModal = ref(false)
const submitting = ref(false)
const multiLeadSuccess = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
})

const { data: categories } = await useAsyncData('search-categories', async () => {
  const { data } = await client.from('categories').select('*').order('name')
  return (data || []) as Category[]
}, { server: false })

const { data: masters, refresh } = await useAsyncData(
  'search-masters',
  async () => {
    let query = client
      .from('masters')
      .select('*, category:categories(*)')
      .eq('status', 'approved')
      // TODO: Premium - add .order('is_premium', { ascending: false }) as first sort key
      // Premium masters appear at the top of search results
      .order('verified', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.category) {
      const cat = categories.value?.find(c => c.slug === filters.category)
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }

    const { data } = await query.limit(50)
    return (data || []) as Master[]
  },
  { watch: [() => filters.category, () => filters.city], server: false }
)

function toggleMaster(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function applyFilters() {
  navigateTo({
    path: '/search',
    query: {
      ...(filters.category && { category: filters.category }),
      ...(filters.city && { city: filters.city }),
    },
  })
  refresh()
}

async function submitMultiLead() {
  if (!masters.value) return
  submitting.value = true

  const selected = masters.value.filter(m => selectedIds.value.includes(m.id))

  await Promise.all(
    selected.map(master =>
      client.from('leads').insert({
        master_id: master.id,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message,
      })
    )
  )

  await Promise.all(
    selected.map(master =>
      client.from('analytics_events').insert({
        master_id: master.id,
        event_type: 'lead_sent',
      })
    )
  )

  submitting.value = false
  multiLeadSuccess.value = true
}

function closeModal() {
  showModal.value = false
  multiLeadSuccess.value = false
  selectedIds.value = []
  form.name = ''
  form.email = ''
  form.phone = ''
  form.message = ''
}

const { t } = useI18n()

useHead({
  title: `${t('search.title')} - MojMajster`,
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
