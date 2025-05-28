import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/toaster"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Errand Boy - Conversational Shopping",
  description: "Your conversational shopping assistant",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>


    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
    </ClerkProvider>
  )
}
