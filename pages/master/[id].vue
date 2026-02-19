<template>
  <div v-if="master" class="container mx-auto px-4 py-8">
    <!-- Profile Header -->
    <div class="flex flex-col md:flex-row gap-6 mb-8">
      <div class="w-32 h-32 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        <img
          v-if="master.photo_url"
          :src="master.photo_url"
          :alt="master.name"
          class="w-full h-full object-cover"
        />
        <span v-else class="text-5xl">{{ getCategoryIcon(master.category?.icon) }}</span>
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h1 class="text-3xl font-bold">{{ master.name }}</h1>
          <UiBadge v-if="master.verified" variant="success">{{ $t('master.verified') }}</UiBadge>
        </div>
        <p v-if="master.business_name" class="text-lg text-muted-foreground mb-1">{{ master.business_name }}</p>
        <p class="text-muted-foreground mb-3">
          {{ master.category?.name }} &bull; {{ master.city }}, {{ master.region }}
        </p>
        <div class="flex flex-wrap gap-4 text-sm">
          <div v-if="master.phone" class="flex items-center gap-1">
            <span>📞</span>
            <button class="text-primary hover:underline" @click="showPhone">
              {{ phoneVisible ? master.phone : $t('search.showPhone') }}
            </button>
          </div>
          <div v-if="master.email" class="flex items-center gap-1">
            <span>✉️</span>
            <a :href="`mailto:${master.email}`" class="text-primary hover:underline">{{ master.email }}</a>
          </div>
          <div v-if="master.website" class="flex items-center gap-1">
            <span>🌐</span>
            <a :href="master.website" target="_blank" rel="noopener" class="text-primary hover:underline">
              {{ $t('master.website') }}
            </a>
          </div>
        </div>
        <div class="flex flex-wrap gap-3 mt-3">
          <UiBadge variant="secondary">{{ $t('master.radius') }}: {{ master.service_radius_km }} km</UiBadge>
          <UiBadge v-for="lang in master.languages" :key="lang" variant="outline">{{ lang }}</UiBadge>
          <UiBadge v-if="master.ico" variant="outline">{{ $t('master.ico') }}: {{ master.ico }}</UiBadge>
        </div>
      </div>
    </div>

    <!-- About -->
    <section v-if="master.description" class="mb-8">
      <h2 class="text-xl font-semibold mb-3">{{ $t('master.about') }}</h2>
      <p class="text-muted-foreground whitespace-pre-line">{{ master.description }}</p>
    </section>

    <!-- Photos -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-3">{{ $t('master.photos') }}</h2>
      <div v-if="photos && photos.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="photo in photos" :key="photo.id" class="aspect-square rounded-lg overflow-hidden bg-muted">
          <img :src="photo.url" :alt="photo.caption || ''" class="w-full h-full object-cover" />
        </div>
      </div>
      <p v-else class="text-muted-foreground">{{ $t('master.noPhotos') }}</p>
    </section>

    <!-- Reviews -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-3">
        {{ $t('master.reviews') }}
        <span v-if="reviews?.length" class="text-muted-foreground text-base font-normal">({{ reviews.length }})</span>
      </h2>
      <div v-if="reviews && reviews.length > 0" class="space-y-4">
        <UiCard v-for="review in reviews" :key="review.id" class="p-4">
          <div class="flex items-center gap-3 mb-2">
            <StarRating :model-value="review.rating" />
            <span class="font-medium">{{ review.author_name }}</span>
            <span class="text-sm text-muted-foreground">{{ formatDate(review.created_at) }}</span>
          </div>
          <p class="text-muted-foreground">{{ review.text }}</p>
        </UiCard>
      </div>
      <p v-else class="text-muted-foreground">{{ $t('master.noReviews') }}</p>

      <!-- Add Review Form -->
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-3">{{ $t('review.title') }}</h3>
        <p class="text-sm text-muted-foreground mb-3">{{ $t('review.pendingNote') }}</p>
        <form class="space-y-4 max-w-lg" @submit.prevent="submitReview">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('review.rating') }}</label>
            <StarRating v-model="reviewForm.rating" interactive />
          </div>
          <UiInput v-model="reviewForm.author_name" :placeholder="$t('review.name')" required />
          <UiInput v-model="reviewForm.author_email" type="email" :placeholder="$t('review.email')" required />
          <UiTextarea v-model="reviewForm.text" :placeholder="$t('review.textPlaceholder')" required />
          <UiButton type="submit" :disabled="reviewSubmitting">{{ $t('review.send') }}</UiButton>
          <p v-if="reviewSuccess" class="text-green-600 text-sm">{{ $t('review.success') }}</p>
          <p v-if="reviewError" class="text-destructive text-sm">{{ $t('review.error') }}</p>
        </form>
      </div>
    </section>

    <!-- Availability Calendar -->
    <section v-if="master.show_availability" class="mb-8">
      <h2 class="text-xl font-semibold mb-3">{{ $t('availability.title') }}</h2>
      <UiCard class="p-4 max-w-sm">
        <AvailabilityCalendar :master-id="master.id" :editable="false" />
      </UiCard>
    </section>

    <!-- Contact Form -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-3">{{ $t('contact.title') }}</h2>
      <form class="space-y-4 max-w-lg" @submit.prevent="submitLead">
        <UiInput v-model="leadForm.name" :placeholder="$t('contact.name')" required />
        <UiInput v-model="leadForm.email" type="email" :placeholder="$t('contact.email')" required />
        <UiInput v-model="leadForm.phone" :placeholder="$t('contact.phone')" />
        <UiTextarea v-model="leadForm.message" :placeholder="$t('contact.messagePlaceholder')" required />
        <UiButton type="submit" :disabled="leadSubmitting">{{ $t('contact.send') }}</UiButton>
        <p v-if="leadSuccess" class="text-green-600 text-sm">{{ $t('contact.success') }}</p>
        <p v-if="leadError" class="text-destructive text-sm">{{ $t('contact.error') }}</p>
      </form>
    </section>
  </div>
  <div v-else class="container mx-auto px-4 py-16 text-center text-muted-foreground">
    {{ $t('common.loading') }}
  </div>
</template>

<script setup lang="ts">
import type { Master, MasterPhoto, Review } from '~/types/database'
import { categoryIconMap } from '~/composables/useCategories'

const route = useRoute()
const client = useSupabaseClient()
const slug = route.params.id as string

const phoneVisible = ref(false)
const reviewSubmitting = ref(false)
const reviewSuccess = ref(false)
const reviewError = ref(false)
const leadSubmitting = ref(false)
const leadSuccess = ref(false)
const leadError = ref(false)

const reviewForm = reactive({
  author_name: '',
  author_email: '',
  rating: 5,
  text: '',
})

const leadForm = reactive({
  name: '',
  email: '',
  phone: '',
  message: '',
})

const { data: master } = await useAsyncData(`master-${slug}`, async () => {
  const { data } = await client
    .from('masters')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()
  return data as Master | null
}, { server: false })

const { data: photos } = await useAsyncData(`master-photos-${slug}`, async () => {
  if (!master.value) return []
  const { data } = await client
    .from('master_photos')
    .select('*')
    .eq('master_id', master.value.id)
    .order('sort_order')
  return (data || []) as MasterPhoto[]
}, { server: false })

const { data: reviews, refresh: refreshReviews } = await useAsyncData(`master-reviews-${slug}`, async () => {
  if (!master.value) return []
  const { data } = await client
    .from('reviews')
    .select('*')
    .eq('master_id', master.value.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  return (data || []) as Review[]
}, { server: false })

// Track profile view
if (master.value) {
  client.from('analytics_events').insert({
    master_id: master.value.id,
    event_type: 'profile_view',
  })
}

function getCategoryIcon(icon?: string) {
  return categoryIconMap[icon || 'wrench'] || '🔧'
}

function showPhone() {
  phoneVisible.value = true
  if (master.value) {
    client.from('analytics_events').insert({
      master_id: master.value.id,
      event_type: 'phone_click',
    })
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sk-SK')
}

async function submitReview() {
  if (!master.value || reviewForm.rating < 1) return
  reviewSubmitting.value = true
  reviewSuccess.value = false
  reviewError.value = false

  const { error } = await client.from('reviews').insert({
    master_id: master.value.id,
    author_name: reviewForm.author_name,
    author_email: reviewForm.author_email,
    rating: reviewForm.rating,
    text: reviewForm.text,
  })

  reviewSubmitting.value = false
  if (error) {
    reviewError.value = true
  } else {
    reviewSuccess.value = true
    reviewForm.author_name = ''
    reviewForm.author_email = ''
    reviewForm.rating = 5
    reviewForm.text = ''
  }
}

async function submitLead() {
  if (!master.value) return
  leadSubmitting.value = true
  leadSuccess.value = false
  leadError.value = false

  const { error } = await client.from('leads').insert({
    master_id: master.value.id,
    name: leadForm.name,
    email: leadForm.email,
    phone: leadForm.phone || null,
    message: leadForm.message,
  })

  if (!error && master.value) {
    await client.from('analytics_events').insert({
      master_id: master.value.id,
      event_type: 'lead_sent',
    })
  }

  leadSubmitting.value = false
  if (error) {
    leadError.value = true
  } else {
    leadSuccess.value = true
    leadForm.name = ''
    leadForm.email = ''
    leadForm.phone = ''
    leadForm.message = ''
  }
}

useHead({
  title: master.value ? `${master.value.name} - MojMajster` : 'MojMajster',
})
</script>
