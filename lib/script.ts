// import necessary modules
import Product from "@/models/Product";
import mongoose from "mongoose";
import connectToDatabase from "./mongodb";
// import { Product } from "./models/Product"; // update path to match your project structure

// Your FOOD_MENU object
const FOOD_MENU = {
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
  pepsi: { basePrice: 2.99, category: "drink", description: "Pepsi cola" },
  coke: { basePrice: 2.99, category: "drink", description: "Coca cola" },
  sprite: { basePrice: 2.99, category: "drink", description: "Sprite lemon-lime" },
  water: { basePrice: 1.99, category: "drink", description: "Bottled water" },
  juice: { basePrice: 3.99, category: "drink", description: "Fresh fruit juice" },
  coffee: { basePrice: 4.99, category: "drink", description: "Freshly brewed coffee" },
  tea: { basePrice: 3.99, category: "drink", description: "Hot tea" },
  fries: { basePrice: 4.99, category: "side", description: "French fries" },
  salad: { basePrice: 6.99, category: "side", description: "Fresh garden salad" },
  bread: { basePrice: 2.99, category: "side", description: "Fresh bread rolls" },
  plantain: { basePrice: 3.99, category: "side", description: "Fried plantain" },
};

// Utility to title-case the product names
const titleCase = (str: string) =>
  str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));

const convertToProducts = () => {
  return Object.entries(FOOD_MENU).map(([key, value]) => ({
    name: titleCase(key),
    description: value.description,
    price: value.basePrice,
    category: "food",
    subCategory: value.category,
    images: [], // Add placeholder or real image URLs if available
    tags: [key.toLowerCase(), value.category],
    metadata: {
      foodType: value.category,
    },
    inStock: true,
  }));
};


export async function importFoodMenu() {
  try {
    // await connectToDatabase(); // replace with your actual URI or .env config
    console.log("Connected to MongoDB");

    const foodProducts = convertToProducts();

    // Optional: Clear old food items
    await Product.deleteMany({ category: "food" });

    await Product.insertMany(foodProducts);
    console.log(`Imported ${foodProducts.length} food items.`);

    mongoose.disconnect();
    return {success:true}
  } catch (err) {
    console.error("Error importing food menu:", err);
    return {success : false}
  }
}

// importFoodMenu();
