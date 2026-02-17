<template>
  <div class="container mx-auto px-4 py-8 max-w-md">
    <h1 class="text-3xl font-bold mb-6 text-center">{{ $t('auth.register') }}</h1>
    <form class="space-y-4" @submit.prevent="handleRegister">
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('auth.email') }}</label>
        <UiInput v-model="email" type="email" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('auth.password') }}</label>
        <UiInput v-model="password" type="password" required minlength="6" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{ $t('auth.confirmPassword') }}</label>
        <UiInput v-model="confirmPassword" type="password" required minlength="6" />
      </div>
      <p v-if="passwordMismatch" class="text-destructive text-sm">Heslá sa nezhodujú.</p>
      <UiButton type="submit" class="w-full" :disabled="loading">
        {{ $t('auth.registerButton') }}
      </UiButton>
      <p v-if="errorMsg" class="text-destructive text-sm">{{ errorMsg }}</p>
      <p v-if="successMsg" class="text-green-600 text-sm">{{ successMsg }}</p>
    </form>
    <p class="text-center text-sm text-muted-foreground mt-4">
      {{ $t('auth.hasAccount') }}
      <NuxtLink to="/prihlasenie" class="text-primary hover:underline">{{ $t('auth.loginLink') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const client = useSupabaseClient()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const passwordMismatch = computed(() => {
  return confirmPassword.value && password.value !== confirmPassword.value
})

async function handleRegister() {
  if (password.value !== confirmPassword.value) return

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const { error } = await client.auth.signUp({
    email: email.value,
    password: password.value,
  })

  loading.value = false
  if (error) {
    errorMsg.value = error.message
  } else {
    successMsg.value = t('auth.registerSuccess')
  }
}

definePageMeta({ middleware: 'guest' })
</script>
