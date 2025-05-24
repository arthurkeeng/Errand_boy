import connectToDatabase from "../lib/mongodb"
import Product from "../models/Product"
import mongoose from "mongoose"

const sampleProducts = [
  {
    name: "Classic Green Chinos",
    description:
      "Comfortable and stylish green chino trousers made from 100% cotton. Perfect for casual and semi-formal occasions.",
    price: 49.99,
    category: "Trousers",
    colors: ["Green", "Olive"],
    sizes: ["S", "M", "L", "XL"],
    images: ["/placeholder.svg?height=400&width=400&text=Green+Chinos"],
    tags: ["chinos", "green", "casual", "cotton"],
    inStock: true,
    features: ["100% cotton", "Machine washable", "Side pockets"],
  },
  {
    name: "Slim Fit Green Dress Pants",
    description: "Elegant slim fit green dress pants. Perfect for formal occasions and office wear.",
    price: 69.99,
    category: "Trousers",
    colors: ["Dark Green", "Forest Green"],
    sizes: ["30", "32", "34", "36", "38"],
    images: ["/placeholder.svg?height=400&width=400&text=Green+Dress+Pants"],
    tags: ["dress pants", "green", "formal", "slim fit"],
    inStock: true,
    features: ["Polyester blend", "Wrinkle resistant", "Belt loops"],
  },
  {
    name: "Cargo Green Pants",
    description: "Durable cargo pants in army green with multiple pockets. Great for outdoor activities.",
    price: 59.99,
    category: "Trousers",
    colors: ["Army Green", "Khaki"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/placeholder.svg?height=400&width=400&text=Green+Cargo+Pants"],
    tags: ["cargo", "green", "outdoor", "pockets"],
    inStock: true,
    features: ["Multiple pockets", "Durable fabric", "Adjustable waist"],
  },
  // Add more sample products here
]

async function seedProducts() {
  try {
    await connectToDatabase()

    // Clear existing products
    await Product.deleteMany({})

    // Insert sample products
    await Product.insertMany(sampleProducts)

    console.log(`Successfully seeded ${sampleProducts.length} products`)

    // Close the connection
    await mongoose.disconnect()
  } catch (error) {
    console.error("Error seeding products:", error)
    process.exit(1)
  }
}

// Run the seed function
seedProducts()
