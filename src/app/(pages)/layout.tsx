"use client";

import Sidebar from "@/components/layouts/Sidebar";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  // Uncomment when ready to use
  // const { user, subscribed, loading } = useAppSelector((state) => state.auth);

  const [isMounted, setIsMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-screen min-h-screen overflow-hidden flex text-black items-start">
      <Sidebar openSidebar={sidebarOpen} setOpenSidebar={setSidebarOpen} />
      <main className="flex flex-col flex-1 overflow-hidden h-screen">
        <div className="flex-1 overflow-auto mt-14 sm:mt-0">
          {isMobile && (
            <div className="w-full flex px-2 pb-2 fixed top-2 left-0 z-[999] items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 ml-[19rem] bg-gray-800 rounded-md focus:outline-none"
              >
                {sidebarOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
              </button>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
