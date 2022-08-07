import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    ['@pinia/nuxt', { autoImports: ['storeToRefs'] }],
    '@nuxtjs/color-mode',
    '@nuxtjs/supabase',
  ],
  autoImports: {
    imports: [
      { name: 'useForm', from: 'vee-validate' },
      { name: 'useField', from: 'vee-validate' },
      { name: 'useIsFormValid', from: 'vee-validate' },
      { name: '*', from: 'yup', as: 'yup' },

    ],
    dirs: [
      'composables/**',
    ],
  },
  ssr: true,
  experimental: {
    reactivityTransform: false,
    viteNode: false,
  },
  unocss: {
    preflight: false,
  },
  colorMode: {
    classSuffix: '',
  },
  typescript: {
    shim: false,
  },
  css: [
    '@unocss/reset/tailwind.css',
    'floating-vue/dist/style.css',
  ],
  vite: {
    optimizeDeps: {
      include: ['pinia'],
    },
  },
})
