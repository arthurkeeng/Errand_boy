"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import OrderHistory from "@/components/order-history"
import type { Order } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface OrdersModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OrdersModal({ isOpen, onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch orders when the modal is open
    if (isOpen) {
      fetchOrders()
    }
  }, [isOpen])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/orders")

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()

      // Transform the MongoDB orders to match our frontend Order type
      const transformedOrders: Order[] = data.orders.map((order: any) => ({
        id: order.orderNumber,
        date: new Date(order.date).getTime(),
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).getTime() : undefined,
      }))

      setOrders(transformedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 h-[550px] max-h-[80vh]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <OrderHistory orders={orders} onRefresh={fetchOrders} />
        )}
      </DialogContent>
    </Dialog>
  )
}
