"use client"

import React, { Suspense } from "react"
import VideoTaskContent from "./videotaskcontent"

const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg p-4">
      <div className="animate-pulse">
        <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
)

const VideoTask = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VideoTaskContent />
    </Suspense>
  )
}

export default VideoTask