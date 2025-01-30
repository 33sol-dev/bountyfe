"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface CompanyFormData {
  name: string
  contactName: string
  email: string
  phoneNumber: string
  description: string
  website: string
}

const initialFormData: CompanyFormData = {
  name: "",
  contactName: "",
  email: "",
  phoneNumber: "",
  description: "",
  website: "",
}

interface CompanyResponse {
  message: string
  companyId: string
}

const NewCompanyForm = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<CompanyFormData>>({})
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      router.push("/sign-in")
      return
    }
    setToken(storedToken)
  }, [router])

  const validateForm = (data: CompanyFormData): boolean => {
    const newErrors: Partial<CompanyFormData> = {}

    if (!data.name.trim()) newErrors.name = "Company name is required"
    if (!data.contactName.trim()) newErrors.contactName = "Contact name is required"
    if (!data.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = "Invalid email address"
    if (!data.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required"
    if (data.website && !/^https?:\/\/.*/.test(data.website))
      newErrors.website = "Website must start with http:// or https://"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof CompanyFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (!validateForm(formData)) {
      setLoading(false)
      return
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Authentication required. Please sign in again.",
        variant: "destructive",
      })
      router.push("/sign-in")
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/sign-in")
          throw new Error("Session expired. Please sign in again.")
        }
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create company")
      }

      const responseData: CompanyResponse = await response.json()
      localStorage.setItem("companyId", responseData.companyId)

      toast({
        title: "Success",
        description: "Company created successfully",
        variant: "default",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-6 bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Create Company</h2>
            <p className="text-sm text-purple-400">Enter your company information to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11 text-black border-0"
                  placeholder="Enter company name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Contact Name</label>
                <Input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="h-11 text-black border-0"
                  placeholder="Enter contact name"
                />
                {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 text-black border-0"
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="h-11 text-black border-0"
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
              </div>
              <div className="space-y-2 col-span-full">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="h-11 text-black border-0"
                  placeholder="Enter description"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div className="space-y-2 col-span-full">
                <label className="text-sm font-medium text-gray-700">Website (optional)</label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="h-11  text-black border-0"
                  placeholder="Enter website URL"
                />
                {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium"
            >
              {loading ? "Creating..." : "Create Company"}
            </Button>
          </form>
        </div>
      </div>

  
    </div>
  )
}

export default NewCompanyForm

