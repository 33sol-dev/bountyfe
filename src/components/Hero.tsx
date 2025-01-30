import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <div className="text-white">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <h1 className={`text-7xl md:text-7xl font-bold text-black font-bree`}>
              BOUNTY
            </h1>
            <p className="text-lg text-gray-600 max-w-xl">
            Where incentives inspire and engagement leads to extraordinary success.
            </p>
            <div className="flex gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center">
              <Image src={"/images/logo.jpeg"} alt="Hero Image" width={500} height={500} className='ml-60'/>
            </div>
          </div>
        </div>
      </div>
  );
};

export default HeroSection;