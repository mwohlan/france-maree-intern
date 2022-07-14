<script lang="ts" setup>
const props = defineProps<{}>()
definePageMeta({
  layout: 'print',
})
console.time('pdf')
const { data } = await useFetch<Blob>('https://v2.api2pdf.com/chrome/pdf/url?url=https://timelino.vercel.app/&apikey=2aac5c19-3e35-4359-8008-04a9dc76b2b0', { server: false })
console.timeEnd('pdf')
const link = ref<HTMLAnchorElement>()

// whenever(() => pending.value === false, () => {
//   link.value.href = window.URL.createObjectURL(data.value)
//   link.value.download = 'timelino.pdf'
// })
</script>

<template>
  <div>
    <a ref="link"> click me</a>
    <div w-full h-100 bg-green>
      dssd
    </div>
    <div w-100 h-100 bg-blue />
    <div w-100 h-100 bg-yellow />
    <div w-100 h-100 bg-green />
    <div w-100 h-100 bg-blue />
    <div w-100 h-100 bg-yellow />
  </div>
</template>

<style scoped>

</style>
