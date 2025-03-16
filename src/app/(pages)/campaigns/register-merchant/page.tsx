"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

interface FormData {
  merchantName: string;
  upiId: string;
  merchantMobile: string;
  merchantEmail: string;
  company: string;
  address: string;
  campaignId: string;
}

interface ApiResponse {
  message: string;
  merchant?: any;
}

export default function MerchantForm() {
  const companyId = localStorage.getItem("companyId") as string;

  const initialFormState: FormData = {
    merchantName: "",
    upiId: "",
    merchantMobile: "",
    merchantEmail: "",
    company: companyId,
    address: "",
    campaignId: "",
  };

  // New state for dummy merchant flag
  const [isDummy, setIsDummy] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedCampaignId = localStorage.getItem("campaignId");
    if (storedCampaignId) {
      setFormData((prev) => ({ ...prev, campaignId: storedCampaignId }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // New handler for toggling dummy merchant creation
  const handleDummyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDummy(e.target.checked);
  };

  const validateForm = (): boolean => {
    // If creating a full merchant, enforce validations
    if (!isDummy) {
      if (!formData.merchantName.trim()) {
        toast.error("Merchant name is required");
        return false;
      }
      if (!formData.upiId.trim()) {
        toast.error("UPI ID is required");
        return false;
      }
      if (!formData.merchantMobile.trim()) {
        toast.error("Mobile number is required");
        return false;
      }
    }
    // Common validations
    if (!formData.company.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!formData.campaignId) {
      toast.error("Campaign ID is missing");
      return false;
    }
    if (formData.merchantEmail && !formData.merchantEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Pass the isDummy flag along with the form data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/merchant/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, isDummy }),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create merchant");
      }

      toast.success("Merchant created successfully!");
      setFormData({
        ...initialFormState,
        campaignId: formData.campaignId,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error in creating merchant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-white">
      <div className="max-w-6xl mx-auto rounded-lg shadow-sm">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-black mb-8">Add New Merchant</h2>

          {/* New toggle for dummy merchant creation */}
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isDummy}
                onChange={handleDummyToggle}
                className="form-checkbox h-5 w-5"
              />
              <span className="ml-2 text-gray-700">
                Create as Dummy Merchant (details can be attached later)
              </span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="merchantName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Merchant Name {isDummy ? "(Optional)" : "*"}
                </label>
                <input
                  type="text"
                  id="merchantName"
                  name="merchantName"
                  value={formData.merchantName}
                  onChange={handleChange}
                  required={!isDummy}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter merchant name"
                />
              </div>

              <div>
                <label
                  htmlFor="upiId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  UPI ID {isDummy ? "(Optional)" : "*"}
                </label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  required={!isDummy}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter UPI ID"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="merchantMobile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mobile Number {isDummy ? "(Optional)" : "*"}
              </label>
              <input
                type="tel"
                id="merchantMobile"
                name="merchantMobile"
                value={formData.merchantMobile}
                onChange={handleChange}
                required={!isDummy}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label
                htmlFor="merchantEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="merchantEmail"
                name="merchantEmail"
                value={formData.merchantEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? "Adding Merchant..." : "Add Merchant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
