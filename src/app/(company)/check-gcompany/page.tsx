"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("Checking authentication...");

  useEffect(() => {
    const checkCompany = async () => {
      const token = localStorage.getItem("next-auth.session-token");
      if (token) {
        try {
          setStatus("Verifying company information...");
          const response = await fetch(`${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/companies`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (response.ok) {
            if (data.companies && data.companies.length > 0) {
              setStatus("Company found! Redirecting to dashboard...");
              setTimeout(() => router.push("/dashboard"), 1000);
            } else {
              setStatus("No company found. Redirecting to company creation...");
              setTimeout(() => router.push("/create-company"), 1000);
            }
          } else {
            setError("Failed to fetch company information");
            toast.error("Failed to fetch company information");
            setTimeout(() => router.push("/create-company"), 2000);
          }
        } catch (error) {
          console.error("Error checking company:", error);
          setError("Network error. Please try again.");
          toast.error("Network error. Please try again.");
          setTimeout(() => router.push("/create-company"), 2000);
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push("/sign-in");
      }
    };

    checkCompany();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      {isLoading ? (
        <div className="flex flex-col items-center space-y-4 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg font-medium">{status}</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};

export default Page;
