<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="container mx-auto px-4 py-16 text-center max-w-md">
      <p class="text-6xl font-bold text-primary mb-4">{{ error.statusCode }}</p>
      <h1 class="text-2xl font-semibold mb-2">{{ title }}</h1>
      <p class="text-muted-foreground mb-8">{{ description }}</p>
      <div class="flex gap-3 justify-center">
        <UiButton variant="outline" @click="handleError">Späť na úvod</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message?: string
  }
}>()

const title = computed(() => {
  switch (props.error.statusCode) {
    case 401: return 'Prístup zamietnutý'
    case 403: return 'Nemáte oprávnenie'
    case 404: return 'Stránka nenájdená'
    case 500: return 'Chyba servera'
    default: return 'Nastala chyba'
  }
})

const description = computed(() => {
  switch (props.error.statusCode) {
    case 401: return 'Pre zobrazenie tejto stránky sa musíte prihlásiť.'
    case 403: return 'Nemáte oprávnenie na zobrazenie tejto stránky.'
    case 404: return 'Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.'
    case 500: return 'Na serveri nastala chyba. Skúste to prosím neskôr.'
    default: return 'Skúste to prosím znova.'
  }
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>
