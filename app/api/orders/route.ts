// app/api/orders/route.ts
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/orders"
// You must have this function in your lib

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const body = await req.json()
    const {
      customer,
      items,
      payment,
      status = "pending",
      date,
      estimatedDelivery,
      trackingNumber,
      notes,
    } = body

    if (!customer || !items || !payment || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const newOrder = await Order.create({
      customer,
      items,
      payment,
      status,
      date: new Date(date),
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      trackingNumber,
      notes,
    })

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
