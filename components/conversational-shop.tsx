"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  ShoppingCart,
  ImageIcon,
  History,
  Plus,
  Clock,
  X,
  User,
  Bell,
  Package,
  Trash2,
} from "lucide-react";
import { searchProducts, uploadImageSearch } from "@/lib/product-search";
import {
  removeItemsFromCart,
  addItemsToCart,
  generateModificationResponse,
} from "@/lib/cart-utils";
import { convertFoodOrderToProducts } from "@/lib/food-ordering";
import type { Product, Order, Conversation, Message } from "@/lib/types";
import ProductCard from "@/components/product-card";
import ProductDetail from "@/components/product-detail";
import Pagination from "@/components/pagination";
import ImageUpload from "@/components/image-upload";
import PaymentModal from "@/components/payment-modal";
import OrdersModal from "@/components/orders-modal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/toaster";
import { getOrders, generateMockOrders } from "@/lib/order-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { handleFoodOrder } from "@/handlers/food-handler";
import { handleProductSearch } from "@/handlers/product-handler";

type User = {
  user_id: string;
  email: string;
};

const PRODUCTS_PER_PAGE = 8;

export default function ConversationalShop() {
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const { toast } = useToast();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  useEffect(() => {
    if (user)
      setCurrentUser({
        user_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
      });
    console.log('the user is ' , user)
  }, [user]);
  // Load conversations and orders from localStorage on initial render
  useEffect(() => {
    // Load conversations
    const savedConversations = localStorage.getItem("errandBoyConversations");
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }

    // If there are no conversations, create a new one
    if (!savedConversations || JSON.parse(savedConversations).length === 0) {
      createNewConversation();
    } else {
      // Load the most recent conversation
      const parsedConversations = JSON.parse(savedConversations);
      const mostRecent = parsedConversations.sort(
        (a: Conversation, b: Conversation) => b.lastUpdated - a.lastUpdated
      )[0];
      setActiveConversation(mostRecent.id);
      setMessages(mostRecent.messages);
      setCart(mostRecent.cart || []);
    }

    // Load orders
    const savedOrders = getOrders();
    if (savedOrders.length === 0) {
      // Generate mock orders for demo purposes
      const mockOrders = generateMockOrders(8);
      localStorage.setItem("errandBoyOrders", JSON.stringify(mockOrders));
      setOrders(mockOrders);
    } else {
      setOrders(savedOrders);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(
        "errandBoyConversations",
        JSON.stringify(conversations)
      );
    }
  }, [conversations]);

  // Update the active conversation whenever messages or cart changes
  useEffect(() => {
    if (activeConversation) {
      updateConversation(activeConversation, messages, cart);
    }
  }, [messages, cart]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset to page 1 when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [messages.map((m) => m.products?.length).join(",")]);

  // Improved scroll to bottom function
  const scrollToBottom = () => {
    // Use setTimeout to ensure this runs after the DOM has updated
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }

      // Also ensure the scroll area is scrolled to the bottom
      if (scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current;
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }, 100);
  };

  const createNewConversation = () => {
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! How can I help you today? You can:\n• Order food (e.g., 'I want 2 plates of rice with chicken')\n• Search for products\n• Upload an image to find similar items\n• Browse categories",
      messageType: "general",
    };

    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [welcomeMessage],
      lastUpdated: Date.now(),
      preview: welcomeMessage.content,
      cart: [],
      conversationHistory: [],
    };

    setConversations((prev) => [...prev, newConversation]);
    setActiveConversation(newConversation.id);
    setMessages([welcomeMessage]);
    setCart([]);
  };

  const updateConversation = (
    conversationId: string,
    updatedMessages: Message[],
    updatedCart: Product[]
  ) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          // Get the last non-loading message for the preview
          const lastMessage = [...updatedMessages]
            .reverse()
            .find((msg) => !msg.isLoading);

          // Update conversation history for food ordering context
          const conversationHistory = updatedMessages
            .filter((msg) => !msg.isLoading)
            .map((msg) => `${msg.role}: ${msg.content}`)
            .slice(-10); // Keep last 10 messages for context

          return {
            ...conv,
            messages: updatedMessages,
            lastUpdated: Date.now(),
            preview: lastMessage?.content || conv.preview,
            title: generateConversationTitle(updatedMessages),
            cart: updatedCart,
            conversationHistory,
          };
        }
        return conv;
      })
    );
  };

  const generateConversationTitle = (msgs: Message[]): string => {
    // Find the first user message that has some content
    const firstUserMessage = msgs.find(
      (msg) => msg.role === "user" && msg.content.trim().length > 0
    );
    if (firstUserMessage) {
      // Truncate the message if it's too long
      const title = firstUserMessage.content.slice(0, 30);
      return title.length < firstUserMessage.content.length
        ? `${title}...`
        : title;
    }
    return "New Conversation";
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      setActiveConversation(conversationId);
      setMessages(conversation.messages);
      setCart(conversation.cart || []);
      setShowHistory(false);
    }
  };

  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );

    // If the deleted conversation is the active one, load the most recent one
    if (conversationId === activeConversation) {
      const remainingConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );
      if (remainingConversations.length > 0) {
        const mostRecent = remainingConversations.sort(
          (a, b) => b.lastUpdated - a.lastUpdated
        )[0];
        loadConversation(mostRecent.id);
      } else {
        createNewConversation();
      }
    }
  };

  const getCurrentConversationHistory = (): string[] => {
    const conversation = conversations.find(
      (conv) => conv.id === activeConversation
    );
    return conversation?.conversationHistory || [];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !showImageUpload) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsProcessing(true);
    const conversationHistory = getCurrentConversationHistory();

    // we check the intent to route to the right handler
    // This sends the input and conversation history to the intent classification API

    const intentRes = await fetch("/api/classify-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input, conversationHistory }),
    });

    // we run a switch statement to handle different intents
    const { intent } = await intentRes.json();
    switch (intent) {
      case "food_order":
        await handleFoodOrder({
          input,
          cart,
          setCart,
          setMessages,
          assistantMessageId: assistantMessage.id,
          getCurrentConversationHistory,
        });
        setIsProcessing(false);
        break;

      case "product_search":
        await handleProductSearch({
          input,
          setMessages,
          assistantMessageId: assistantMessage.id,
          getCurrentConversationHistory,
          generateResponse,
        });
        setIsProcessing(false);
        break;

      // add more flows like 'order_status', 'greeting', etc.

      // default:
      //   // fallback: unknown intent
      //   setMessages((prev) =>
      //     prev.map((msg) =>
      //       msg.id === assistantMessage.id
      //         ? {
      //             ...msg,
      //             content: "I'm not sure how to help with that yet.",
      //             messageType: "text",
      //             isLoading: false,
      //           }
      //         : msg,
      //     ),
      //   )
    }
  };

  const handleImageUpload = async (file: File) => {
    setShowImageUpload(false);
    setIsImageUploading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "I'm looking for products similar to this image.",
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Analyzing your image to find similar products...",
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsProcessing(true);

    try {
      // Simulate API call to search products by image
      const results = await uploadImageSearch(file);

      // Update the assistant message with the results
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: "Here are some products similar to your image:",
                products: results,
                messageType: "product_search" as const,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content:
                  "I'm sorry, I couldn't process your image. Please try again.",
                messageType: "general" as const,
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
      setIsImageUploading(false);
      // Ensure we scroll to bottom after processing
      setTimeout(() => {
        scrollToBottom();
      }, 300); // Additional delay to ensure content is rendered
    }
  };

  const generateResponse = (query: string, products: Product[]): string => {
    // Regular product search
    if (products.length === 0) {
      return `I couldn't find any products matching "${query}". Would you like to try a different search or browse our categories?`;
    }

    return `Here are some products that match your search for "${query}":${
      products.length > PRODUCTS_PER_PAGE
        ? " (showing page 1 of " +
          Math.ceil(products.length / PRODUCTS_PER_PAGE) +
          ")"
        : ""
    }`;
  };

  const addToCart = (product: Product, quantity = 1) => {
    // Create new product instances with their own references
    const newItems = Array(quantity)
      .fill(null)
      .map(() => ({
        ...product,
        // Generate a unique ID for each cart item to ensure they're treated as separate items
        cartItemId: `${product.id}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,
      }));

    setCart((prev) => [...prev, ...newItems]);

    // Show a single toast notification with quantity information
    toast({
      title: "Added to Cart",
      description: `${quantity > 1 ? `${quantity}x ` : ""}${
        product.name
      } has been added to your cart.`,
      variant: "success",
    });
  };

  const removeFromCart = (product: Product, index: number) => {
    setCart((prev) => {
      const newCart = [...prev];
      // Remove the item at the specified index
      newCart.splice(index, 1);
      return newCart;
    });

    toast({
      title: "Removed from Cart",
      description: `${product.name} has been removed from your cart.`,
      variant: "success",
    });
  };

  const updateCartItemQuantity = (
    product: Product,
    index: number,
    quantityChange: number
  ) => {
    if (quantityChange > 0) {
      // Add more of this product
      const newItems = Array(quantityChange)
        .fill(null)
        .map(() => ({ ...product }));
      setCart((prev) => [...prev, ...newItems]);

      toast({
        title: "Updated Cart",
        description: `Added ${quantityChange}x ${product.name} to your cart.`,
        variant: "success",
      });
    } else if (quantityChange < 0) {
      // Remove some of this product
      // This is handled by removeFromCart
    }
  };

  const handleViewProductDetails = (
    product: Product,
    allProducts?: Product[]
  ) => {
    setSelectedProduct(product);

    if (allProducts) {
      setSelectedProducts(allProducts);
      const index = allProducts.findIndex((p) => p.id === product.id);
      setCurrentProductIndex(index >= 0 ? index : 0);
    } else {
      setSelectedProducts([product]);
      setCurrentProductIndex(0);
    }

    setShowProductDetail(true);
  };

  const handleProductNavigation = (direction: "prev" | "next") => {
    if (!selectedProducts.length) return;

    let newIndex = currentProductIndex;

    if (direction === "prev" && currentProductIndex > 0) {
      newIndex = currentProductIndex - 1;
    } else if (
      direction === "next" &&
      currentProductIndex < selectedProducts.length - 1
    ) {
      newIndex = currentProductIndex + 1;
    }

    setCurrentProductIndex(newIndex);
    setSelectedProduct(selectedProducts[newIndex]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCheckout = async () => {
    try {
      // Create order items from cart
      const orderItems = cart.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        isCustomFood: product.isCustomFood,
        foodCustomizations: product.foodCustomizations,

        quantity: 1, // Since we're adding individual items to cart
      }));

      const customer = {
        customerId : user?.id,
        name: user?.fullName,
        email:user?.emailAddresses[0]?.emailAddress,
        phone: "08100944296",
        address: "123 Main St, Apt 4B, New York, NY 10001",
      };
      // Calculate totals
      const subtotal = cart.reduce((sum, product) => sum + product.price, 0);
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;

      const payment = {
        method: "Credit Card",
        subtotal,
        total,
        tax,
      };

      // Create order data
      const orderData = {
        customer,
        items: orderItems,
        date: new Date(),
        trackingNumber: "sdkjfoe23232",
        notes: "",
        // shippingAddress: "123 Main St, Apt 4B, New York, NY 10001", // This would come from a form in a real app
        payment,
      };

      // Send order to API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      // Get the created order
      const newOrder = await response.json();

      // Update the orders state (we'll fetch from API in the next step)
      setOrders((prev) => [newOrder, ...prev]);

      // Clear the cart
      setCart([]);

      // Close the payment modal
      setShowPayment(false);

      console.log('the new order ' , newOrder)
      // Show success toast
      toast({
        title: "Order Placed",
        description: `Thank you for your purchase! Your order #${newOrder._id} has been placed successfully.`,
        variant: "success",
      });

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Thank you for your order! Your order #${newOrder._id} has been placed successfully. You can track your order in the Orders section.`,
          messageType: "general",
        },
      ]);
    } catch (error) {
      console.error("Error creating order:", error);

      toast({
        title: "Error",
        description:
          "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get paginated products for the current message
  const getPaginatedProducts = (message: Message) => {
    if (!message.products || message.products.length === 0) return [];

    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;

    return message.products.slice(startIndex, endIndex);
  };

  // Calculate total pages for the current message's products
  const getTotalPages = (message: Message) => {
    if (!message.products || message.products.length === 0) return 0;
    return Math.ceil(message.products.length / PRODUCTS_PER_PAGE);
  };

  // Count active orders (not delivered or cancelled)
  const activeOrdersCount = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  ).length;

  const deleteAllConversations = () => {
    setConversations([]);
    localStorage.removeItem("errandBoyConversations");
    createNewConversation();
    setShowDeleteConfirmation(false);

    toast({
      title: "Chat History Cleared",
      description: "All conversations have been deleted.",
      variant: "success",
    });
  };

  return (
    <div className="flex flex-col h-[600px] rounded-lg overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm border border-brand-200">
      <Toaster />
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/20 hover:text-white"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <h2 className="font-semibold hidden md:block">Errand Boy</h2>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex text-white hover:bg-white/20 hover:text-white"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-2 border-b bg-gradient-to-r from-brand-500 to-brand-600 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Conversations</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="hover:bg-white/20 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={createNewConversation}
                      className="hover:bg-white/20 hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </div>
                </div>
              </div>
              <ScrollArea className="h-80">
                <div className="p-2">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No conversations yet
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {conversations
                        .sort((a, b) => b.lastUpdated - a.lastUpdated)
                        .map((conversation) => (
                          <div
                            key={conversation.id}
                            className={`p-2 rounded-md cursor-pointer flex justify-between items-start hover:bg-brand-50 ${
                              activeConversation === conversation.id
                                ? "bg-brand-50 border border-brand-200"
                                : ""
                            }`}
                            onClick={() => loadConversation(conversation.id)}
                          >
                            <div className="space-y-1 flex-1 overflow-hidden">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-brand-500 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(conversation.lastUpdated),
                                    "MMM d, h:mm a"
                                  )}
                                </p>
                              </div>
                              <p className="font-medium text-sm line-clamp-1">
                                {conversation.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {conversation.preview}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-red-100 hover:text-red-500"
                              onClick={(e) =>
                                deleteConversation(conversation.id, e)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Orders Button */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-white hover:bg-white/20 hover:text-white"
            onClick={() => setShowOrders(true)}
          >
            <Package className="h-4 w-4 mr-2" />
            Orders
            {activeOrdersCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {activeOrdersCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="relative text-white hover:bg-white/20 hover:text-white"
            onClick={() => {
              setShowPayment(true);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {cart.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cart.length}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={createNewConversation}
            className="text-white hover:bg-white/20 hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-white hover:bg-white/20 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* Clerk User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 p-0 overflow-hidden border-2 border-white hover:border-opacity-80 hover:bg-transparent"
              >
                {/* This is where the Clerk user avatar would be rendered */}
                {/* For now, using a placeholder */}
                <div className="bg-accent2-500 h-full w-full flex items-center justify-center">
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowOrders(true)}>
                Order History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile History Sidebar */}
        {showHistory && (
          <div className="w-full md:hidden border-r">
            <div className="p-2 border-b bg-gradient-to-r from-brand-500 to-brand-600 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Conversations</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="hover:bg-white/20 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(false)}
                    className="hover:bg-white/20 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <ScrollArea className="h-full">
              <div className="p-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No conversations yet
                  </p>
                ) : (
                  <div className="space-y-1">
                    {conversations
                      .sort((a, b) => b.lastUpdated - a.lastUpdated)
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-2 rounded-md cursor-pointer flex justify-between items-start hover:bg-brand-50 ${
                            activeConversation === conversation.id
                              ? "bg-brand-50 border border-brand-200"
                              : ""
                          }`}
                          onClick={() => loadConversation(conversation.id)}
                        >
                          <div className="space-y-1 flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-brand-500 flex-shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(conversation.lastUpdated),
                                  "MMM d, h:mm a"
                                )}
                              </p>
                            </div>
                            <p className="font-medium text-sm line-clamp-1">
                              {conversation.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {conversation.preview}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-100 hover:text-red-500"
                            onClick={(e) =>
                              deleteConversation(conversation.id, e)
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main Chat Area */}
        <div
          className={`flex-1 flex flex-col ${
            showHistory ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Use a div with ref and overflow-auto instead of ScrollArea for better control */}
          <div
            className="flex-1 p-4 bg-gradient-to-b from-white to-brand-50 overflow-auto"
            ref={scrollAreaRef}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[95%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {message.role === "user" ? (
                      <div className="h-8 w-8 ">
                        <img src={user?.imageUrl} className="rounded-full" />
                      </div>
                    ) : (
                      <Avatar
                        className={`h-8 w-8 ${"bg-gradient-to-br from-brand-400 to-brand-600"}`}
                      >
                        {/* <div className="text-xs font-medium text-white">{message.role === "user" ? "You" : "AI"}</div> */}
                      </Avatar>
                    )}

                    <div className="space-y-2 flex-1">
                      <Card
                        className={`p-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-accent1-500 to-accent1-600 text-white"
                            : "bg-white border-brand-200"
                        }`}
                      >
                        {message.isLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Just A Moment...</span>
                          </div>
                        ) : (
                          <div>
                            <p className="whitespace-pre-line">
                              {message.content}
                            </p>
                            {message.messageType === "food_order" &&
                              message.foodOrderData && (
                                <div className="mt-2 p-2 bg-brand-50 rounded-md border">
                                  <p className="text-sm font-medium text-brand-700">
                                    Order Summary:
                                  </p>
                                  <p className="text-sm">
                                    {message.foodOrderData.orderSummary}
                                  </p>
                                  {message.foodOrderData.totalEstimatedPrice >
                                    0 && (
                                    <p className="text-sm font-medium">
                                      Total: $
                                      {message.foodOrderData.totalEstimatedPrice.toFixed(
                                        2
                                      )}
                                    </p>
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                      </Card>

                      {/* Show loader while image is being processed */}
                      {isImageUploading &&
                        message.role === "assistant" &&
                        message.isLoading && (
                          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-md border border-brand-200">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Analyzing image and finding similar products...
                            </p>
                          </div>
                        )}

                      {message.products &&
                        message.products.length > 0 &&
                        !message.isLoading && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                              {getPaginatedProducts(message).map((product) => (
                                <ProductCard
                                  key={product.id}
                                  product={product}
                                  onAddToCart={() => addToCart(product, 1)}
                                  onViewDetails={() =>
                                    handleViewProductDetails(
                                      product,
                                      message.products
                                    )
                                  }
                                  compact={true}
                                />
                              ))}
                            </div>

                            {/* Pagination */}
                            {message.products.length > PRODUCTS_PER_PAGE && (
                              <div className="flex justify-center mt-2">
                                <Pagination
                                  currentPage={currentPage}
                                  totalPages={getTotalPages(message)}
                                  onPageChange={handlePageChange}
                                />
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
              {/* This is our scroll target */}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>

          {showImageUpload ? (
            <div className="p-4 border-t bg-white">
              <ImageUpload
                onUpload={handleImageUpload}
                onCancel={() => setShowImageUpload(false)}
              />
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t bg-white"
            >
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowImageUpload(true)}
                  disabled={isProcessing || isImageUploading}
                  className="border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Order food (e.g., '2 plates of rice with chicken') or search for products..."
                  className="min-h-10 flex-1 resize-none border-brand-200 focus-visible:ring-brand-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  disabled={isProcessing || isImageUploading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isProcessing || isImageUploading || !input.trim()}
                  className="bg-brand-500 hover:bg-brand-600"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        isOpen={showProductDetail}
        onClose={() => setShowProductDetail(false)}
        onAddToCart={addToCart}
        products={selectedProducts}
        currentIndex={currentProductIndex}
        onNavigate={handleProductNavigation}
      />

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          onClose={() => setShowPayment(false)}
          onCheckout={handleCheckout}
          onRemoveItem={removeFromCart}
          onUpdateQuantity={updateCartItemQuantity}
        />
      )}

      {/* Orders Modal */}
      {showOrders && (
        <OrdersModal
          //  orders={orders}
          isOpen={showOrders}
          onClose={() => setShowOrders(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete All Conversations</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete all conversations? This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteAllConversations}>
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
