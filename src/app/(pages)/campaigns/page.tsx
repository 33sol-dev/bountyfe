"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, Plus, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import qrcode from "qrcode"

interface CampaignCardProps {
  campaign: Campaign
  companyId?: string
}

interface Campaign {
  id: string
  name: string
  description: string
  rewardAmount: number
  tags: string[]
  createdAt: string
  status: string
  campaignTemplate: string
  taskType: string
  company: string
  merchantRegistrationLink: string
}

const CampaignList = () => {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token")
        const companyId = localStorage.getItem("companyId")
        if (!token) {
          router.push("/sign-in")
          return
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns?companyId=${companyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (!response.ok) throw toast.error("Failed to fetch campaigns")
        const data = await response.json()
        console.log(data)
        setCampaigns(
          data.campaigns.map((c: any) => ({
            id: c._id,
            name: c.name,
            description: c.description,
            rewardAmount: c.rewardAmount,
            createdAt: c.createdAt,
            status: c.status,
            campaignTemplate: c.campaignTemplate,
            taskType: c.taskType,
            merchantRegistrationLink: c.merchantRegistrationLink,
          })),
        )
      } catch (err: any) {
        toast.error(err.message || "An error occurred while fetching campaigns")
      } finally {
        setIsLoading(false)
      }
    }
    fetchCampaigns()
  }, [router])

  const renderCampaignContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    return (
      <>
        <TabsContent value="ready" className="grid gap-4 md:grid-cols-2">
          {campaigns
            .filter((c) => c.status === "Ready")
            .map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </TabsContent>

        <TabsContent value="active" className="grid gap-4 md:grid-cols-2">
          {campaigns
            .filter((c) => c.status === "Active")
            .map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </TabsContent>
      </>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-muted-foreground">Manage and track your campaign performance</p>
        </div>
        <Link href={"/campaigns/new"}>
          <Button variant="outline" className="gap-2 bg-black text-white">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 border-b rounded-none p-0 h-auto">
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:bg-black data-[state=active]:border-primary px-4 pb-2"
          >
            Live Campaigns ({!isLoading && !error ? campaigns.filter((c) => c.status === "Active").length : 0})
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-black px-4 pb-2"
          >
            Draft Campaigns ({!isLoading && !error ? campaigns.filter((c) => c.status === "Ready").length : 0})
          </TabsTrigger>
        </TabsList>

        {renderCampaignContent()}
      </Tabs>
    </div>
  )
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  const companyId = localStorage.getItem("companyId")

  const handleQRDownload = async () => {
    try {
      if (!campaign.merchantRegistrationLink) {
        toast.error("No merchant registration link available")
        return
      }

      const qrDataUrl = await qrcode.toDataURL(campaign.merchantRegistrationLink, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 400,
      })

      // Create temporary link and trigger download
      const downloadLink = document.createElement("a")
      downloadLink.href = qrDataUrl
      downloadLink.download = `${campaign.name}_merchant_qr.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err) {
      console.error("Error generating QR code:", err)
      toast.error("Failed to generate QR code")
    }
  }

  return (
    <Card className="border rounded-lg overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{campaign.name}</h3>
            <p className="text-muted-foreground mt-1">{campaign.description}</p>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              campaign.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {campaign.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-sm">Reward Amount</span>
            </div>
            <p className="text-lg font-medium">Rs.{campaign.rewardAmount}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Created</span>
            </div>
            <p className="text-sm">{new Date(campaign.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-sm">Campaign Template</span>
            </div>
            <p className="text-md">{campaign.campaignTemplate}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:flex-row gap-3 w-full">
          {campaign.status === "Ready" ? (
            <Button variant="outline" className="bg-black text-white col-span-3">
              <Link href={`/drafts/${campaign.id}`}>Publish</Link>
            </Button>
          ) : (
            <>
              <Button onClick={handleQRDownload} variant="default" className="flex-1 bg-black text-white">
                Register Merchant QR
              </Button>

              <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                <Button variant="default" className="w-full bg-black text-white">
                  View Details
                </Button>
              </Link>

              <Button variant="outline" className="bg-black text-white">
                <Link href={`/drafts/${campaign.id}`}>Download</Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CampaignList

