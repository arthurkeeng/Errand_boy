// app/api/classify-intent/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { query, conversationHistory } = await req.json();

    const prompt = `
You are an intent classification assistant for a conversational shopping AI.

Your task is to analyze a customer's message and determine the primary intent behind it.

You MUST return one of the following intent labels:

- "food_order": The user is ordering or modifying a food order (e.g., "I'd like a pepperoni pizza", "remove fries from my order").
- "product_search": The user is searching for a non-food product (e.g., clothes, shoes, electronics, etc.).
- "support": The user is asking for help, support, or has questions about returns, delivery, or issues.
- "general": The user is making small talk, chatting, or asking something general (e.g., "hello", "who are you?").
- "unknown": You are not confident about the intent or the message is unclear.

Only return a JSON object like this:

{ "intent": "product_search" }

Do not explain or add anything else. Be strict and return only one intent.
user message: "${query}"
conversation history: ${conversationHistory?.join(" ") || "No previous messages."}
`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Remove code block formatting if present
    if (text.startsWith("```")) {
      text = text.replace(/```[a-z]*\n?/i, "").replace(/```$/, "").trim();
    }

    let intent = "unknown";
    try {
      const parsed = JSON.parse(text);
      intent = parsed.intent || "unknown";
    } catch (err) {
      console.error("❌ Failed to parse Gemini response:", text);
    }

    return NextResponse.json({ intent });
  } catch (error) {
    console.error("❌ classify-intent error:", error);
    return NextResponse.json({ intent: "unknown" }, { status: 500 });
  }
}
