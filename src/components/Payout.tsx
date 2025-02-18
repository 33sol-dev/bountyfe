import { ArrowUpDown, Filter, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface PayoutConfig {
  productType: "BR" | "CM"
  payoutLevel: number
  payoutAmount: number
  id: number
}

export default function PayoutConfigTable() {
  const payoutData: PayoutConfig[] = [
    { productType: "BR", payoutLevel: 1, payoutAmount: 100, id: 1 },
    { productType: "BR", payoutLevel: 2, payoutAmount: 125, id: 2 },
    { productType: "BR", payoutLevel: 3, payoutAmount: 190, id: 3 },
    { productType: "BR", payoutLevel: 4, payoutAmount: 200, id: 4 },
    { productType: "BR", payoutLevel: 5, payoutAmount: 150, id: 5 },
    { productType: "BR", payoutLevel: 6, payoutAmount: 75, id: 6 },
  ]

  return (
    <div className="w-full w-[80vw] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Level Wise Config</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product type</TableHead>
              <TableHead>Payout level</TableHead>
              <TableHead>Payout amount</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payoutData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`
                      ${row.productType === "BR" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    `}
                  >
                    {row.productType}
                  </Badge>
                </TableCell>
                <TableCell>{row.payoutLevel}</TableCell>
                <TableCell>{row.payoutAmount}</TableCell>
                <TableCell>{row.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">Update Config</Button>
    </div>
  )
}

