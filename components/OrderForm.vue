<script lang="ts" setup>
const store = useOrderStore()
const client = useSupabaseClient()
const { orderItems, selectedSupplier, activeOrderId, isSaving } = storeToRefs(store)

store.getOrderItems()
</script>

<template>
  <div border h-fit rounded-xl border-gray-300 rounded p-3 w="50%">
    <div class="flex justify-center items-center gap-x-4 mb-3">
      <h2 w-fit max-w-30 font-bold text-xl text-sky-600>
        Bestellung bei {{ selectedSupplier?.name }}
      </h2>

      <div v-if="isSaving" animate-spin w-7 h-7 bg-sky-400 i-heroicons-outline:refresh />
      <div v-else-if="activeOrderId && !isSaving" w-7 h-7 bg-sky-400 i-heroicons-outline:badge-check />
    </div>

    <div rounded-md border-sky-400>
      <table class="divide-y w-full divide-sky-300">
        <thead class="bg-sky-200">
          <tr>
            <th scope="col" class="pl-2 w-10% py-3.5 rounded-tl-md text-left font-semibold text-gray-900">
              Anzahl
            </th>
            <th scope="col" class="pl-2 w-15% py-3.5 text-left  font-semibold text-gray-900">
              Einheit
            </th>
            <th scope="col" class="pl-2 w-10% py-3.5 text-left  font-semibold text-gray-900">
              Preis
            </th>
            <th scope="col" class="pl-2 rounded-tr-md whitespace-nowrap py-3.5 text-left  font-semibold text-gray-900">
              Beschreibung
            </th>
          </tr>
        </thead>
        <tbody class="divide-y cursor-pointer divide-sky-200 bg-white">
          <template v-for="(orderItem, index) in orderItems" :key="orderItem.id">
            <OrderFormElement :index="index" :is-last-index="index === (orderItems?.length ?? 0) - 1 " :order-item="orderItem" />
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

</style>
