import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Order, OrderHistory, OrderItem, Product, Supplier } from '~~/types'

export const useOrderStore = defineStore('order', () => {
  const client = useSupabaseClient()
  // is currently being used as v-model and therefore being modified by the component
  const selectedSupplier = ref<Supplier>()

  const orderItems = ref<OrderItem[]>([])

  const activeOrder = ref<Order | null>()

  const isSaving = ref(false)

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

  const selectOrder = (order: OrderHistory) => {
    activeOrder.value = { id: order.id, supplier_id: order.supplier_id, status: order.status, updated_at: order.updated_at, created_at: order.created_at }

    selectedSupplier.value = { id: order.supplier_id, name: order.name, updated_at: order.updated_at, created_at: order.updated_at }
  }

  const toggleOrderStatus = async () => {
    try {
      const { data, error } = await client.from<Order>('order').upsert({
        id: activeOrder.value?.id,
        status: activeOrder.value?.status === 'Offen' ? 'Abgeschlossen' : 'Offen',
        supplier_id: activeOrder.value?.supplier_id,
        updated_at: new Date().toISOString(),
      }).single()
      activeOrder.value = data

      if (error)
        throw error
    }
    catch (err) {
      console.error('OrderStore:toggleOrderStatus failed', err)
    }
  }

  async function getOrderItems() {
    try {
      const { data, error } = await client.from<OrderItem>('order_item').select('*,product(*)')
        .eq('order_id', activeOrder.value?.id)

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
        order_id: activeOrder.value?.id,
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
      order_id: activeOrder.value?.id,
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
      activeOrder.value = data

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
      if (!activeOrder.value?.id)
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
    resetSelectedSupplier()
    resetSelectedProducts()
  }

  return {
    selectedSupplier,
    orderItems,
    activeOrder,
    resetSelectedSupplier,
    resetSelectedProducts,
    resetAll,
    updateOrderItem,
    transFormProduct,
    deleteOrderItem,
    addToOrderItems,
    getOrderItems,
    selectOrder,
    toggleOrderStatus,
    isSaving,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
