import type { Product } from "./types"

export interface CartItemGroup {
  product: Product
  quantity: number
  totalPrice: number
  cartItemIds: string[]
}

/**
 * Groups similar cart items together for better management
 */
export function groupCartItems(cart: Product[]): CartItemGroup[] {
  const groups: { [key: string]: CartItemGroup } = {}

  cart.forEach((item) => {
    // Create a unique key based on item properties (excluding cartItemId)
    const customizations =
      item.foodCustomizations
        ?.map((c) => `${c.name}:${c.option}`)
        .sort()
        .join("|") || ""
    const key = `${item.name}-${item.price}-${customizations}`

    if (groups[key]) {
      groups[key].quantity += 1
      groups[key].totalPrice += item.price
      groups[key].cartItemIds.push(item.cartItemId || item.id)
    } else {
      groups[key] = {
        product: item,
        quantity: 1,
        totalPrice: item.price,
        cartItemIds: [item.cartItemId || item.id],
      }
    }
  })

  return Object.values(groups)
}

/**
 * Finds matching items in cart for modification
 */
export function findMatchingCartItems(cart: Product[], targetName: string): Product[] {
  return cart.filter(
    (item) =>
      item.name.toLowerCase().includes(targetName.toLowerCase()) ||
      targetName.toLowerCase().includes(item.name.toLowerCase()),
  )
}

/**
 * Removes specific quantity of items from cart
 */
export function removeItemsFromCart(
  cart: Product[],
  itemName: string,
  quantityToRemove: number,
): { newCart: Product[]; removedCount: number } {
  const matchingItems = findMatchingCartItems(cart, itemName)

  if (matchingItems.length === 0) {
    return { newCart: cart, removedCount: 0 }
  }

  let removedCount = 0
  const newCart = cart.filter((item) => {
    if (removedCount >= quantityToRemove) {
      return true
    }

    const isMatch =
      item.name.toLowerCase().includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(item.name.toLowerCase())

    if (isMatch) {
      removedCount++
      return false
    }

    return true
  })

  return { newCart, removedCount }
}

/**
 * Adds items to cart, checking for existing similar items
 */
export function addItemsToCart(cart: Product[], newItems: Product[]): Product[] {
  const updatedCart = [...cart]

  newItems.forEach((newItem) => {
    // For food items, we always add as separate items to maintain individual tracking
    // but we generate unique cart item IDs
    const itemWithId = {
      ...newItem,
      cartItemId: `${newItem.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }
    updatedCart.push(itemWithId)
  })

  return updatedCart
}

/**
 * Gets cart summary for display
 */
export function getCartSummary(cart: Product[]): {
  totalItems: number
  totalPrice: number
  groupedItems: CartItemGroup[]
} {
  const groupedItems = groupCartItems(cart)
  const totalItems = cart.length
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0)

  return {
    totalItems,
    totalPrice,
    groupedItems,
  }
}

export async function generateModificationResponse(
  action: "add" | "remove",
  items: any[],
  success: boolean,
  details?: string,
): Promise<string> {
  try {
    const itemsList = items.map((item) => `${item.quantity} ${item.name}`).join(", ")

    if (!success) {
      if (action === "remove") {
        return `I couldn't remove ${itemsList} because ${details || "those items are not in your current order"}. Would you like me to show you what's currently in your cart?`
      } else {
        return `I couldn't add ${itemsList}. ${details || "Please try again with a clearer request."}`
      }
    }

    if (action === "remove") {
      return `Perfect! I've removed ${itemsList} from your order. Is there anything else you'd like to modify?`
    } else {
      return `Great! I've added ${itemsList} to your order. Anything else you'd like to add?`
    }
  } catch (error) {
    console.error("Error generating modification response:", error)
    return "I've updated your order. Is there anything else you'd like to modify?"
  }
}