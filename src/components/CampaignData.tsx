import { Home, Settings, Gift, AirplayIcon as Broadcast } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Dashboard() {
  return (
    <div className="min-h-screen w-[80vw]">
      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <h3 className="text-sm text-gray-500">Total Cashback Given</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">₹1,491,675.00</p>
                  <span className="text-green-500 text-sm">↑ 8%</span>
                </div>
                <p className="text-sm text-gray-500">Total money given</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <h3 className="text-sm text-gray-500">Total QR Scanned</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">10,293</p>
                  <span className="text-green-500 text-sm">↑ 8%</span>
                </div>
                <p className="text-sm text-gray-500">Unique QRs Scanned</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-1">
                <h3 className="text-sm text-gray-500">Total Users enrolled</h3>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">9,500</p>
                  <span className="text-green-500 text-sm">↑ 8%</span>
                </div>
                <p className="text-sm text-gray-500">No.of total Users</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

