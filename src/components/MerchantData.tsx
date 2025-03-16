"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Download,
  Trash2,
  Pause,
  Play,
  EditIcon,
} from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MerchantData {
  _id: string;
  merchantName: string;
  upiId: string;
  merchantMobile: string;
  merchantEmail: string;
  address: string;
  status: string;
  qrLink: string;
  [key: string]: string; 
  // Include any additional fields as needed
}

interface EditMerchantFormData {
  merchantName: string;
  upiId: string;
  merchantMobile: string;
  merchantEmail: string;
  address: string;
}

export default function MerchantCSVViewer() {
  const searchParams = useSearchParams();
  const campaignId = localStorage.getItem("campaignId");
  const [csvData, setCSVData] = useState<MerchantData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPausing, setIsPausing] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState<string | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditMerchantFormData>({
    merchantName: "",
    upiId: "",
    merchantMobile: "",
    merchantEmail: "",
    address: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchMerchantCSV = async () => {
    if (!campaignId) {
      setError("Campaign ID is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}/merchants/csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch merchant data");
      }

      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        complete: (results: any) => {
          if (results.data.length > 0) {
            const allHeaders = Object.keys(results.data[0]);
            const displayHeaders = allHeaders.filter(
              (header) => header !== "_id"
            );
            setHeaders(displayHeaders);
            setCSVData(results.data as MerchantData[]);
          }
        },
        error: (error: any) => {
          toast.error(`Failed to parse CSV: ${error.message}`);
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch merchant data");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = async () => {
    if (!campaignId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/campaigns/${campaignId}/merchants/csv`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merchants-${campaignId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      toast.error(err.message || "Failed to download CSV");
    }
  };

  const deleteMerchant = async (merchantId: string) => {
    if (!merchantId || !campaignId) return;

    setIsDeleting(merchantId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/merchant/${merchantId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete merchant");
      }

      // Remove the deleted merchant from the state
      setCSVData((prevData) =>
        prevData.filter((row) => row._id !== merchantId)
      );
      toast.success("Merchant deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete merchant");
    } finally {
      setIsDeleting(null);
    }
  };

  const updateMerchantStatus = async (merchantId: string, status: string) => {
    if (!merchantId || !campaignId) return;

    if (status === "paused") {
      setIsPausing(merchantId);
    } else if (status === "active") {
      setIsActivating(merchantId);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/merchant/update-merchant/${merchantId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${status === "paused" ? "pause" : "activate"} merchant`
        );
      }

      // Update the status in the local state
      setCSVData((prevData) =>
        prevData.map((row) =>
          row._id === merchantId ? { ...row, status } : row
        )
      );
      toast.success(
        `Merchant ${status === "paused" ? "paused" : "activated"} successfully`
      );
    } catch (err: any) {
      toast.error(
        err.message ||
          `Failed to ${status === "paused" ? "pause" : "activate"} merchant`
      );
    } finally {
      if (status === "paused") {
        setIsPausing(null);
      } else if (status === "active") {
        setIsActivating(null);
      }
    }
  };

  const pauseMerchant = (merchantId: string) => {
    updateMerchantStatus(merchantId, "paused");
  };

  const activateMerchant = (merchantId: string) => {
    updateMerchantStatus(merchantId, "active");
  };

  const openEditModal = (merchantId: string) => {
    const merchant = csvData.find((row) => row._id === merchantId);
    if (merchant) {
      setSelectedMerchant(merchantId);
      setEditFormData({
        merchantName: merchant.merchantName || "",
        upiId: merchant.upiId || "",
        merchantMobile: merchant.merchantMobile || "",
        merchantEmail: merchant.merchantEmail || "",
        address: merchant.address || "",
      });
      setEditModalOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveEditedMerchant = async () => {
    if (!selectedMerchant || !campaignId) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BOUNTY_URL}/api/merchant/update-merchant/${selectedMerchant}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            merchantName: editFormData.merchantName,
            upiId: editFormData.upiId,
            merchantMobile: editFormData.merchantMobile,
            merchantEmail: editFormData.merchantEmail,
            address: editFormData.address,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update merchant");
      }

      // Update the merchant data in the local state
      setCSVData((prevData) =>
        prevData.map((row) =>
          row._id === selectedMerchant
            ? {
                ...row,
                merchantName: editFormData.merchantName,
                upiId: editFormData.upiId,
                merchantMobile: editFormData.merchantMobile,
                merchantEmail: editFormData.merchantEmail,
                address: editFormData.address,
              }
            : row
        )
      );

      toast.success("Merchant updated successfully");
      setEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update merchant");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchMerchantCSV();
  }, [campaignId]);

  if (!campaignId) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>Campaign ID is required</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-[80vw] px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Merchant Data</h2>
        <Button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead
                    key={header}
                    className={header === "qrLink" ? "max-w-xs" : ""}
                  >
                    {header}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell
                      key={`${index}-${header}`}
                      className={
                        header === "qrLink" ? "max-w-xs break-all" : ""
                      }
                    >
                      {header === "merchantName" ? (
                        <div className="flex items-center gap-2">
                          {row.merchantName}
                          {row.status === "paused" && (
                            <Badge
                              variant="outline"
                              className="bg-gray-200 text-gray-700"
                            >
                              Paused
                            </Badge>
                          )}
                        </div>
                      ) : header === "qrLink" ? (
                        <div className="max-w-xs overflow-hidden break-words py-2">
                          {row.qrLink}
                        </div>
                      ) : (
                        row[header]
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      {row.status === "paused" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateMerchant(row._id)}
                          disabled={isActivating === row._id}
                          className="bg-black text-white border-none"
                        >
                          {isActivating === row._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pauseMerchant(row._id)}
                          disabled={isPausing === row._id}
                          className="bg-black text-white border-none"
                        >
                          {isPausing === row._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(row._id)}
                        className="bg-black text-white border-none"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMerchant(row._id)}
                        className="bg-black text-white"
                        disabled={isDeleting === row._id}
                      >
                        {isDeleting === row._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Merchant</DialogTitle>
            <DialogDescription>
              Update the merchant information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchantName" className="text-right">
                Merchant Name
              </Label>
              <Input
                id="merchantName"
                name="merchantName"
                value={editFormData.merchantName}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="upiId" className="text-right">
                UPI ID
              </Label>
              <Input
                id="upiId"
                name="upiId"
                value={editFormData.upiId}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchantMobile" className="text-right">
                Mobile
              </Label>
              <Input
                id="merchantMobile"
                name="merchantMobile"
                value={editFormData.merchantMobile}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merchantEmail" className="text-right">
                Email
              </Label>
              <Input
                id="merchantEmail"
                name="merchantEmail"
                value={editFormData.merchantEmail}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                value={editFormData.address}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveEditedMerchant}
              disabled={isSaving}
              className="bg-black text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
