import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/gemini';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const { message, instructions, userName } = await req.json();
    
    if (!message || typeof message !== 'string') {
      console.error('Invalid message format:', message);
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }
    
    console.log('API route received message:', message);
    
    // Check if Gemini API key is available
    if (!env.GEMINI_API_KEY) {
      console.error('Gemini API key is missing in environment variables');
      return NextResponse.json(
        { error: 'API configuration error', response: "I can't think right now. Ask an adult to check my brain! 🤔" },
        { status: 500 }
      );
    }
    
    const response = await getChatResponse(message, instructions, userName);
    console.log('API route sending response:', response?.substring(0, 100) + '...');
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        response: "Oops! Something went wrong with my brain. Try again? 🙃" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Please use POST method with a message parameter' },
    { status: 405 }
  );
} 