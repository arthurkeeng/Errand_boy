import { Message } from "@/lib/types";
import { generateQuoteFromInput } from "./generate-cleaning-quote";
// import { generateQuoteFromInput } from "@/lib/services/quote-generator";

type Params = {
  input: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  getCurrentConversationHistory: () => string[];
};

export const handleFollowUpResponse = async ({
  input,
  setMessages,
  getCurrentConversationHistory,
}: Params) => {
  try {
    // Get conversation history messages (assuming you store them somewhere)
    const conversationHistory = getCurrentConversationHistory();

    // Find the last service request message to get service type
    // Assuming each message has `services` array with matched services (like your previous handler)
    const lastServiceMsg = [...conversationHistory].reverse().find((msg) => {
      // Here msg is probably string array, so you might need a way to access full message objects
      // Adjust this according to your state shape
      // For demo, let's say you pass full messages instead of just strings to getCurrentConversationHistory
      return (msg as any).messageType === "service_request" && (msg as any).services?.length > 0;
    }) as Message | undefined;

    const serviceType = lastServiceMsg?.services?.[0]?.type;
    
    console.log('the conversation history is ' , conversationHistory)

    if (!serviceType) {
        console.log('the error is frm here')
      throw new Error("Could not identify the service type from conversation history.");
    }

    // Generate the quote based on user input & service type
    const quote = generateQuoteFromInput(serviceType, input);

    const quoteMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: quote,
      isLoading: false,
      messageType: "quote",
    };

    // Add the quote message to chat
    setMessages((prev) => [...prev, quoteMessage]);
    return 
  } catch (error) {
    console.error("Failed to generate quote:", error);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Sorry, I couldn't generate a quote from your details. Please try to provide more information or clarify your request.",
        isLoading: false,
        messageType: "error",
      },
    ]);
    return 
  }
};
