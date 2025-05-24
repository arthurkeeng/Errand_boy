"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import type { Product } from "@/lib/types"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
  onViewDetails: () => void
  compact?: boolean
}

export default function ProductCard({ product, onAddToCart, onViewDetails, compact = false }: ProductCardProps) {
  return (
    <Card
      className="overflow-hidden border-brand-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onViewDetails}
    >
      <div className={`relative ${compact ? "h-28" : "h-40"} w-full`}>
        <Image
          src={product.image || `/placeholder.svg?height=160&width=320`}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.isCustomFood && (
          <Badge className="absolute top-2 right-2 bg-accent1-500 hover:bg-accent1-600">Custom</Badge>
        )}
      </div>
      <CardContent className={`${compact ? "p-2" : "p-3"}`}>
        <div className="flex justify-between items-start gap-1">
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium line-clamp-1 ${compact ? "text-sm" : ""}`}>{product.name}</h3>
            {!compact && <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>}
            <p className={`font-bold ${compact ? "text-sm mt-0.5" : "mt-1"} text-brand-700`}>
              ${product.price.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full hover:bg-brand-100 text-brand-600"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails()
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full hover:bg-brand-100 text-brand-600"
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart()
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
