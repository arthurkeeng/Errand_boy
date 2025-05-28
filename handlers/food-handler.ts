// the food handler has the food-ordering.ts included , 
// has the route.ts- this is whre the api handler is defined



import { toast } from "@/components/ui/use-toast"
import { addItemsToCart, removeItemsFromCart } from "@/lib/cart-utils"
import { convertFoodOrderToProducts, generateModificationResponse } from "@/lib/food-ordering"
import { Message, Product } from "@/lib/types"
// import { convertFoodOrderToProducts } from "@/lib/convertFoodOrderToProducts"
// import { addItemsToCart, removeItemsFromCart } from "@/lib/cartUtils"
// import { generateModificationResponse } from "@/lib/generateModificationResponse"
// import type { Message } from "@/types/message"
// import type { Product } from "@/types/product"
// import type { FoodOrderData, ParsedOrder } from "@/types/food"

type HandleFoodOrderArgs = {
  input: string
  cart: Product[]
  setCart: (cart: Product[]) => void
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  assistantMessageId: string
  getCurrentConversationHistory: () => string[]
}

export const handleFoodOrder = async ({
  input,
  cart,
  setCart,
  setMessages,
  assistantMessageId,
  getCurrentConversationHistory,
}: HandleFoodOrderArgs) => {
  const conversationHistory = getCurrentConversationHistory()

  const foodOrderResponse = await fetch("/api/food-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: input,
      conversationHistory,
      currentCart: cart,
    }),
  })

  const foodOrderData = await foodOrderResponse.json()

  // 🧾 Order Modification
  if (foodOrderData.isModification) {
    const { action, items } = foodOrderData
    let success = false
    let details = ""

    if (action === "remove") {
      let updatedCart = [...cart]
      let totalRemoved = 0

      items.forEach((item :any) => {
        const { newCart, removedCount } = removeItemsFromCart(updatedCart, item.name, item.quantity)
        updatedCart = newCart
        totalRemoved += removedCount
      })

      if (totalRemoved > 0) {
        setCart(updatedCart)
        success = true
        toast({
          title: "Items Removed",
          description: `Removed ${totalRemoved} item(s) from your cart.`,
          variant: "success",
        })
      } else {
        details = "those items are not in your cart"
      }
    } else if (action === "add") {
      const foodProducts = convertFoodOrderToProducts({
        items,
        isComplete: true,
        needsConfirmation: false,
        totalEstimatedPrice: items.reduce((sum:number, item:any) => sum + item.basePrice * item.quantity, 0),
        orderSummary: items.map((item : any) => `${item.quantity} ${item.name}`).join(", "),
      })

      const updatedCart = addItemsToCart(cart, foodProducts)
      setCart(updatedCart)
      success = true

      toast({
        title: "Items Added",
        description: `Added ${foodProducts.length} item(s) to your cart.`,
        variant: "success",
      })
    }

    const response = await generateModificationResponse(action, items, success, details)

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: response,
              messageType: "food_order" as const,
              isLoading: false,
            }
          : msg,
      ),
    )

    return true
  }

  // 🥡 New Food Order
  if (foodOrderData.isFoodOrder && foodOrderData.success) {
    const { parsedOrder, aiResponse } = foodOrderData
    let addedToCart = false

    if (parsedOrder.isComplete && parsedOrder.items.length > 0) {
      const foodProducts = convertFoodOrderToProducts(parsedOrder)
      const updatedCart = addItemsToCart(cart, foodProducts)
      setCart(updatedCart)
      addedToCart = true

      toast({
        title: "Food Order Added to Cart",
        description: `${foodProducts.length} item(s) added to your cart. Total: $${parsedOrder.totalEstimatedPrice.toFixed(
          2,
        )}`,
        variant: "success",
      })
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: addedToCart
                ? `${aiResponse}\n\nGreat! I've added your order to the cart so you can continue shopping.`
                : aiResponse,
              messageType: "food_order" as const,
              foodOrderData: parsedOrder,
              isLoading: false,
            }
          : msg,
      ),
    )

    return true
  }

  return false // Not a food order
}
