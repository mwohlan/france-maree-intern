import type { Ref } from 'nuxt/dist/app/compat/vue-demi'

export const useClearInput = (input: Ref<string>) => {
  const { escape, delete: del } = useMagicKeys()
  watch([escape, del], () => {
    if (escape.value || del.value)
      input.value = ''
  })
}
