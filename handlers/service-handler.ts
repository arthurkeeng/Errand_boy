import { searchServices } from "@/lib/sevices/service-search";
import { Message, Product } from "@/lib/types";

type Params = {
  input: string;
  assistantMessageId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  getCurrentConversationHistory: () => string[];
  generateResponse: (
    input: string,
    results: any[],
    options?: { messageType?: string }
  ) => string;
};


export const handleServiceRequest = async ({
  input,
  assistantMessageId,
  setMessages,
  getCurrentConversationHistory,
  generateResponse,
}: Params) => {
  try {
    const conversationHistory = getCurrentConversationHistory();

    const { services: results, aiResponse } = await searchServices(input);

    const matchedService = results?.[0]

    const followUpPrompt =
      matchedService?.type === "cleaning"
        ? `📝 To give you a personalized quote, please tell me:
- How many **bedrooms** and **bathrooms** do you have?
- Would you like a **regular** or **deep clean**?
- Any extras? (e.g., **fridge**, **oven**, **balcony**, **laundry**)`
        : matchedService?.type === "laundry"
        ? `🧺 To generate an accurate quote, please tell me:
- Roughly how many **kgs** or **bags** of laundry?
- Do you need **express** delivery?`
        : "";

    setMessages((prev ) =>
      prev.map((msg) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: aiResponse || generateResponse(input, results, { messageType: "service_request" }),
              services: results,
              messageType: "service_request",
              isLoading: false,
            }
          : msg,
      ),
    );


    if (followUpPrompt) {
         setTimeout(() => {
        const followUpMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: followUpPrompt,
          isLoading: false,
          messageType: "follow_up",
        };

        setMessages((prev) => [...prev, followUpMessage]);
      }, 3000);
    }
    return { services: results, matchedService };
  } catch (error) {
    console.error("Service request failed:", error);
    setMessages((prev : any) =>
      prev.map((msg : any) =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: "Something went wrong while finding a service. Please try again.",
              messageType: "service_request",
              isLoading: false,
            }
          : msg,
      ),
    );
        return { services: [], matchedService: null };

  }
};
