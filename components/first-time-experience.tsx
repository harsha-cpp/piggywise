"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface FirstTimeExperienceProps {
  onComplete: () => void
}

export function FirstTimeExperience({ onComplete }: FirstTimeExperienceProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  const questions = [
    {
      question: "What would you do with $10?",
      options: [
        { label: "Save it all", value: "saver", emoji: "🐉" },
        { label: "Buy something fun", value: "spender", emoji: "🦊" },
        { label: "Share with friends", value: "sharer", emoji: "🐻" },
        { label: "Invest it", value: "investor", emoji: "🦉" },
      ],
    },
    {
      question: "What's your favorite activity?",
      options: [
        { label: "Playing games", value: "fun", emoji: "🎮" },
        { label: "Learning new things", value: "curious", emoji: "📚" },
        { label: "Making things", value: "creative", emoji: "🎨" },
        { label: "Helping others", value: "helper", emoji: "🤝" },
      ],
    },
    {
      question: "What's your dream?",
      options: [
        { label: "Be super rich", value: "ambitious", emoji: "💰" },
        { label: "Travel the world", value: "adventurer", emoji: "✈️" },
        { label: "Help people", value: "compassionate", emoji: "❤️" },
        { label: "Invent something cool", value: "innovator", emoji: "💡" },
      ],
    },
  ]

  const handleAnswer = (answer: string) => {
    setIsTransitioning(true)
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1)
      } else {
        // Quiz completed, determine character
        setTimeout(() => {
          onComplete()
        }, 1000)
      }
      setIsTransitioning(false)
    }, 300)
  }

  const getCharacterResult = () => {
    // This would be more sophisticated in a real app
    return {
      character: "Saver Dragon",
      description: "You're great at saving money for the future!",
      emoji: "🐉",
    }
  }

  const result = getCharacterResult()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-purple-100 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {step < questions.length ? (
            <div
              className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
            >
              <h1 className="text-2xl font-bold text-center mb-6 text-indigo-800">
                Let's Find Your Money Character!
              </h1>

              <div className="mb-8 text-center">
                <span className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm font-semibold">
                  Question {step + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-xl font-bold mb-6 text-center">{questions[step].question}</h2>

              <div className="grid grid-cols-1 gap-3">
                {questions[step].options.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="h-auto py-4 justify-start text-left"
                    onClick={() => handleAnswer(option.value)}
                  >
                    <span className="text-2xl mr-3">{option.emoji}</span>
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="text-center transition-all duration-500 transform opacity-100 scale-100"
            >
              <div className="mb-6">
                <div
                  className="mx-auto bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full w-32 h-32 flex items-center justify-center animate-spin-slow"
                >
                  <span className="text-5xl">{result.emoji}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-indigo-800">You're a {result.character}!</h2>

              <p className="text-gray-600 mb-6">{result.description}</p>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                onClick={onComplete}
              >
                Start My Adventure!
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
