import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini with your API key and model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

interface ProductQuery {
  intent: string
  category?: string
  color?: string
  size?: string
  priceRange?: {
    min?: number
    max?: number
  }
  features?: string[]
  sortBy?: string
}

// Analyze user query and extract structured search parameters
export async function analyzeQuery(query: string): Promise<ProductQuery> {
  try {
    const prompt = `
You are a smart shopping assistant.

From the user's message, extract a clean JSON object with only these fields:
- intent
- category
- color
- size
- priceRange (with min and/or max)
- features (array)
- sortBy

Only include fields that are clearly mentioned or implied.
Avoid extra explanation — return only the JSON object.

User query: """${query}"""
`.trim()

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    // Match the JSON part safely
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) throw new Error("No JSON found in Gemini response")

    const parsed = JSON.parse(jsonMatch[0])
    return parsed as ProductQuery
  } catch (error) {
    console.error("❌ analyzeQuery error:", error)
    return { intent: "search" }
  }
}

// Generate a friendly, human-like AI message based on results
export async function generateResponse(query: string, products: any[]): Promise<string> {
  try {
    const productSummary = products.map((p) => {
      const desc = p.description?.slice(0, 100).replace(/\n/g, " ") || ""
      return `- ${p.name}: ${desc}${desc.length === 100 ? "..." : ""} (Price: $${p.price}, Colors: ${p.colors?.join(", ")})`
    }).join("\n")

    const prompt = `
You're a friendly shopping assistant helping a customer on an e-commerce website.

The customer searched for: "${query}"

Here are the matching products:
${productSummary || "No products were found."}

Now write a short, natural-sounding message that:
1. Acknowledges their query
2. Mentions how many products were found
3. Summarizes the types of products (without listing all)
4. Sounds human — warm, casual, and helpful
5. Encourages them to browse or refine their search

Avoid robotic tone. Be concise but kind.
`.trim()

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error("❌ generateResponse error:", error)
    return products.length > 0
      ? `Great! I found ${products.length} items that match what you're looking for. Take a look — you might find something you love!`
      : `Hmm, I didn’t find anything for "${query}". Maybe try tweaking your search or asking for something a little different?`
  }
}
