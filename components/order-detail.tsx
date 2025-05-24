"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "@/lib/utils"
import { ArrowLeft, Package, Truck, Calendar, MapPin, ExternalLink, RefreshCw } from "lucide-react"
import type { Order } from "@/lib/types"
import Image from "next/image"

// Update the OrderDetailProps interface
interface OrderDetailProps {
  order: Order
  onBack: () => void
  onRefresh?: () => void
}

export default function OrderDetail({ order, onBack, onRefresh }: OrderDetailProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "processing":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "preparing":
        return "bg-indigo-500"
      case "shipped":
        return "bg-purple-500"
      case "out_for_delivery":
        return "bg-pink-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatStatus = (status: string): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getStatusSteps = () => {
    const steps = [
      { status: "processing", label: "Processing" },
      { status: "confirmed", label: "Confirmed" },
      { status: "preparing", label: "Preparing" },
      { status: "shipped", label: "Shipped" },
      { status: "out_for_delivery", label: "Out for Delivery" },
      { status: "delivered", label: "Delivered" },
    ]

    if (order.status === "cancelled") {
      return [
        { status: "processing", label: "Processing" },
        { status: "cancelled", label: "Cancelled" },
      ]
    }

    return steps
  }

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps()
    return steps.findIndex((step) => step.status === order.status)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Add a refresh button in the component header */}
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-bold">Order #{order.id.substring(0, 8)}</h2>
        <div className="ml-auto flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-brand-200 hover:bg-brand-50">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          )}
          <Badge className={`ml-auto ${getStatusColor(order.status)} hover:${getStatusColor(order.status)}`}>
            {formatStatus(order.status)}
          </Badge>
        </div>
      </div>

      <div className="p-4 overflow-y-auto max-h-[450px]">
        <div className="space-y-6">
          {/* Order Progress */}
          {order.status !== "cancelled" && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Order Progress</h3>
                <div className="relative">
                  <div className="absolute top-1.5 left-2.5 w-[calc(100%-20px)] h-1 bg-muted">
                    <div
                      className="h-full bg-brand-500"
                      style={{
                        width: `${(getCurrentStepIndex() / (getStatusSteps().length - 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between">
                    {getStatusSteps().map((step, index) => (
                      <div key={step.status} className="flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full z-10 ${
                            index <= getCurrentStepIndex() ? "bg-brand-500" : "bg-muted border-2 border-muted"
                          }`}
                        ></div>
                        <span
                          className={`text-xs mt-2 ${
                            index <= getCurrentStepIndex() ? "text-brand-700 font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-brand-500" />
                  <span className="text-sm">
                    Ordered on {format(new Date(order.date), "MMM d, yyyy")} at {format(new Date(order.date), "h:mm a")}
                  </span>
                </div>
                {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
                  <div className="flex items-center mt-2 md:mt-0">
                    <Truck className="h-4 w-4 mr-2 text-brand-500" />
                    <span className="text-sm">
                      Estimated delivery: {format(new Date(order.estimatedDelivery), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>

              {order.trackingNumber && order.status !== "processing" && order.status !== "confirmed" && (
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-brand-500" />
                  <span className="text-sm">Tracking Number: {order.trackingNumber}</span>
                  <Button variant="ghost" size="sm" className="h-6 ml-2 text-brand-600 p-0">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Track
                  </Button>
                </div>
              )}

              {order.shippingAddress && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-brand-500 mt-0.5" />
                  <span className="text-sm">{order.shippingAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={`${item.product.id}-${index}`}>
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.svg?height=64&width=64"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.product.description}</p>
                            {item.product.isCustomFood && item.product.foodCustomizations && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.product.foodCustomizations.map((c) => `${c.option}`).join(", ")}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} x ${item.product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < order.items.length - 1 && <Separator className="my-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1 border-brand-200 hover:bg-brand-50">
              Need Help?
            </Button>
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                Cancel Order
              </Button>
            )}
            <Button className="flex-1 bg-brand-500 hover:bg-brand-600">Reorder</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
