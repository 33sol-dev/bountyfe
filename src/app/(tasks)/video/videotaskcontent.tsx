"use client"

import React, { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Volume2, VolumeX, PlayCircle, PauseCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

const videos = [
  {
    id: 1,
    title: "Bounty Task",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
]

interface Campaign {
  campaignTemplate: "award" | "digital_activation"
  company: {
    phoneNumber: string;
    [key: string]: any;
  }
  createdAt: string
  description: string
  merchantRegistrationLink: string
  name: string
  publishPin: string
  status: string
  tags: string[]
  totalAmount: number
  updatedAt: string
  _id: string
  taskConfig: {
    taskType: string;
    taskUrl: string;
    triggerText: string;
  }
  triggerText: string
}

const VideoTask = () => {
  const searchParams = useSearchParams()
  const [campaignData, setCampaignData] = useState<Campaign | null>(null)
  const [currentVideo, setCurrentVideo] = useState(videos[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(true) // start muted for autoplay
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({ phoneNo: "" })
  const [merchantData, setMerchantData] = useState<any>(null)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  // Fetch merchant and campaign data (unchanged)
  useEffect(() => {
    const fetchMerchantData = async () => {
      const merchantId = searchParams.get('merchant')
      if (!merchantId) return
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/merchant/get-merchant/${merchantId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) throw new Error('Failed to fetch merchant data')
        const data = await response.json()
        setMerchantData(data.merchant)
      } catch (error) {
        console.error('Error fetching merchant data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMerchantData()
  }, [])

  useEffect(() => {
    const fetchCampaignData = async () => {
      const campaignId = searchParams.get('campaign')
      if (!campaignId) return
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) throw new Error('Failed to fetch campaign data')
        const data = await response.json()
        setCampaignData(data.campaign)
      } catch (error) {
        console.error('Error fetching campaign data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCampaignData()
  }, [searchParams])

  // Set up event listeners for video time and metadata
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100
      setProgress(progress)
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
    }
  }, [])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVideoEnd = async () => {
    setIsPlaying(false)
    if (!campaignData) return
    setShowTaskDialog(true)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Toggle mute and update both state and video element
  const toggleMute = () => {
    if (!videoRef.current) return
    const newMuted = !isMuted
    videoRef.current.muted = newMuted
    setIsMuted(newMuted)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const percentageClicked = (clickPosition / progressBar.offsetWidth) * 100
    const newTime = (percentageClicked / 100) * videoRef.current.duration
    videoRef.current.currentTime = newTime
    setProgress(percentageClicked)
  }

  useEffect(() => {
    if (videoRef.current && campaignData && campaignData.taskConfig?.taskUrl) {
      // Autoplay will work if video is muted; hence we start muted
      videoRef.current.play().catch(error => {
        console.log("Autoplay failed:", error)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }, [campaignData])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-lg rounded-lg">
        <CardContent className="p-0">
          {/* Video Container without forcing aspect ratio */}
          <div className="relative w-full bg-black rounded-t-lg overflow-hidden">
            {campaignData && campaignData.taskConfig?.taskUrl && (
              <video
                ref={videoRef}
                className="w-full h-auto object-contain"
                src={campaignData.taskConfig.taskUrl}
                onEnded={handleVideoEnd}
                autoPlay
                // Keep muted for autoplay; allow user to unmute via button
              />
            )}

            {/* Overlay Controls */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {/* Top Gradient Overlay */}
              <div className="p-4 bg-gradient-to-b from-black/80 to-transparent">
                <h3 className="text-white text-lg font-medium">{currentVideo.title}</h3>
              </div>

              {/* Center Play/Pause Button */}
              <div className="flex-grow flex items-center justify-center">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 transition-transform duration-300"
                  onClick={togglePlay}
                >
                  {isPlaying ? <PauseCircle className="h-10 w-10 text-white" /> : <PlayCircle className="h-10 w-10 text-white" />}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>

                  <div className="text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex-1 flex items-center" onClick={handleProgressClick}>
                  <Progress value={progress} className="w-full h-2 bg-gray-600 rounded cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800">{currentVideo.title}</h3>
            <p className="text-sm text-gray-500">Video progress: {Math.floor(progress)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs for Reward Claiming (unchanged) */}
      {campaignData?.campaignTemplate === 'award' && (
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="bg-white text-black max-w-lg w-full p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold">Congratulations! 🎉</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="text-lg">You are eligible for the reward!</p>
              <p className="text-gray-600">Click below to claim your reward.</p>
              {formError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <Link href={`https://wa.me/${campaignData.company.phoneNumber}?text=${encodeURIComponent(`${campaignData.taskConfig.triggerText}-${merchantData?.merchantCode}`)}`}>
                <Button className="w-full bg-green-600 hover:bg-green-700 py-4" disabled={false}>
                  Claim Your Reward
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={() => setShowTaskDialog(false)}>
                Maybe Later
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showSuccessDialog && (
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="bg-white text-black max-w-lg w-full p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-semibold">Success! 🎉</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              <p className="text-lg">Your submission has been processed successfully!</p>
              <p className="text-gray-600">Thank you for participating.</p>
            </div>
            <div className="mt-6 flex justify-center">
              <Button className="w-32 bg-green-600 hover:bg-green-700" onClick={() => setShowSuccessDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default VideoTask
