import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/supabase',
  ],
  autoImports: {
    imports: [
      { name: 'storeToRefs', from: 'pinia', as: 'storeToRefs' },
    ],
  },
  ssr: true,
  experimental: {
    reactivityTransform: false,
    viteNode: false,
  },
  unocss: {
    preflight: true,
  },
  colorMode: {
    classSuffix: '',
  },
  typescript: {
    shim: false,
  },

})
