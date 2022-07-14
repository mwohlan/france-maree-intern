export interface Supplier {
  id: number | null
  name: string
  created_at?: string
  updated_at?: string
  email?: string
}

export interface Product {
  id?: number
  description: string
  created_at?: string
  updated_at?: string
  supplier?: Supplier
  supplier_id?: number | null
  price?: number | null
}

export interface Order {
  id: number
  created_at: string
  updated_at: string
  supplier_id: number
  status: 'Offen' | 'Abgeschlossen'

}

export interface OrderHistory {
  id: number
  updated_at: string
  supplier_id: number
  name: string
  orderItemCount: number
  status: 'Offen' | 'Abgeschlossen'

}

export type ValueOf<T> = T[keyof T];

export interface OrderItem {
  id?: number
  created_at?: string
  updated_at?: string
  order_id?: number
  product_id: number
  amount?: number
  weight?: number
  unit?: ValueOf<Unit>
  product?: Product
  price?: number | null
}

export type Unit = {
  Kg: 'kg',
  Kiste: 'Kiste',
  Anzahl: 'Anzahl',
}

