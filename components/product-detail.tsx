"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Star } from "lucide-react"
import type { Product } from "@/lib/types"
import Image from "next/image"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductDetailProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product, quantity: number) => void
  isOpen: boolean
}

export default function ProductDetail({ product, onClose, onAddToCart, isOpen }: ProductDetailProps) {
  const [showCustomizations, setShowCustomizations] = useState(false)
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const toggleCustomizations = () => {
    if (product.isCustomFood && product.foodCustomizations && product.foodCustomizations.length > 0) {
      setShowCustomizations(!showCustomizations)
    }
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = () => {
    // Add the product with the current quantity
    onAddToCart(product, quantity)
    // Reset quantity to 1 after adding to cart
    setQuantity(1)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative h-64 md:h-full w-full bg-brand-50">
            <Image
              src={product.image || `/placeholder.svg?height=400&width=400`}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.isCustomFood && <Badge className="absolute top-4 right-4 bg-accent1-500">Custom Order</Badge>}
          </div>

          {/* Product Details */}
          <div className="p-6 flex flex-col h-full max-h-[500px] overflow-y-auto">
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold">{product.name}</h2>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-2xl font-bold text-brand-700 mt-1">${product.price.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
            </div>

            <Separator className="my-4" />

            {/* Customizations for food items */}
            {product.isCustomFood && product.foodCustomizations && product.foodCustomizations.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={toggleCustomizations}
                  className="flex items-center text-sm font-medium text-accent2-500 hover:text-accent2-600 hover:underline"
                >
                  {showCustomizations ? (
                    <>
                      <Minus className="h-3 w-3 mr-1" />
                      Hide customizations
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Show customizations ({product.foodCustomizations.length})
                    </>
                  )}
                </button>

                {showCustomizations && (
                  <div className="mt-2 space-y-1 border rounded-md p-3 bg-brand-50">
                    {product.foodCustomizations.map((customization, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          <span className="font-medium">{customization.name}:</span> {customization.option}
                        </span>
                        {customization.price > 0 && (
                          <span className="text-accent1-600">+${customization.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product details tabs */}
            <Tabs defaultValue="details" className="flex-1">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="text-sm space-y-2 mt-2">
                <p>
                  Category: <span className="font-medium">{product.category}</span>
                </p>
                <p>
                  SKU: <span className="font-medium">{product.id.substring(0, 8)}</span>
                </p>
                <p>
                  Availability: <span className="font-medium text-green-600">In Stock</span>
                </p>
                <p>
                  Shipping: <span className="font-medium">Free shipping on orders over $50</span>
                </p>
              </TabsContent>
              <TabsContent value="nutrition" className="text-sm space-y-2 mt-2">
                {product.category === "Food" ? (
                  <div className="space-y-2">
                    <p>
                      Calories: <span className="font-medium">350 kcal</span>
                    </p>
                    <p>
                      Protein: <span className="font-medium">12g</span>
                    </p>
                    <p>
                      Carbohydrates: <span className="font-medium">42g</span>
                    </p>
                    <p>
                      Fat: <span className="font-medium">14g</span>
                    </p>
                    <p className="text-xs text-muted-foreground">* Nutritional values are approximate</p>
                  </div>
                ) : (
                  <p>Nutrition information not applicable for this product category.</p>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="text-sm space-y-2 mt-2">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span className="ml-2 font-medium">Amazing product!</span>
                    </div>
                    <p className="text-xs text-muted-foreground">by John D. - 2 days ago</p>
                    <p className="mt-1">This exceeded my expectations. Would definitely buy again!</p>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Star className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="ml-2 font-medium">Good value</span>
                    </div>
                    <p className="text-xs text-muted-foreground">by Sarah M. - 1 week ago</p>
                    <p className="mt-1">Great quality for the price. Fast shipping too!</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="w-10 text-center font-medium">{quantity}</div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={incrementQuantity}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button className="flex-1 bg-brand-500 hover:bg-brand-600" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
