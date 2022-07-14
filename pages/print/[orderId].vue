<script lang="ts" setup>
import type { OrderItem } from '~~/types'

const route = useRoute()
const client = useSupabaseClient()
const { data: orderItems } = await useAsyncData('order-items', async () => {
  try {
    const { data, error } = await client.from<OrderItem>('order_item').select('*,product(*)')
      .eq('order_id', route.params.orderId as string)

    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('OrderStore: getOrderItems failed', error)
  }
})

definePageMeta({
  layout: 'print',
})
console.time('pdf')
const { data } = await useFetch<Blob>('https://v2.api2pdf.com/chrome/pdf/url?url=https://timelino.vercel.app/&apikey=2aac5c19-3e35-4359-8008-04a9dc76b2b0', { server: false })
console.timeEnd('pdf')
const link = ref<HTMLAnchorElement>()

// whenever(() => pending.value === false, () => {
//   link.value.href = window.URL.createObjectURL(data.value)
//   link.value.download = 'timelino.pdf'
// })
</script>

<template>
  <div border h-fit rounded-xl border-gray-300 rounded p-3 w-full>
    <div class="flex justify-center items-center gap-x-4 mb-3">
      <h2 w-fit font-bold text-xl text-sky-600>
        Bestellung bei Hans Wurst
      </h2>
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
                <div> {{ orderItem.unit}}</div>
              </td>
              <td :class="{ 'rounded-br-md': index === orderItems?.length ?? 0 - 1 }" class="px-2 py-2 relative text-gray-900">
                <div>{{ orderItem?.price ? orderItem.price : '-' }}</div>
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
