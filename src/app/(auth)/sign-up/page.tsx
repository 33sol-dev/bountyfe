"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import Link from "next/link"
import { toast } from 'sonner'
import Image from "next/image"
import clsx from "clsx"
import { LoadingButton } from "@/components/globals/buttons"
import { signIn } from "next-auth/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

const SignupUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  typeOfUser: z.enum(["brand-admin", "customer"]),
  upiId: z.string().optional(),
  companyId: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignupFormData = z.infer<typeof SignupUserSchema>

const Signup = () => {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const form = useForm<SignupFormData>({
    defaultValues: {
      name: "",
      mobileNumber: "",
      typeOfUser: "customer",
      upiId: "",
      companyId: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: SignupFormData) {
    setLoading(true)
    try {
      const payload = {
        name: values.name,
        mobileNumber: values.mobileNumber,
        typeOfUser: values.typeOfUser,
        email: values.email,
        password: values.password,
        ...(values.upiId && { upiId: values.upiId }),
        ...(values.companyId && { companyId: values.companyId }),
      }

      let response: Response
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        })
      } catch (networkError) {
        throw new Error("Network error. Please check your connection.")
      }

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Response parsing error:", response)
        throw new Error(
          `Server returned invalid response (Status: ${response.status} ${response.statusText}). ` +
            "Please contact support if this persists.",
        )
      }

      toast.success('Account created successfully!')

      setTimeout(() => {
        router.push("/sign-in")
      }, 1500)
    } catch (error) {
      console.error("Signup error:", error)
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signIn("google", {
        callbackUrl: "/create-company",
      })
    } catch (error) {
      console.error("Google signin error:", error)
      toast.error("Unable to sign in with Google. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen ">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-[28rem] max-w-md space-y-3 bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Sign Up</h2>
            <p className="text-sm text-purple-400">Enter your information to create an account</p>
          </div>

          <Button
            className={clsx(
              "flex items-center w-full gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 h-11",
            )}
            onClick={handleGoogle}
            type="button"
            disabled={loading}
          >
            <Image src="/svgs/google.svg" width={20} height={20} alt="google logo" />
            Sign Up with Google
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Snow" {...field} className="h-11  text-black border-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm">Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="918779780352"
                        {...field}
                        type="tel"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className="h-11  text-black border-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 text-sm">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                        className="h-11 text-black border-0"
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
                    <FormLabel className="text-gray-700 text-sm">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        minLength={6}
                        autoComplete="new-password"
                        className="h-11 text-black border-0"
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
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-600">
            Account already exists? &nbsp;
            <Link className="font-medium text-[#7c3aed] hover:text-[#6d28d9]" href="/sign-in">
              Login
            </Link>
          </p>
        </div>
      </div>


    </div>
  )
}

export default Signup

