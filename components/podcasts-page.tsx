"use client"

import { useState } from "react"
import Image from "next/image"
import { Headphones, Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react"

interface Podcast {
  id: string
  title: string
  description: string
  duration: string
  thumbnailUrl: string
  audioUrl: string
  hostName: string
}

// Sample podcast data
const samplePodcasts: Podcast[] = [
  {
    id: "1",
    title: "Money Basics for Kids",
    description: "Learn the basics of money, saving, and spending in this fun intro podcast!",
    duration: "8:25",
    thumbnailUrl: "/placeholder.svg",
    audioUrl: "https://piggywise-wasabi.s3.wasabisys.com/podcasts/money-basics.mp3",
    hostName: "Mrs. Penny"
  },
  {
    id: "2",
    title: "Saving for your Dreams",
    description: "Find out how saving a little now can help you buy big things later!",
    duration: "10:15",
    thumbnailUrl: "/placeholder.svg",
    audioUrl: "https://piggywise-wasabi.s3.wasabisys.com/podcasts/saving-dreams.mp3",
    hostName: "Mr. Dollar"
  },
  {
    id: "3",
    title: "What is Credit?",
    description: "A simple explanation of credit scores and why they matter for your future.",
    duration: "7:45",
    thumbnailUrl: "/placeholder.svg",
    audioUrl: "https://piggywise-wasabi.s3.wasabisys.com/podcasts/credit-explained.mp3",
    hostName: "Mrs. Penny"
  }
]

export function PodcastsPage() {
  const [activePodcast, setActivePodcast] = useState<Podcast | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  
  const handlePlayPodcast = (podcast: Podcast) => {
    // If selecting the same podcast, toggle play/pause
    if (activePodcast?.id === podcast.id) {
      if (isPlaying) {
        audioElement?.pause()
      } else {
        audioElement?.play()
      }
      setIsPlaying(!isPlaying)
      return
    }
    
    // If audio element exists, pause and clean up
    if (audioElement) {
      audioElement.pause()
      audioElement.src = ""
    }
    
    // Create new audio element for different podcast
    const audio = new Audio(podcast.audioUrl)
    setAudioElement(audio)
    setActivePodcast(podcast)
    
    // Play when loaded
    audio.addEventListener('canplaythrough', () => {
      audio.play()
      setIsPlaying(true)
    })
    
    // Handle end of podcast
    audio.addEventListener('ended', () => {
      setIsPlaying(false)
    })
  }
  
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Money Podcasts</h1>
        <p className="text-gray-600">Listen and learn about money the fun way!</p>
      </header>
      
      {/* Podcast Player - only shown when a podcast is selected */}
      {activePodcast && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex items-center p-4 border-b">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden mr-4">
              <Image 
                src={activePodcast.thumbnailUrl}
                alt={activePodcast.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{activePodcast.title}</h3>
              <p className="text-sm text-gray-600">Host: {activePodcast.hostName}</p>
            </div>
          </div>
          
          <div className="p-4 flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button 
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700"
              onClick={() => {
                if (isPlaying) {
                  audioElement?.pause()
                } else {
                  audioElement?.play()
                }
                setIsPlaying(!isPlaying)
              }}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>
            
            <button className="text-gray-500 hover:text-gray-700">
              <SkipForward className="h-5 w-5" />
            </button>
            
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-1/3"></div>
            </div>
            
            <span className="text-sm text-gray-600">{activePodcast.duration}</span>
            
            <button className="text-gray-500 hover:text-gray-700">
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {/* Podcast List */}
      <div className="space-y-4">
        {samplePodcasts.map((podcast) => (
          <div 
            key={podcast.id}
            className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all ${
              activePodcast?.id === podcast.id ? 'border-2 border-blue-500' : ''
            }`}
            onClick={() => handlePlayPodcast(podcast)}
          >
            <div className="flex items-center p-4">
              <div className="relative h-14 w-14 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                <Image 
                  src={podcast.thumbnailUrl}
                  alt={podcast.title}
                  fill
                  className="object-cover"
                />
                
                <div className={`absolute inset-0 flex items-center justify-center ${
                  activePodcast?.id === podcast.id && isPlaying 
                    ? 'bg-black bg-opacity-30' 
                    : 'bg-black bg-opacity-50'
                }`}>
                  {activePodcast?.id === podcast.id && isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{podcast.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{podcast.description}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span>{podcast.hostName}</span>
                  <span className="mx-1">•</span>
                  <span>{podcast.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
