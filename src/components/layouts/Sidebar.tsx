"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from 'next-auth/react'

const Sidebar = ({
  openSidebar,
  setOpenSidebar,
}: {
  openSidebar: boolean;
  setOpenSidebar: (value: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false);

  const router = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: "/svgs/home.svg", href: "/dashboard" },
    { name: "Campaigns", icon: "/svgs/profile.svg", href: "/campaigns" },
    { name: "Draft Campaigns", icon: "/svgs/notepad.svg", href: "/drafts" },
    { name: "Recharge", icon: "/svgs/handCoins.svg", href: "/recharge" },
    { name: "Notification", icon: "/svgs/message.svg", href: "/notifications" },
  ];

  useEffect(() => {
    setIsOpen(openSidebar);
  }, [openSidebar]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/sign-in";  
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      if (session?.user?.image?.includes('googleusercontent')) {
        await signOut({ callbackUrl: '/sign-in' })
      } else {
        logout()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`
        fixed lg:static inset-y-0 left-0 z-[100]
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        flex flex-col h-screen w-56 bg-[#1D2129] text-white py-4 shadow-lg mr-3
        border-r-4 border-transparent
      `}
      style={{ boxShadow: "3px 4px 35px 0px rgba(115, 113, 252, 0.10)" }}
    >
      <div className="px-4 w-full flex-1 flex flex-col justify-between items-center">
        <div className="w-full">
          <nav className="flex-grow mt-16">
            {menuItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                onClick={() => setOpenSidebar(false)}
              >
                <div
                  className={`
                    flex items-center p-3 h-12 box-border mb-2 gap-6 rounded-lg 
                    text-white cursor-pointer transition-colors duration-200
                    ${router === item.href 
                      ? "bg-gradient-to-r from-[#7371FC] to-[#A594F9]"
                      : "bg-[#1D2129]"
                    }
                  `}
                >
                  <Image
                    src={item.icon}
                    width={24}
                    height={24}
                    alt={item.name}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#FFFFFF1A] mb-2"></div>

      <div className="w-full px-4">
        <Link href="/settings" onClick={() => setOpenSidebar(false)}>
          <div
            className={`
              flex items-center p-3 h-12 mb-2 gap-6 rounded-lg 
              bg-[#1D2129] text-white cursor-pointer
              hover:bg-gradient-to-r hover:from-[#7371FC] hover:to-[#A594F9]
              transition-all duration-200
            `}
          >
            <Image
              src="/svgs/setting.svg"
              width={24}
              height={24}
              alt="Settings"
            />
            <span className="text-sm">User Settings</span>
          </div>
        </Link>
        
        <div
          className={`
            flex items-center p-3 h-12 mb-2 gap-6 rounded-lg 
            bg-[#1D2129] text-white cursor-pointer
            hover:bg-gradient-to-r hover:from-[#7371FC] hover:to-[#A594F9]
            transition-all duration-200
          `}
          onClick={() => {
            setOpenSidebar(false);
            handleLogout();
          }}
        >
          <Image
            src="/svgs/logout.svg"
            width={24}
            height={24}
            alt="Logout"
          />
          <span className="text-sm">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;