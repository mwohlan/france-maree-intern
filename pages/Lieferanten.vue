<script lang="ts" setup>
import { usePageTransition } from '~~/composables/pageTransition'
import type { Supplier } from '~~/types'

const client = useSupabaseClient()
const selectedSupplier = ref<Supplier>()

const { data: suppliers, refresh: refreshSupplierList } = await useAsyncData('suppliers', async () => {
  try {
    const { data, error } = await client.from<Supplier>('supplier').select('*').order('name')
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('ListSupplier: Failed to Fetch Suppliers', error)
  }
}, {})

function resetSelectedSupplier() {
  selectedSupplier.value = {
    name: '',
    email: '',
    id: 0,

  }
}

function resetAll() {
  resetSelectedSupplier()
}

definePageMeta({
  pageTransition: usePageTransition(),
})
</script>

<template>
  <div flex px-7 pt-7 class="h-full">
    <div flex flex-1 gap-x-4>
      <ListSupplier v-model:selectedSupplier="selectedSupplier" flex-1 class="max-w-1/4 " :suppliers="suppliers" />
      <SupplierForm v-model:selectedSupplier="selectedSupplier" flex-1 @refresh-supplier-list="refreshSupplierList()" />
    </div>
  </div>
</template>

<style scoped></style>
