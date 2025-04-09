"use client"

import { useState, useRef, useEffect } from 'react'
import { SendHorizontal, X, MessageCircle, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface Message {
  text: string
  sender: 'user' | 'bot'
  timestamp: number
}

export function KidChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hey there! I'm PiggyWise AI, ready to help with money questions. What would you like to know? 💰", sender: 'bot', timestamp: Date.now() }
  ])
  const [loading, setLoading] = useState(false)
  const [showPredefinedQuestions, setShowPredefinedQuestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Reset messages when chat is closed
  const handleClose = () => {
    setOpen(false)
    // Reset messages to initial state after closing
    setTimeout(() => {
      setMessages([
        { text: "Hey there! I'm PiggyWise AI, ready to help with money questions. What would you like to know? 💰", sender: 'bot', timestamp: Date.now() }
      ])
      setInput('')
      setShowPredefinedQuestions(true)
    }, 300) // Small delay to ensure animation completes first
  }

  // Initialize messages from local storage or default
  useEffect(() => {
    // If chat is closed, always reset to initial state
    if (!open) {
      setMessages([
        { text: "Hey there! I'm PiggyWise AI, ready to help with money questions. What would you like to know? 💰", sender: 'bot', timestamp: Date.now() }
      ])
      setShowPredefinedQuestions(true)
    }
  }, [open])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Function to navigate to modules page
  const goToModulesPage = () => {
    // Close the chatbot and redirect
    handleClose()
    window.location.href = '/dashboard/child/browse-modules'
  }

  // Handle predefined question
  const handlePredefinedQuestion = (question: string, action?: () => void) => {
    // Add user message
    const userMessage = { text: question, sender: 'user' as const, timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    
    // Hide predefined questions after selection
    setShowPredefinedQuestions(false)
    
    if (action) {
      // For questions with navigation actions
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: "I'll show you right away! Let me take you to the modules page. 🚀", sender: 'bot', timestamp: Date.now() }
        ])
        
        // Execute the action after a short delay to show the response
        setTimeout(action, 1000)
      }, 500)
    } else {
      // Process with API for regular questions but don't add user message again
      setLoading(true)
      
      try {
        // Call Gemini API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: question, 
            instructions: "Provide a kid-friendly answer but don't start every response with 'Hey Kiddo!' - vary your greetings or skip greetings entirely when answering follow-up questions."
          }),
          signal: controller.signal
        })
        .then(response => {
          clearTimeout(timeoutId);
          return response.json();
        })
        .then(data => {
          if (!data) {
            throw new Error('Empty response');
          }
          
          // Add bot response to chat or fallback message
          const botMessage = data.response || "Hmm, I'm having trouble thinking right now. Can we try again? 🤔";
          
          setMessages(prev => [
            ...prev, 
            { text: botMessage, sender: 'bot', timestamp: Date.now() }
          ]);
        })
        .catch(error => {
          console.error('Chat error:', error);
          
          // Handle different error types
          let errorMessage = "Oops! My brain got scrambled. Can you try again? 🙃";
          
          if (error instanceof DOMException && error.name === 'AbortError') {
            errorMessage = "Hmm, I'm taking too long to think. Can we try a simpler question? ⏱️";
          } else if (error instanceof Error) {
            console.error('Error details:', error.message);
            if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = "I can't connect to my brain right now. Are you online? 📶";
            }
          }
          
          setMessages(prev => [
            ...prev,
            { text: errorMessage, sender: 'bot', timestamp: Date.now() }
          ]);
        })
        .finally(() => {
          setLoading(false);
        });
      } catch (error) {
        console.error('Failed to start API request:', error);
        setLoading(false);
        setMessages(prev => [
          ...prev,
          { text: "Something went wrong. Could you try again?", sender: 'bot', timestamp: Date.now() }
        ]);
      }
    }
  }

  // Handle sending messages
  const handleSend = async (message: string) => {
    if (!message.trim()) return
    
    // Add user message to chat
    const userMessage = { text: message, sender: 'user' as const, timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Check if it's a simple greeting
    const simpleGreeting = /^(hi+|hey+|hello|hii+|heyy+|yo+|sup|hi there|hey there|hello there|howdy|what'?s up|hola|greetings|wave|👋)[\s!.?]*$/i.test(message.trim())
    
    if (simpleGreeting) {
      // Respond with a simple greeting without calling API
      const greetings = [
        "Hey there! 👋",
        "Hi! What's up?",
        "Hello! 😊",
        "Hi friend! Ready to talk about money?",
        "Hi there!",
        "Hey! How's it going?",
        "Hello! Ready to chat?",
        "👋 Hi!",
        "Hey! 😃",
        "Hi! Got any money questions today?",
        "Hello! What would you like to know?",
        "Hi! I'm here to help!",
        "Hey! What shall we talk about?"
      ]
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: randomGreeting, sender: 'bot', timestamp: Date.now() }
        ])
      }, 500)
      return
    }
    
    setLoading(true)
    
    try {
      // Call Gemini API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message, 
          instructions: "Provide a kid-friendly answer but don't start every response with 'Hey Kiddo!' - vary your greetings or skip greetings entirely when answering follow-up questions."
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error:', data.error);
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Add bot response to chat or fallback message
      const botMessage = data.response || "Hmm, I'm having trouble thinking right now. Can we try again? 🤔";
      
      setMessages(prev => [
        ...prev, 
        { text: botMessage, sender: 'bot', timestamp: Date.now() }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Handle different error types
      let errorMessage = "Oops! My brain got scrambled. Can you try again? 🙃";
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = "Hmm, I'm taking too long to think. Can we try a simpler question? ⏱️";
      } else if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "I can't connect to my brain right now. Are you online? 📶";
        }
      }
      
      setMessages(prev => [
        ...prev,
        { text: errorMessage, sender: 'bot', timestamp: Date.now() }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }
  
  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-white border-opacity-15 shadow-lg flex items-center justify-center hover:bg-opacity-30 active:scale-95 active:shadow-md transition-all duration-200"
        aria-label="Open PiggyWise AI"
      >
        <span className="text-3xl" role="img" aria-label="Pig">🐷</span>
      </button>
      
      {/* Chat window */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md h-[500px] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 flex flex-col">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label="Pig face">🐷</span>
                  <h3 className="font-bold text-white text-lg">PiggyWise AI</h3>
                </div>
                <button 
                  onClick={() => handleClose()}
                  className="text-white hover:bg-white/10 rounded-full p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Powered by Google Gemini */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <p className="text-xs text-white/80">Powered by</p>
                <div className="flex items-center">
                  <Image 
                    src="/geminitext.png" 
                    alt="Gemini" 
                    width={70} 
                    height={20}
                    className="h-[18px] w-auto relative top-[-4px]"
                  />
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div 
                    key={message.timestamp + i}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                          : 'bg-white border border-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Predefined Questions - show only before first user message */}
                {showPredefinedQuestions && messages.length === 1 && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 mb-2">Try asking:</p>
                    <div className="space-y-2">
                      <button 
                        className="w-full bg-white hover:bg-gray-50 text-left text-sm py-2 px-3 rounded-lg border border-gray-200 shadow-sm transition-colors"
                        onClick={() => handlePredefinedQuestion("Where can I learn modules?", goToModulesPage)}
                      >
                        Where can I learn modules? 📚
                      </button>
                      <button 
                        className="w-full bg-white hover:bg-gray-50 text-left text-sm py-2 px-3 rounded-lg border border-gray-200 shadow-sm transition-colors"
                        onClick={() => handlePredefinedQuestion("What is saving?")}
                      >
                        What is saving? 💰
                      </button>
                      <button 
                        className="w-full bg-white hover:bg-gray-50 text-left text-sm py-2 px-3 rounded-lg border border-gray-200 shadow-sm transition-colors"
                        onClick={() => handlePredefinedQuestion("How do I earn money as a kid?")}
                      >
                        How do I earn money as a kid? 💵
                      </button>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me about money stuff..."
                  className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-slate-200"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={loading || !input.trim()}
                  className="bg-indigo-600 text-white p-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <SendHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 