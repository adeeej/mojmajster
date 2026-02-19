<template>
  <div class="container mx-auto px-4 py-8 max-w-md">
    <h1 class="text-3xl font-bold mb-6 text-center">{{ $t('auth.login') }}</h1>
    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('auth.email') }}</label>
        <UiInput v-model="email" type="email" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('auth.password') }}</label>
        <UiInput v-model="password" type="password" required />
      </div>
      <UiButton type="submit" class="w-full" :disabled="loading">
        {{ $t('auth.loginButton') }}
      </UiButton>
      <p v-if="errorMsg" class="text-destructive text-sm">{{ errorMsg }}</p>
    </form>
    <p class="text-center text-sm text-muted-foreground mt-4">
      {{ $t('auth.noAccount') }}
      <NuxtLink to="/registracia" class="text-primary hover:underline">{{ $t('auth.registerLink') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const client = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  loading.value = false
  if (error) {
    errorMsg.value = t('auth.error')
  } else {
    const { data } = await useFetch('/api/admin/check')
    if (data.value?.isAdmin) {
      navigateTo('/admin')
    } else {
      navigateTo('/profil/upravit')
    }
  }
}

definePageMeta({ middleware: 'guest' })
</script>
