
import { Message } from "./types"




async function classifyIntent(input: string, conversationHistory: Message[]) {
  const response = await fetch("/api/classify-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, history: conversationHistory }),
  })

  const data = await response.json()
  return data.intent as
    | "food_order"
    | "product_search"
    | "support"
    | "general"
    | "unknown"
}
