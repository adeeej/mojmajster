<template>
  <header class="border-b bg-white sticky top-0 z-50">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">M</span>
        </div>
        <span class="font-bold text-xl text-foreground">MojMajster</span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink to="/hladaj" class="text-muted-foreground hover:text-foreground transition-colors">
          {{ $t('nav.search') }}
        </NuxtLink>
        <template v-if="!user">
          <NuxtLink to="/registracia" class="text-muted-foreground hover:text-foreground transition-colors">
            {{ $t('nav.register') }}
          </NuxtLink>
          <NuxtLink
            to="/prihlasenie"
            class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {{ $t('nav.login') }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/profil/upravit" class="text-muted-foreground hover:text-foreground transition-colors">
            {{ $t('nav.profile') }}
          </NuxtLink>
          <button
            class="text-muted-foreground hover:text-foreground transition-colors"
            @click="handleLogout"
          >
            {{ $t('nav.logout') }}
          </button>
        </template>
      </nav>

      <!-- Mobile menu button -->
      <button class="md:hidden p-2" @click="mobileMenuOpen = !mobileMenuOpen">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t bg-white">
      <nav class="container mx-auto px-4 py-4 flex flex-col gap-3">
        <NuxtLink to="/hladaj" class="text-muted-foreground hover:text-foreground" @click="mobileMenuOpen = false">
          {{ $t('nav.search') }}
        </NuxtLink>
        <template v-if="!user">
          <NuxtLink to="/registracia" class="text-muted-foreground hover:text-foreground" @click="mobileMenuOpen = false">
            {{ $t('nav.register') }}
          </NuxtLink>
          <NuxtLink to="/prihlasenie" class="text-muted-foreground hover:text-foreground" @click="mobileMenuOpen = false">
            {{ $t('nav.login') }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/profil/upravit" class="text-muted-foreground hover:text-foreground" @click="mobileMenuOpen = false">
            {{ $t('nav.profile') }}
          </NuxtLink>
          <button class="text-left text-muted-foreground hover:text-foreground" @click="handleLogout">
            {{ $t('nav.logout') }}
          </button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()
const mobileMenuOpen = ref(false)

async function handleLogout() {
  await client.auth.signOut()
  mobileMenuOpen.value = false
  navigateTo('/')
}
</script>
