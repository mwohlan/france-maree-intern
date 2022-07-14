<script lang="ts" setup>
const navigation = ref([
  { name: 'Übersicht', icon: 'i-heroicons-outline-home', to: '/', current: false },
  { name: 'Bestellzettel', icon: 'i-icon-park-outline:transaction-order', to: '/bestellungen', current: false },
  { name: 'Anrufliste', icon: 'i-ic:round-phone-in-talk', to: '/', current: false },
  { name: 'Lieferanten', icon: 'i-mdi:truck-delivery-outline', to: '/lieferanten', current: false },
  { name: 'Kunden', icon: 'i-ic:round-group', to: '/', current: false },
  { name: 'Produkte', icon: 'i-fluent:food-16-filled', to: '/Produkte', current: false },
  { name: 'Reports', icon: 'i-heroicons-outline-chart-bar', to: '/', current: false },
])
const route = useRoute()

watchEffect(() => {
  for (const item of navigation.value)
    item.current = item.to.localeCompare(route.path, undefined, { sensitivity: 'base' }) === 0
})
const activeRoute = computed(() => {
  return navigation.value.find(entry => entry.to === route.path)
})
</script>

<template>
  <div h-full shrink-0 px-4 py-3 border-gray-200 border-r-2>
    <div class="flex flex-col overflow-y-auto">
      <div class="flex gap-x-2 items-center">
        <div class="h-10 w-10   i-logos-docker-icon" />
        <h2 text-sky-600 font-semibold text-2xl>
          France Maree
        </h2>
      </div>
      <div class="mt-5 flex-grow flex flex-col">
        <nav class="flex-1 bg-white space-y-1" aria-label="Sidebar">
          <NuxtLink v-for="item in navigation" :key="item.name" :to="item.to" class="group duration-200 flex items-center rounded-r-md px-3 py-2 font-medium border-l-4" :class="[item.current ? 'bg-sky-100 border-sky-600 text-sky-600' : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900']">
            <div class="mr-3 flex-shrink-0 h-6 w-6" :class="[item.current ? 'text-sky-500' : 'text-gray-500 group-hover:text-gray-600', item.icon]" aria-hidden="true" />
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
