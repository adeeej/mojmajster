<template>
  <div class="container mx-auto px-4 py-8 max-w-lg">
    <h1 class="text-3xl font-bold mb-6">{{ $t('contact.title') }}</h1>
    <p class="text-muted-foreground mb-6">
      Máte otázku? Napíšte nám a my sa vám ozveme.
    </p>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <UiInput v-model="form.name" :placeholder="$t('contact.name')" required />
      <UiInput v-model="form.email" type="email" :placeholder="$t('contact.email')" required />
      <UiTextarea v-model="form.message" :placeholder="$t('contact.messagePlaceholder')" required />
      <UiButton type="submit" :disabled="loading">Odoslať</UiButton>
      <p v-if="success" class="text-green-600 text-sm">Správa bola odoslaná!</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const success = ref(false)

const form = reactive({
  name: '',
  email: '',
  message: '',
})

async function handleSubmit() {
  loading.value = true
  // In a real app, send to an API endpoint
  await new Promise(resolve => setTimeout(resolve, 500))
  loading.value = false
  success.value = true
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>
