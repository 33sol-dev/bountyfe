"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download } from "lucide-react"
import Papa from 'papaparse'
import { toast } from "sonner"

interface customerData {
  [key: string]: string
}

export default function customerCSVViewer() {
  const searchParams = useSearchParams()
  const campaignId = localStorage.getItem('campaignId')
  const [csvData, setCSVData] = useState<customerData[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchCustomerCSV = async () => {
    if (!campaignId) {
      setError("Campaign ID is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}/customers/csv`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch customer data")
      }

      const csvText = await response.text()
      
      Papa.parse(csvText, {
        header: true,
        complete: (results :any) => {
          if (results.data.length > 0) {
            setHeaders(Object.keys(results.data[0]))
            setCSVData(results.data as customerData[])
          }
        },
        error: (error : any) => {
          toast.error(`Failed to parse CSV: ${error.message}`)
        }
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch customer data")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSV = async () => {
    if (!campaignId) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}/customers/csv`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to download CSV")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-${campaignId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      toast.error(err.message || "Failed to download CSV")
    }
  }

  useEffect(() => {
    fetchCustomerCSV()
  }, [campaignId])

  if (!campaignId) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>Campaign ID is required</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="w-[80vw] px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Customer Data</h2>
        <Button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}