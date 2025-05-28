// components/PaystackButton.tsx
"use client"

import { loadPaystackScript } from "@/lib/load-paystack"
import { useEffect } from "react"

interface PaystackButtonProps {
  email: string
  amount: number // Naira
  onSuccess: (ref: string) => void
  onClose?: () => void
}

export const PaystackButton: React.FC<PaystackButtonProps> = ({ email, amount, onSuccess, onClose }) => {
  useEffect(() => {
    loadPaystackScript()
  }, [])

  const handlePayment = () => {
    const PaystackPop = (window as any).PaystackPop

    if (!PaystackPop) return alert("Unable to load Paystack. Please try again.")

    PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Paystack expects kobo
      currency: "NGN",
      ref: `ps_${Date.now()}`,
      callback: (response: { reference: string }) => {
        onSuccess(response.reference)
      },
      onClose: () => {
        onClose?.()
      }
    }).openIframe()
  }

  return (
    <button
      onClick={handlePayment}
      className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-4 py-2 rounded-md"
    >
      Pay ₦{amount}
    </button>
  )
}
