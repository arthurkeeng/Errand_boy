import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Product, FoodCustomization } from "./types"

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export interface FoodOrderItem {
  name: string
  quantity: number
  basePrice: number
  customizations?: string[]
  notes?: string
}

export interface ParsedFoodOrder {
  items: FoodOrderItem[]
  isComplete: boolean
  needsConfirmation: boolean
  totalEstimatedPrice: number
  orderSummary: string
}

// Food menu database with prices
const FOOD_MENU = {
  // Main dishes
  rice: { basePrice: 8.99, category: "main", description: "Steamed white rice" },
  "fried rice": { basePrice: 12.99, category: "main", description: "Fried rice with vegetables" },
  "jollof rice": { basePrice: 14.99, category: "main", description: "Nigerian spiced rice" },
  chicken: { basePrice: 15.99, category: "protein", description: "Grilled chicken breast" },
  beef: { basePrice: 18.99, category: "protein", description: "Grilled beef" },
  fish: { basePrice: 16.99, category: "protein", description: "Grilled fish fillet" },
  stew: { basePrice: 3.99, category: "sauce", description: "Traditional tomato stew" },
  curry: { basePrice: 4.99, category: "sauce", description: "Spicy curry sauce" },
  pasta: { basePrice: 13.99, category: "main", description: "Italian pasta" },
  pizza: { basePrice: 16.99, category: "main", description: "Wood-fired pizza" },
  burger: { basePrice: 12.99, category: "main", description: "Beef burger with fries" },
  sandwich: { basePrice: 9.99, category: "main", description: "Club sandwich" },

  // Drinks
  pepsi: { basePrice: 2.99, category: "drink", description: "Pepsi cola" },
  coke: { basePrice: 2.99, category: "drink", description: "Coca cola" },
  sprite: { basePrice: 2.99, category: "drink", description: "Sprite lemon-lime" },
  water: { basePrice: 1.99, category: "drink", description: "Bottled water" },
  juice: { basePrice: 3.99, category: "drink", description: "Fresh fruit juice" },
  coffee: { basePrice: 4.99, category: "drink", description: "Freshly brewed coffee" },
  tea: { basePrice: 3.99, category: "drink", description: "Hot tea" },

  // Sides
  fries: { basePrice: 4.99, category: "side", description: "French fries" },
  salad: { basePrice: 6.99, category: "side", description: "Fresh garden salad" },
  bread: { basePrice: 2.99, category: "side", description: "Fresh bread rolls" },
  plantain: { basePrice: 3.99, category: "side", description: "Fried plantain" },
}

/**
 * Analyzes user input to determine if it's a food order
 */
export async function detectFoodOrder(query: string): Promise<boolean> {
  try {
    const prompt = `
      Analyze this message and determine if the user is trying to order food/drinks or make a food-related request.
      
      Look for:
      - Mentions of food items, dishes, or drinks
      - Ordering language like "I want", "I'd like", "Can I get", "Order", etc.
      - Quantities like "2 plates", "3 bottles", numbers
      - Food-related words like "eat", "hungry", "meal", "lunch", "dinner"
      
      Return only "true" or "false" (no other text).
      
      User message: "${query}"
    `

    const result = await model.generateContent(prompt)
    const response = await result.response.text().trim().toLowerCase()

    return response === "true"
  } catch (error) {
    console.error("Error detecting food order:", error)
    // Fallback: check for common food ordering keywords
    const foodKeywords = [
      "order",
      "want",
      "like",
      "get",
      "plates",
      "bottles",
      "rice",
      "chicken",
      "pizza",
      "burger",
      "drink",
      "pepsi",
      "coke",
      "food",
      "meal",
      "hungry",
      "lunch",
      "dinner",
      "breakfast",
      "eat",
    ]

    return foodKeywords.some((keyword) => query.toLowerCase().includes(keyword))
  }
}

/**
 * Parses a food order from natural language
 */
export async function parseFoodOrder(query: string, conversationHistory: string[] = []): Promise<ParsedFoodOrder> {
  try {
    const menuItems = Object.keys(FOOD_MENU).join(", ")
    const context = conversationHistory.length > 0 ? `Previous conversation: ${conversationHistory.join(" ")}` : ""

    const prompt = `
      You are a food ordering assistant. Parse this food order and extract structured information.
      
      Available menu items: ${menuItems}
      
      ${context}
      
      Current user message: "${query}"
      
      Extract and return a JSON object with this exact structure:
      {
        "items": [
          {
            "name": "item name (from menu)",
            "quantity": number,
            "basePrice": price_from_menu,
            "customizations": ["any modifications mentioned"],
            "notes": "additional notes"
          }
        ],
        "isComplete": boolean (true if order seems complete),
        "needsConfirmation": boolean (true if you need to confirm details),
        "totalEstimatedPrice": total_price,
        "orderSummary": "human readable summary of the order"
      }
      
      Rules:
      - Match items to the closest menu item
      - If quantity not specified, assume 1
      - Calculate total price (quantity × basePrice for each item)
      - Set isComplete to true if the order seems finished
      - Set needsConfirmation to true if you need clarification
      - Include customizations like "with stew on top", "no ice", etc.
      
      Return only valid JSON, no other text.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response.text()

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from response")
    }

    const parsedOrder = JSON.parse(jsonMatch[0]) as ParsedFoodOrder

    // Validate and fix prices using our menu
    parsedOrder.items = parsedOrder.items.map((item) => {
      const menuItem = FOOD_MENU[item.name.toLowerCase() as keyof typeof FOOD_MENU]
      if (menuItem) {
        item.basePrice = menuItem.basePrice
      }
      return item
    })

    // Recalculate total
    parsedOrder.totalEstimatedPrice = parsedOrder.items.reduce(
      (total, item) => total + item.basePrice * item.quantity,
      0,
    )

    return parsedOrder
  } catch (error) {
    console.error("Error parsing food order:", error)

    // Fallback parsing
    return {
      items: [],
      isComplete: false,
      needsConfirmation: true,
      totalEstimatedPrice: 0,
      orderSummary: "I couldn't understand your order. Could you please clarify what you'd like to order?",
    }
  }
}

/**
 * Generates appropriate response for food ordering conversation
 */
export async function generateFoodOrderResponse(
  parsedOrder: ParsedFoodOrder,
  conversationHistory: string[] = [],
): Promise<string> {
  try {
    const context = conversationHistory.length > 0 ? `Previous conversation: ${conversationHistory.join(" ")}` : ""

    const prompt = `
      You are a friendly food ordering assistant. Generate an appropriate response based on this parsed order.
      
      ${context}
      
      Parsed order: ${JSON.stringify(parsedOrder)}
      
      Guidelines:
      - If isComplete is true, confirm the order and mention adding to cart
      - If needsConfirmation is true, ask for clarification
      - If items array is empty, ask what they'd like to order
      - Be conversational and friendly
      - Mention the total price if order is complete
      - Ask "Would that be all?" if order seems complete but not confirmed
      - Keep responses concise but helpful
      
      Generate a natural, conversational response (no JSON, just text).
    `

    const result = await model.generateContent(prompt)
    return await result.response.text()
  } catch (error) {
    console.error("Error generating food order response:", error)

    // Fallback responses
    if (parsedOrder.items.length === 0) {
      return "What would you like to order today? We have rice, chicken, pizza, burgers, and various drinks available."
    }

    if (parsedOrder.needsConfirmation) {
      return `I understand you want ${parsedOrder.orderSummary}. Could you please confirm the details?`
    }

    if (parsedOrder.isComplete) {
      return `Perfect! I've prepared your order: ${parsedOrder.orderSummary}. Total: $${parsedOrder.totalEstimatedPrice.toFixed(2)}. I'll add this to your cart so you can continue shopping.`
    }

    return `I have ${parsedOrder.orderSummary}. Would that be all?`
  }
}

/**
 * Converts parsed food order to cart products
 */
export function convertFoodOrderToProducts(parsedOrder: ParsedFoodOrder): Product[] {
  const products: Product[] = []

  parsedOrder.items.forEach((item) => {
    const menuItem = FOOD_MENU[item.name.toLowerCase() as keyof typeof FOOD_MENU]

    for (let i = 0; i < item.quantity; i++) {
      const customizations: FoodCustomization[] = []

      if (item.customizations && item.customizations.length > 0) {
        item.customizations.forEach((customization) => {
          customizations.push({
            name: "Special Instructions",
            option: customization,
            price: 0,
          })
        })
      }

      const product: Product = {
        id: `food-${item.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${i}`,
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        description: menuItem?.description || `Delicious ${item.name}`,
        price: item.basePrice,
        image: `/placeholder.svg?height=160&width=320&text=${encodeURIComponent(item.name)}`,
        category: "Food",
        isCustomFood: true,
        foodCustomizations: customizations.length > 0 ? customizations : undefined,
        cartItemId: `food-order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      }

      if (item.notes) {
        if (!product.foodCustomizations) {
          product.foodCustomizations = []
        }
        product.foodCustomizations.push({
          name: "Notes",
          option: item.notes,
          price: 0,
        })
      }

      products.push(product)
    }
  })

  return products
}

/**
 * Detects if the user wants to modify an existing order (add/remove items)
 */
export async function detectOrderModification(query: string): Promise<{
  isModification: boolean
  action: "add" | "remove" | "none"
  items: FoodOrderItem[]
}> {
  try {
    const prompt = `
      Analyze this message to determine if the user wants to modify an existing food order.
      
      Look for:
      - Removal language: "remove", "delete", "take away", "cancel", "no more"
      - Addition language: "add", "more", "extra", "another", "also get"
      - Quantities: numbers like "1", "2", "3", etc.
      - Food items being modified
      
      Return a JSON object with this structure:
      {
        "isModification": boolean,
        "action": "add" | "remove" | "none",
        "items": [
          {
            "name": "item name",
            "quantity": number,
            "basePrice": 0,
            "customizations": [],
            "notes": ""
          }
        ]
      }
      
      User message: "${query}"
      
      Return only valid JSON, no other text.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { isModification: false, action: "none", items: [] }
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Fix prices using our menu
    if (parsed.items) {
      parsed.items = parsed.items.map((item: FoodOrderItem) => {
        const menuItem = FOOD_MENU[item.name.toLowerCase() as keyof typeof FOOD_MENU]
        if (menuItem) {
          item.basePrice = menuItem.basePrice
        }
        return item
      })
    }

    return parsed
  } catch (error) {
    console.error("Error detecting order modification:", error)
    return { isModification: false, action: "none", items: [] }
  }
}

/**
 * Generates response for order modifications
 */
export async function generateModificationResponse(
  action: "add" | "remove",
  items: FoodOrderItem[],
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
