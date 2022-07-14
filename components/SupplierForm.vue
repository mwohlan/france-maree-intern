<script lang="ts" setup>
import type { Supplier } from '~~/types'

const props = defineProps<{
  selectedSupplier: Supplier
}>()

const emit = defineEmits<{
  (e: 'update:selectedSupplier', supplier: Supplier): void
  (e: 'refreshSupplierList'): void
}>()

const client = useSupabaseClient()

const isSaving = ref(false)
debouncedWatch([() => props.selectedSupplier?.name, () => props.selectedSupplier?.email, () => props.selectedSupplier?.id], async ([newName, newEmail, newId], [oldName, oldEmail, oldId]) => {
  try {
    if (newId && newId === oldId) {
      const { data: supplier, error } = await client.from<Supplier>('supplier').upsert({
        name: newName,
        email: newEmail,
        id: props.selectedSupplier.id,
      }).single()
      if (error)
        throw error
    }
    else if (!newId && newName) {
      const { data: supplier, error } = await client.from<Supplier>('supplier').insert({
        name: newName,
        email: newEmail,
      }).single()
      if (supplier)
        emit('update:selectedSupplier', { ...supplier })
      if (error)
        throw error
    }
    emit('refreshSupplierList')
  }
  catch (error) {
    console.error('AddEditSupplier: Creating or Updating Supllier failed', error)
  }
  isSaving.value = false
}, { debounce: 500 })

const nameInput = ref<HTMLInputElement>()
const emailInput = ref<HTMLInputElement>()

const updatedName = (event: Event) => {
  emit('update:selectedSupplier', { ...props.selectedSupplier, name: event.target.value })
  isSaving.value = true
}

const updatedEmail = (event: Event) => {
  emit('update:selectedSupplier', { ...props.selectedSupplier, email: event.target.value })
  isSaving.value = true
}
</script>

<template>
  <div>
    <h2 w-fit mx-auto font-extrabold mb-3 text-2xl text-sky-600>
      {{ props.selectedSupplier?.id ? `${props.selectedSupplier.name} bearbeiten` : 'Lieferant hinzufügen' }}
    </h2>

    <div border-gray-300 shadow-xl border p-2 rounded-xl class="h-95%">
      <div flex>
        <div class="flex-1 space-y-6xl max-w-1/3 p-4">
          <div relative>
            <input ref="nameInput" :value="props.selectedSupplier?.name" type="text" placeholder="a" class="peer transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed" @input="updatedName($event)">
            <label class="absolute bg-light-50 z-[0] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm " @click="nameInput?.focus()">
              Name
            </label>
          </div>
          <div relative>
            <input ref="emailInput" :value="props.selectedSupplier?.email" type="email" placeholder="a" class="peer appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed" @input="updatedEmail($event)">
            <label class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm " @click="emailInput?.focus()">
              Email
            </label>
          </div>
          <div flex items-center justify-between>
            <button v-if="selectedSupplier?.id" class="px-3 py-1 bg-red-300 text-white flex items-center rounded-md shadow-md gap-x-2">
              <div bg-red-600 i-ic:round-delete />
              <div font-semibold text-red-600>
                Löschen
              </div>
            </button>
            <div v-if="isSaving" animate-spin w-7 h-7 bg-sky-400 i-heroicons-outline:refresh />
            <div v-else-if="props.selectedSupplier?.id && !isSaving" w-7 h-7 bg-sky-400 i-heroicons-outline:badge-check />
          </div>
        </div>
        <div> Notizen und Bestellhistorie</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
