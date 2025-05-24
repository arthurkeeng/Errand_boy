import type { Product, FoodItem, FoodCustomization } from "./types"

// Mock product database - expanded with more items
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
    id: "2",
    name: "Whole Wheat Bread",
    description: "Freshly baked whole wheat bread, perfect for sandwiches.",
    price: 3.49,
    image: "/placeholder.svg?height=160&width=320&text=Bread",
    category: "Grocery",
  },
  {
    id: "3",
    name: "Organic Milk",
    description: "Fresh organic milk from grass-fed cows.",
    price: 4.99,
    image: "/placeholder.svg?height=160&width=320&text=Milk",
    category: "Grocery",
  },
  {
    id: "4",
    name: "Free Range Eggs",
    description: "Dozen free-range eggs from local farms.",
    price: 5.49,
    image: "/placeholder.svg?height=160&width=320&text=Eggs",
    category: "Grocery",
  },
  {
    id: "5",
    name: "Avocados",
    description: "Ripe avocados, perfect for guacamole or toast.",
    price: 6.99,
    image: "/placeholder.svg?height=160&width=320&text=Avocados",
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
    id: "7",
    name: "Smart Watch",
    description: "Track your fitness and stay connected with this smart watch.",
    price: 199.99,
    image: "/placeholder.svg?height=160&width=320&text=Smart+Watch",
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
    id: "9",
    name: "Denim Jeans",
    description: "Classic denim jeans, perfect for any occasion.",
    price: 49.99,
    image: "/placeholder.svg?height=160&width=320&text=Jeans",
    category: "Clothing",
  },
  {
    id: "10",
    name: "Running Shoes",
    description: "Lightweight running shoes with excellent support.",
    price: 89.99,
    image: "/placeholder.svg?height=160&width=320&text=Running+Shoes",
    category: "Footwear",
  },
  {
    id: "11",
    name: "Smartphone",
    description: "Latest model with high-resolution camera and fast processor.",
    price: 799.99,
    image: "/placeholder.svg?height=160&width=320&text=Smartphone",
    category: "Electronics",
  },
  {
    id: "12",
    name: "Laptop",
    description: "Powerful laptop for work and entertainment.",
    price: 1299.99,
    image: "/placeholder.svg?height=160&width=320&text=Laptop",
    category: "Electronics",
  },
  {
    id: "13",
    name: "Coffee Maker",
    description: "Programmable coffee maker for the perfect brew every morning.",
    price: 79.99,
    image: "/placeholder.svg?height=160&width=320&text=Coffee+Maker",
    category: "Home",
  },
  {
    id: "14",
    name: "Blender",
    description: "High-speed blender for smoothies and food preparation.",
    price: 59.99,
    image: "/placeholder.svg?height=160&width=320&text=Blender",
    category: "Home",
  },
  {
    id: "15",
    name: "Yoga Mat",
    description: "Non-slip yoga mat for comfortable workouts.",
    price: 29.99,
    image: "/placeholder.svg?height=160&width=320&text=Yoga+Mat",
    category: "Fitness",
  },
  {
    id: "16",
    name: "Dumbbells",
    description: "Set of adjustable dumbbells for home workouts.",
    price: 149.99,
    image: "/placeholder.svg?height=160&width=320&text=Dumbbells",
    category: "Fitness",
  },
  {
    id: "17",
    name: "Backpack",
    description: "Durable backpack with multiple compartments.",
    price: 39.99,
    image: "/placeholder.svg?height=160&width=320&text=Backpack",
    category: "Accessories",
  },
  {
    id: "18",
    name: "Sunglasses",
    description: "Stylish sunglasses with UV protection.",
    price: 89.99,
    image: "/placeholder.svg?height=160&width=320&text=Sunglasses",
    category: "Accessories",
  },
  {
    id: "19",
    name: "Wireless Earbuds",
    description: "Compact wireless earbuds with long battery life.",
    price: 129.99,
    image: "/placeholder.svg?height=160&width=320&text=Earbuds",
    category: "Electronics",
  },
  {
    id: "20",
    name: "Smart Speaker",
    description: "Voice-controlled smart speaker with premium sound.",
    price: 99.99,
    image: "/placeholder.svg?height=160&width=320&text=Speaker",
    category: "Electronics",
  },
]

// Mock food items database
const foodItems: FoodItem[] = [
  {
    id: "f1",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and basil.",
    basePrice: 12.99,
    image: "/placeholder.svg?height=160&width=320&text=Pizza",
    category: "Food",
    customizationOptions: [
      {
        name: "Size",
        options: [
          { name: "Small", price: 0 },
          { name: "Medium", price: 2 },
          { name: "Large", price: 4 },
        ],
      },
      {
        name: "Crust",
        options: [
          { name: "Thin", price: 0 },
          { name: "Regular", price: 0 },
          { name: "Thick", price: 1 },
        ],
      },
      {
        name: "Extra Toppings",
        options: [
          { name: "Pepperoni", price: 1.5 },
          { name: "Mushrooms", price: 1 },
          { name: "Olives", price: 1 },
          { name: "Pepper", price: 0.75 },
          { name: "Extra Cheese", price: 1.5 },
        ],
      },
    ],
  },
  {
    id: "f2",
    name: "Cheeseburger",
    description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce.",
    basePrice: 8.99,
    image: "/placeholder.svg?height=160&width=320&text=Burger",
    category: "Food",
    customizationOptions: [
      {
        name: "Size",
        options: [
          { name: "Single", price: 0 },
          { name: "Double", price: 3 },
        ],
      },
      {
        name: "Add-ons",
        options: [
          { name: "Bacon", price: 1.5 },
          { name: "Avocado", price: 2 },
          { name: "Fried Egg", price: 1 },
        ],
      },
      {
        name: "Side",
        options: [
          { name: "Fries", price: 2.5 },
          { name: "Onion Rings", price: 3 },
          { name: "Side Salad", price: 3.5 },
        ],
      },
    ],
  },
  {
    id: "f3",
    name: "Chicken Sandwich",
    description: "Grilled or crispy chicken with lettuce, tomato, and mayo.",
    basePrice: 7.99,
    image: "/placeholder.svg?height=160&width=320&text=Chicken+Sandwich",
    category: "Food",
    customizationOptions: [
      {
        name: "Style",
        options: [
          { name: "Grilled", price: 0 },
          { name: "Crispy", price: 0 },
          { name: "Spicy", price: 0.5 },
        ],
      },
      {
        name: "Add-ons",
        options: [
          { name: "Cheese", price: 1 },
          { name: "Bacon", price: 1.5 },
          { name: "Avocado", price: 2 },
        ],
      },
      {
        name: "Side",
        options: [
          { name: "Fries", price: 2.5 },
          { name: "Onion Rings", price: 3 },
          { name: "Side Salad", price: 3.5 },
        ],
      },
    ],
  },
  {
    id: "f4",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan.",
    basePrice: 9.99,
    image: "/placeholder.svg?height=160&width=320&text=Salad",
    category: "Food",
    customizationOptions: [
      {
        name: "Size",
        options: [
          { name: "Small", price: 0 },
          { name: "Large", price: 3 },
        ],
      },
      {
        name: "Protein",
        options: [
          { name: "Grilled Chicken", price: 3 },
          { name: "Shrimp", price: 4 },
          { name: "Salmon", price: 5 },
        ],
      },
      {
        name: "Dressing",
        options: [
          { name: "Caesar", price: 0 },
          { name: "Ranch", price: 0 },
          { name: "Balsamic", price: 0 },
          { name: "On the side", price: 0 },
        ],
      },
    ],
  },
  {
    id: "f5",
    name: "Pasta Alfredo",
    description: "Fettuccine pasta with creamy Alfredo sauce.",
    basePrice: 11.99,
    image: "/placeholder.svg?height=160&width=320&text=Pasta",
    category: "Food",
    customizationOptions: [
      {
        name: "Protein",
        options: [
          { name: "Chicken", price: 3 },
          { name: "Shrimp", price: 4 },
          { name: "None", price: 0 },
        ],
      },
      {
        name: "Add-ons",
        options: [
          { name: "Broccoli", price: 1 },
          { name: "Mushrooms", price: 1 },
          { name: "Sun-dried Tomatoes", price: 1.5 },
        ],
      },
      {
        name: "Side",
        options: [
          { name: "Garlic Bread", price: 2 },
          { name: "Side Salad", price: 3.5 },
          { name: "None", price: 0 },
        ],
      },
    ],
  },
]

// Function to search products based on text query
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    // Call our API endpoint
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`)
    }

    const data = await response.json()

    // Map the MongoDB products to our frontend Product type
    return data.products.map((product: any) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.images[0],
      category: product.category,
      colors: product.colors,
      sizes: product.sizes,
    }))
  } catch (error) {
    console.error("Error searching products:", error)
    return []
  }
}

// Function to search products based on image similarity
export async function uploadImageSearch(file: File): Promise<Product[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // In a real application, you would:
  // 1. Upload the image to a server
  // 2. Process the image to extract features
  // 3. Compare with product images in the database
  // 4. Return similar products

  // For this demo, we'll return random products
  const shuffled = [...products].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 12)
}

// Function to parse food orders from natural language
function parseFoodOrder(query: string): Product | null {
  // Simulate API delay
  const lowercaseQuery = query.toLowerCase()

  // Check if this is a food order
  if (
    !lowercaseQuery.includes("order") &&
    !lowercaseQuery.includes("like") &&
    !lowercaseQuery.includes("want") &&
    !lowercaseQuery.includes("get") &&
    !lowercaseQuery.includes("food") &&
    !lowercaseQuery.includes("pizza") &&
    !lowercaseQuery.includes("burger") &&
    !lowercaseQuery.includes("sandwich") &&
    !lowercaseQuery.includes("salad") &&
    !lowercaseQuery.includes("pasta")
  ) {
    return null
  }

  // Find the food item
  let foodItem: FoodItem | undefined

  if (lowercaseQuery.includes("pizza")) {
    foodItem = foodItems.find((item) => item.name.toLowerCase().includes("pizza"))
  } else if (lowercaseQuery.includes("burger")) {
    foodItem = foodItems.find((item) => item.name.toLowerCase().includes("burger"))
  } else if (lowercaseQuery.includes("sandwich")) {
    foodItem = foodItems.find((item) => item.name.toLowerCase().includes("sandwich"))
  } else if (lowercaseQuery.includes("salad")) {
    foodItem = foodItems.find((item) => item.name.toLowerCase().includes("salad"))
  } else if (lowercaseQuery.includes("pasta")) {
    foodItem = foodItems.find((item) => item.name.toLowerCase().includes("pasta"))
  }

  if (!foodItem) return null

  // Parse customizations
  const customizations: FoodCustomization[] = []
  let totalPrice = foodItem.basePrice

  // Check for size
  if (foodItem.customizationOptions.some((opt) => opt.name === "Size")) {
    if (lowercaseQuery.includes("small")) {
      const option = foodItem.customizationOptions
        .find((opt) => opt.name === "Size")
        ?.options.find((o) => o.name === "Small")
      if (option) {
        customizations.push({ name: "Size", option: option.name, price: option.price })
        totalPrice += option.price
      }
    } else if (lowercaseQuery.includes("medium")) {
      const option = foodItem.customizationOptions
        .find((opt) => opt.name === "Size")
        ?.options.find((o) => o.name === "Medium")
      if (option) {
        customizations.push({ name: "Size", option: option.name, price: option.price })
        totalPrice += option.price
      }
    } else if (lowercaseQuery.includes("large")) {
      const option = foodItem.customizationOptions
        .find((opt) => opt.name === "Size")
        ?.options.find((o) => o.name === "Large")
      if (option) {
        customizations.push({ name: "Size", option: option.name, price: option.price })
        totalPrice += option.price
      }
    }
  }

  // Check for toppings/add-ons
  const toppingsCategory = foodItem.customizationOptions.find(
    (opt) => opt.name === "Extra Toppings" || opt.name === "Add-ons",
  )

  if (toppingsCategory) {
    for (const option of toppingsCategory.options) {
      if (lowercaseQuery.includes(option.name.toLowerCase())) {
        customizations.push({ name: toppingsCategory.name, option: option.name, price: option.price })
        totalPrice += option.price
      }
    }
  }

  // Check for sides
  if (lowercaseQuery.includes("side") || lowercaseQuery.includes("with")) {
    const sideCategory = foodItem.customizationOptions.find((opt) => opt.name === "Side")

    if (sideCategory) {
      for (const option of sideCategory.options) {
        if (lowercaseQuery.includes(option.name.toLowerCase())) {
          customizations.push({ name: "Side", option: option.name, price: option.price })
          totalPrice += option.price
        }
      }
    }

    // Special case for "on the side"
    if (lowercaseQuery.includes("on the side")) {
      const dressingCategory = foodItem.customizationOptions.find((opt) => opt.name === "Dressing")
      if (dressingCategory) {
        const option = dressingCategory.options.find((o) => o.name === "On the side")
        if (option) {
          customizations.push({ name: "Dressing", option: option.name, price: option.price })
          totalPrice += option.price
        }
      } else {
        // Generic "on the side" for items without a specific category
        customizations.push({ name: "Special Instructions", option: "Served on the side", price: 0 })
      }
    }
  }

  // Check for specific customizations like "pepper on the side"
  if (lowercaseQuery.includes("pepper on the side")) {
    customizations.push({ name: "Special Instructions", option: "Pepper on the side", price: 0 })
  }

  // Create a product with the food item and customizations
  return {
    id: `custom-${foodItem.id}-${Date.now()}`,
    name: foodItem.name,
    description: foodItem.description,
    price: totalPrice,
    image: foodItem.image,
    category: "Food",
    isCustomFood: true,
    foodCustomizations: customizations,
    originalFoodItem: foodItem,
  }
}
