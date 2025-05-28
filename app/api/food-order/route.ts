import { type NextRequest, NextResponse } from "next/server"
import {
  detectFoodOrder,
  parseFoodOrder,
  generateFoodOrderResponse,
  detectOrderModification,
} from "@/lib/food-ordering"

export async function POST(request: NextRequest) {
  try {
    const { query, conversationHistory, currentCart } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // First, check if this is an order modification
    const modificationResult = await detectOrderModification(query)

    if (modificationResult.isModification) {
      return NextResponse.json({
        isModification: true,
        action: modificationResult.action,
        items: modificationResult.items,
        success: true,
      })
    }

    // Then check if this is a food order
    const isFoodOrder = await detectFoodOrder(query)

    if (!isFoodOrder) {
      return NextResponse.json({
        isFoodOrder: false,
        message: "This doesn't appear to be a food order.",
      })
    }

    // Parse the food order
    const parsedOrder = await parseFoodOrder(query, conversationHistory || [])

    // Generate appropriate response
    const aiResponse = await generateFoodOrderResponse(parsedOrder, conversationHistory || [])

    return NextResponse.json({
      isFoodOrder: true,
      parsedOrder,
      aiResponse,
      success: true,
    })
  } catch (error) {
    console.error("Error processing food order:", error)
    return NextResponse.json({ error: "Failed to process food order" }, { status: 500 })
  }
}
