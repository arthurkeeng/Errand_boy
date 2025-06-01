export interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  isCustomFood?: boolean
  foodCustomizations?: FoodCustomization[]
  originalFoodItem?: FoodItem
  cartItemId?: string
}

export interface FoodItem {
  id: string
  name: string
  description: string
  basePrice: number
  image?: string
  category: string
  customizationOptions: FoodCustomizationOption[]
}

export interface FoodCustomizationOption {
  name: string
  options: {
    name: string
    price: number
  }[]
}

export interface FoodCustomization {
  name: string
  option: string
  price: number
}

export interface OrderItem {
  product: Product
  quantity: number
}

export type OrderStatus =
  | "processing"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export interface Order {
  id: string
  date: number
  items: OrderItem[]
  subtotal: number
  total: number
  status: OrderStatus
  shippingAddress?: string
  trackingNumber?: string
  estimatedDelivery?: number
}




export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
  messageType?: "food_order" | "product_search" | "general"
  products?: Product[]
  foodOrderData?: any
}


export type Conversation = {
  id: string
  title: string
  messages: Message[]
  lastUpdated: number
  preview: string
  cart?: Product[]
  conversationHistory?: string[]
}