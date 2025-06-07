import { Message } from "@/lib/types";

type Params = {
  input: string;
  assistantMessageId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  getCurrentConversationHistory?: () => string[]; // Optional if not needed here
  generateResponse?: (input: string, data?: any) => string; // Optional
};



export const handleAboutUs = async ({
  input,
  assistantMessageId,
  setMessages,
  generateResponse,
}: Params) => {
  try {
    const aboutUsMessage = `
We offer a range of products and services to meet your everyday needs!

🛍️ PRODUCTS:
- Fashion: Clothes, shoes, and accessories.
- Electronics: Phones, gadgets, and more.

🍔 FOOD:
- Order fresh, hot meals delivered straight to your door.
- Order farm produce like eggs , yam , etc.


🧼 SERVICES:
- Laundry, home cleaning, and personal errands.

Let me know what you're interested in, and I’ll help you get started!
`.trim();

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: aboutUsMessage,
              messageType: "about_us" as const,
              isLoading: false,
            }
          : msg,
      ),
    );
  } catch (error) {
    console.error("About Us handling failed:", error);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content:
                "Something went wrong while telling you about our services. Please try again.",
              messageType: "about_us" as const,
              isLoading: false,
            }
          : msg,
      ),
    );
  }
  finally{
    return true
  }
};
