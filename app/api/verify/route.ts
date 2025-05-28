// app/api/verify/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    console.log('verifying payment')
  const { reference } = await req.json()

  console.log('the reference is', reference)

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY!}`,
      "Content-Type": "application/json"
    }
  })

  const result = await res.json()

  if (result.status) {
    return NextResponse.json({ success: true, data: result.data })
  } else {
    return NextResponse.json({ success: false, error: result.message })
  }
}
