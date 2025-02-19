"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, PlayCircle, PauseCircle, Volume2, Volume1, VolumeX } from "lucide-react"
import Link from "next/link"

const videos = [
  {
    id: 1,
    title: "Video Task",
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
  const [completedVideos, setCompletedVideos] = useState<number[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    phoneNo: "",
  })
  const [ merchantData, setMerchantData ] = useState<any>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

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
        console.log(data)
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
        console.log(data)
        setCampaignData(data.campaign)

        if (data.campaign.taskConfig?.taskUrl) {
          setVideoUrl(data.campaign.taskConfig.taskUrl)
        }
      } catch (error) {
        console.error('Error fetching campaign data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaignData()
  }, [searchParams])

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
  }, [videoUrl])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVideoEnd = async () => {
    setIsPlaying(false)

    if (!campaignData) return
    if (campaignData.campaignTemplate === 'award') {
      setShowTaskDialog(true)
      setShowCompletionForm(false)
    } else if (campaignData.campaignTemplate === 'digital_activation') {
      setShowTaskDialog(false)
      setShowCompletionForm(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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

  const toggleVolume = () => {
    if (!videoRef.current) return

    const newVolume = volume === 0 ? 1 : 0
    videoRef.current.volume = newVolume
    setVolume(newVolume)
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

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden group">
            {videoUrl && (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={videoUrl}
                onEnded={handleVideoEnd}
              />
            )}

            {/* Title Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-white text-lg font-medium">{currentVideo.title}</h3>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="ghost"
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300"
                onClick={togglePlay}
              >
                {isPlaying ?
                  <PauseCircle className="h-10 w-10 text-white" /> :
                  <PlayCircle className="h-10 w-10 text-white" />
                }
              </Button>
            </div>

            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Progress Bar */}
              <div className="px-4 py-2">
                <div className="relative">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-white text-xs">
                    {formatTime(currentTime)}
                  </div>
                  <div
                    className="w-full cursor-pointer relative h-1 group/progress"
                    onClick={handleProgressClick}
                  >
                    <Progress
                      value={progress}
                      className="h-1 bg-gray-600 group-hover/progress:h-2 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-6">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-white/10 transition-colors"
                    onClick={togglePlay}
                  >
                    {isPlaying ?
                      <PauseCircle className="h-6 w-6" /> :
                      <PlayCircle className="h-6 w-6" />
                    }
                  </Button>

                  <div className="flex items-center gap-2 group/volume">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-white/10 transition-colors relative"
                      onClick={toggleVolume}
                    >
                      {volume === 0 ? (
                        <VolumeX className="h-6 w-6" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="h-6 w-6" />
                      ) : (
                        <Volume2 className="h-6 w-6" />
                      )}
                    </Button>

                    <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
                      <Progress
                        value={volume * 100}
                        className="h-1 cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const percentage = x / rect.width;
                          if (videoRef.current) {
                            videoRef.current.volume = Math.max(0, Math.min(1, percentage));
                            setVolume(Math.max(0, Math.min(1, percentage)));
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {completedVideos.includes(currentVideo.id) && (
                    <span className="text-green-400 text-sm flex items-center gap-1 bg-green-400/10 px-3 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Completed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center text-black">
              <h3 className="text-xl font-semibold">{currentVideo.title}</h3>
              <div className="text-sm text-gray-400">
                {completedVideos.length} / {videos.length} Videos Completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {campaignData?.campaignTemplate === 'award' && (
        <Dialog
          open={showTaskDialog}
          onOpenChange={setShowTaskDialog}
        >
          <DialogContent className="bg-white text-black border border-gray-200 max-w-lg w-full mx-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-center">
                Congratulations! 🎉
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-center py-4">
              <p className="text-lg">You are eligible for the free coupans!</p>
              <p className="text-gray-600">Click the button below to claim your reward</p>

              {formError && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4">
            <Link href={`https://wa.me/${campaignData.company.phoneNumber}?text=${campaignData.triggerText}-${merchantData?.merchantCode?.code}`}>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Claim Your Reward"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowTaskDialog(false)}
              >
                Maybe Later
              </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {campaignData?.campaignTemplate === 'digital_activation' && (
        <Dialog
          open={showTaskDialog}
          onOpenChange={setShowTaskDialog}
        >
          <DialogContent className="bg-white text-black border border-gray-200 max-w-lg w-full mx-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-center">
                Congratulations! 🎉
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-center py-4">
              <p className="text-lg">You are eligible for the free sample!</p>
              <p className="text-gray-600">Click the button below to claim your reward</p>

              {formError && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-4">
            <Link href={`https://wa.me/${campaignData.company.phoneNumber}?text=${campaignData.triggerText}-${merchantData?.merchantCode?.code}`}>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Claim Your Reward"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowTaskDialog(false)}
              >
                Maybe Later
              </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      >
        <DialogContent className="bg-white text-black border border-gray-200 max-w-lg w-full mx-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-center">
              Success! 🎉
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-center py-4">
            <p className="text-lg">Your submission has been processed successfully!</p>
            <p className="text-gray-600">Thank you for participating.</p>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              className="w-32 bg-green-600 hover:bg-green-700"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VideoTask
