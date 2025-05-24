"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"
import { CreditCard, Trash2, Minus, Plus } from "lucide-react"

interface PaymentModalProps {
  cart: Product[]
  onClose: () => void
  onCheckout: () => void
  onRemoveItem: (product: Product, index: number) => void
  onUpdateQuantity: (product: Product, index: number, newQuantity: number) => void
}

// Helper function to group cart items
function groupCartItems(cart: Product[]): { product: Product; quantity: number; indices: number[] }[] {
  const groupedItems: Map<string, { product: Product; quantity: number; indices: number[] }> = new Map()

  cart.forEach((product, index) => {
    // Use the product ID and customizations to create a unique key
    const key = `${product.id}-${product.isCustomFood ? JSON.stringify(product.foodCustomizations) : ""}`

    if (groupedItems.has(key)) {
      const item = groupedItems.get(key)!
      item.quantity += 1
      item.indices.push(index)
    } else {
      groupedItems.set(key, { product, quantity: 1, indices: [index] })
    }
  })

  return Array.from(groupedItems.values())
}

export default function PaymentModal({ cart, onClose, onCheckout, onRemoveItem, onUpdateQuantity }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Group cart items by product ID and customizations
  const groupedCart = groupCartItems(cart)

  const subtotal = cart.reduce((sum, product) => sum + product.price, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onCheckout()
    }, 1500)
  }

  const handleRemoveItem = (item: { product: Product; indices: number[] }) => {
    // Remove the first occurrence of this item
    onRemoveItem(item.product, item.indices[0])
  }

  const handleDecreaseQuantity = (item: { product: Product; quantity: number; indices: number[] }) => {
    if (item.quantity > 1) {
      // Remove the first occurrence of this item
      onRemoveItem(item.product, item.indices[0])
    }
  }

  const handleIncreaseQuantity = (item: { product: Product; indices: number[] }) => {
    // Add another instance of this item by updating the quantity
    onUpdateQuantity(item.product, item.indices[0], 1)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent1-500 text-transparent bg-clip-text">
            Checkout
          </DialogTitle>
        </DialogHeader>

        {cart.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" onClick={onClose} className="mt-4 border-brand-200 hover:bg-brand-50">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium text-brand-700">Order Summary</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groupedCart.map((item) => (
                    <div
                      key={`${item.product.id}-${
                        item.product.isCustomFood ? JSON.stringify(item.product.foodCustomizations) : ""
                      }`}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-none"
                            onClick={() => handleDecreaseQuantity(item)}
                            disabled={isProcessing}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="w-6 text-center font-medium text-xs">{item.quantity}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-none"
                            onClick={() => handleIncreaseQuantity(item)}
                            disabled={isProcessing}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="line-clamp-1 flex-1 min-w-0">{item.product.name}</span>
                        {item.product.isCustomFood &&
                          item.product.foodCustomizations &&
                          item.product.foodCustomizations.length > 0 && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">(Custom)</span>
                          )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="font-medium text-brand-700 whitespace-nowrap">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isProcessing}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-2 bg-brand-100" />

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-brand-700">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-brand-100" />

              <div className="space-y-2">
                <h3 className="font-medium text-brand-700">Payment Information</h3>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      required
                      className="border-brand-200 focus-visible:ring-brand-500"
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength={19}
                      className="border-brand-200 focus-visible:ring-brand-500"
                      onChange={(e) => {
                        // Format card number with spaces
                        const value = e.target.value.replace(/\s/g, "")
                        const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ")
                        e.target.value = formattedValue
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        required
                        maxLength={5}
                        className="border-brand-200 focus-visible:ring-brand-500"
                        onChange={(e) => {
                          // Format expiry date
                          const value = e.target.value.replace(/\//g, "")
                          if (value.length > 2) {
                            e.target.value = `${value.slice(0, 2)}/${value.slice(2)}`
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        required
                        maxLength={3}
                        className="border-brand-200 focus-visible:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} className="border-brand-200 hover:bg-brand-50">
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing} className="bg-brand-500 hover:bg-brand-600">
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
