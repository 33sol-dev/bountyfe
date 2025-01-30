"use client"
import React from 'react';
import { QrCode, FileSpreadsheet } from 'lucide-react';
import CreateCampaignForm from '@/components/Qr';
import CreateExcelCampaign from '@/components/Excel';

const SwitchComponent = () => {
  const [activeTab, setActiveTab] = React.useState("qr");
  
  return (
    <div className="w-full max-w-7.3xl ">
      <div className="flex p-4 rounded-lg">
        <button
          onClick={() => setActiveTab("qr")}
          className={`flex items-center gap-2 px-4 rounded-md text-base font-medium transition-colors ${
            activeTab === "qr"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <QrCode size={20} />
          QR
        </button>
        <button
          onClick={() => setActiveTab("excel")}
          className={`flex items-center gap-2 px-4 py-1 rounded-md text-base font-medium transition-colors ${
            activeTab === "excel"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FileSpreadsheet size={20} />
          Excel
        </button>
      </div>
      
      <div className=" rounded-lg">
        {activeTab === "qr" ? (
          <div className="text-gray-200">
            <CreateCampaignForm />
          </div>
        ) : (
          <div className="text-gray-200">
            <CreateExcelCampaign />
          </div>
        )}
      </div>
    </div>
  );
};

export default SwitchComponent;