"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "@/lib/utils"
import { Package, ChevronRight, Search, ShoppingBag, RefreshCw } from "lucide-react"
import type { Order } from "@/lib/types"
import OrderDetail from "@/components/order-detail"
import { Input } from "@/components/ui/input"
import Pagination from "@/components/pagination"

interface OrderHistoryProps {
  orders: Order[]
  onRefresh?: () => void
}

const ORDERS_PER_PAGE = 5

export default function OrderHistory({ orders, onRefresh }: OrderHistoryProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredOrders = orders.filter((order) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" &&
        ["processing", "confirmed", "preparing", "shipped", "out_for_delivery"].includes(order.status)) ||
      (activeTab === "completed" && order.status === "delivered") ||
      (activeTab === "cancelled" && order.status === "cancelled")

    return matchesSearch && matchesTab
  })

  // Paginate orders
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="flex flex-col h-full">
      {selectedOrder ? (
        <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
      ) : (
        <>
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">My Orders</h2>
              <div className="flex items-center gap-2">
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="border-brand-200 hover:bg-brand-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                )}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    className="pl-8 w-[180px] md:w-[250px] h-9"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1) // Reset to first page on search
                    }}
                  />
                </div>
              </div>
            </div>

            <Tabs
              defaultValue="all"
              onValueChange={(value) => {
                setActiveTab(value)
                setCurrentPage(1) // Reset to first page on tab change
              }}
            >
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 max-h-[320px]">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3">
                  <ShoppingBag className="h-6 w-6 text-brand-500" />
                </div>
                <h3 className="text-base font-medium mb-1">No orders found</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search or filter criteria"
                    : "When you place orders, they will appear here"}
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {paginatedOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:border-brand-300 transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm flex items-center">
                        <Package className="h-4 w-4 mr-1.5 text-brand-500" />
                        Order #{order.id.substring(0, 8)}
                      </CardTitle>
                      <Badge
                        className={`${getStatusColor(order.status)} hover:${getStatusColor(order.status)} text-xs py-0.5`}
                      >
                        {formatStatus(order.status)}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground">
                            {format(new Date(order.date), "MMM d, yyyy")} at {format(new Date(order.date), "h:mm a")}
                          </p>
                          <p>
                            {order.items.reduce((total, item) => total + item.quantity, 0)} items •{" "}
                            <span className="font-medium">${order.total.toFixed(2)}</span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 md:mt-0 text-brand-600 hover:text-brand-700 hover:bg-brand-50 p-0 h-auto text-xs"
                        >
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="p-3 border-t flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
