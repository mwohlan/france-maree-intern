<script setup>
const id = useRoute().params.id
const client = useSupabaseClient()
const { data: orderItems } = await useAsyncData(`order-details-${id}`, async () => {
  try {
    const { data, error } = await client.from('order_item').select('*').eq('order_id', id)
    if (error)
      throw error
    return data
  }
  catch (error) {
    console.error('OrderHistory', error)
  }
})
</script>

<template>
  <div>
    {{ orderItems }}
  </div>
</template>
