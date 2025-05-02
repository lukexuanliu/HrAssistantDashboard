import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ChatMessageType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [debugData, setDebugData] = useState<any>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const fetchedMessages = await apiRequest<ChatMessageType[]>("/api/chat/messages");
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch chat messages:", error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive",
        });
      }
    };

    fetchMessages();
  }, [toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to UI immediately
    const userMessage: ChatMessageType = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Show detailed debugging information
      console.log("Sending message to API:", input.trim());
      
      console.log("Sending data:", JSON.stringify({ message: input.trim() }));
      
      // Use the browser's fetch API directly with more robust error handling
      const fetchResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input.trim() }),
      });
      
      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP error ${fetchResponse.status}: ${errorText}`);
      }
      
      const response = await fetchResponse.json();
      
      // Enhance logging of the API communication for debugging
      const debugInfo = {
        url: "/api/chat",
        requestBody: { message: input.trim() },
        responseStatus: fetchResponse.status,
        // Simplify headers to avoid TypeScript issues
        responseHeaders: {
          contentType: fetchResponse.headers.get('content-type'),
          contentLength: fetchResponse.headers.get('content-length')
        },
        responseBody: response
      };
      
      console.log("API call details:", debugInfo);
      setDebugData(debugInfo);
      
      // Log the raw response for debugging
      console.log("Raw chatbot response:", response);
      
      // Add assistant message from response
      if (response && response.success) {
        const assistantMessage: ChatMessageType = {
          role: "assistant",
          content: response.generated_text,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response?.error || "Failed to get response from AI");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      toast({
        title: "Error",
        description: typeof error === "string" ? error : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">HR Assistant Chatbot</h1>
      
      {/* Chat message display area */}
      <Card className="p-4 h-[60vh] mb-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                Start chatting with your HR assistant by typing a message below.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start max-w-[80%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className={`h-8 w-8 ${
                    msg.role === "user" ? "ml-2" : "mr-2"
                  }`}>
                    <div className={`h-full w-full rounded-full ${
                      msg.role === "user" ? "bg-blue-500" : "bg-green-500"
                    } flex items-center justify-center text-white text-xs font-bold`}>
                      {msg.role === "user" ? "U" : "AI"}
                    </div>
                  </Avatar>
                  <div
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Debug info area */}
      <div className="mb-4 p-2 bg-gray-100 rounded-md">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Information
          </summary>
          <div className="mt-2 text-xs bg-black text-green-400 p-3 rounded overflow-auto max-h-60">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h3 className="text-white font-bold mb-1">Latest Message</h3>
                <pre>
                  {messages.length > 0 
                    ? JSON.stringify(messages[messages.length - 1], null, 2) 
                    : "No messages yet"}
                </pre>
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">API Details</h3>
                <pre>
                  {debugData 
                    ? JSON.stringify(debugData, null, 2)
                    : "No API calls yet"}
                </pre>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about HR policies, benefits, or employee management..."
          disabled={isLoading}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </div>
  );
}