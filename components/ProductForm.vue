<script lang="ts" setup>
import Fuse from 'fuse.js'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
  TransitionRoot,
} from '@headlessui/vue'
import type { Product, Supplier } from '~~/types'

const props = defineProps<{
  selectedProduct: Product
  suppliers: Supplier[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedProduct', product: Product): void
  (e: 'refreshProductList'): void
}>()

const client = useSupabaseClient()

const isSaving = ref(false)

debouncedWatch([() => props.selectedProduct?.description, () => props.selectedProduct?.price, () => props.selectedProduct?.id, () => props.selectedProduct?.supplier], async ([newDescription, newPrice, newId, newSupplier], [oldDescription, oldPrice, oldId, oldSupplier]) => {
  try {
    if (newId && newId === oldId) {
      console.log('newPrice', newPrice, 'oldPrice', oldPrice)
      const { data: product, error } = await client.from<Product>('product').upsert({
        description: newDescription,
        supplier_id: newSupplier?.id,
        price: newPrice || null,
        id: props.selectedProduct.id,
      }).single()
      if (error)
        throw error
    }
    else if (!newId && newDescription) {
      const { data: product, error } = await client.from<Product>('product').insert({
        description: newDescription,
        supplier_id: newSupplier?.id,
        price: newPrice,
      }).single()
      if (product)
        emit('update:selectedProduct', { ...product, supplier: newSupplier })
      if (error)
        throw error
    }
    emit('refreshProductList')
  }
  catch (error) {
    console.error('AddEditProduct: Creating or Updating Product failed', error)
  }
  isSaving.value = false
}, { debounce: 500 })

const descriptionInput = ref<HTMLInputElement>()
const priceInput = ref<HTMLInputElement>()

const noSupplier: Supplier = {
  id: null,
  name: 'Kein Lieferant',
  email: '',
}
const selectedSupplier = ref<Supplier>(noSupplier)
const supplierFilter = ref<string>('')

const fuse = new Fuse(props.suppliers ?? [], {
  keys: ['name'],
  threshold: 0.5,
  ignoreLocation: true,
})

const filteredSuppliers = computed(() => {
  return supplierFilter.value === '' ? props.suppliers : fuse.search(supplierFilter.value).map(({ item }) => item)
})

const updatedDescription = (event: Event) => {
  emit('update:selectedProduct', { ...props.selectedProduct, description: event.target.value })
  isSaving.value = true
}

const updatedPrice = (event: Event) => {
  emit('update:selectedProduct', { ...props.selectedProduct, price: event.target.value })
  isSaving.value = true
}

watch(selectedSupplier, () => {
  emit('update:selectedProduct', { ...props.selectedProduct, supplier: selectedSupplier.value })
  isSaving.value = true
})

watch(() => props.selectedProduct.supplier, () => {
  selectedSupplier.value = props.selectedProduct.supplier ?? noSupplier
})

const deleteProduct = async () => {
  try {
    const { data: product, error } = await client.from<Product>('product')
      .delete()
      .match({ id: props.selectedProduct.id })
      .single()
    if (error)
      throw error
    emit('update:selectedProduct', { id: 0, description: '' })
  }
  catch (error) {
    console.error('ProductForm: Deleting Product failed', error)
  }
}
</script>

<template>
  <div>
    <h2 flex gap-x-2 w-fit mx-auto font-extrabold mb-3 text-2xl text-sky-600>
      <div max-w-80 truncate>
        {{ props.selectedProduct?.id ? props.selectedProduct.description : 'Produkt hinzufügen' }}
      </div>

      <div v-if="props.selectedProduct?.id">bearbeiten</div>
    </h2>

    <div border-gray-300 shadow-xl border p-2 rounded-xl class="h-95%">
      <div flex>
        <div class="flex-1 space-y-6xl max-w-1/3 p-4">
          <div relative @click="descriptionInput?.focus()">
            <input ref="descriptionInput" :value="props.selectedProduct?.description" type="text" placeholder="a" class="peer transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed" @input="updatedDescription($event)">
            <label class="absolute bg-light-50 z-[0] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
              Beschreibung
            </label>
          </div>
          <div relative @click="priceInput?.focus()">
            <input ref="priceInput" :value="props.selectedProduct?.price" step=".01" type="number" placeholder="a" class="peer appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed" @input="updatedPrice($event)">
            <label class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
              Preis in €
            </label>
          </div>
          <div relative>
            <Combobox v-model="selectedSupplier">
              <ComboboxButton w-full>
                <ComboboxInput
                  placeholder="Lieferant"
                  class="peer appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed"
                  :display-value="() => selectedSupplier?.name"
                  @input="supplierFilter = $event.target.value"
                />
                <ComboboxLabel class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
                  Lieferant auswählen
                </ComboboxLabel>
              </ComboboxButton>

              <TransitionRoot
                leave="ease-in duration-100"
                leave-from="opacity-100"
                leave-to="opacity-0"
                @after-leave="supplierFilter = ''"
              >
                <ComboboxOptions
                  class="absolute z-1 mt-1 max-h-60 w-full overflow-auto rounded-md bg-light-50 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                >
                  <ComboboxOption

                    v-slot="{ selected, active }"
                    as="template"
                    :value="noSupplier"
                  >
                    <li
                      class="relative cursor-default select-none py-2 pl-10 pr-4"
                      :class="{
                        'bg-sky-600 text-white': active,
                        'text-gray-900': !active,
                      }"
                    >
                      <span
                        class="block truncate"
                        :class="{ 'font-medium': selected, 'font-normal': !selected }"
                      >
                        {{ noSupplier.name }}
                      </span>
                      <span
                        v-if="selected"
                        class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-sky-600': !active }"
                      />
                    </li>
                  </ComboboxOption>
                  <div
                    v-if="filteredSuppliers.length === 0 && supplierFilter !== ''"
                    class="relative cursor-default select-none py-2 px-4 text-gray-700"
                  >
                    Nichts gefunden
                  </div>

                  <ComboboxOption
                    v-for="filteredSupplier in filteredSuppliers"
                    :key="filteredSupplier.id"
                    v-slot="{ selected, active }"
                    as="template"
                    :value="filteredSupplier"
                  >
                    <li
                      class="relative cursor-default select-none py-2 pl-10 pr-4"
                      :class="{
                        'bg-sky-600 text-white': active,
                        'text-gray-900': !active,
                      }"
                    >
                      <span
                        class="block truncate"
                        :class="{ 'font-medium': selected, 'font-normal': !selected }"
                      >
                        {{ filteredSupplier.name }}
                      </span>
                      <span
                        v-if="selected"
                        class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-sky-600': !active }"
                      />
                    </li>
                  </ComboboxOption>
                </ComboboxOptions>
              </TransitionRoot>
            </Combobox>
          </div>
          <div flex items-center justify-between>
            <button v-if="selectedProduct?.id" class="px-3 py-1 bg-red-200 text-white flex items-center rounded-md shadow-md gap-x-2" @click="deleteProduct">
              <div bg-red-500 i-ic:round-delete />
              <div font-semibold text-red-500>
                Löschen
              </div>
            </button>
            <div v-if="isSaving" animate-spin w-7 h-7 bg-sky-400 i-heroicons-outline:refresh />
            <div v-else-if="props.selectedProduct?.id && !isSaving" w-7 h-7 bg-sky-400 i-heroicons-outline:badge-check />
          </div>
        </div>
        <div> Notizen und Bestellhistorie</div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
