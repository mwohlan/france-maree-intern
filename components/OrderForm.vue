<script lang="ts" setup>
const store = useOrderStore()
const client = useSupabaseClient()
const { orderItems, selectedSupplier, activeOrder, isSaving } = storeToRefs(store)

store.getOrderItems()

const pending = ref(true)

const link = ref<HTMLAnchorElement>()

const fetchPdf = async () => {
  if (pending.value) {
    const { data } = await useFetch<Blob>('https://v2.api2pdf.com/chrome/pdf/url', {
      initialCache: false,
      server: false,
      method: 'POST',
      body: {
        url: `https://prismatic-cendol-6d0805.netlify.app/print/${activeOrder.value?.id}`,
        inline: false,
        fileName: `Bestellung bei ${selectedSupplier.value?.name} vom ${new Date().toLocaleString('de-DE', { dateStyle: 'short' })}.pdf`,
        options: {
          puppeteerWaitForMethod: 'WaitForSelector',
          puppeteerWaitForValue: 'td',
        },

      },
      headers: {
        Authorization: '2aac5c19-3e35-4359-8008-04a9dc76b2b0',
      },
    })

    console.log(data.value)
    link.value.href = data.value.FileUrl
    pending.value = false
  }
}
fetchPdf()
</script>

<template>
  <div border h-fit rounded-xl border-gray-300 rounded p-3 w="50%">
    <div class="flex justify-center items-center gap-x-4 mb-3">
      <h2 w-fit font-bold text-xl text-sky-600>
        Bestellung bei {{ selectedSupplier?.name }}
      </h2>

      <div v-if="isSaving" animate-spin w-7 h-7 bg-sky-400 i-heroicons-outline:refresh />
      <div v-else-if="activeOrder?.id && !isSaving" w-7 h-7 bg-sky-400 i-heroicons-outline:badge-check />
    </div>

    <div rounded-md border-sky-400 mb-10>
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
    <div flex justify-between items-center>
      <a ref="link" flex justify-center shadow download="hello.pdf" target="_blank" w-fit min-w-26 px-3 py-2 rounded-md bg-sky-400 text-white @click="fetchPdf"> <div v-if="pending" animate-spin w-5 h-5 bg-white i-heroicons-outline:refresh /> <div v-else font-semibold>Download</div></a>
      <div
        px-2 cursor-pointer
        rounded-lg shadow :class="activeOrder?.status === 'Abgeschlossen' ? 'bg-green-300 text-green-800' : 'bg-yellow-300 text-yellow-800'"
        @click="store.toggleOrderStatus()"
      >
        Status: {{ activeOrder?.status }}
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
