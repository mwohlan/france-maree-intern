<script lang="ts" setup>
import type { Order, OrderItem } from '~~/types'

const route = useRoute()
const client = useSupabaseClient()

// fetch name of the supplier
const { data: orderItems } = await useAsyncData('order-items', async () => {
  try {
    const { data, error } = await client.from<OrderItem>('order_item').select('*,product(*)')
      .eq('order_id', route.params.orderId as string)

    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('Print: getOrderItems failed', error)
  }
})
const { data: order } = await useAsyncData('order', async () => {
  try {
    const { data, error } = await client.from<Order>('order').select('*,supplier(*)').eq('id', route.params.orderId as string).single()
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('Print: Fetching Supplier Failed', error)
  }
})

definePageMeta({
  layout: 'print',
})
</script>

<template>
  <div border h-fit rounded-xl border-gray-300 rounded p-3 w-full>
    <img max-h-10 src="/francemaree.jpg">
    <div class="flex justify-center  gap-x-4 mb-3">
      <h2 w-fit font-bold text-xl text-sky-600>
        Bestellung bei {{ order?.supplier?.name }}
      </h2>
      <div self-end font-bold text-xs text-sky-600>
        vom {{ new Date().toLocaleString('de-DE', { dateStyle: 'full' }) }}
      </div>
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
            <tr :class="index % 2 === 0 ? 'bg-sky-50' : 'bg-white'">
              <td :class="index === orderItems?.length ?? 0 - 1 ? 'rounded-bl-md' : ''" class="whitespace-wrap py-2 pl-4 text-gray-900 ">
                <div w-10 relative>
                  {{ orderItem.amount }}
                </div>
              </td>
              <td class="whitespace-nowrap flex items-center  gap-x-2 px-2 py-2 text-sm text-gray-900">
                <div v-if="orderItem.unit === 'kg'" w-fit class="group" relative>
                  {{ orderItem.weight }}
                </div>
                <div> {{ orderItem.unit }}</div>
              </td>
              <td :class="{ 'rounded-br-md': index === orderItems?.length ?? 0 - 1 }" class="px-2 py-2 relative text-gray-900">
                <div>{{ orderItem?.price ? `${orderItem.price}€` : '-' }}</div>
              </td>
              <td :class="{ 'rounded-br-md': index === orderItems?.length ?? 0 - 1 }" class="px-2 py-2 relative text-gray-900">
                <div>{{ orderItem.product?.description }}</div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>

</style>
