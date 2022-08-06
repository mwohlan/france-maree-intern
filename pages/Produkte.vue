<script lang="ts" setup>
import type { Product, Supplier } from '~~/types'
import ListProduct from '~~/components/ListProduct.vue'
import { usePageTransition } from '~~/composables/pageTransition'

const client = useSupabaseClient()
const selectedProduct = ref<Product>({
  description: '',
  id: 0,
  created_at: (new Date()).toLocaleString(),
  updated_at: (new Date()).toLocaleString(),

})

// const { data, refresh: refreshProductList } = await useAsyncData('products', async () => {
//   try {
//     const { data, error } = await client.from<Product>('product').select('*,supplier(*)')
//     if (error)
//       throw error
//     return data
//   }
//   catch (error) {
//     console.error('ListProduct: Failed to Fetch Products', error)
//   }
// }, { initialCache: false })

const { data, refresh: refreshProductList } = await useAsyncData('products', async () => {
  return await useSupabaseFetch(
    client.from<Product>('product').select('*,supplier(*)', { count: 'estimated' }),
    'ListProduct: Failed to Fetch Products')
}, { initialCache: false })

const { data: suppliers } = await useAsyncData('supplier', async () => {
  try {
    const { data, error } = await client.from<Supplier>('supplier').select('*').order('name')
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('ListProduct: Failed to Fetch Suppliers', error)
  }
}, {})

const subscribtion = client
  .from('product')
  .on('*', (payload) => {
    console.log(payload)
    refreshProductList()
  })
  .subscribe()
  .onError((error) => {
    console.error('Product: Failed to Subscribe to Products', error)
  })

const products = computed(() => data.value?.sort((a, z) => a.description.localeCompare(z.description)))

function resetSelectedProduct() {
  selectedProduct.value = {
    description: '',
    id: 0,

  }
}

function resetAll() {
  resetSelectedProduct()
}

definePageMeta({
  pageTransition: usePageTransition(),
})
</script>

<template>
  <div flex px-7 pt-7 class="h-95%">
    <div flex flex-1 gap-x-4>
      <ListProduct v-model:selectedProduct="selectedProduct" flex-1 class="max-w-1/4" :products="products" />
      <ProductForm :key="selectedProduct.justAdded ? 0 : selectedProduct.id" v-model:selectedProduct="selectedProduct" :suppliers="suppliers" flex-1 />
    </div>
  </div>
</template>

<style scoped></style>
