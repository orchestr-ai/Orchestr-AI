"use client";

import React from "react";
import Link from "next/link";
import {
  // FaucetButton,
  RainbowKitCustomConnectButton,
} from "~~/components/scaffold-eth";

interface IHeaderProps {
  hideReg: boolean;
  hideView: boolean;
}
export const Header = ({ hideReg, hideView }: IHeaderProps) => {
  return (
    <div className="w-full flex justify-between py-6 px-16">
      <div className="flex flex-row gap-x-10 items-center w-1/2">
        <Link href={"/"} className="text-lg text-gray-200 hover:text-white transition-colors duration-300">
          ORCHESTR.AI
        </Link>
        {!hideReg && (
          <Link
            href={"/register-agent"}
            className="text-lg text-gray-200 hover:text-white transition-colors duration-300"
          >
            Register Agent
          </Link>
        )}
        {!hideView && (
          <Link
            href={"/agent-dashboard"}
            className="text-lg text-gray-200 hover:text-white transition-colors duration-300"
          >
            View Agents
          </Link>
        )}
      </div>
      <div className="flex flex-row gap-x-10 items-center">
        {/* <WalletDefault /> */}
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
