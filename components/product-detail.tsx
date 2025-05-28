"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Star, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { Product } from "@/lib/types"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductDetailProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product, quantity: number) => void
  isOpen: boolean
  // Add navigation props
  products?: Product[]
  currentIndex?: number
  onNavigate?: (direction: "prev" | "next") => void
}

export default function ProductDetail({
  product,
  onClose,
  onAddToCart,
  isOpen,
  products,
  currentIndex,
  onNavigate,
}: ProductDetailProps) {
  const [showCustomizations, setShowCustomizations] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen || !products || products.length <= 1) return

      if (event.key === "ArrowLeft" && currentIndex !== undefined && currentIndex > 0) {
        onNavigate?.("prev")
      } else if (event.key === "ArrowRight" && currentIndex !== undefined && currentIndex < products.length - 1) {
        onNavigate?.("next")
      } else if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, products, currentIndex, onNavigate, onClose])

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1)
  }, [product?.id])

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

  const showPrevButton = products && products.length > 1 && currentIndex !== undefined && currentIndex > 0
  const showNextButton =
    products && products.length > 1 && currentIndex !== undefined && currentIndex < products.length - 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Product Counter */}
        {products && products.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium shadow-md">
            {(currentIndex ?? 0) + 1} of {products.length}
          </div>
        )}

        {/* Navigation Buttons */}
        {showPrevButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate?.("prev")}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md rounded-full h-12 w-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {showNextButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate?.("next")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md rounded-full h-12 w-12"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        <div className="grid md:grid-cols-2 gap-0 h-full">
          {/* Product Image */}
          <div className="relative h-80 md:h-full w-full bg-brand-50">
            <Image
              src={product.image || `/placeholder.svg?height=600&width=600`}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.isCustomFood && <Badge className="absolute bottom-4 right-4 bg-accent1-500">Custom Order</Badge>}
          </div>

          {/* Product Details */}
          <div className="p-8 flex flex-col h-full max-h-[600px] overflow-y-auto">
            <div>
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-3xl font-bold text-brand-700 mt-2">${product.price.toFixed(2)}</p>
              <p className="text-base text-muted-foreground mt-3 leading-relaxed">{product.description}</p>
            </div>

            <Separator className="my-6" />

            {/* Customizations for food items */}
            {product.isCustomFood && product.foodCustomizations && product.foodCustomizations.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={toggleCustomizations}
                  className="flex items-center text-base font-medium text-accent2-500 hover:text-accent2-600 hover:underline"
                >
                  {showCustomizations ? (
                    <>
                      <Minus className="h-4 w-4 mr-2" />
                      Hide customizations
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Show customizations ({product.foodCustomizations.length})
                    </>
                  )}
                </button>

                {showCustomizations && (
                  <div className="mt-3 space-y-2 border rounded-lg p-4 bg-brand-50">
                    {product.foodCustomizations.map((customization, index) => (
                      <div key={index} className="flex justify-between text-base">
                        <span>
                          <span className="font-medium">{customization.name}:</span> {customization.option}
                        </span>
                        {customization.price > 0 && (
                          <span className="text-accent1-600 font-medium">+${customization.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product details tabs */}
            <Tabs defaultValue="details" className="flex-1">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="details" className="text-base">
                  Details
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="text-base">
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-base">
                  Reviews
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="text-base space-y-3 mt-4">
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
              <TabsContent value="nutrition" className="text-base space-y-3 mt-4">
                {product.category === "Food" ? (
                  <div className="space-y-3">
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
                    <p className="text-sm text-muted-foreground">* Nutritional values are approximate</p>
                  </div>
                ) : (
                  <p>Nutrition information not applicable for this product category.</p>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="text-base space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span className="ml-2 font-medium">Amazing product!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">by John D. - 2 days ago</p>
                    <p className="mt-2">This exceeded my expectations. Would definitely buy again!</p>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="ml-2 font-medium">Good value</span>
                    </div>
                    <p className="text-sm text-muted-foreground">by Sarah M. - 1 week ago</p>
                    <p className="mt-2">Great quality for the price. Fast shipping too!</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center font-medium text-lg">{quantity}</div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="flex-1 bg-brand-500 hover:bg-brand-600 h-12 text-lg" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-3" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
