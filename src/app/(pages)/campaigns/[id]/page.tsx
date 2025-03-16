"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JSZip from "jszip";
import qrcode from "qrcode";
import { saveAs } from "file-saver";
import Link from "next/link";
import CampaignData from "@/components/CampaignData";
import Data from "@/components/Data";
import Payout from "@/components/Payout";
import { toast } from "sonner";

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

const CampaignDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to directly create a dummy merchant
  const addDummyMerchant = async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("companyId");
      const campaignId = localStorage.getItem("campaignId");
      if (!token || !companyId || !campaignId) {
        throw new Error("Missing required campaign or company information");
      }

      const payload = {
        merchantName: "Dummy Merchant",
        upiId: "",
        merchantMobile: "",
        merchantEmail: "",
        address: "",
        company: companyId,
        campaignId: campaignId,
        isDummy: true,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/merchant/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create dummy merchant");
      }

      toast.success("Dummy merchant created successfully!");
      // Optionally, you could refresh your merchant list or navigate to a merchants page
    } catch (error: any) {
      toast.error(error.message || "Failed to create dummy merchant");
    }
  };

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

  const updateCampaignStatus = async (newStatus: any) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaign?.id}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pin: campaign?.publishPin,
            status: "Ready",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Status update failed with status: ${response.status}`);
      }

      toast.success(`Campaign status updated to ${newStatus}`);
      router.push(`/campaigns`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update campaign status");
    } finally {
      setIsUpdating(false);
    }
  };

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
        <div className="flex gap-2">
          {/* Button for adding a full merchant */}
          <Link href="/campaigns/register-merchant">
            <Button className="bg-black text-white">Add Merchant</Button>
          </Link>
          {/* Button for directly creating a dummy merchant */}
          <Button
            className="bg-black text-white"
            onClick={addDummyMerchant}
          >
            Add Dummy Merchant
          </Button>
          <Button
            className="bg-black text-white"
            onClick={() => updateCampaignStatus("Draft")}
          >
            Set to Draft
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Tabs defaultValue="campaign">
          <TabsList>
            <TabsTrigger className="hover:bg-gray" value="campaign">
              Campaign
            </TabsTrigger>
            <TabsTrigger className="hover:bg-gray" value="payout">
              Payout
            </TabsTrigger>
            <TabsTrigger className="hover:bg-gray" value="data">
              Data
            </TabsTrigger>
          </TabsList>
          <TabsContent value="campaign">
            <CampaignData />
          </TabsContent>
          <TabsContent value="payout">
            <Payout campaignId={campaign.id} />
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
