export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
  ],

  supabase: {
    redirect: false,
    url: 'https://oxtsxylzgyzzjopaohmt.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dHN4eWx6Z3l6empvcGFvaG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDgyNjAsImV4cCI6MjA4NjkyNDI2MH0.GMBui2Dpnh4rsNb3_8_vQrQnnkfJ7kKjy704OHpmj7Y',
  },

  i18n: {
    locales: [
      { code: 'sk', name: 'Slovenčina', file: 'sk.json' },
      { code: 'cs', name: 'Čeština', file: 'cs.json' },
      { code: 'pl', name: 'Polski', file: 'pl.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'sk',
    lazy: true,
    langDir: 'locales',
    strategy: 'prefix_except_default',
  },

  app: {
    head: {
      title: 'MojMajster - Nájdi majstra na Kysuciach',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nájdite overených remeselníkov a majstrov v regióne Kysúc. Murári, strechári, elektrikári a ďalší.' },
        { property: 'og:title', content: 'MojMajster - Nájdi majstra na Kysuciach' },
        { property: 'og:description', content: 'Platforma na prepojenie remeselníkov s ľuďmi, ktorí ich hľadajú.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    adminEmail: process.env.ADMIN_EMAIL || '',
    public: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      adminEmail: process.env.ADMIN_EMAIL || '',
    },
  },
})
