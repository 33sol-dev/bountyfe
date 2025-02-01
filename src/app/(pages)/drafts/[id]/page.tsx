"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle2, Download, Lock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import JSZip from "jszip"
import qrcode from "qrcode"
import { saveAs } from "file-saver"

interface Campaign {
  name: string
  publishPin: string
  reward_type: string
  zipUrl: string
  template: string
  _id: string
}

interface QRCodeData {
  code: string
  url: string
  merchantId?: string
}

export default function PayoutPage() {
  const router = useRouter()
  const { id } = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [payoutPin, setPayoutPin] = useState("")
  const [isPinCorrect, setIsPinCorrect] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/sign-in")
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setCampaign({
          ...data.campaign,
          template: data.campaign.campaignTemplate,
        })
      } catch (err: any) {
        console.error("Fetch campaign error:", err)
        setError(err.message || "An error occurred while fetching the campaign")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCampaign()
    }
  }, [id, router])

  const getTaskCampaignQrs = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/sign-in")
        return
      }

      // For task campaigns, fetch merchant data
      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${id}/merchants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch merchant data")
      }

      const data = await response.json()
      const zip = new JSZip()

      // Generate QR codes for each merchant
      const qrPromises = data.merchants.map(async (merchant: any) => {
        const qrUrl = `${process.env.NEXT_PUBLIC_BOUNTY_URL}/qr?campaign=${id}&merchant=${merchant._id}`
        const qrDataUrl = await qrcode.toDataURL(qrUrl)
        
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
        zip.file(`merchant_${merchant._id}.png`, base64Data, { base64: true })
      })

      await Promise.all(qrPromises)
      const zipBlob = await zip.generateAsync({ type: "blob" })
      saveAs(zipBlob, `${campaign?.name || 'task_campaign'}_merchant_qrs.zip`)

    } catch (err) {
      console.error('Error generating task QR codes:', err)
      throw err
    }
  }

  const getProductCampaignQrs = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/sign-in")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/code/get-campaign-codes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId: id }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch campaign QRs")
      }

      const data = await response.json()
      const zip = new JSZip()

      const qrPromises = data.codes.map(async (codeObj: QRCodeData) => {
        const qrDataUrl = await qrcode.toDataURL(codeObj.url, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 400
        })
        
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
        zip.file(`${codeObj.code}.png`, base64Data, { base64: true })
      })

      await Promise.all(qrPromises)
      const zipBlob = await zip.generateAsync({ type: "blob" })
      saveAs(zipBlob, `${campaign?.name || 'product_campaign'}_qrcodes.zip`)

    } catch (err) {
      console.error('Error generating product QR codes:', err)
      throw err
    }
  }

  const getCampaignQrs = async () => {
    try {
      if (!campaign) return

      switch (campaign.template) {
        case 'task':
          await getTaskCampaignQrs()
          break
        case 'product':
        case 'sampleGiveAway':
          await getProductCampaignQrs()
          break
        default:
          throw new Error(`Unsupported campaign template: ${campaign.template}`)
      }
    } catch (err) {
      console.error('Error in getCampaignQrs:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while generating QR codes')
    }
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (campaign && payoutPin === campaign.publishPin) {
        setIsPinCorrect(true)
      } else {
        setError("Incorrect payout pin. Please try again.")
      }
    } catch (err) {
      setError("An error occurred while verifying the pin")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/sign-in")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${id}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: payoutPin }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Publishing failed with status: ${response.status}`)
      }

      await response.json()
      await getCampaignQrs()
    } catch (err: any) {
      console.error("Publish error:", err)
      setError(err.message || "An error occurred while publishing the campaign")
    } finally {
      setIsPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg text-gray-600">Loading payout details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-medium tracking-tight text-black">Campaign Payout Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            Campaign Type: {campaign.template.charAt(0).toUpperCase() + campaign.template.slice(1)}
          </p>
        </div>

        <Card className="bg-white border-gray-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-black">{isPinCorrect ? "Publish Campaign Files" : "Enter Payout Pin"}</CardTitle>
            <CardDescription className="text-gray-600">
              {isPinCorrect
                ? "Click publish to generate and download your campaign files"
                : "Please enter the payout pin to access campaign files"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isPinCorrect ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="text-black font-medium mb-2">Payout Pin: {campaign.publishPin}</div>
                  <div className="relative">
                    <Input
                      id="payoutPin"
                      type="password"
                      value={payoutPin}
                      onChange={(e) => setPayoutPin(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-black placeholder-gray-400"
                      placeholder="Enter your pin"
                      required
                    />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Pin"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <Alert className="bg-green-100 border-green-400">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-700">Success!</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Your payout pin has been verified successfully.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handlePublish}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing and Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Campaign Files
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}