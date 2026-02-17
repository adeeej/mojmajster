<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('admin.categories') }}</h1>

    <!-- Admin Nav -->
    <div class="flex gap-4 mb-8">
      <NuxtLink to="/admin" class="text-muted-foreground hover:text-foreground">{{ $t('admin.dashboard') }}</NuxtLink>
      <NuxtLink to="/admin/profily" class="text-muted-foreground hover:text-foreground">{{ $t('admin.profiles') }}</NuxtLink>
      <NuxtLink to="/admin/kategorie" class="text-primary font-medium">{{ $t('admin.categories') }}</NuxtLink>
    </div>

    <!-- Add Category -->
    <UiCard class="p-4 mb-6">
      <h3 class="font-semibold mb-3">{{ $t('admin.addCategory') }}</h3>
      <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="addCategory">
        <UiInput v-model="newCategory.name" :placeholder="$t('admin.categoryName')" required />
        <UiInput v-model="newCategory.slug" :placeholder="$t('admin.categorySlug')" required />
        <UiInput v-model="newCategory.icon" :placeholder="$t('admin.categoryIcon')" />
        <UiButton type="submit">{{ $t('admin.addCategory') }}</UiButton>
      </form>
    </UiCard>

    <!-- List -->
    <div class="space-y-2">
      <UiCard v-for="cat in categories" :key="cat.id" class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-xl">{{ getCategoryIcon(cat.icon) }}</span>
            <div>
              <span class="font-medium">{{ cat.name }}</span>
              <span class="text-sm text-muted-foreground ml-2">({{ cat.slug }})</span>
            </div>
          </div>
          <UiButton size="sm" variant="destructive" @click="deleteCategory(cat.id)">
            {{ $t('admin.delete') }}
          </UiButton>
        </div>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types/database'
import { categoryIconMap } from '~/composables/useCategories'

definePageMeta({ middleware: 'admin' })

const newCategory = reactive({ name: '', slug: '', icon: 'wrench' })

const { data: categories, refresh } = await useAsyncData('admin-categories', async () => {
  const { data } = await $fetch<{ data: Category[] }>('/api/admin/categories')
  return data || []
})

function getCategoryIcon(icon: string) {
  return categoryIconMap[icon] || '🔧'
}

async function addCategory() {
  await $fetch('/api/admin/categories', {
    method: 'POST',
    body: newCategory,
  })
  newCategory.name = ''
  newCategory.slug = ''
  newCategory.icon = 'wrench'
  refresh()
}

async function deleteCategory(id: number) {
  await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
