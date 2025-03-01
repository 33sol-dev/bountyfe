"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Trash2 } from "lucide-react"
import Papa from 'papaparse'
import { toast } from "sonner"

interface MerchantData {
  [key: string]: string
}

export default function MerchantCSVViewer() {
  const searchParams = useSearchParams()
  const campaignId = localStorage.getItem('campaignId')
  const [csvData, setCSVData] = useState<MerchantData[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchMerchantCSV = async () => {
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
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}/merchants/csv`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch merchant data")
      }

      const csvText = await response.text()
      
      Papa.parse(csvText, {
        header: true,
        complete: (results :any) => {
          if (results.data.length > 0) {
            // Filter out the ID field from headers to display
            const allHeaders = Object.keys(results.data[0])
            const displayHeaders = allHeaders.filter(header => header !== '_id')
            setHeaders(displayHeaders)
            setCSVData(results.data as MerchantData[])
          }
        },
        error: (error : any) => {
          toast.error(`Failed to parse CSV: ${error.message}`)
        }
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch merchant data")
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
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}/merchants/csv`,
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
      a.download = `merchants-${campaignId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      toast.error(err.message || "Failed to download CSV")
    }
  }

  const deleteMerchant = async (merchantId: string) => {
    if (!merchantId || !campaignId) return

    setIsDeleting(merchantId)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/merchant/${merchantId}`,
        {
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete merchant")
      }

      // Remove the deleted merchant from the state
      setCSVData(prevData => prevData.filter(row => row._id !== merchantId))
      toast.success("Merchant deleted successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete merchant")
    } finally {
      setIsDeleting(null)
    }
  }

  useEffect(() => {
    fetchMerchantCSV()
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
        <h2 className="text-lg font-semibold">Merchant Data</h2>
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
                  <TableHead key={header} className={header === "qrLink" ? "max-w-xs" : ""}>
                    {header}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell 
                      key={`${index}-${header}`} 
                      className={header === "qrLink" ? "max-w-xs break-all" : ""}
                    >
                      {header === "qrLink" ? (
                        <div className="max-w-xs overflow-hidden break-words py-2">
                          {row[header]}
                        </div>
                      ) : (
                        row[header]
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMerchant(row._id)}
                      disabled={isDeleting === row._id}
                    >
                      {isDeleting === row._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}