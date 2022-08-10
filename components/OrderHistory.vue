<script lang="ts"  setup>
import type { OrderHistory } from '~~/types/index.js'

const store = useOrderStore()
const { selectedSupplier, activeOrder } = storeToRefs(store)

const client = useSupabaseClient()
const { data: orders } = await useAsyncData('orders', async () => {
  try {
    const { data, error } = await client.from<OrderHistory>('order_history').select('*').order('updated_at', { ascending: false })
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('OrderHistory', error)
  }
}, { initialCache: false })
</script>

<template>
  <div class="w-3/8">
    <h2 w-fit mx-auto font-extrabold mb-3 text-2xl text-sky-600>
      Bestellungen Übersicht
    </h2>

    <div border-gray-300 shadow-xl class="h-95%" border-1 rounded-xl p-1>
      <ul id="comboscroll" p-2 space-y-3 of-auto>
        <li
          v-for="order in orders" :key="order.id" border-1 space-y-2 cursor-pointer rounded-md border-gray-300 hover:bg-gray-200
          px-2 py-4
        >
          <NuxtLink space-y-2 :to="`Bestellungen/${order.id}`" @click="store.selectOrder(order)">
            <div flex justify-between items-center gap-x-6>
              <div>{{ order.name }}</div>
              <div shadow bg-gray-200 px-2 rounded-md text-gray-600 font-semibold text-sm>
                {{ order.orderitemcount }} Artikel
              </div>
            </div>
            <div text-gray-600 text-sm flex justify-between>
              <div
                px-2 rounded-lg shadow
                :class="order.status === 'Abgeschlossen' ? 'bg-green-300 text-green-800' : 'bg-yellow-300 text-yellow-800'"
              >
                Status: {{ order.status }}
              </div>
              <VTooltip theme="light">
                <div>
                  {{ useGermanTimeAgo(new Date(order.updated_at)).value }}
                </div>
                <template #popper>
                  <div text-red-500 font-bold>
                    {{ new Date(order.updated_at).toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'medium' }) }}
                  </div>
                </template>
              </VTooltip>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
.v-popper--theme-light .v-popper__inner {
  background: #ebebeb;
  color: #4f4f4f;
  padding: 12px;
  border: none;
  border-radius: 10px;
}

.v-popper--theme-light .v-popper__arrow-outer {
  border-color: #ebebeb;
}

.v-popper--theme-light .v-popper__arrow-inner {
  visibility: hidden;
}
#comboscroll::-webkit-scrollbar-track
{

}
#comboscroll::-webkit-scrollbar
{
 width: 0.5rem;
}

#comboscroll::-webkit-scrollbar-thumb
{
  background-color: rgba(156, 163, 175, 0.7);
  border-radius: 0.25rem;
}
</style>
