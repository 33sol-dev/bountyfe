import Image from "next/image";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen w-screen flex bg-maindark01">
        <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="w-[80%] sm:w-[53%]">
                {children}
            </div>
        </div>
      
      {/* Right Side */}
      <div className="h-full w-[46vw] relative sm:flex items-center justify-center hidden">
        <div className="absolute h-full w-full z-10">
          <Image
            src="/images/bg.jpg"
            alt="Wave Logo"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-11 relative z-20">
          <div className="w-[50vw] h-[50vh] relative">
            <Image
              src="/images/logo.jpeg"
              alt="Wave"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
