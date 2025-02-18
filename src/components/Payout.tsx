"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"

interface PayoutLevelConfig {
  min: number
  max: number
  avg: number
  level: number
  id: string
}

interface PayoutProps {
  campaignId?: string
}

export default function Payout({ campaignId: propsCampaignId }: PayoutProps) {
  const params = useParams()
  const [payoutData, setPayoutData] = useState<PayoutLevelConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchPayoutConfig = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/external/getPayoutConfig/${params.id}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch payout configuration")
      }
      
      const data = await response.json()
      const transformedData = Object.entries(data).map(([level, config]: [string, any]) => ({
        level: parseInt(level),
        min: config.min,
        max: config.max,
        avg: config.avg,
        id: `level-${level}-${Date.now()}`
      }))
      setPayoutData(transformedData)
    } catch (err: any) {
      toast.error(err.message || "Failed to load payout configuration")
    } finally {
      setIsLoading(false)
    }
  }

  const addNewRow = () => {
    const existingLevels = payoutData.map(row => row.level).filter(level => !isNaN(level))
    const newLevel = existingLevels.length > 0 ? Math.max(...existingLevels) + 1 : 1
    setPayoutData([...payoutData, {
      level: newLevel,
      min: 0,
      max: 0,
      avg: 0,
      id: `level-${newLevel}-${Date.now()}`
    }])
  }

  const removeRow = (id: string) => {
    setPayoutData(payoutData.filter(row => row.id !== id))
  }

  const handleValueChange = (id: string, field: keyof PayoutLevelConfig, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return
    setPayoutData(prevData => 
      prevData.map(row => 
        row.id === id 
          ? { ...row, [field]: numValue }
          : row
      )
    )
  }

  const updatePayoutConfig = async () => {

    setIsSaving(true)

    try {
      const configOutput = {
        payoutConfig: payoutData.reduce((acc, curr) => {
          acc[curr.level.toString()] = {
            min: curr.min,
            max: curr.max,
            avg: curr.avg
          }
          return acc
        }, {} as Record<string, { min: number; max: number; avg: number }>)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/external/updatePayoutConfig/${params.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(configOutput)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.[0]?.msg || "Failed to update configuration")
      }

      toast.success("Payout configuration updated successfully")
      await fetchPayoutConfig()
    } catch (err: any) {
      toast.error(err.message || "Failed to update payout configuration")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchPayoutConfig()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-4 w-[80vw]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Level Wise Payout Config</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setPayoutData([...payoutData].sort((a, b) => a.level - b.level))}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={addNewRow}
          className="flex items-center gap-2 bg-black text-white"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Min Payout</TableHead>
              <TableHead>Max Payout</TableHead>
              <TableHead>Average Payout</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payoutData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    type="number"
                    value={row.min}
                    onChange={(e) => handleValueChange(row.id, 'min', e.target.value)}
                    className="w-80 border border-gray-700"
                    min="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.max}
                    onChange={(e) => handleValueChange(row.id, 'max', e.target.value)}
                    className="w-80  border border-gray-700"
                    min="0"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.avg}
                    onChange={(e) => handleValueChange(row.id, 'avg', e.target.value)}
                    className="w-80  border border-gray-700"
                    min="0"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button 
        className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
        onClick={updatePayoutConfig}
        disabled={isSaving}
      >
        {isSaving ? (
          <div className="flex items-center gap-2 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating Configuration...</span>
          </div>
        ) : (
          'Update Config'
        )}
      </Button>
    </div>
  )
}