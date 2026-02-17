<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-16 md:py-24">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {{ $t('hero.title') }}
        </h1>
        <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          {{ $t('hero.subtitle') }}
        </p>

        <!-- Search Bar -->
        <form class="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto" @submit.prevent="handleSearch">
          <UiSelect v-model="searchCategory" class="flex-1">
            <option value="">{{ $t('search.allCategories') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </UiSelect>
          <UiInput
            v-model="searchCity"
            type="text"
            :placeholder="$t('hero.locationPlaceholder')"
            class="flex-1"
          />
          <UiButton type="submit" size="lg">
            {{ $t('hero.searchButton') }}
          </UiButton>
        </form>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-8 text-center">{{ $t('categories.title') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/hladaj?category=${cat.slug}`"
            class="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span class="text-3xl">{{ getCategoryIcon(cat.icon) }}</span>
            <span class="text-sm font-medium text-center">{{ cat.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Top Masters -->
    <section v-if="topMasters?.length" class="py-16 bg-muted/30">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-8 text-center">Top majstri</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MasterCard v-for="master in topMasters" :key="master.id" :master="master" />
        </div>
      </div>
    </section>

    <!-- CTA for Masters -->
    <section class="py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold mb-4">Ste majster? Zaregistrujte sa zadarmo!</h2>
        <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
          Získajte viditeľnosť v regióne Kysúc. Registrácia a profil sú 100% zadarmo.
        </p>
        <NuxtLink to="/registracia">
          <UiButton size="lg">{{ $t('nav.register') }}</UiButton>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Category, Master } from '~/types/database'
import { categoryIconMap } from '~/composables/useCategories'

const client = useSupabaseClient()

const searchCategory = ref('')
const searchCity = ref('')

const { data: categories } = await useAsyncData('categories', async () => {
  const { data, error } = await client.from('categories').select('*').order('name')
  if (error) console.error('Categories error:', error)
  return (data || []) as Category[]
}, { server: false })

const { data: topMasters } = await useAsyncData('top-masters', async () => {
  const { data } = await client
    .from('masters')
    .select('*, category:categories(*)')
    .eq('status', 'approved')
    .eq('verified', true)
    .limit(6)
  return (data || []) as Master[]
}, { server: false })

function getCategoryIcon(icon: string) {
  return categoryIconMap[icon] || '🔧'
}

function handleSearch() {
  const query: Record<string, string> = {}
  if (searchCategory.value) query.category = searchCategory.value
  if (searchCity.value) query.city = searchCity.value
  navigateTo({ path: '/hladaj', query })
}

useHead({
  title: 'MojMajster - Nájdi majstra na Kysuciach',
})
</script>
