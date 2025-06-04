// app/api/orders/route.ts
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/mongodb"
import Order from "@/models/orders"
import { importFoodMenu } from "@/lib/script"
import { getMockFoodMenu } from "@/lib/food-ordering"
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

export async function GET(req: Request) {
  try {
    await connectToDatabase()
   
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")
    console.log('Fetching orders...' , customerId)

    const orders = await Order.find({ "customer.customerId": customerId })
              .sort({ createdAt: -1 })        // newest first (optional)
              .lean();   
              

    // if (orderId) {
    //   const order = await Order.find()
    //   if (!order) {
    //     return NextResponse.json(
    //       { error: "Order not found" },
    //       { status: 404 }
    //     )
    //   }
    //   return NextResponse.json(order, { status: 200 })
    // }


    return NextResponse.json({orders}, { status: 200 })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
