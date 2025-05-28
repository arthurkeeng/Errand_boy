"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { groupCartItems, type CartItemGroup } from "@/lib/cart-utils";

interface PaymentModalProps {
  cart: any[];
  onClose: () => void;
  onCheckout: () => void;
  onRemoveItem: (item: any, index: number) => void;
  onUpdateQuantity: (item: any, index: number, quantityChange: number) => void;
}

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function PaymentModal({
  cart,
  onClose,
  onCheckout,
  onRemoveItem,
  onUpdateQuantity,
}: PaymentModalProps) {
  const groupedItems = groupCartItems(cart);
  const subtotal = cart.reduce((sum, product) => sum + product.price, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Load Paystack script
  useEffect(() => {
    const scriptId = "paystack-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePaystackPayment = () => {
    const paystack = window.PaystackPop;
    if (!paystack) return alert("Paystack failed to load.");

    const ref = `ps_${Date.now()}`;

const handler = paystack.setup({
  key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  email: "customer@example.com",
  amount: 50000,
  currency: "NGN",
  ref,
  callback: async (response: { reference: string }) => {
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: response.reference }),
      });
      const data = await res.json();
      if (data.success) {
        console.log("Payment verified!", data.data);
        // ✅ Place order success logic here:
        // onCheckout();
      } else {
        console.error("Verification failed:", data.error);
      }
    } catch (err) {
      console.error("Verification error", err);
    }
  },
  onClose: () => {
    console.log("Payment popup closed.");
  },
});

handler.openIframe(); // ✅ explicitly call openIframe

  };

  const handleRemoveGroup = (group: CartItemGroup, quantityToRemove = 1) => {
    for (let i = 0; i < quantityToRemove && group.cartItemIds.length > 0; i++) {
      const cartItemId = group.cartItemIds[i];
      const index = cart.findIndex(
        (item) => (item.cartItemId || item.id) === cartItemId
      );
      if (index >= 0) {
        onRemoveItem(cart[index], index);
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cart.length} items)
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {groupedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              groupedItems.map((group, groupIndex) => (
                <Card
                  key={`${group.product.name}-${groupIndex}`}
                  className="p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={group.product.image || "/placeholder.svg"}
                      alt={group.product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{group.product.name}</h4>

                      {group.product.foodCustomizations &&
                        group.product.foodCustomizations.length > 0 && (
                          <div className="mt-1">
                            {group.product.foodCustomizations.map(
                              (customization, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs mr-1"
                                >
                                  {customization.option}
                                </Badge>
                              )
                            )}
                          </div>
                        )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveGroup(group, 1)}
                            disabled={group.quantity <= 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium min-w-[2rem] text-center">
                            {group.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newItem = {
                                ...group.product,
                                cartItemId: `${
                                  group.product.id
                                }-${Date.now()}-${Math.random()
                                  .toString(36)
                                  .substring(2, 9)}`,
                              };
                              onUpdateQuantity(newItem, 0, 1);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">${group.totalPrice}</p>
                          <p className="text-xs text-muted-foreground">
                            ${group.product.price} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {cart.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Continue Shopping
          </Button>
          {cart.length > 0 && (
            <Button
              onClick={handlePaystackPayment}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Pay ₦{total.toFixed(2)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
