// this handler uses files like product search which gives us access to the function searchProducts

import { generateResponse } from "@/lib/gemini"
import { searchProducts } from "@/lib/product-search"
import { Message } from "@/lib/types"

type Params = {
  input: string
  assistantMessageId: string
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  getCurrentConversationHistory: () => string[], 
  generateResponse: (input: string, results: any[], options?: { products?: any[]; messageType?: string; isLoading?: boolean }) => string
}

export const handleProductSearch = async ({
  input,
  assistantMessageId,
  setMessages,
  getCurrentConversationHistory,
  generateResponse
}: Params) => {
  try {
    const conversationHistory = getCurrentConversationHistory()

    const { products: results, aiResponse } = await searchProducts(input 
        // , conversationHistory
    )

   setMessages((prev) =>
  prev.map((msg) =>
    msg.id === assistantMessageId
      ? {
          ...msg,
          content: aiResponse || generateResponse(input, results),
          products: results,
          messageType: "product_search",
          isLoading: false,
        }
      : msg,
  ),
)

  } catch (error) {
    console.error("Product search failed:", error)
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: "Something went wrong while searching for products. Please try again.",
              messageType: "product_search" as const,
              isLoading: false,
            }
          : msg,
      ),
    )
  }
}
