"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import CustomerData from './CustomerData'
import MerchantData from './MerchantData'

export default function PageToggle() {
  const [viewType, setViewType] = useState<'customer' | 'merchant'>('customer')

  return (
    <div className="w-full">
      <div className="container mx-auto py-4">
        <div className="mb-6 flex">
          <div className="inline-flex rounded-lg bg-white">
            <Button
              variant={viewType === 'customer' ? 'default' : 'ghost'}
              className={`px-4 py-2 text-sm font-medium ${
                viewType === 'customer' 
                  ? 'bg-primary text-primary-foreground' 
                  : ''
              }`}
              onClick={() => setViewType('customer')}
            >
              Customer Data
            </Button>
            <Button
              variant={viewType === 'merchant' ? 'default' : 'ghost'}
              className={`px-4 py-2 text-sm font-medium ${
                viewType === 'merchant' 
                  ? 'bg-primary text-primary-foreground' 
                  : ''
              }`}
              onClick={() => setViewType('merchant')}
            >
              Merchant Data
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {viewType === 'customer' ? (
            <div>
              <CustomerData />
            </div>
          ) : (
            <div>
              <MerchantData />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}