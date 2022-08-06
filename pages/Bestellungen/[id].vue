<script lang="ts" setup>
const store = useOrderStore()

const { selectedSupplier, activeOrder } = storeToRefs(store)

if (!(selectedSupplier.value && activeOrder.value)) {

}
 
</script>

<template>
  <div>
    <div class="flex gap-x-2">
      <NuxtLink to="/Bestellungen" bg-sky-600 ml-2 mb-2 w-8 h-8 i-ic:outline-arrow-back @click="store.resetSelectedSupplier()" />
    </div>
    <div flex grow>
      <ChooseProduct grow shrink-0 />
      <OrderForm class="grow shrink-0" />
    </div>
  </div>
</template>

<style scoped></style>
