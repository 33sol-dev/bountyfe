"use client"

//qr component
import React, { useState, useEffect } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import Link from 'next/link'
import { MerchantDetailsForm } from './Personal-detail'

export default function PromoterForm( { activeTab }: { activeTab: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [showPersonDetails, setShowPersonDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalAmount: '',
    tags: '',
    triggerType: 'QR',
    numberOfCodes: '5000',
    triggerText: '',
    qrStyle: 'simple',
    personDetails: null as { field1: string; field2: string; field3: string } | null,
  })

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId')
    if (!storedCompanyId) {
      setError('No company ID found. Please create a company first.')
      setTimeout(() => {
        router.push('/create-company')
      }, 2000)
      return
    }
    setCompanyId(storedCompanyId)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOpenPersonDetails = () => {
    setShowPersonDetails(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!companyId) {
      setError('Company ID is required. Please create a company first.')
      setIsLoading(false)
      return
    }

    const requiredFields = ['name', 'numberOfCodes', 'triggerText', 'qrStyle']
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        companyId,
        totalAmount: formData.totalAmount ? Number(formData.totalAmount) : undefined,
        numberOfCodes: Number(formData.numberOfCodes),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create campaign')
      }

      const responseData = await response.json()
      console.log('Campaign created successfully:', responseData)

      setFormData({
        name: '',
        description: '',
        totalAmount: '',
        tags: '',
        triggerType: '',
        numberOfCodes: '1000',
        triggerText: '',
        qrStyle: '',
        personDetails: null,
      })

      router.push('/campaigns')
    } catch (err: any) {
      setError(err.message || "Failed to create campaign")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=" p-4">
      <div className="max-w-7xl">
        <h1 className="text-2xl font-bold mb-6 text-black">Create New Campaign</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-black">
                Campaign Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter campaign name"
                required
                className="w-full  border-gray-700/10 text-black placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-black">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="Enter total amount"
                className="w-full border-gray-700/10  text-black placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-black">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Enter tags (e.g., festive, holiday)"
                className="w-full  border-gray-700/10 text-black placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter campaign description"
              className="w-full min-h-[100px] border-gray-700/10  text-black placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="triggerType" className="text-black">
                Trigger Type
              </Label>
              <Input
                id="triggerType"
                value="QR"
                disabled
                className="w-full  border-gray-700/10 text-black cursor-not-allowed opacity-70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfCodes" className="text-black">
                Number of Codes <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numberOfCodes"
                type="number"
                name="numberOfCodes"
                value={formData.numberOfCodes}
                onChange={handleChange}
                placeholder="Enter number of codes"
                required
                className="w-full border-gray-700/10 text-black placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qrStyle" className="text-black">
                QR Style <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.qrStyle} 
                onValueChange={(value) => handleSelectChange('qrStyle', value)}
              >
                <SelectTrigger 
                  id="qrStyle"
                  className="w-full   text-black"
                >
                  <SelectValue placeholder="Select QR style" />
                </SelectTrigger>
                <SelectContent className=" ">
                  <SelectItem value="simple" className="text-black">Simple</SelectItem>
                  <SelectItem value="stylized" className="text-black">Stylized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="triggerText" className="text-black">
              Trigger Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="triggerText"
              name="triggerText"
              value={formData.triggerText}
              onChange={handleChange}
              placeholder="Enter message template"
              required
              className="w-full min-h-[80px] border-gray-700/10  text-black placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              onClick={handleOpenPersonDetails}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Add Merchant Details
            </Button>
          </div>


          {error && (
            <div className='flex flex-col sm:flex-row gap-4 items-center'>
              <Alert variant="destructive" className="bg-red-900/50 border-red-800 flex-grow">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
              <Button className='bg-white text-black w-full sm:w-auto'>
                <Link href="/recharge">
                  Recharge
                </Link>
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2 px-4 rounded-lg"
            disabled={isLoading || !companyId}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating Campaign...</span>
              </div>
            ) : (
              'Create Campaign'
            )}
          </Button>
        </form>
      </div>
      {showPersonDetails && (
        <MerchantDetailsForm onSubmit={function (details: { merchantName: string; upiId: string; phoneNumber: string }): void {
                  throw new Error('Function not implemented.')
              } } onCancel={function (): void {
                  throw new Error('Function not implemented.')
              } } />
      )}
    </div>
  )
}

