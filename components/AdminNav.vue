<template>
  <div class="flex gap-4 mb-8 items-center">
    <NuxtLink
      to="/admin"
      class="flex items-center gap-1.5"
      :class="active === 'dashboard' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'"
    >
      {{ $t('admin.dashboard') }}
      <span
        v-if="unreadCount > 0"
        class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </NuxtLink>
    <NuxtLink
      to="/admin/profiles"
      :class="active === 'profiles' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'"
    >
      {{ $t('admin.profiles') }}
    </NuxtLink>
    <NuxtLink
      to="/admin/categories"
      :class="active === 'categories' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'"
    >
      {{ $t('admin.categories') }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  active: 'dashboard' | 'profiles' | 'categories'
}>()

const { data } = await useAsyncData('admin-unread-count', () =>
  $fetch<{ count: number }>('/api/admin/contact-messages/count'),
{ server: false })

const unreadCount = computed(() => data.value?.count || 0)
</script>
