const GEMINI_API_KEY = "AIzaSyCBg_jxPqfUzCZ3rDyaHgMltRip-crnl6Y";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export const sendMessageToGemini = async (
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[]
): Promise<string> => {
  const contents: GeminiMessage[] = [
    {
      role: "user",
      parts: [{ text: "You are a helpful AI travel assistant called TravelMate AI. You help users with trip suggestions, packing recommendations, destination details, travel tips, budget planning advice, and anything travel-related. Be friendly, concise, and informative. Use emojis occasionally to keep the conversation engaging." }],
    },
    {
      role: "model",
      parts: [{ text: "Understood! I'm TravelMate AI, your friendly travel assistant. I'm ready to help with destinations, packing tips, budgets, and more! ✈️" }],
    },
    ...conversationHistory.map((msg) => ({
      role: (msg.role === "assistant" ? "model" : "user") as "user" | "model",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response. Please try again.";
};
