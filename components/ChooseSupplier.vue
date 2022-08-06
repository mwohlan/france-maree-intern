<script lang="ts" setup>
import Fuse from 'fuse.js'

import type { Supplier } from '~~/types'

const client = useSupabaseClient()
const store = useOrderStore()
store.resetAll()

const { selectedSupplier } = storeToRefs(store)
const { data: suppliers } = await useAsyncData('suppliers', async () => {
  try {
    const { data, error } = await client.from<Supplier>('supplier').select('*').order('name')
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('ChooseSupplier', error)
  }
}, { default: () => [] })

const supplierFilter = ref('')

useClearInput(supplierFilter)

const fuse = new Fuse(suppliers.value ?? [], {
  keys: ['name'],
  threshold: 0.4,
  ignoreLocation: true,
})

const filteredSuppliers = computed(() => {
  return supplierFilter.value === '' ? suppliers.value : fuse.search(supplierFilter.value).map(entry => entry.item)
})
</script>

<template>
  <div h-full>
    <h2 w-fit mx-auto font-extrabold mb-3 text-2xl text-sky-600>
      Bestellung anlegen
    </h2>

    <div border-gray-300 shadow-xl border p-2 rounded-xl class="h-95%">
      <div mx-auto w-fit font-bold text-xl text-sky-600 mb-2>
        Wähle Lieferant
      </div>
      <div class="max-w-xl relative">
        <input id="supplierFilter" v-model="supplierFilter" placeholder="hello" class="peer appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-sky-500 invalid:text-sky-600 disabled:cursor-not-allowed">
        <label for="supplierFilter" class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
          Lieferanten filtern
        </label>
      </div>
      <ul id="comboscroll" space-y-2 overflow-y-auto rounded-lg p-1 static mt-2>
        <li v-for="supplier in filteredSuppliers" :key="supplier!.id ?? 0">
          <NuxtLink to="bestellungen/neu" block font-semibold p-2 shadow border rounded border-gray-300 text-gray-700 cursor-pointer duration-150 hover="bg-gray-200" @click="selectedSupplier = supplier">
            {{ supplier.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
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
