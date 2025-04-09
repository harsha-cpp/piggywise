"use client"

import { Headphones, Play } from "lucide-react"

export function PodcastsPage() {
  const podcasts = [
    {
      id: 1,
      title: "Money Basics for Kids",
      duration: "5:30",
      description: "Learn the basics of money in a fun way!",
    },
    {
      id: 2,
      title: "Saving for Your Dreams",
      duration: "4:45",
      description: "How to save money for things you want",
    },
    {
      id: 3,
      title: "What is a Bank?",
      duration: "6:15",
      description: "Understanding what banks do and how they help us",
    },
  ]

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Podcasts</h1>
        <p className="text-gray-600">Listen and learn about money!</p>
      </header>

      <div className="bg-purple-100 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-purple-200 p-3 rounded-full">
            <Headphones className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold">Money Stories</h2>
            <p className="text-sm text-gray-600">Fun stories about money concepts</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {podcasts.map((podcast) => (
          <div key={podcast.id} className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{podcast.title}</h3>
                <p className="text-sm text-gray-600">{podcast.description}</p>
                <p className="text-xs text-gray-500 mt-1">{podcast.duration}</p>
              </div>
              <button className="bg-green-100 p-2 rounded-full">
                <Play className="h-5 w-5 text-green-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
