<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('admin.profiles') }}</h1>

    <!-- Admin Nav -->
    <div class="flex gap-4 mb-8">
      <NuxtLink to="/admin" class="text-muted-foreground hover:text-foreground">{{ $t('admin.dashboard') }}</NuxtLink>
      <NuxtLink to="/admin/profiles" class="text-primary font-medium">{{ $t('admin.profiles') }}</NuxtLink>
      <NuxtLink to="/admin/categories" class="text-muted-foreground hover:text-foreground">{{ $t('admin.categories') }}</NuxtLink>
    </div>

    <!-- Filter by status -->
    <div class="flex gap-2 mb-6">
      <UiButton
        v-for="s in ['pending', 'approved', 'rejected', 'banned']"
        :key="s"
        :variant="statusFilter === s ? 'default' : 'outline'"
        size="sm"
        @click="statusFilter = s; refreshMasters()"
      >
        {{ s }}
      </UiButton>
    </div>

    <div class="space-y-4">
      <UiCard v-for="m in masters" :key="m.id" class="p-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ m.name }}</h3>
              <UiBadge v-if="m.verified" variant="success">{{ $t('admin.verified') }}</UiBadge>
              <UiBadge
                :variant="m.status === 'approved' ? 'success' : m.status === 'pending' ? 'warning' : 'destructive'"
              >
                {{ m.status }}
              </UiBadge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ m.category?.name }} &bull; {{ m.city }}
              <span v-if="m.phone"> &bull; {{ m.phone }}</span>
              <span v-if="m.email"> &bull; {{ m.email }}</span>
            </p>
          </div>
          <div class="flex gap-2 shrink-0 flex-wrap">
            <UiButton v-if="m.status !== 'approved'" size="sm" @click="updateStatus(m.id, 'approved')">
              {{ $t('admin.approve') }}
            </UiButton>
            <UiButton v-if="m.status !== 'rejected'" size="sm" variant="outline" @click="updateStatus(m.id, 'rejected')">
              {{ $t('admin.reject') }}
            </UiButton>
            <UiButton v-if="m.status !== 'banned'" size="sm" variant="destructive" @click="updateStatus(m.id, 'banned')">
              {{ $t('admin.ban') }}
            </UiButton>
            <UiButton
              size="sm"
              :variant="m.verified ? 'outline' : 'secondary'"
              @click="toggleVerified(m.id, !m.verified)"
            >
              {{ m.verified ? $t('admin.unverify') : $t('admin.verify') }}
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>

    <p v-if="!masters?.length" class="text-muted-foreground text-center py-8">{{ $t('admin.noProfiles') }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Master } from '~/types/database'

definePageMeta({ middleware: 'admin' })

const statusFilter = ref('pending')

const { data: masters, refresh: refreshMasters } = await useAsyncData(
  'admin-masters',
  async () => {
    const { data } = await $fetch<{ data: Master[] }>('/api/admin/masters', {
      query: { status: statusFilter.value },
    })
    return data || []
  },
  { server: false, watch: [statusFilter] }
)

async function updateStatus(masterId: number, status: string) {
  await $fetch(`/api/admin/masters/${masterId}`, {
    method: 'PATCH',
    body: { status },
  })
  refreshMasters()
}

async function toggleVerified(masterId: number, verified: boolean) {
  await $fetch(`/api/admin/masters/${masterId}`, {
    method: 'PATCH',
    body: { verified },
  })
  refreshMasters()
}
</script>
