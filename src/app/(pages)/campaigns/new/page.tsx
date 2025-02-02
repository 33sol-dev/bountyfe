"use client";
import React from "react";
import { QrCode, FileSpreadsheet } from "lucide-react";
import CreateCampaignForm from "@/components/Tasks";
import CreateExcelCampaign from "@/components/Excel";
import TaskForm from "@/components/Tasks";
import Payments from "@/components/Payments";
import Promoter from "@/components/Promoter";

const SwitchComponent = () => {
  const [activeTab, setActiveTab] = React.useState("product");

  return (
    <div className="w-full max-w-7.3xl ">
      <div className="flex p-4 rounded-lg">
        <button
          onClick={() => setActiveTab("product")}
          className={`flex items-center gap-2 px-4 rounded-md text-base font-medium transition-colors ${
            activeTab === "product"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-black"
          }`}
        >
          <QrCode size={20} />
          Payment
        </button>
        <button
          onClick={() => setActiveTab("task")}
          className={`flex items-center gap-2 px-4 py-1 rounded-md text-base font-medium transition-colors ${
            activeTab === "task"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-black "
          }`}
        >
          <FileSpreadsheet size={20} />
          Tasks
        </button>
        <button
          onClick={() => setActiveTab("sample")}
          className={`flex items-center gap-2 px-4 py-1 rounded-md text-base font-medium transition-colors ${
            activeTab === "sample"
              ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9] text-white"
              : "text-black "
          }`}
        >
          <FileSpreadsheet size={20} />
          Promoter
        </button>
      </div>

      <div className=" rounded-lg">
        {activeTab === "product" ? (
          <div className="text-gray-200">
            <Payments activeTab={activeTab} />
          </div>
        ) : activeTab === "task" ? (
          <div className="text-gray-200">
            <TaskForm activeTab={activeTab} />
          </div>
        ) : activeTab === "sample" ? (
          <div className="text-gray-200">
            <Promoter activeTab={activeTab}/>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SwitchComponent;
