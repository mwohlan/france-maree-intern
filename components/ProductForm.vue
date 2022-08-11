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
}>()

const client = useSupabaseClient()

const isSaving = ref(false)

const { selectedProduct } = toRefs(props)

const randomProductInsert = async () => {
  for (let index = 0; index < 1000; index++) {
    const { data: product, error } = await client.from<Product>('product').insert({
      description: `Product ${index}`,
      supplier_id: [55, 54, 56, null][Math.floor(Math.random() * 4)],
      price: Math.floor(Math.random() * 100),
    })
  }
}

const { data, refresh: resfreshPriceHistory } = await useAsyncData(`prices${props.selectedProduct.id}`, async () => {
  try {
    const { data, error } = await client.from('price').select('*').eq('product_id', props.selectedProduct.id).order('created_at', { ascending: false })
    if (error)
      throw error

    return data
  }
  catch (error) {
    console.error('ListProduct: Failed to Fetch Products', error)
  }
}, { initialCache: false })

const { data: units } = await useAsyncData('units', async () => {
  try {
    const { data, error } = await client.from('unitlist').select('*')
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('ProductForm: Failed to Fetch Units', error)
  }
}, { initialCache: false })

client.from('price').on('*', (payload) => {
  console.log(payload)
  resfreshPriceHistory()
}).subscribe()

onMounted(() => {
  // randomProductInsert()
})

const validationSchema = yup.object({
  description: yup.string().required('Bitte einen Produktnamen angeben').min(3, 'Produktname muss mindestens 3 Zeichen lang sein').nullable(),
  purchasingPrice: yup.number().transform((currentValue, originalValue) => {
    return originalValue === '' ? null : currentValue
  }).nullable(),
  price: yup.number().transform((currentValue, originalValue) => {
    return originalValue === '' ? null : currentValue
  }).moreThan(yup.ref('purchasingPrice')).nullable(),
  supplier: yup.object({
    name: yup.string().min(6),
  }),
})
const { errors, resetForm, meta, setValues, setFieldValue } = useForm({
  validationSchema,
})

useField<string>('description')
useField<number>('price')
useField<Supplier>('supplier.name')
useField<number>('purchasingPrice')

debouncedWatch([() => props.selectedProduct?.description, () => props.selectedProduct?.price, () => props.selectedProduct?.id, () => props.selectedProduct?.supplier, () => props.selectedProduct.purchasing_price, () => props.selectedProduct.prefered_unit.value], async ([newDescription, newPrice, newId, newSupplier, newPurchasingPrice, newPreferedUnit], [oldDescription, oldPrice, oldId, oldSupplier]) => {
  try {
    if (newId && meta.value.valid) {
      const { data: product, error } = await client.from<Product>('product').upsert({
        description: newDescription,
        supplier_id: newSupplier?.id,
        price: newPrice || null,
        purchasing_price: newPurchasingPrice || null,
        id: props.selectedProduct.id,
        prefered_unit: newPreferedUnit
      }).single()
      if (error)
        throw error
    }
    else if (!newId && meta.value.valid) {
      const { data: product, error } = await client.from<Product>('product').insert({
        description: newDescription,
        supplier_id: newSupplier?.id,
        price: newPrice,
        purchasing_price: newPurchasingPrice,
        prefered_unit: newPreferedUnit
      }).single()
      if (product)
        emit('update:selectedProduct', { ...product, supplier: newSupplier, justAdded: true })
      if (error)
        throw error
    }
  }
  catch (error) {
    console.error('AddEditProduct: Creating or Updating Product failed', error)
  }
  isSaving.value = false
}, { debounce: 500 })

const descriptionInput = ref<HTMLInputElement>()
const priceInput = ref<HTMLInputElement>()
const purchasingPriceInput = ref<HTMLInputElement>()
const noSupplier: Supplier = {
  id: null,
  name: 'Kein Lieferant',
  email: '',
}
const selectedSupplier = ref<Supplier>(props.selectedProduct?.supplier || noSupplier)
const supplierFilter = ref<string>('')
const preferedUnit = ref(props.selectedProduct?.prefered_unit ?? { value: 'keine Einheit' })

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
  meta.value.valid ? isSaving.value = true : isSaving.value = false
}

const updatedPrice = async (target: HTMLInputElement) => {
  emit('update:selectedProduct', { ...props.selectedProduct, price: target.value })
  meta.value.valid ? isSaving.value = true : isSaving.value = false
  try {
    const { data: price, error } = await client.from('price').insert({
      purchase: props.selectedProduct.purchasing_price,
      sell: target.value,
      product_id: props.selectedProduct.id,
    }).single()
    if (error)
      throw error
  }
  catch (error) {
    console.error('AddEditProduct: Creating or Updating Product failed', error)
  }
}

const updatedPurchasingPrice = async (event: Event) => {
  emit('update:selectedProduct', { ...props.selectedProduct, purchasing_price: event.target.value })
  meta.value.valid ? isSaving.value = true : isSaving.value = false
  try {
    const { data: price, error } = await client.from('price').insert({
      purchase: event.target.value,
      sell: props.selectedProduct.price,
      product_id: props.selectedProduct.id,
    }).single()
    if (error)
      throw error
  }
  catch (error) {
    console.error('AddEditProduct: Creating or Updating Product failed', error)
  }
}
watch(selectedSupplier, () => {
  emit('update:selectedProduct', { ...props.selectedProduct, supplier: selectedSupplier.value })
  meta.value.valid ? isSaving.value = true : isSaving.value = false
})

watch(() => props.selectedProduct.supplier, () => {
  selectedSupplier.value = props.selectedProduct.supplier ?? noSupplier
})

watch([() => props.selectedProduct.price, () => props.selectedProduct.description, () => props.selectedProduct.supplier, () => props.selectedProduct.purchasing_price, () => props.selectedProduct.prefered_unit.value], ([newPrice, newDescription, newSupplier, newPurchasingPrice, newPreferedUnit]) => {
  setFieldValue('description', newDescription)
  setFieldValue('price', newPrice ?? null)
  setFieldValue('supplier.name', newSupplier?.name)
  setFieldValue('purchasingPrice', newPurchasingPrice)
})

const deleteProduct = async () => {
  try {
    const { data: product, error } = await client.from<Product>('product')
      .delete()
      .match({ id: props.selectedProduct.id })
      .single()
    if (error)
      throw error
    emit('update:selectedProduct', { id: 0, description: '', price: null, supplier: noSupplier, justAdded: false })
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
      <div v-if="props.selectedProduct?.id">
        bearbeiten
      </div>
    </h2>

    <div border-gray-300 bg-light-2 shadow-xl border p-2 rounded-xl class="h-95%">
      <div flex>
        <div v-auto-animate class="space-y-6xl min-w-1/3 p-4">
          <div relative @click="descriptionInput?.focus()">
            <input ref="descriptionInput" :value="props.selectedProduct?.description" type="text" placeholder="a"
              class="peer transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed"
              @change="updatedDescription($event)">
            <label
              class="absolute bg-light-50 z-[0] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
              Beschreibung
            </label>
          </div>

          <div v-if="errors.description">
            {{ errors.description }}
          </div>

          <div relative @click="priceInput?.focus()">
            <input ref="priceInput" :value="props.selectedProduct?.price" step=".01" type="number" placeholder="a"
              class="peer font-semibold appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed"
              @change="updatedPrice($event.target)">
            <label
              class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
              VK Preis in €
            </label>
          </div>

          <div v-if="errors.price">
            {{ errors.price }}
          </div>

          <div relative @click="purchasingPriceInput?.focus()">
            <input ref="purchasingPriceInput" :value="props.selectedProduct?.purchasing_price" step=".01" type="number"
              placeholder="a"
              class="peer font-semibold appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed"
              @change="updatedPurchasingPrice($event)">
            <label
              class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
              EK Preis in €
            </label>
          </div>

          <div v-if="errors.purchasingPrice">
            {{ errors.purchasingPrice }}
          </div>

          <div relative>
            <Combobox v-model="selectedSupplier" as="div">
              <ComboboxButton w-full>
                <ComboboxInput placeholder="Lieferant"
                  class="peer font-semibold appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed"
                  :display-value="() => selectedSupplier?.name" @input="supplierFilter = $event.target.value" />
                <ComboboxLabel
                  class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
                  Lieferant auswählen
                </ComboboxLabel>
              </ComboboxButton>
              <TransitionRoot leave="ease-in duration-100" leave-from="opacity-100" leave-to="opacity-0"
                @after-leave="supplierFilter = ''">
                <ComboboxOptions
                  class="absolute z-1 mt-1 max-h-60 w-full overflow-auto rounded-md bg-light-50 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ComboboxOption v-slot="{ selected, active }" as="template" :value="noSupplier">
                    <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                      'bg-sky-600 text-white': active,
                      'text-gray-900': !active,
                    }">
                      <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }">
                        {{ noSupplier.name }}
                      </span>
                      <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-sky-600': !active }" />
                    </li>
                  </ComboboxOption>
                  <div v-if="filteredSuppliers.length === 0 && supplierFilter !== ''"
                    class="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nichts gefunden
                  </div>
                  <ComboboxOption v-for="filteredSupplier in filteredSuppliers" :key="filteredSupplier.id"
                    v-slot="{ selected, active }" as="template" :value="filteredSupplier">
                    <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                      'bg-sky-600 text-white': active,
                      'text-gray-900': !active,
                    }">
                      <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }">
                        {{ filteredSupplier.name }}
                      </span>
                      <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-sky-600': !active }" />
                    </li>
                  </ComboboxOption>
                </ComboboxOptions>
              </TransitionRoot>
            </Combobox>
          </div>
          <div v-if="errors['supplier.name']">
            {{ errors['supplier.name'] }}
          </div>
          <div relative>
            <Combobox v-model="preferedUnit" as="div">
              <ComboboxButton w-full>
                <ComboboxInput placeholder="Lieferant"
                  class="peer font-semibold appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed"
                  :display-value="() => preferedUnit?.value" />
                <ComboboxLabel
                  class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm ">
                  Bevorzugte Einheit auswählen
                </ComboboxLabel>
              </ComboboxButton>
              <TransitionRoot leave="ease-in duration-100" leave-from="opacity-100" leave-to="opacity-0">
                <ComboboxOptions
                  class="absolute z-1 mt-1 max-h-60 w-full overflow-auto rounded-md bg-light-50 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ComboboxOption v-for="unit in units" :key="unit" v-slot="{ selected, active }" as="template"
                    :value="unit">
                    <li class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                      'bg-sky-600 text-white': active,
                      'text-gray-900': !active,
                    }">
                      <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }">
                        {{ unit.value }}
                      </span>
                      <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3"
                        :class="{ 'text-white': active, 'text-sky-600': !active }" />
                    </li>
                  </ComboboxOption>
                </ComboboxOptions>
              </TransitionRoot>
            </Combobox>
          </div>
          <div v-if="errors['supplier.name']">
            {{ errors['supplier.name'] }}
          </div>
          <div flex items-center justify-between>
            <button v-if="selectedProduct?.id"
              class="px-3 py-1 bg-red-200 text-white flex items-center rounded-md shadow-md gap-x-2"
              @click="deleteProduct">
              <div bg-red-500 i-ic:round-delete />
              <div font-semibold text-red-500>
                Löschen
              </div>
            </button>
            <div v-if="isSaving" animate-spin w-7 h-7 bg-sky-400 i-heroicons-outline:refresh />
            <div v-else-if="props.selectedProduct?.id && !isSaving" w-7 h-7 bg-sky-400 i-heroicons-outline:badge-check
              @click="resetForm({
                values: {
                  description: '',
                },
              })" />
          </div>
        </div>
        <div>
          Notizen und Bestellhistorie
          {{ data }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
