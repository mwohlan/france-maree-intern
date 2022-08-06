import FloatingVue from 'floating-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(FloatingVue, {
    themes: {
      light: {
        triggers: ['hover'],
        placement: 'top',
      },
    },
  })
})
