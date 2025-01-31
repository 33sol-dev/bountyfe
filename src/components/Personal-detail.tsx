"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MerchantDetailsFormProps {
  onSubmit: (details: { merchantName: string; upiId: string; phoneNumber: string }) => void
  onCancel: () => void
}

export function MerchantDetailsForm({ onSubmit, onCancel }: MerchantDetailsFormProps) {
  const [details, setDetails] = useState({ merchantName: "", upiId: "", phoneNumber: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(details)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Merchant Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchantName" className="text-gray-700">
              Merchant Name
            </Label>
            <Input
              id="merchantName"
              name="merchantName"
              value={details.merchantName}
              onChange={handleChange}
              className="w-full border-gray-300 text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiId" className="text-gray-700">
              Merchant UPI ID
            </Label>
            <Input
              id="upiId"
              name="upiId"
              value={details.upiId}
              onChange={handleChange}
              className="w-full border-gray-300 text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-700">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={details.phoneNumber}
              onChange={handleChange}
              className="w-full border-gray-300 text-gray-900 placeholder:text-gray-400"
              required
              type="tel"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              Add Merchant
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

