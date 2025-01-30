"use client"

import type React from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, UserPlus } from "lucide-react"

interface NavbarProps {
  brandName?: string
}

export const NavbarUserDashboard: React.FC<NavbarProps> = ({ brandName = "Hunt Bounty" }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-700 hover:text-gray-900">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white border-r border-gray-200 p-0">
              <SheetHeader className="p-4 border-b border-gray-200">
                <SheetTitle className="text-gray-900">Navigation</SheetTitle>
              </SheetHeader>
              {/* Add your mobile navigation items here if needed */}
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{brandName}</span>
          </Link>
        </div>

        {/* Right Section - Sign In Button */}
        <div className="flex items-center">
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-md px-6">
            <Link href="/sign-in" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default NavbarUserDashboard

