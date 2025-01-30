"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import JSZip from "jszip"
import qrcode from "qrcode"
import { saveAs } from "file-saver"

interface Campaign {
  id: string
  name: string
  description: string
  totalAmount: number
  tags: string[]
  createdAt: string
  status: string
  triggerText: string
  publishPin: string
  reward_type: string
  zipUrl: string
}

const CampaignDetail: React.FC = () => {
  const router = useRouter()
  const { id } = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const insightsData = [
    { title: "Total Revenue", value: "$45,678", change: "+12%" },
    { title: "Active Users", value: "2,345", change: "+8%" },
    { title: "Conversion Rate", value: "3.2%", change: "-1%" },
  ]

  const payoutData = [
    { method: "Bank Transfer", status: "Active", fee: "1.5%" },
    { method: "PayPal", status: "Inactive", fee: "2.9%" },
    { method: "Stripe", status: "Active", fee: "2.5%" },
  ]

  const dataTable = [
    {
      waNumber: "+91 90296...",
      name: "Vishal",
      phone: "+90 296362...",
      pincode: "400053",
      state: "Maharashtra",
      address: "123 Main St",
      city: "Mumbai",
      landmark: "Near Park",
    },
    // Add more rows as needed
  ]

  const getCampaignQrs = async () => {
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

      const zip = new JSZip()
      const data = await response.json()
      const urls = data.codes.map(async (codeObj: any) => {
        const qrDataUrl = await qrcode.toDataURL(codeObj.url)
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
        zip.file(`${codeObj.code}.png`, base64Data, { base64: true })
      })
      await Promise.all(urls)
      const zipBlob = await zip.generateAsync({ type: "blob" })
      saveAs(zipBlob, "campaign_qrcodes.zip")
    } catch (err) {
      console.error(err)
      alert(err || "An error occurred while fetching the campaign QRs")
    }
  }

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
          throw new Error("Failed to fetch campaign")
        }

        const data = await response.json()
        const campaignData = data.campaign

        setCampaign({
          id: campaignData._id,
          name: campaignData.name,
          description: campaignData.description,
          totalAmount: campaignData.totalAmount,
          tags: campaignData.tags,
          createdAt: campaignData.createdAt,
          status: campaignData.status,
          triggerText: campaignData.triggerText,
          publishPin: campaignData.publishPin,
          reward_type: campaignData.reward_type,
          zipUrl: campaignData.zipUrl,
        })
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching the campaign")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCampaign()
    }
  }, [id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!campaign) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6">
          <p className="text-lg">{campaign.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">${campaign.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold">{campaign.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reward Type</p>
              <p className="text-lg font-semibold">{campaign.reward_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="text-lg font-semibold">{new Date(campaign.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tags</p>
            <p className="text-lg font-semibold">{campaign.tags.join(", ")}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trigger Text</p>
            <p className="text-lg font-semibold">{campaign.triggerText}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="payout">Payout Config</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insightsData.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-semibold">{item.value}</span>
                    <span className={`text-sm ${item.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                      {item.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="payout">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.method}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{item.fee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="data">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WhatsApp Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Landmark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataTable.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.waNumber}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.pincode}</TableCell>
                  <TableCell>{item.state}</TableCell>
                  <TableCell>{item.address}</TableCell>
                  <TableCell>{item.city}</TableCell>
                  <TableCell>{item.landmark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CampaignDetail

