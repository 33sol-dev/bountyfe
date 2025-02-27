import { useState, useEffect } from "react"
import { Home, Settings, Gift, AirplayIcon as Broadcast } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function Dashboard() {
  const [kpiData, setKpiData] = useState({
    totalMerchants: 0,
    totalCustomers: 0,
    totalMoneyGiven: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { id: campaignId } = useParams()

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}/kpis`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch KPI data")
        }

        const data = await response.json()
        setKpiData(data.kpis)
      } catch (err) {
        toast.error("Error fetching KPI data")
        setError("Failed to load KPI data")
      } finally {
        setIsLoading(false)
      }
    }

    if (campaignId) {
      fetchKpis()
    }
  }, [campaignId])

  const formatCurrency = (amount : any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen w-[80vw]">
      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-sm text-gray-500">Total Merchants</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{kpiData.totalMerchants.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-sm text-gray-500">Total Customers</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{kpiData.totalCustomers.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-sm text-gray-500">Total Cashback Given</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">{formatCurrency(kpiData.totalMoneyGiven)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}