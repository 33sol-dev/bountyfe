"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { LoadingButton } from "@/components/globals/buttons"
import { signIn, useSession } from "next-auth/react"

const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignInFormData = z.infer<typeof SignInSchema>

const Page: React.FC = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { data: session, status } = useSession()
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const getNextAuthToken = () => {
    const cookies = document.cookie.split(";")
    const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("next-auth.session-token="))
    return sessionCookie ? sessionCookie.split("=")[1].trim() : null
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setMessage("")
    try {
      const result = await signIn("google", {
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      const sessionToken = getNextAuthToken()

      if (!sessionToken) {
        throw new Error("No session token available")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: sessionToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token)
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user))
        }
        router.replace("/check-company")
      } else {
        throw new Error(data.message || "Failed to process Google authentication")
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      setMessage("Failed to sign in with Google")
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with Google",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: SignInFormData) {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(values),
      })
      const data = await response.json()

      if (data.token) {
        localStorage.setItem("token", data.token)
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user))
        }
        router.replace(data.user?.hasCompany ? "/dashboard" : "/check-company")
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen ">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-[28rem] max-w-lg space-y-6 bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
            <p className="text-sm text-purple-400">Enter your email and password to sign in!</p>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            type="button"
            disabled={isLoading}
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 flex items-center justify-center gap-2 h-11"
          >
            <Image src="/svgs/google.svg" width={20} height={20} alt="google logo" />
            Sign in with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        className="h-11  text-black border-0"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="h-11 text-black border-0"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-medium"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-600">
            Not registered yet?{" "}
            <Link href="/sign-up" className="font-medium text-[#7c3aed] hover:text-[#6d28d9]">
              Create an Account
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}

export default Page

