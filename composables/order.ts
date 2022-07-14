import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Order, OrderItem, Product, Supplier } from '~~/types'

export const useOrderStore = defineStore('order', () => {
  const client = useSupabaseClient()
  // is currently being used as v-model and therefore being modified by the component
  const selectedSupplier = ref<Supplier>()

  const orderItems = ref<OrderItem[]>([])

  const activeOrderId = ref<number>(0)

  const isSaving = ref(false)

  function setActiveOrderId(id: number) {
    activeOrderId.value = id
  }

  function resetActiveOrderId() {
    activeOrderId.value = 0
  }

  function resetSelectedSupplier() {
    selectedSupplier.value = undefined
  }

  function resetSelectedProducts() {
    orderItems.value = []
  }

  async function updateOrderItem(index: number, orderItem: OrderItem) {
    const { product_id, id, order_id, unit, amount, weight, updated_at } = orderItem
    try {
      const { error } = await client.from('order_item').upsert({ product_id, id, order_id, unit, amount, weight, updated_at }).single()
      if (error)
        throw error
      orderItems.value[index] = orderItem
    }
    catch (e) {
      console.error('OrderStore: Failed to update OrderItem', e)
    }
  }

  async function getOrderItems() {
    try {
      const { data, error } = await client.from<OrderItem>('order_item').select('*,product(*)')
        .eq('order_id', activeOrderId.value)

      console.log(data)

      if (error)
        throw error
      if (data)
        orderItems.value = data
    }
    catch (error) {
      console.error('OrderStore: getOrderItems failed', error)
    }
  }

  const transFormProduct = (product: Product, withProduct: boolean): OrderItem => {
    if (withProduct) {
      return {
        product_id: product.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount: 1,
        unit: 'Anzahl',
        order_id: activeOrderId.value,
        weight: 0,
        product,
        price: product.price ? product.price : null,
      }
    }
    return {
      product_id: product.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      amount: 1,
      unit: 'Anzahl',
      order_id: activeOrderId.value,
      weight: 0,
      price: product.price ? product.price : null,
    }
  }

  const createOrder = async () => {
    try {
      const { data, error } = await client.from<Order>('order').insert({
        supplier_id: selectedSupplier.value?.id,
        status: 'Offen',
      }).single()
      activeOrderId.value = data?.id ?? 0

      if (error)
        throw error
    }
    catch (err) {
      console.error('OrderForm: Inserting new order failed', err)
    }
  }
  const addToOrderItems = async (product: Product) => {
    try {
      isSaving.value = true
      if (!activeOrderId.value)
        await createOrder()

      const orderItem = transFormProduct(product, false)
      const { data, error } = await client.from<OrderItem>('order_item').insert(orderItem).select('*, product(*)').single()
      if (error)
        throw error
      orderItems.value.push({ ...data, product })
      setTimeout(() => {
        isSaving.value = false
      }, 500)
    }
    catch (error) {
      console.error('OrderStore: addToOrderItems Failed', error)
    }
  }

  async function deleteOrderItem(index: number, id: number) {
    try {
      const { error } = await client.from('order_item').delete().match({ id }).single()
      if (error)
        throw error
      orderItems.value.splice(index, 1)
    }
    catch (e) {
      console.error('OrderStore: Failed to delete OrderItem', e)
    }
  }

  function resetAll() {
    resetActiveOrderId()
    resetSelectedSupplier()
    resetSelectedProducts()
  }

  return {
    selectedSupplier,
    orderItems,
    activeOrderId,
    setActiveOrderId,
    resetActiveOrderId,
    resetSelectedSupplier,
    resetSelectedProducts,
    resetAll,
    updateOrderItem,
    transFormProduct,
    deleteOrderItem,
    addToOrderItems,
    getOrderItems,
    isSaving,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
