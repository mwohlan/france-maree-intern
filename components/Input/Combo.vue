<script lang="ts" setup>
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
  TransitionRoot,
} from '@headlessui/vue'

const props = defineProps<{
  model: object
  displayField: string
  values: object[]
}>()

const filter = ref<string>('')
</script>

<template>
  <div relative>
    <Combobox :value="model" as="div">
      <ComboboxButton w-full>
        <ComboboxInput
          placeholder="Lieferant"
          class="peer font-semibold appearance-none transition-all relative w-full placeholder-transparent outline-none focus:outline-none border border-slate-200 focus:border-sky-400 rounded-md p-4 autofill:bg-white invalid:border-red-500 invalid:text-red-600 disabled:cursor-not-allowed"
          :display-value="() => model[displayField]" @input="filter = $event.target.value"
        />
        <ComboboxLabel
          class="absolute bg-light-50 z-[1] left-1 px-2 -top-2 text-gray-600 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base !peer-focus:left-1 !peer-focus:-top-2 !peer-focus:text-gray-600 !peer-focus:text-sm "
        >
          Lieferant auswählen
        </ComboboxLabel>
      </ComboboxButton>
      <TransitionRoot
        leave="ease-in duration-100" leave-from="opacity-100" leave-to="opacity-0"
        @after-leave="filter = ''"
      >
        <ComboboxOptions
          class="absolute z-1 mt-1 max-h-60 w-full overflow-auto rounded-md bg-light-50 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ComboboxOption v-slot="{ selected, active }" as="template" :value="noSupplier">
            <li
              class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                'bg-sky-600 text-white': active,
                'text-gray-900': !active,
              }"
            >
              <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }">
                {{ noSupplier.name }}
              </span>
              <span
                v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3"
                :class="{ 'text-white': active, 'text-sky-600': !active }"
              />
            </li>
          </ComboboxOption>
          <div
            v-if="filteredSuppliers.length === 0 && filter !== ''"
            class="relative cursor-default select-none py-2 px-4 text-gray-700"
          >
            Nichts gefunden
          </div>
          <ComboboxOption
            v-for="filteredSupplier in filteredSuppliers" :key="filteredSupplier.id"
            v-slot="{ selected, active }" as="template" :value="filteredSupplier"
          >
            <li
              class="relative cursor-default select-none py-2 pl-10 pr-4" :class="{
                'bg-sky-600 text-white': active,
                'text-gray-900': !active,
              }"
            >
              <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }">
                {{ filteredSupplier.name }}
              </span>
              <span
                v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3"
                :class="{ 'text-white': active, 'text-sky-600': !active }"
              />
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </TransitionRoot>
    </Combobox>
  </div>
</template>

<style scoped>
</style>
