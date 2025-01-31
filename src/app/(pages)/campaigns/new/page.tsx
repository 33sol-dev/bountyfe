"use client"
import React from 'react';
import { QrCode, FileSpreadsheet } from 'lucide-react';
import CreateCampaignForm from '@/components/Tasks';
import CreateExcelCampaign from '@/components/Excel';
import TaskForm from '@/components/Tasks';
import Payments from '@/components/Payments';
import Promoter from '@/components/Promoter';

const SwitchComponent = () => {
  const [activeTab, setActiveTab] = React.useState("payment");
  
  return (
    <div className="w-full max-w-7.3xl ">
      <div className="flex p-4 rounded-lg">
        <button
          onClick={() => setActiveTab("payment")}
          className={`flex items-center gap-2 px-4 rounded-md text-base font-medium transition-colors ${
            activeTab === "payment"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-black hover:text-white"
          }`}
        >
          <QrCode size={20} />
          Payment
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 px-4 py-1 rounded-md text-base font-medium transition-colors ${
            activeTab === "tasks"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-black hover:text-white"
          }`}
        >
          <FileSpreadsheet size={20} />
          Tasks
        </button>
        <button
          onClick={() => setActiveTab("promoter")}
          className={`flex items-center gap-2 px-4 py-1 rounded-md text-base font-medium transition-colors ${
            activeTab === "promoter"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-black hover:text-white"
          }`}
        >
          <FileSpreadsheet size={20} />
          Promoter
        </button>
      </div>
      
      <div className=" rounded-lg">
        {activeTab === "payment" ? (
          <div className="text-gray-200">
            <Payments />
          </div>
        ) : ( activeTab === "tasks" ? (
          <div className="text-gray-200">
            <TaskForm />
          </div>
        ) : (
          <div className="text-gray-200">
            <Promoter />
          </div>
        )
        )}
      </div>
    </div>
  );
};

export default SwitchComponent;