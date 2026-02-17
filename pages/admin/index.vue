<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('admin.dashboard') }}</h1>

    <!-- Admin Nav -->
    <div class="flex gap-4 mb-8">
      <NuxtLink to="/admin" class="text-primary font-medium">{{ $t('admin.dashboard') }}</NuxtLink>
      <NuxtLink to="/admin/profily" class="text-muted-foreground hover:text-foreground">{{ $t('admin.profiles') }}</NuxtLink>
      <NuxtLink to="/admin/kategorie" class="text-muted-foreground hover:text-foreground">{{ $t('admin.categories') }}</NuxtLink>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <UiCard class="p-6">
        <p class="text-sm text-muted-foreground">{{ $t('admin.totalMasters') }}</p>
        <p class="text-3xl font-bold">{{ stats.totalMasters }}</p>
      </UiCard>
      <UiCard class="p-6">
        <p class="text-sm text-muted-foreground">{{ $t('admin.pendingProfiles') }}</p>
        <p class="text-3xl font-bold text-yellow-600">{{ stats.pendingProfiles }}</p>
      </UiCard>
      <UiCard class="p-6">
        <p class="text-sm text-muted-foreground">{{ $t('admin.totalLeads') }}</p>
        <p class="text-3xl font-bold">{{ stats.totalLeads }}</p>
      </UiCard>
      <UiCard class="p-6">
        <p class="text-sm text-muted-foreground">{{ $t('admin.totalReviews') }}</p>
        <p class="text-3xl font-bold">{{ stats.totalReviews }}</p>
      </UiCard>
    </div>

    <!-- Recent pending reviews -->
    <h2 class="text-xl font-semibold mb-4">{{ $t('admin.reviews') }} (pending)</h2>
    <div v-if="pendingReviews && pendingReviews.length > 0" class="space-y-3">
      <UiCard v-for="review in pendingReviews" :key="review.id" class="p-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <StarRating :model-value="review.rating" />
              <span class="font-medium">{{ review.author_name }}</span>
            </div>
            <p class="text-sm text-muted-foreground mb-2">{{ review.text }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <UiButton size="sm" @click="updateReviewStatus(review.id, 'approved')">{{ $t('admin.approve') }}</UiButton>
            <UiButton size="sm" variant="destructive" @click="updateReviewStatus(review.id, 'rejected')">{{ $t('admin.reject') }}</UiButton>
          </div>
        </div>
      </UiCard>
    </div>
    <p v-else class="text-muted-foreground">Žiadne recenzie na schválenie.</p>
  </div>
</template>

<script setup lang="ts">
import type { Review } from '~/types/database'

definePageMeta({ middleware: 'admin' })

const client = useSupabaseClient()

const { data: stats } = await useAsyncData('admin-stats', async () => {
  const [masters, pending, leads, reviews] = await Promise.all([
    client.from('masters').select('id', { count: 'exact', head: true }),
    client.from('masters').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('leads').select('id', { count: 'exact', head: true }),
    client.from('reviews').select('id', { count: 'exact', head: true }),
  ])
  return {
    totalMasters: masters.count || 0,
    pendingProfiles: pending.count || 0,
    totalLeads: leads.count || 0,
    totalReviews: reviews.count || 0,
  }
}, { server: false })

const { data: pendingReviews, refresh: refreshReviews } = await useAsyncData('pending-reviews', async () => {
  const { data } = await client
    .from('reviews')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)
  return (data || []) as Review[]
}, { server: false })

async function updateReviewStatus(reviewId: number, status: 'approved' | 'rejected') {
  await $fetch(`/api/admin/reviews/${reviewId}`, {
    method: 'PATCH',
    body: { status },
  })
  refreshReviews()
}
</script>
