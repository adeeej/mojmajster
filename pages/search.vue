<template>
  <div class="container mx-auto px-4 py-8">
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
      <MasterCard v-for="master in masters" :key="master.id" :master="master" />
    </div>
    <div v-else class="text-center py-16 text-muted-foreground">
      {{ $t('search.noResults') }}
    </div>
  </div>
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

const { t } = useI18n()

useHead({
  title: `${t('search.title')} - MojMajster`,
})
</script>
