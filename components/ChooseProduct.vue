<script lang="ts" setup>
import Fuse from 'fuse.js'
import type { Product } from '~~/types'

const store = useOrderStore()

const { selectedSupplier } = storeToRefs(store)

if (!selectedSupplier.value) {
 await store.setByOrderId(useRoute().params.id)
}

const client = useSupabaseClient()


const { data: products } = await useAsyncData(`products${selectedSupplier.value?.id}`, async () => {
  try {
    const { data, error } = await client.from<Product>('product').select('*').or(`supplier_id.is.null,supplier_id.eq.${selectedSupplier.value?.id}`)
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('Fetching products failed', error)
  }
}, { initialCache: false })

const productFuse = new Fuse(products.value ?? [] as Product[], {
  keys: ['description'],
  threshold: 0.5,
  ignoreLocation: true,
})

const productFilter = ref('')

useClearInput(productFilter)

const filteredProducts = computed(() => {
  return productFilter.value === '' ? products.value : productFuse.search(productFilter.value).map(entry => entry.item)
})
</script>

<template>
  <div px-3 min-h-xl gap-x-4 flex>
    <div w="50%" grow  border-gray-300 shadow-xl border p-3 rounded-xl>
      <div relative justify-center flex gap-x-2 items-center w-full font-bold text-xl text-sky-600 mb-2>
        <div>Wähle Produkt</div>
      </div>
      <div class="max-w-xl relative">
        <input
          id="productFilter" v-model="productFilter" type="text" placeholder="hello"
          class="peer appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-sky-500 invalid:text-sky-600 disabled:cursor-not-allowed"
        >
        <label
          for="productFilter"
          class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm "
        >
          Produkte filtern
        </label>
      </div>
      <div id="comboscroll" as="div" class="max-h-44rem" h-fit rounded-md rounded-lg overflow-y-auto static px-2 mt-2>
        <table class="divide-y w-full rounded-lg  divide-sky-300">
          <thead class="bg-sky-200 sticky top-0">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left font-semibold text-gray-900 sm:pl-6">
                Beschreibung
              </th>
              <th scope="col" class="px-2 py-3.5 text-left  font-semibold text-gray-900">
                Preis
              </th>
              <th scope="col" class="px-2 whitespace-nowrap py-3.5 text-left  font-semibold text-gray-900">
                Geändert am
              </th>
            </tr>
          </thead>
          <tbody class="divide-y cursor-pointer divide-sky-200 bg-white">
            <tr
              v-for="(product, index) in filteredProducts" :key="product.id" hover="bg-sky-100"
              :class="index % 2 === 0 ? 'bg-sky-50' : 'bg-white'" border-collapse
              @click="store.addToOrderItems(product)"
            >
              <td class="whitespace-wrap py-2 pl-4 pr-3 text-gray-900 sm:pl-6">
                {{ product.description }}
              </td>
              <td class="whitespace-nowrap px-2 py-2 font-bold text-sm text-gray-900">
                {{ product.price ? `${product.price} €` : '-' }}
              </td>
              <td class="px-2 py-2 text-sm text-gray-600">
                {{ new Date(product.updated_at).toLocaleString('De-de', { dateStyle: 'medium' }) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
#comboscroll::-webkit-scrollbar-track {}

#comboscroll::-webkit-scrollbar {
  width: 0.5rem;
}

#comboscroll::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.7);
  border-radius: 0.25rem;
}
</style>
