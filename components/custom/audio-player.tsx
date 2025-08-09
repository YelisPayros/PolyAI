'use client'

import { useState, useRef, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PauseIcon, PlayIcon } from './icons'

interface AudioPlayerProps {
  audioUrl?: string
  isLoading?: boolean
}

export const AudioPlayer = ({ audioUrl, isLoading }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const restart = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    audio.play()
    setIsPlaying(true)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-max">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Generating audio...</span>
      </div>
    )
  }

  if (!audioUrl) {
    return null
  }

  return (
    <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-max">
      <audio ref={audioRef} src={audioUrl} className="hidden" />

      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        className="h-7 w-7 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={restart}
        className="h-7 w-7 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 mx-2">
        <span>{formatTime(currentTime)}</span>
        <div className="h-1 w-24 bg-zinc-300 dark:bg-zinc-600 rounded-full">
          <div
            className="h-1 bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-100"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
