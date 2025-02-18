"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JSZip from "jszip";
import qrcode from "qrcode";
import { saveAs } from "file-saver";
import Link from "next/link";
import CampaignData from "@/components/CampaignData";
import Data from "@/components/Data";
import Payout from "@/components/Payout";

interface Campaign {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  tags: string[];
  createdAt: string;
  status: string;
  triggerText: string;
  publishPin: string;
  reward_type: string;
  zipUrl: string;
  campaignTemplate: string;
  taskType: string;
  rewardAmount: string;
}

interface PayoutProps {
  campaignId: string;
}

const CampaignDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const insightsData = [
    { title: "Total Revenue", value: "$45,678", change: "+12%" },
    { title: "Active Users", value: "2,345", change: "+8%" },
    { title: "Conversion Rate", value: "3.2%", change: "-1%" },
  ];

  const payoutData = [
    { method: "Bank Transfer", status: "Active", fee: "1.5%" },
    { method: "PayPal", status: "Inactive", fee: "2.9%" },
    { method: "Stripe", status: "Active", fee: "2.5%" },
  ];

  const dataTable = [
    {
      waNumber: "+91 90296...",
      name: "Vishal",
      phone: "+90 296362...",
      pincode: "400053",
      state: "Maharashtra",
      address: "123 Main St",
      city: "Mumbai",
      landmark: "Near Park",
    },
    // Add more rows as needed
  ];

  const getCampaignQrs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/code/get-campaign-codes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ campaignId: id }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch campaign QRs");
      }

      const zip = new JSZip();
      const data = await response.json();
      const urls = data.codes.map(async (codeObj: any) => {
        const qrDataUrl = await qrcode.toDataURL(codeObj.url);
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
        zip.file(`${codeObj.code}.png`, base64Data, { base64: true });
      });
      await Promise.all(urls);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "campaign_qrcodes.zip");
    } catch (err) {
      console.error(err);
      alert(err || "An error occurred while fetching the campaign QRs");
    }
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/sign-in");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch campaign");
        }

        const data = await response.json();
        const campaignData = data.campaign;
        localStorage.setItem("campaignId", campaignData._id);

        setCampaign({
          id: campaignData._id,
          name: campaignData.name,
          description: campaignData.description,
          totalAmount: campaignData.totalAmount,
          tags: campaignData.tags,
          createdAt: campaignData.createdAt,
          status: campaignData.status,
          triggerText: campaignData.triggerText,
          publishPin: campaignData.publishPin,
          reward_type: campaignData.reward_type,
          zipUrl: campaignData.zipUrl,
          campaignTemplate: campaignData.campaignTemplate,
          taskType: campaignData.taskType,
          rewardAmount: campaignData.rewardAmount,
        });
      } catch (err: any) {
        setError(
          err.message || "An error occurred while fetching the campaign"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCampaign();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!campaign) {
    return null;
  }

  return (

    <div className="container p-3 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaign Details</h1>
        <Link href="/campaigns/register-merchant">
          <Button className="bg-black text-white">Add Merchant</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="campaign" className="">
          <TabsList>
            <TabsTrigger className="hover:bg-gray" value="campaign">Campaign</TabsTrigger>
            <TabsTrigger className="hover:bg-gray" value="payout">Payout</TabsTrigger>
            <TabsTrigger className="hover:bg-gray" value="data">Data</TabsTrigger>
          </TabsList>
          <TabsContent value="campaign">
            <CampaignData />
          </TabsContent>
          <TabsContent value="payout">
            <Payout campaignId={campaign.id}/>
          </TabsContent>
          <TabsContent value="data">
            <Data />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
};

export default CampaignDetail;
