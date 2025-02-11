"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentForm({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [showPersonDetails, setShowPersonDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: "Bounty Campaign 1",
    rewardAmount: "",
    campaignTemplate: "product",
    triggerType: "QR",
    noOfSamples: "5000",
    triggerText: "",
  });

  useEffect(() => {
    const storedCompanyId = localStorage.getItem("companyId");
    if (!storedCompanyId) {
      setError("No company ID found. Please create a company first.");
      setTimeout(() => {
        router.push("/create-company");
      }, 2000);
      return;
    }
    setCompanyId(storedCompanyId);
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenPersonDetails = () => {
    setShowPersonDetails(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!companyId) {
      setError("Company ID is required. Please create a company first.");
      setIsLoading(false);
      return;
    }

    const requiredFields = ["name", "noOfSamples", "triggerText", "rewardAmount"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      setError(`Required fields missing: ${missingFields.join(", ")}`);
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        company: companyId,
        rewardAmount: Number(formData.rewardAmount),
        noOfSamples: Number(formData.noOfSamples),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create campaign");
      }

      const responseData = await response.json();
      console.log("Campaign created successfully:", responseData);

      setFormData({
        name: "",
        rewardAmount: "",
        campaignTemplate: "product",
        noOfSamples: "5000",
        triggerType: "QR",
        triggerText: "",
      });

      router.push("/campaigns");
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="max-w-7xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col gap-6">
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
                className="w-full border-gray-700/10 text-black placeholder:text-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rewardAmount" className="text-black">
                Reward Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rewardAmount"
                type="number"
                name="rewardAmount"
                value={formData.rewardAmount}
                onChange={handleChange}
                placeholder="Enter reward amount"
                required
                className="w-full border-gray-700/10 text-black placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="noOfSamples" className="text-black">
                Number of Codes <span className="text-red-500">*</span>
              </Label>
              <Input
                id="noOfSamples"
                type="number"
                name="noOfSamples"
                value={formData.noOfSamples}
                onChange={handleChange}
                placeholder="Enter number of codes"
                required
                className="w-full border-gray-700/10 text-black placeholder:text-gray-400"
              />
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
              className="w-full min-h-[80px] border-gray-700/10 text-black placeholder:text-gray-400"
            />
          </div>

          {error && (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Alert variant="destructive" className="bg-red-900/50 border-red-800 flex-grow">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
              <Button className="bg-white text-black w-full sm:w-auto">
                <Link href="/recharge">Recharge</Link>
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg"
            disabled={isLoading || !companyId}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating Campaign...</span>
              </div>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}