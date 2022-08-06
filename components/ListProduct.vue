<script lang="ts" setup>
import Fuse from 'fuse.js'
import { useClearInput } from '~~/composables/clearInput'

import type { Product } from '~~/types'

const props = defineProps<{
  products: Product[]
  selectedProduct: Product | undefined
}>()

const emit = defineEmits<{
  (e: 'update:selectedProduct', product: Product): void
}>()

const fuse = computed(() => new Fuse(props.products as Product[] ?? [], {
  keys: ['description', 'supplier.name'],
  threshold: 0.4,
  ignoreLocation: true,
}))

const productFilter = ref('')

useClearInput(productFilter)

const filteredProducts = computedAsync(async () => {
  fuse.value.search(productFilter.value)
  return productFilter.value === '' ? props.products : fuse.value.search(productFilter.value).map(entry => entry.item)
})
</script>

<template>
  <div space-y-4 h="75%">
    <h2 w-fit mx-auto font-extrabold mb-3 text-2xl text-sky-600>
      Produkte Übersicht
    </h2>

    <div class="max-w-xl relative">
      <input id="productFilter" v-model="productFilter" placeholder="hello" class="peer appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-sky-500 invalid:text-sky-600 disabled:cursor-not-allowed">
      <label before="inline-block w-10 h-10 bg-red content-none" for="productFilter" class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
        Produkte filtern
      </label>
    </div>
    <div
      flex justify-center
      @click="emit('update:selectedProduct', {
        description: null,
        id: 0,
      })"
    >
      <div w="60%" hover="bg-green-400" shadow flex gap-x-2 items-center bg-green-3 rounded-xl font-semibold px-2 py-1 cursor-pointer duration-150>
        <div bg-green-700 i-ic:round-add-circle-outline />
        <div text-green-700>
          Produkt hinzufügen
        </div>
      </div>
    </div>
    <div id="comboscroll" overflow-y-auto border-gray-300 shadow-xl border p-2 rounded-xl class="h-95%">
      <div>
        <ul space-y-2 rounded-lg p-1 mt-2>
          <li v-for="product in filteredProducts" :key="product.id" @click="emit('update:selectedProduct', product)">
            <div p-2 border rounded shadow border-gray-300 cursor-pointer duration-150 hover:bg-gray-200 :class="[{ '!bg-gray-400': product.id === selectedProduct?.id }]">
              <div font-medium text-gray-800>
                {{ product.description }}
              </div>
              <div text-gray-600 text-sm font-medium w-fit ml-auto>
                {{ product?.supplier?.name }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
#comboscroll::-webkit-scrollbar-track
{

}
#comboscroll::-webkit-scrollbar
{
 @apply w-2
}

#comboscroll::-webkit-scrollbar-thumb
{
  @apply bg-gray-400 rounded
}
</style>
