<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-16 md:py-24">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-2">
          {{ $t('hero.title') }}
        </h1>
        <p class="text-3xl md:text-4xl font-bold text-primary mb-4">
          {{ $t('hero.titleHighlight') }}
        </p>
        <p class="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          {{ $t('hero.subtitle') }}
        </p>

        <!-- Search Bar -->
        <form class="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto" @submit.prevent="handleSearch">
          <UiSelect v-model="searchCategory" class="flex-1">
            <option value="">{{ $t('hero.categoryPlaceholder') }}</option>
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
          <UiButton type="submit">
            {{ $t('hero.searchButton') }}
          </UiButton>
        </form>
      </div>
    </section>

    <!-- Trust Signals -->
    <section class="border-b bg-muted/30">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <component :is="Users" class="w-4 h-4 text-primary" />
            <span><strong class="text-foreground">{{ $t('trust.mastersCount') }}</strong> {{ $t('trust.mastersLabel') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <component :is="ShieldCheck" class="w-4 h-4 text-primary" />
            <span>{{ $t('trust.verifiedLabel') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <component :is="MapPin" class="w-4 h-4 text-primary" />
            <span>{{ $t('trust.localLabel') }}</span>
          </div>
        </div>
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
            :to="`/search?category=${cat.slug}`"
            class="flex flex-col items-center gap-3 p-4 rounded-lg border bg-background hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <component :is="getLucideIcon(cat.icon)" class="w-5 h-5 text-primary" />
            </div>
            <span class="text-sm font-medium text-center leading-tight">{{ cat.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Why MojMajster -->
    <section class="py-16 bg-muted/30">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-10 text-center">{{ $t('why.title') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UiCard class="p-6 text-center">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <component :is="BadgeCheck" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold mb-2">{{ $t('why.item1Title') }}</h3>
            <p class="text-sm text-muted-foreground">{{ $t('why.item1Desc') }}</p>
          </UiCard>
          <UiCard class="p-6 text-center">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <component :is="MapPin" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold mb-2">{{ $t('why.item2Title') }}</h3>
            <p class="text-sm text-muted-foreground">{{ $t('why.item2Desc') }}</p>
          </UiCard>
          <UiCard class="p-6 text-center">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <component :is="Zap" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold mb-2">{{ $t('why.item3Title') }}</h3>
            <p class="text-sm text-muted-foreground">{{ $t('why.item3Desc') }}</p>
          </UiCard>
          <UiCard class="p-6 text-center">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <component :is="HandCoins" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold mb-2">{{ $t('why.item4Title') }}</h3>
            <p class="text-sm text-muted-foreground">{{ $t('why.item4Desc') }}</p>
          </UiCard>
        </div>
      </div>
    </section>

    <!-- Top Masters -->
    <section v-if="topMasters?.length" class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold mb-8 text-center">{{ $t('home.topMasters') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MasterCard v-for="master in topMasters" :key="master.id" :master="master" />
        </div>
      </div>
    </section>

    <!-- CTA for Masters -->
    <section class="py-16 bg-primary text-primary-foreground">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-2xl font-bold mb-3">{{ $t('home.ctaTitle') }}</h2>
        <p class="mb-2 max-w-xl mx-auto opacity-90">{{ $t('home.ctaText') }}</p>
        <p class="mb-6 max-w-xl mx-auto opacity-75 text-sm">{{ $t('home.ctaLeads') }}</p>
        <NuxtLink to="/register">
          <UiButton size="lg" variant="secondary">{{ $t('nav.register') }}</UiButton>
        </NuxtLink>
      </div>
    </section>

    <!-- SEO Text Section -->
    <section class="py-12 border-t">
      <div class="container mx-auto px-4 max-w-3xl">
        <h2 class="text-xl font-semibold mb-4">{{ $t('seo.title') }}</h2>
        <p class="text-sm text-muted-foreground leading-relaxed">{{ $t('seo.text') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { Category, Master } from '~/types/database'
import {
  BrickWall, Home, Flame, Zap, Droplets, Paintbrush, Square, TreePine,
  Lock, Layers, Wrench, Thermometer, Flower2, Shield, Building2,
  Users, ShieldCheck, MapPin, BadgeCheck, HandCoins,
} from 'lucide-vue-next'

const lucideIconMap: Record<string, Component> = {
  'brick-wall': BrickWall,
  'home': Home,
  'flame': Flame,
  'zap': Zap,
  'droplets': Droplets,
  'paintbrush': Paintbrush,
  'square': Square,
  'tree-pine': TreePine,
  'lock': Lock,
  'layers': Layers,
  'wrench': Wrench,
  'thermometer': Thermometer,
  'flower': Flower2,
  'shield': Shield,
  'building': Building2,
}

function getLucideIcon(icon?: string): Component {
  return lucideIconMap[icon || 'wrench'] || Wrench
}

const client = useSupabaseClient()

const searchCategory = ref('')
const searchCity = ref('')

const { data: categories } = await useAsyncData('categories', async () => {
  const { data, error } = await client.from('categories').select('*').order('name')
  if (error) console.error('Categories error:', error)
  return (data || []) as Category[]
}, { server: false })

const { data: topMasters } = await useAsyncData('top-masters', async () => {
  // TODO: Premium - sort by is_premium DESC first, then by avg_rating or created_at
  // Premium masters appear higher in Top Masters section on homepage
  const { data } = await client
    .from('masters')
    .select('*, category:categories(*)')
    .eq('status', 'approved')
    .eq('verified', true)
    .limit(6)
  return (data || []) as Master[]
}, { server: false })

function handleSearch() {
  const query: Record<string, string> = {}
  if (searchCategory.value) query.category = searchCategory.value
  if (searchCity.value) query.city = searchCity.value
  navigateTo({ path: '/search', query })
}

const { t } = useI18n()
useHead({
  title: `${t('site.name')} - ${t('site.tagline')}`,
  meta: [
    { name: 'description', content: t('seo.text') },
  ],
})
</script>
