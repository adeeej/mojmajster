<template>
  <footer class="border-t bg-muted/50 mt-auto">
    <div class="container mx-auto px-4 py-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        <!-- Brand -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <span class="font-bold text-lg">MojMajster</span>
          </div>
          <p class="text-sm text-muted-foreground">{{ $t('footer.aboutText') }}</p>
        </div>

        <!-- Popular searches -->
        <div>
          <h3 class="font-semibold mb-3">{{ $t('footer.popularSearches') }}</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><NuxtLink to="/search?category=kominar" class="hover:text-foreground">{{ $t('footer.mason') }}</NuxtLink></li>
            <li><NuxtLink to="/search?category=strechar" class="hover:text-foreground">{{ $t('footer.roofer') }}</NuxtLink></li>
            <li><NuxtLink to="/search?category=elektrikar" class="hover:text-foreground">{{ $t('footer.electrician') }}</NuxtLink></li>
            <li><NuxtLink to="/search?category=instalater" class="hover:text-foreground">{{ $t('footer.plumber') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- For masters -->
        <div>
          <h3 class="font-semibold mb-3">{{ $t('footer.forMasters') }}</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><NuxtLink to="/register" class="hover:text-foreground">{{ $t('nav.register') }}</NuxtLink></li>
            <li><NuxtLink to="/login" class="hover:text-foreground">{{ $t('nav.login') }}</NuxtLink></li>
            <li><NuxtLink to="/search" class="hover:text-foreground">{{ $t('nav.search') }}</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact / About -->
        <div>
          <h3 class="font-semibold mb-3">{{ $t('footer.about') }}</h3>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li>
              <a :href="`mailto:${$t('footer.contactEmail')}`" class="hover:text-foreground">
                {{ $t('footer.contactEmail') }}
              </a>
            </li>
            <li><NuxtLink to="/contact" class="hover:text-foreground">{{ $t('footer.contact') }}</NuxtLink></li>
          </ul>
        </div>

      </div>

      <div class="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
        &copy; {{ new Date().getFullYear() }} MojMajster. {{ $t('footer.rights') }}.
      </div>
    </div>
  </footer>
</template>
