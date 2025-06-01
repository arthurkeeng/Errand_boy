// models/Order.ts
import mongoose, { Schema, Document, model, models } from "mongoose"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface CustomerInfo {
  customerId : string
  name: string
  email: string
  phone: string
  address: string
}

export interface PaymentInfo {
  method: string
  cardLast4: string
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface OrderDocument extends Document {
  customer: CustomerInfo
  items: OrderItem[]
  payment: PaymentInfo
  status: "pending" | "processing" | "completed" | "cancelled"
  date: Date
  estimatedDelivery: Date
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
)

const CustomerSchema = new Schema<CustomerInfo>(
  {
    customerId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false }
)

const PaymentSchema = new Schema<PaymentInfo>(
  {
    method: { type: String, required: true },
    // cardLast4: { type: String, required: true },
    subtotal: { type: Number, required: true },
    // shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
)

const OrderSchema = new Schema<OrderDocument>(
  {
    customer: { type: CustomerSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    payment: { type: PaymentSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    date: { type: Date, required: true },
    estimatedDelivery: { type: Date },
    trackingNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
)

const Order = models.Order || model<OrderDocument>("Order", OrderSchema)
export default Order
