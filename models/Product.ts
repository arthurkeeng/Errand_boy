import mongoose, { Schema, type Document , models ,model} from "mongoose"

// Interface
export interface IProduct extends Document {
  name: string
  description: string
  price: number
  category: string
  brand?: string
  colors?: string[]
  sizes?: string[]
  weight?: string
  images: string[]
  tags: string[]
  inStock: boolean
  rating?: number
  features?: string[]
  metadata?: Record<string, any>,
  subCategory?: string // e.g. "main", "drink", "shirt", "phone"
  embedding?: {
    vector: number[]
    dimension: number
  }
  createdAt: Date
  updatedAt: Date
}

// Embedding schema for vector search
const embeddingSchema = new Schema({
  vector: { type: [Number], required: true },
  dimension: { type: Number, required: true },
})

// Main product schema
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, index: true }, // e.g. "food", "clothing", "electronics"
    subCategory: { type: String }, // e.g. "main", "drink", "shirt", "phone"

    brand: { type: String },
    colors: { type: [String], index: true },
    sizes: { type: [String] }, // for clothing or items with size
    weight: { type: String }, // useful for food, hardware, etc.

    images: { type: [String], required: true },
    tags: { type: [String], index: true },
    inStock: { type: Boolean, default: true },

    rating: { type: Number, min: 0, max: 5 },
    features: { type: [String] }, // e.g. ["waterproof", "Bluetooth 5.0"]

    // For extensibility across all types of items
    metadata: { type: Schema.Types.Mixed }, // e.g. { foodType: 'main', calories: 300 } or { voltage: "220V" }

    // For AI-based recommendations or semantic search
    embedding: embeddingSchema,
  },
  { timestamps: true }
);

// Text index for full-text search

// ✅ Define indexes before model creation
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, subCategory: 1 }); // optional

export default mongoose.models?.Product || model<IProduct>("Product", productSchema)
// export default model<IProduct>("Product", productSchema)


// import mongoose, { Schema, type Document } from "mongoose"

// // Supported product types
// type ProductType = "food" | "drink" | "service" | "moving" | "retail"

// // Interface
// export interface IProduct extends Document {
//   name: string
//   description: string
//   price: number
//   category: string
//   type: ProductType
//   brand?: string
//   colors?: string[]
//   sizes?: string[]
//   weight?: string
//   images: string[]
//   tags: string[]
//   inStock: boolean
//   rating?: number
//   features?: string[]
//   metadata?: Record<string, any>
//   embedding?: {
//     vector: number[]
//     dimension: number
//   }
//   createdAt: Date
//   updatedAt: Date
// }

// // Embedding schema for vector search
// const embeddingSchema = new Schema({
//   vector: { type: [Number], required: true },
//   dimension: { type: Number, required: true },
// })

// // Main product schema
// const productSchema = new Schema<IProduct>(
//   {
//     name: { type: String, required: true, index: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     category: { type: String, required: true, index: true },
//     type: {
//       type: String,
//       required: true,
//       enum: ["food", "drink", "service", "moving", "retail"],
//       index: true,
//     },
//     brand: { type: String },
//     colors: { type: [String], index: true },
//     sizes: { type: [String] },
//     weight: { type: String },
//     images: { type: [String], required: true },
//     tags: { type: [String], index: true },
//     inStock: { type: Boolean, default: true },
//     rating: { type: Number, min: 0, max: 5 },
//     features: { type: [String] },
//     metadata: { type: Schema.Types.Mixed, default: {} },
//     embedding: embeddingSchema,
//   },
//   { timestamps: true }
// )

// // Text index for full-text search
// productSchema.index({ name: "text", description: "text", tags: "text" })

// export default mongoose.models.Product ||
//   mongoose.model<IProduct>("Product", productSchema)
