<script lang="ts" setup>
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import type { OrderItem, Unit, ValueOf } from '~~/types'

const props = defineProps<{
  orderItem: OrderItem
  isLastIndex: boolean
  index: number
}>()

const { orderItem, index } = toRefs(props)

const store = useOrderStore()

const units: ValueOf<Unit>[] = ['kg', 'Anzahl', 'Kiste']

const selectedUnit = ref<ValueOf<Unit>>(orderItem.value.unit ?? 'Anzahl')

const amount = ref(orderItem.value.amount ?? 1)
const weight = ref(orderItem.value.weight)
const weightInput = ref<HTMLInputElement>()

watchDebounced([selectedUnit, amount, weight], async () => {
  await store.updateOrderItem(index.value, { ...orderItem.value, updated_at: new Date().toISOString(), amount: amount.value, weight: weight.value, unit: selectedUnit.value })
  store.isSaving = false
}, { debounce: 750 })

watch([selectedUnit, amount, weight], async () => store.isSaving = true)

watchEffect(() => {
  if (weightInput.value && selectedUnit.value === 'kg') {
    setTimeout(() => {
      weightInput.value?.focus()
    }, 100)
  }
})

const orderItemId = ref<number>(orderItem.value.id ?? 0)
</script>

<template>
  <tr :class="index % 2 === 0 ? 'bg-sky-50' : 'bg-white'">
    <td :class="isLastIndex ? 'rounded-bl-md' : ''" class="whitespace-wrap py-2 pl-4 text-gray-900 ">
      <div class="group" w-10 relative>
        <input v-model="amount" type="number" class="shadow group-hover:(ring-2 ring-sky-400) focus:(outline-none ring-2 ring-sky-400) rounded-md pl-2 py-1 w-12" name="amount">
        <div absolute class="-right-1" top-1 flex flex-col>
          <div w-3 h-3 i-heroicons-outline-chevron-up @click="amount++" />
          <div w-3 h-3 i-heroicons-outline-chevron-down @click="amount > 1 ? amount-- : amount" />
        </div>
      </div>
    </td>
    <td class="whitespace-nowrap flex items-center  gap-x-2 px-2 py-2 text-sm text-gray-900">
      <div v-if="selectedUnit === 'kg'" w-fit class="group" relative>
        <input ref="weightInput" v-model="weight" min="0" autocomplete="off" class="shadow group-hover:(ring-2 ring-sky-400) focus:(outline-none ring-2 ring-sky-400) rounded-md py-1.5 pl-2 w-14" type="number" name="weight">
        <div class="absolute top-0.5 right-0.5" flex flex-col>
          <div w-3 h-3 i-heroicons-outline-chevron-up @click="weight = weight ? weight + 1 : 1 " />
          <div v-if="weight" w-3 h-3 i-heroicons-outline-chevron-down @click="weight = weight ? weight - 1 : 0" />
        </div>
      </div>
      <Listbox v-model="selectedUnit" w-fit as="div">
        <div class="relative">
          <ListboxButton>
            <div class="relative inline-flex gap-x-1 items-center shadow bg-sky-400 py-1 px-1 border border-transparent rounded-md text-white">
              <div class="i-heroicons-outline-chevron-down h-4 w-4" aria-hidden="true" />
              <p class=" text-sm font-medium">
                {{ selectedUnit === 'Kiste' && amount > 1 ? 'Kisten' : selectedUnit }}
              </p>
            </div>
          </ListboxButton>

          <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <ListboxOptions class="origin-top-right absolute left-0 z-20 right-0 mt-2 w-24 rounded-md shadow-lg overflow-hidden bg-white divide-y divide-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none">
              <ListboxOption v-for="unit in units" :key="unit" v-slot="{ active, selected }" as="template" :value="unit">
                <li class="cursor-default select-none relative p-2 text-sm" :class="[active ? 'text-white bg-sky-500' : 'text-gray-900 bg-light-300']">
                  <div class="flex flex-col">
                    <div class="flex justify-end">
                      <p :class="selected ? 'font-semibold' : 'font-normal'">
                        {{ unit === 'Kiste' && amount > 1 ? 'Kisten' : unit }}
                      </p>
                    </div>
                  </div>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </td>
    <td :class="{ 'rounded-br-md': isLastIndex }" class="px-2 py-2 relative text-gray-900">
      <div>{{ orderItem?.price ? orderItem.price : '-' }}</div>
    </td>
    <td :class="{ 'rounded-br-md': isLastIndex }" class="px-2 py-2 relative text-gray-900">
      <div>{{ orderItem.product?.description }}</div>
      <div class="bg-red-400 absolute top-3 h-5 w-5 right-0 i-ic:round-delete" @click="store.deleteOrderItem(index, orderItem.id)" />
    </td>
  </tr>
</template>

