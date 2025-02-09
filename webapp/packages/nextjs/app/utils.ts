import { ABI, ADDRESS } from "./contract/constants";
import { ethers } from "ethers";
import { parseEther } from "viem";

interface ISendFundsToUser {
  jobID: string;
  agentAddresses: string[];
  amounts: bigint[];
  promptMetadataURI: string;
  totalAmount: number;
  signer: any;
  address?: string;
}

export const sendFundsToEscrow = async ({
  agentAddresses,
  amounts,
  jobID,
  promptMetadataURI,
  totalAmount,
  address,
  signer,
}: ISendFundsToUser) => {
  if (!address) return;
  const contract = new ethers.Contract(ADDRESS, ABI, signer);

  const result = await contract.acceptFunds(jobID, agentAddresses, amounts, promptMetadataURI, {
    value: parseEther(totalAmount.toString()),
  });

  return result;
};
