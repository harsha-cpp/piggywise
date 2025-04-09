import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Create a model instance with kid-friendly parameters
export async function getChatResponse(prompt: string, instructions?: string, userName?: string): Promise<string> {
  try {
    console.log("Sending request to Gemini API with key length:", env.GEMINI_API_KEY.length);
    
    // Check if API key is available
    if (!env.GEMINI_API_KEY) {
      console.error("Gemini API key is missing");
      return "I can't think right now. Ask an adult to check my brain! 🤔";
    }
    
    // Use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Send message with content safety settings
    console.log("Sending prompt to Gemini:", prompt.substring(0, 50) + "...");
    
    // Add any custom instructions
    const additionalInstructions = instructions ? `\n\nAdditional Instructions: ${instructions}` : '';
    
    // Use the provided name or fallback to a generic term
    const childName = userName || "there";
    
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a friendly AI helper for a financial education app for kids aged 8-12.
              
              Always follow these rules:
              - Use simple words a 10-year-old can understand
              - Keep sentences short and clear
              - Add fun emojis at the end of sentences
              - Be enthusiastic and encouraging
              - Never mention schoolwork, homework, or studies
              - Explain money concepts in fun, relatable ways
              - Never use complex financial terms without explaining them
              - Always be positive and supportive
              - Use examples relevant to kids (toys, games, treats, etc.)
              - Keep responses under 3 sentences when possible
              - Don't start every response with a greeting - vary your greetings
              - For follow-up questions, just answer directly without a greeting
              
              The kid's name is ${childName} - use their name occasionally to personalize responses.${additionalInstructions}
              
              Question: ${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 200,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });
    
    const response = result.response.text();
    console.log("Received response from Gemini:", response.substring(0, 100) + "...");
    
    return response;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // More detailed error handling
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Check for specific API errors
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      if (errorObj.status) {
        console.error("API status code:", errorObj.status);
      }
      if (errorObj.details) {
        console.error("API error details:", errorObj.details);
      }
    }
    
    return "Oops! Something went wrong with my brain. Try again? 🙃";
  }
} 