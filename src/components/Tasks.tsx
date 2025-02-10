"use client"

import React, { useState, useEffect } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export default function TaskForm({ activeTab }: { activeTab: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [showPersonDetails, setShowPersonDetails] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: 'Bounty Campaign 1',
    triggerText: '',
    campaignTemplate: "task",
    taskUrl: '',
    rewardAmount: '',
    taskType: '',
    noOfSamples: '',
  })

  const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
    }
  })

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId')
    if (!storedCompanyId) {
      setError('No company ID found. Please create a company first.')
      setTimeout(() => {
        router.push('/create-company')
      }, 2000)
      return
    }
    setCompanyId(storedCompanyId)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }


  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOpenPersonDetails = () => {
    setShowPersonDetails(true)
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 10 * 1024 * 1024) {
        setError('Video file size must be less than 10MB')
        return
      }
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file')
        return
      }
      setSelectedVideo(file)
      setError('')
    }
  }

  const uploadVideo = async () => {
    if (!selectedVideo) return null
    setIsUploading(true)
    setError('')

    try {
      console.log('Starting video upload...')

      if (!process.env.NEXT_PUBLIC_AWS_BUCKET_NAME) {
        throw new Error('AWS bucket name is not configured')
      }
      if (!process.env.NEXT_PUBLIC_AWS_REGION) {
        throw new Error('AWS region is not configured')
      }

      const fileName = `videos/${companyId}/${Date.now()}-${selectedVideo.name}`
      console.log('Uploading to:', fileName)

      const fileBuffer = await selectedVideo.arrayBuffer();
      const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(fileBuffer),
        ContentType: selectedVideo.type
      })

      console.log('Sending to S3...')
      await s3Client.send(command)
      console.log('Upload successful!')

      const videoUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`
      console.log('Video URL:', videoUrl)

      return videoUrl
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Failed to upload video: ${err.message}`)
      return null
    } finally {
      setIsUploading(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!companyId) {
      setError('Company ID is required. Please create a company first.')
      setIsLoading(false)
      return
    }

    const requiredFields = ['name']
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      let videoUrl = null
      if (selectedVideo) {
        videoUrl = await uploadVideo()
        if (!videoUrl) {
          setError('Failed to upload video')
          setIsLoading(false)
          return
        }
      }

      const payload = {
        ...formData,
        company: companyId,
        rewardAmount: parseFloat(formData.rewardAmount),
        taskUrl: videoUrl || formData.taskUrl
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create campaign')
      }

      const responseData = await response.json()
      console.log('Campaign created successfully:', responseData)

      setFormData({
        name: '',
        triggerText: '',
        campaignTemplate: "task",
        taskUrl: '',
        rewardAmount: '',
        taskType: '',
        noOfSamples: '',
      })

      router.push('/campaigns')
    } catch (err: any) {
      setError(err.message || "Failed to create campaign")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=" p-4">
      <div className="max-w-7xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black">
              Campaign Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter campaign name"
              required
              className="w-full  border-gray-700/10 text-black placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 bg-white">
              <Label htmlFor="campaignTemplate" className="text-black">
                Campaign Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.campaignTemplate}
                onValueChange={(value) => handleSelectChange('campaignTemplate', value)}
              >
                <SelectTrigger
                  id="campaignType"
                  className="w-full border-gray-700/10 bg-white text-black bg-white"
                >
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="award" className="text-black">Award</SelectItem>
                  <SelectItem value="digital_activation" className="text-black">Digital Activation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskType" className="text-black">
                Task Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.taskType}
                onValueChange={(value) => handleSelectChange('taskType', value)}
              >
                <SelectTrigger
                  id="campaignType"
                  className="w-full border-gray-700/10  text-black"
                >
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {/* <SelectItem value="award" className="text-black">Award</SelectItem>
                  <SelectItem value="digital_activation" className="text-black">Digital Activation</SelectItem> */}
                  <SelectItem value="social_media" className="text-black">Social Media</SelectItem>
                  <SelectItem value="video" className="text-black">Video</SelectItem>
                  <SelectItem value="location_sharing" className="text-black">Location Sharing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.campaignTemplate === 'award' && (
            <div className="space-y-2">
              <Label htmlFor="rewardAmount" className="text-black">
                Reward Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rewardAmount"
                type="number"
                name="rewardAmount"
                value={formData.rewardAmount}
                onChange={handleChange}
                placeholder="Enter reward amount"
                required
                className="w-full border-gray-700/10  text-black placeholder:text-gray-400"
              />
            </div>
          )}

          {formData.campaignTemplate === 'digital_activation' && (
            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-black">Total Number Of Samples</Label>
              <Input
                id="noOfSamples"
                type="number"
                name="noOfSamples"
                value={formData.noOfSamples}
                onChange={handleChange}
                placeholder="Enter total number of samples"
                className="w-full border-gray-700/10  text-black placeholder:text-gray-400"
              />
            </div>
          )}

          {formData.taskType === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="video" className="text-black">
                Upload Video <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full border-gray-700/10 text-black"
                />
                {isUploading && (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Maximum file size: 10MB. Supported formats: MP4, WebM
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="triggerText" className="text-black">
              Trigger Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="triggerText"
              name="triggerText"
              value={formData.triggerText}
              onChange={handleChange}
              placeholder="Enter message template"
              required
              className="w-full min-h-[80px] border-gray-700/10  text-black placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className='flex flex-col sm:flex-row gap-4 items-center'>
              <Alert variant="destructive" className="bg-red-900/50 border-red-800 flex-grow">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
              <Button className='bg-white text-black w-full sm:w-auto'>
                <Link href="/recharge">
                  Recharge
                </Link>
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2 px-4 rounded-lg"
            disabled={isLoading || !companyId}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating Campaign...</span>
              </div>
            ) : (
              'Create Campaign'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

