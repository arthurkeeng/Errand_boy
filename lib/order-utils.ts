import type { Order, OrderItem, OrderStatus, Product } from "@/lib/types"

// Generate a random order ID
export function generateOrderId(): string {
  return `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

// Create a new order from cart items
export function createOrder(cartItems: Product[]): Order {
  // Group cart items
  const groupedItems: OrderItem[] = []
  cartItems.forEach((product) => {
    const key = `${product.id}-${product.isCustomFood ? JSON.stringify(product.foodCustomizations) : ""}`
    const existingItem = groupedItems.find(
      (item) =>
        item.product.id === product.id &&
        JSON.stringify(item.product.foodCustomizations) === JSON.stringify(product.foodCustomizations),
    )

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      groupedItems.push({ product, quantity: 1 })
    }
  })

  // Calculate totals
  const subtotal = cartItems.reduce((sum, product) => sum + product.price, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  // Create order
  const order: Order = {
    id: generateOrderId(),
    date: Date.now(),
    items: groupedItems,
    subtotal,
    tax,
    total,
    status: "processing",
    shippingAddress: "123 Main St, Apt 4B, New York, NY 10001",
    estimatedDelivery: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
  }

  return order
}

// Save order to localStorage (for fallback/offline support)
export function saveOrder(order: Order): void {
  const orders = getOrders()
  orders.push(order)
  localStorage.setItem("errandBoyOrders", JSON.stringify(orders))
}

// Get all orders from localStorage (for fallback/offline support)
export function getOrders(): Order[] {
  const ordersJson = localStorage.getItem("errandBoyOrders")
  return ordersJson ? JSON.parse(ordersJson) : []
}

// Update order status
export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  // First try to update in the database
  fetch(`/api/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  }).catch((error) => {
    console.error("Error updating order status:", error)
  })

  // Also update in localStorage for offline support
  const orders = getOrders()
  const orderIndex = orders.findIndex((order) => order.id === orderId)

  if (orderIndex !== -1) {
    orders[orderIndex].status = status

    // Add tracking number if shipped
    if (status === "shipped" && !orders[orderIndex].trackingNumber) {
      orders[orderIndex].trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    }

    localStorage.setItem("errandBoyOrders", JSON.stringify(orders))
  }
}

// Generate mock orders for testing (only used if no orders exist)
export function generateMockOrders(count = 5): Order[] {
  const statuses: OrderStatus[] = [
    "processing",
    "confirmed",
    "preparing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]

  const products: Product[] = [
    {
      id: "1",
      name: "Organic Bananas",
      description: "Fresh organic bananas, perfect for smoothies or a healthy snack.",
      price: 2.99,
      image: "/placeholder.svg?height=160&width=320&text=Bananas",
      category: "Grocery",
    },
    {
      id: "6",
      name: "Wireless Headphones",
      description: "Premium wireless headphones with noise cancellation.",
      price: 149.99,
      image: "/placeholder.svg?height=160&width=320&text=Headphones",
      category: "Electronics",
    },
    {
      id: "8",
      name: "Cotton T-Shirt",
      description: "Comfortable cotton t-shirt, available in multiple colors.",
      price: 19.99,
      image: "/placeholder.svg?height=160&width=320&text=T-Shirt",
      category: "Clothing",
    },
    {
      id: "f1",
      name: "Margherita Pizza",
      description: "Classic pizza with tomato sauce, mozzarella, and basil.",
      price: 12.99,
      image: "/placeholder.svg?height=160&width=320&text=Pizza",
      category: "Food",
      isCustomFood: true,
      foodCustomizations: [
        { name: "Size", option: "Medium", price: 2 },
        { name: "Crust", option: "Thin", price: 0 },
      ],
    },
  ]

  return Array.from({ length: count }).map((_, i) => {
    const orderItems: OrderItem[] = []
    const itemCount = Math.floor(Math.random() * 3) + 1 // 1-3 items

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 2) + 1 // 1-2 quantity

      orderItems.push({
        product,
        quantity,
      })
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const tax = subtotal * 0.08
    const total = subtotal + tax
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    // Create dates with more recent orders first
    const date = Date.now() - i * 24 * 60 * 60 * 1000 // Each order is 1 day older

    const order: Order = {
      id: generateOrderId(),
      date,
      items: orderItems,
      subtotal,
      tax,
      total,
      status,
      shippingAddress: "123 Main St, Apt 4B, New York, NY 10001",
    }

    // Add tracking number for shipped/delivered orders
    if (["shipped", "out_for_delivery", "delivered"].includes(status)) {
      order.trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    }

    // Add estimated delivery for active orders
    if (["processing", "confirmed", "preparing", "shipped", "out_for_delivery"].includes(status)) {
      order.estimatedDelivery = date + 7 * 24 * 60 * 60 * 1000 // 7 days from order date
    }

    return order
  })
}
