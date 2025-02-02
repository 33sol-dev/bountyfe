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

const videos = [
  {
    id: 1,
    title: "Big Buck Bunny",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
]

interface Campaign {
  campaignTemplate: "task" | "sample"
  company: string
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
}

const VideoTask = () => {
  const searchParams = useSearchParams()
  const [campaignData, setCampaignData] = useState<Campaign | null>(null)
  const [currentVideo, setCurrentVideo] = useState(videos[Math.floor(Math.random() * videos.length)])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [completedVideos, setCompletedVideos] = useState<number[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const [formData, setFormData] = useState({
    phoneNo: "",
  })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate)
      video.addEventListener("loadedmetadata", () => setDuration(video.duration))
      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("loadedmetadata", () => {})
      }
    }
  }, [currentVideo])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleFormSubmit = async () => {
    try {
      setIsSubmitting(true)
      setFormError("")

      const campaignId = searchParams.get('campaign')
      const merchantId = searchParams.get('merchant')

      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/code/complete-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNo: formData.phoneNo,
          videoId: currentVideo.id,
          completedAt: new Date().toISOString(),
          watchDuration: videoRef.current?.duration || 0,
          campaignId,
          merchantId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error("Failed to submit completion details")
      }

      setCompletedVideos((prev) => [...prev, currentVideo.id])
      setShowCompletionForm(false)
      setShowSuccessDialog(true)

      if (completedVideos.length + 1 === videos.length) {
        return
      }
      selectRandomVideo()
    } catch (error) {
      setFormError("Failed to submit completion details. Please try again.")
      console.error("Error submitting completion:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleVideoEnd = async () => {
    console.log("Video ended - starting handleVideoEnd function")  // Debug log
    
    setIsPlaying(false)
    const campaignId = searchParams.get('campaign')  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch campaign data')
      
      const data = await response.json()
      const campaignData = data.campaign
      console.log('Extracted campaign data:', campaignData) 
      setCampaignData(campaignData)
      console.log('Campaign data set to state') 
      console.log('Campaign template type:', data.campaignTemplate)  

      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (campaignData.campaignTemplate === 'task') {
          setShowTaskDialog(true)
        } else if (campaignData.campaignTemplate === 'sample') {
          setShowCompletionForm(true)
        } else {
          console.log('Unknown campaign template:', campaignData.campaignTemplate)  
        }
      } catch (dialogError) {
        console.error('Error showing dialog:', dialogError)  // Debug log
      }
      
    } catch (error) {
      console.error('Error in handleVideoEnd:', error)  // Debug log
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleVolume = () => {
    if (videoRef.current) {
      const newVolume = volume === 0 ? 1 : 0
      videoRef.current.volume = newVolume
      setVolume(newVolume)
    }
  }

  const selectRandomVideo = () => {
    const unwatchedVideos = videos.filter((video) => !completedVideos.includes(video.id))
    if (unwatchedVideos.length === 0) {
      setCompletedVideos([])
      setCurrentVideo(videos[Math.floor(Math.random() * videos.length)])
    } else {
      const randomVideo = unwatchedVideos[Math.floor(Math.random() * unwatchedVideos.length)]
      setCurrentVideo(randomVideo)
    }
    setProgress(0)
    setIsPlaying(false)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const percentageClicked = (clickPosition / progressBar.offsetWidth) * 100
    if (videoRef.current) {
      const newTime = (percentageClicked / 100) * videoRef.current.duration
      videoRef.current.currentTime = newTime
      setProgress(percentageClicked)
    }
  }

  const allVideosCompleted = completedVideos.length === videos.length

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={currentVideo.url}
              onEnded={handleVideoEnd}
            />

            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <div className="px-4 cursor-pointer" onClick={handleProgressClick}>
                <Progress value={progress} className="h-1 bg-gray-600" />
              </div>

              <div className="p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <Button size="icon" variant="ghost" className="hover:bg-white/10" onClick={togglePlay}>
                    {isPlaying ? <PauseCircle className="h-6 w-6" /> : <PlayCircle className="h-6 w-6" />}
                  </Button>

                  <Button size="icon" variant="ghost" className="hover:bg-white/10" onClick={toggleVolume}>
                    {volume === 0 ? (
                      <VolumeX className="h-6 w-6" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </Button>

                  <div className="text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {completedVideos.includes(currentVideo.id) && (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Completed
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

            {allVideosCompleted && (
              <Alert className="bg-green-900/50 border-green-500 text-green-300">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>Congratulations! You have completed all videos.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={showTaskDialog} 
        onOpenChange={(open) => {
          console.log('Task Dialog state changing to:', open)
          setShowTaskDialog(open)
        }}
      >
        <DialogContent className="bg-white text-black border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Task Completion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Campaign Template: {campaignData?.campaignTemplate}</p>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowTaskDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sample Campaign Dialog (Phone Number Form) */}
      <Dialog 
        open={showCompletionForm} 
        onOpenChange={(open) => {
          console.log('Completion Form Dialog state changing to:', open)
          setShowCompletionForm(open)
        }}
      >
        <DialogContent className="bg-white text-black border border-gray-200 max-w-lg w-full mx-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold">Complete the Form</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNo" className="block text-sm font-medium mb-1">
                Phone Number
              </Label>
              <Input
                id="phoneNo"
                name="phoneNo"
                type="text"
                placeholder="Enter your phone number"
                className="w-full"
                value={formData.phoneNo}
                onChange={handleInputChange}
              />
            </div>

            {formError && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowCompletionForm(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VideoTask