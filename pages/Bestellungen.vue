<script lang="ts" setup>
const store = useOrderStore()
const { selectedSupplier } = storeToRefs(store)

definePageMeta({
  pageTransition: usePageTransition(),
})
</script>

<template>
  <div flex p-7 class="h-full">
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
