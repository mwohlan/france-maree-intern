<script lang="ts" setup>
const store = useOrderStore()
const { selectedSupplier } = storeToRefs(store)

console.time('pdf')
const { data,pending } = useLazyFetch<Blob>('https://v2.api2pdf.com/chrome/pdf/url?url=https://prismatic-cendol-6d0805.netlify.app/print/112&apikey=2aac5c19-3e35-4359-8008-04a9dc76b2b0', { server: false })
console.timeEnd('pdf')
const link = ref<HTMLAnchorElement>()

whenever(() => pending.value === false, () => {
  console.log(data.value)
  link.value.href = window.URL.createObjectURL(data.value)
  link.value.download = 'timelino.pdf'
})

definePageMeta({
  pageTransition: usePageTransition(),
})
</script>

<template>
  <div flex p-7 class="h-full">
    <a ref="link">{{pending ? 'wait' : 'Download'}}</a>
    <Transition
      leave-to-class="op-0 -translate-x-20"
      leave-active-class="duration-200"
      enter-from-class="op-0 translate-x-20"
      enter-active-class="duration-300"
      enter-to-class="op-100 translate-x-0"
      mode="out-in"
    >
      <div v-if="!selectedSupplier" flex flex-1 gap-x-4>
        <ChooseSupplier class="w-1/3" />
        <OrderHistory grow />
      </div>
      <div v-else grow>
        <div class="flex gap-x-2">
          <button bg-sky-600 ml-2 mb-2 w-8 h-8 i-ic:outline-arrow-back @click="store.resetSelectedSupplier()" />
        </div>
        <div flex grow>
          <ChooseProduct grow shrink-0 />
          <OrderForm class="grow shrink-0" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>

</style>
