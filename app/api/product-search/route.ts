import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Product from "@/models/Product"
import { analyzeQuery, generateResponse } from "@/lib/gemini"

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase()

    // Get the query from the request body
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Analyze the query using Gemini API
    const queryAnalysis = await analyzeQuery(query)
    console.log("Query analysis:", queryAnalysis)

    // Build MongoDB query based on the analysis
    const mongoQuery: any = {}

    // Add category filter if present
    if (queryAnalysis.category) {
      mongoQuery.category = { $regex: queryAnalysis.category, $options: "i" }
    }

    // Add color filter if present
    if (queryAnalysis.color) {
      mongoQuery.colors = { $regex: queryAnalysis.color, $options: "i" }
    }

    // Add size filter if present
    if (queryAnalysis.size) {
      mongoQuery.sizes = { $regex: queryAnalysis.size, $options: "i" }
    }

    // Add price range filter if present
    if (queryAnalysis.priceRange) {
      mongoQuery.price = {}
      if (queryAnalysis.priceRange.min !== undefined) {
        mongoQuery.price.$gte = queryAnalysis.priceRange.min
      }
      if (queryAnalysis.priceRange.max !== undefined) {
        mongoQuery.price.$lte = queryAnalysis.priceRange.max
      }
    }

    // Only show in-stock products by default
    mongoQuery.inStock = true

    // If no specific filters were extracted, use text search
    if (Object.keys(mongoQuery).length <= 1) {
      // Only has inStock
      // Use MongoDB text search as fallback
      mongoQuery.$text = { $search: query }
    }

    // Execute the query
    let products = await Product.find(mongoQuery).limit(12)

    // If no products found with specific filters, try text search
    if (products.length === 0 && Object.keys(mongoQuery).length > 1) {
      products = await Product.find({
        $text: { $search: query },
        inStock: true,
      }).limit(12)
    }

    // Generate a response using Gemini
    const aiResponse = await generateResponse(query, products)

    // Return the results
    return NextResponse.json({
      query,
      analysis: queryAnalysis,
      products,
      aiResponse,
    })
  } catch (error) {
    console.error("Error in search API:", error)
    return NextResponse.json({ error: "Failed to process search request" }, { status: 500 })
  }
}
