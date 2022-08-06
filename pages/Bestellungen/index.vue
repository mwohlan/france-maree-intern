<script lang="ts" setup>
const store = useOrderStore()
const { selectedSupplier } = storeToRefs(store)

definePageMeta({
  pageTransition: usePageTransition(),
})
</script>

<template>
  <div flex gap-x-4 p-7 class="h-full">
    <ChooseSupplier class="w-1/3" />
    <OrderHistory grow />
  </div>
</template>

<style scoped>

</style>
