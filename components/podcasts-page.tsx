"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Headphones, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface Podcast {
  id: string
  title: string
  description: string
  duration: string
  thumbnailUrl: string
  audioUrl: string
  hostName: string
}

// Podcast data with original audio sources
const podcasts: Podcast[] = [
  {
    id: "1",
    title: "Needs and Wants",
    description: "Learn the difference between needs and wants and how to make smart spending decisions.",
    duration: "5:28",
    thumbnailUrl: "/placeholder.svg",
    audioUrl: "https://res.cloudinary.com/dwxsrko1g/video/upload/v1744868696/Financial_Literacy_Needs_and_Wants_1_aiht2v.mp3",
    hostName: "Money Mentor"
  },
  {
    id: "2",
    title: "Budget Basics",
    description: "Learn how to create and manage a budget to track your income and expenses.",
    duration: "5:30",
    thumbnailUrl: "/placeholder.svg",
    audioUrl: "https://res.cloudinary.com/dwxsrko1g/video/upload/v1744868572/Financial_Literacy_Budget_yfa8ml.mp3",
    hostName: "Money Mentor"
  },
  {
    id: "3",
    title: "Financial Literacy for Kids",
    description: "An introduction to important money concepts designed especially for children.",
    duration: "5:25",
    thumbnailUrl: "/placeholder.svg",
    audioUrl: "https://res.cloudinary.com/dwxsrko1g/video/upload/v1744868800/Financial_Literacy_for_Kids_1_v5dvfh.mp3",
    hostName: "Money Mentor"
  }
]

export function PodcastsPage() {
  const [activePodcast, setActivePodcast] = useState<Podcast | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isVolumeControlVisible, setIsVolumeControlVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Helper function to format time in MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);
  
  // Enable audio on mobile with touch
  useEffect(() => {
    const enableAudio = () => {
      const silentAudio = new Audio();
      silentAudio.play().catch(() => {});
      
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('click', enableAudio);
    };
    
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('click', enableAudio);
    
    return () => {
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('click', enableAudio);
    };
  }, []);
  
  const handlePlayPodcast = (podcast: Podcast) => {
    // Reset error state
    setErrorMessage(null);
    
    // If selecting the same podcast, toggle play/pause
    if (activePodcast?.id === podcast.id) {
      togglePlayPause();
      return;
    }
    
    // Clean up any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // If audio element exists, pause and clean up
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    
    try {
      setIsLoading(true);
      
      // Create new audio element for different podcast
      const audio = new Audio();
      
      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        setIsLoading(false);
      });
      
      audio.addEventListener('canplay', () => {
        setIsLoading(false);
        audio.play()
          .then(() => {
            setIsPlaying(true);
            // Start tracking progress
            progressIntervalRef.current = setInterval(() => {
              setCurrentTime(audio.currentTime);
            }, 1000);
          })
          .catch(err => {
            console.error("Error playing audio:", err);
            setErrorMessage("Couldn't play audio. Try again or tap the screen first.");
            setIsPlaying(false);
            setIsLoading(false);
          });
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      });
      
      // Handle stalled or waiting events
      audio.addEventListener('stalled', () => {
        setIsLoading(true);
      });
      
      audio.addEventListener('waiting', () => {
        setIsLoading(true);
      });
      
      audio.addEventListener('playing', () => {
        setIsLoading(false);
      });
      
      audio.addEventListener('error', (e) => {
        setIsLoading(false);
        // Hide error messages from users
        setErrorMessage(null);
        
        // Silently log the error but don't show to user
        const error = e.target as HTMLAudioElement;
        let errMsg = "Error loading audio";
        
        if (error.error) {
          switch(error.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errMsg = "Audio playback aborted";
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errMsg = "Network error. Check your connection";
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errMsg = "Audio format not supported";
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errMsg = "Audio format not supported";
              break;
          }
        }
        
        // Only log to console, don't show to user
        console.error("Audio error:", errMsg, error.error);
        setIsPlaying(false);
      });
      
      // Set source and volume
      audio.volume = volume;
      audio.src = podcast.audioUrl;
      audioRef.current = audio;
      setActivePodcast(podcast);
      setCurrentTime(0);
      setDuration(0);
      
    } catch (err) {
      console.error("Error setting up audio:", err);
      setErrorMessage("Couldn't set up audio player");
      setIsLoading(false);
    }
  };
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else {
      audioRef.current.play()
        .then(() => {
          // Start tracking progress
          progressIntervalRef.current = setInterval(() => {
            setCurrentTime(audioRef.current?.currentTime || 0);
          }, 1000);
        })
        .catch(err => console.error("Error playing audio:", err));
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    
    const newVolume = value[0];
    
    try {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    } catch (err) {
      console.error("Error setting volume:", err);
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    try {
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    } catch (err) {
      console.error("Error toggling mute:", err);
    }
  };
  
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Money Podcasts</h1>
        <p className="text-gray-600">Listen and learn about money the fun way!</p>
      </header>
      
      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <span className="mr-2">⚠️</span>
          <p>{errorMessage}</p>
          <button 
            className="ml-auto text-red-700 hover:text-red-900" 
            onClick={() => setErrorMessage(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Podcast Player - only shown when a podcast is selected */}
      {activePodcast && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex items-center p-4 border-b">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden mr-4 bg-blue-100 flex items-center justify-center">
              <Headphones className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{activePodcast.title}</h3>
              <p className="text-sm text-gray-600">Host: {activePodcast.hostName}</p>
            </div>
          </div>
          
          <div className="p-4">
            {/* Progress bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleProgressChange}
                className="my-2"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button 
                className="text-gray-500 hover:text-gray-700 p-2"
                onClick={() => {
                  if (audioRef.current && currentTime > 10) {
                    audioRef.current.currentTime = currentTime - 10;
                    setCurrentTime(audioRef.current.currentTime);
                  } else if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button 
                className={`${isPlaying ? 'bg-blue-600' : 'bg-blue-500'} text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                onClick={togglePlayPause}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              
              <button 
                className="text-gray-500 hover:text-gray-700 p-2"
                onClick={() => {
                  if (audioRef.current && currentTime < duration - 10) {
                    audioRef.current.currentTime = currentTime + 10;
                    setCurrentTime(audioRef.current.currentTime);
                  }
                }}
              >
                <SkipForward className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <button 
                  className="text-gray-500 hover:text-gray-700 p-2"
                  onClick={toggleMute}
                  onMouseEnter={() => setIsVolumeControlVisible(true)}
                  onTouchStart={() => setIsVolumeControlVisible(!isVolumeControlVisible)}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                
                {isVolumeControlVisible && (
                  <div 
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-white shadow-md rounded-md w-32"
                    onMouseEnter={() => setIsVolumeControlVisible(true)}
                    onMouseLeave={() => setIsVolumeControlVisible(false)}
                  >
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Podcast List */}
      <div className="space-y-4">
        {podcasts.map((podcast) => (
          <div 
            key={podcast.id}
            className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              activePodcast?.id === podcast.id ? 'border-2 border-blue-500' : ''
            }`}
            onClick={() => handlePlayPodcast(podcast)}
          >
            <div className="flex items-center p-4">
              <div className="relative h-14 w-14 rounded-lg overflow-hidden mr-4 flex-shrink-0 bg-blue-100 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-blue-500" />
                
                <div className={`absolute inset-0 flex items-center justify-center ${
                  activePodcast?.id === podcast.id && isPlaying 
                    ? 'bg-black bg-opacity-30' 
                    : 'bg-black bg-opacity-40'
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
