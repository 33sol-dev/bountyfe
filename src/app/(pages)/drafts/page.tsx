"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
  Tag,
  Plus,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  tags: string[];
  createdAt: string;
  status: string;
}

const CampaignList = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const companyId = localStorage.getItem("companyId")
        if (!token) {
          router.push("/sign-in");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns?companyId=${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch campaigns");

        const data = await response.json();
        setCampaigns(
          data.campaigns.map((c: any) => ({
            id: c._id,
            name: c.name,
            description: c.description,
            totalAmount: c.totalAmount,
            tags: c.tags,
            createdAt: c.createdAt,
            status: c.status,
          }))
        );
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching campaigns");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [router]);

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage and track your campaign performance
          </p>
        </div>
        {/* <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button> */}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
          >
            All Campaigns ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2"
          >
            Active ({campaigns.filter((c) => c.status === "Active").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="grid gap-4 md:grid-cols-2">
          {campaigns
            .filter((c) => c.status === "Active")
            .map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
  <Card className="border rounded-lg overflow-hidden">
    <CardContent className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{campaign.name}</h3>
          <p className="text-muted-foreground mt-1">{campaign.description}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            campaign.status === "Active"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {campaign.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <span className="text-sm">Total Amount</span>
          </div>
          <p className="text-lg font-medium">Rs.{campaign.totalAmount}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Created</span>
          </div>
          <p className="text-sm">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Tag className="h-4 w-4" />
          <span className="text-sm">Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {campaign.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4">
      <Link href={`/campaigns/${campaign.id}`}>
        <Button variant="default" className="w-full bg-black text-white">
          View Details
        </Button>
      </Link>
      <Button
        variant="outline"
        className="bg-black text-white"
      >
        <Link href={`/drafts/${campaign.id}`}>Pay To Publish</Link>
      </Button>
      </div>
    </CardContent>
  </Card>
);

export default CampaignList;
