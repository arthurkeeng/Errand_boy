import { Suspense } from "react"
import ConversationalShop from "@/components/conversational-shop"
import { Loader2 } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-gradient-to-br from-background to-brand-50 pattern-dots">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-brand-600 via-accent1-500 to-accent2-500 text-transparent bg-clip-text">
            Errand Boy
          </h1>
          <p className="text-muted-foreground">
            Your conversational shopping assistant - ask for products, upload images, or browse our catalog
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[600px] bg-white/80 backdrop-blur-sm rounded-lg border shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
          }
        >
          <ConversationalShop />
        </Suspense>
      </div>
    </main>
  )
}
