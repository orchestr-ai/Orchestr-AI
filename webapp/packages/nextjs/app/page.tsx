"use client";

import Image from "next/image";
import { SPONSORS } from "./constants";
import type { NextPage } from "next";
import HeroSection from "~~/components/Hero";

const Home: NextPage = () => {
  return (
    <>
      <HeroSection />
      <div className="w-full flex justify-center items-center mb-10">
        <div className="w-full flex flex-row gap-x-2 justify-center items-center mb-4">
          <div className="text-lg text-gray-600 text-center">Powered By</div>
          {SPONSORS.map(sponsor => (
            <div key={sponsor} className="flex items-center justify-center space-x-2">
              <Image src={sponsor} alt={"sponsor"} width={35} height={35} style={{ borderRadius: 20 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
