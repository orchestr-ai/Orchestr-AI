import React, { useEffect, useState } from "react";
import Image from "next/image";
import FinalOutput from "./FinalOutput";
import Plans from "./PlanRender";
import { ethers } from "ethers";
import { Send } from "lucide-react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { sendFundsToEscrow } from "~~/app/utils";
import { NGROK_BASE_URL } from "~~/services/api";
import { IOutput, IPlan, IServerExecutionPlan } from "~~/type";

const HeroSection = () => {
  const { address } = useAccount();
  const [displayText, setDisplayText] = useState("");
  const [prompt, setPrompt] = useState("");
  const productName = "ORCHESTR.AI";
  const [promptExecuted, setPromptExecuted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [finalOutputData, setFinalOutputData] = useState<IOutput[] | undefined>(undefined);

  const [plan, setPlan] = useState<IPlan[] | undefined>(undefined);
  const [promptMetadataURI, setPromptMetadataURI] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= productName.length) {
        setDisplayText(productName.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, []);

  const handlePromptChange = (e: any) => {
    setPrompt(e.target.value);
  };

  const handleSendPrompt = async () => {
    if (prompt.trim()) {
      setIsLoading(true);
      try {
        const data = await fetch(`${NGROK_BASE_URL}/prompt/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });
        const response = await data.json();
        const plan = response.quotes;
        setPlan(plan);
        setPromptMetadataURI(response.promptMetadataBlobId);
        setPromptExecuted(true);
      } catch (err) {
        console.error(err);
        alert("An error occurred while processing your request. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = async (e: any) => {
    if (e.key === "Enter") {
      await handleSendPrompt();
    }
  };

  const onAccept = async () => {
    if (promptMetadataURI === undefined || !plan?.length) return;
    const randomString = Math.random().toString(36).substring(7);
    // make a contract call
    const agentAddresses = plan.map((p: IPlan) => p.agentAddress);
    const amounts = plan.map((p: IPlan) => parseEther(p.agentPrice.toString()));
    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const res = await sendFundsToEscrow({
        agentAddresses: agentAddresses,
        amounts: amounts,
        jobID: randomString,
        promptMetadataURI: promptMetadataURI,
        totalAmount: plan.reduce((acc, plan) => acc + plan.agentPrice, 0),
        address: address,
        signer: signer,
      });

      if (!res) {
        alert("Transaction failed. Please try again.");
        return;
      }
      const serverSerializedData: IServerExecutionPlan[] = [];
      plan.forEach((p: IPlan) => {
        serverSerializedData.push({
          agentAddress: p.agentAddress,
          agentDescription: p.agentDescription,
          agentImage: p.agentImage,
          agentName: p.agentName,
          agentPrice: p.agentPrice,
          agentPrompt: p.agentPrompt,
          agentUrl: p.apiUrl,
        });
      });
      const response = await fetch(`${NGROK_BASE_URL}/prompt/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId: randomString, data: serverSerializedData }),
      });

      const finalData = await response.json();
      const outputSerializedData: IOutput[] = [];

      finalData?.outputs?.forEach((output: any) => {
        const serializedOutput: IOutput = {
          agentAddress: output.agentAddress,
          response: output.response,
          prompt: output.prompt,
          attestationId: output.attestationId,
          score: output.score,
          agentPrice: output.agentPrice,
        };
        outputSerializedData.push(serializedOutput);
      });

      setTxHash(finalData.txHash);

      setFinalOutputData(outputSerializedData);
    } catch (err) {
      console.error(err);
      alert("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const loading = isLoading || (plan && plan.length <= 0) || promptExecuted;
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="bg-black flex items-center justify-center p-4 w-4xl" style={{ width: "800px" }}>
        <div className="w-full">
          {/* Logo and Title Container */}
          {!loading && (
            <div className="flex flex-col items-center justify-center space-x-6 mb-6">
              <Image
                src="/logo.gif"
                alt="ORCHSTR.AI Assistant"
                className="object-cover rounded-full"
                width={350}
                height={350}
              />

              <h1 className="text-6xl font-extrabold h-16">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 text-transparent bg-clip-text">
                  {displayText}
                </span>
              </h1>
            </div>
          )}

          {/* Input Bar Section */}
          <div className="w-full mx-auto mt-8">
            <div className="relative w-full">
              <input
                type="text"
                disabled={loading}
                value={prompt}
                onChange={handlePromptChange}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full pl-6 pr-36 py-4 bg-gray-800/70 border border-gray-700/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition duration-300 ease-in-out"
              />
              <button
                disabled={loading}
                onClick={handleSendPrompt}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out border border-purple-500/30 hover:border-purple-500/50 flex items-center space-x-2"
              >
                <span>Send</span>
                <Send size={18} className="ml-2" />
              </button>
            </div>
          </div>

          {!loading && (
            <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-8">
              Orchestrate your AI workflows with unprecedented intelligence and seamless coordination.
            </p>
          )}

          {isLoading && (
            <div className="flex w-4xl flex-col gap-4 my-4">
              <div className="skeleton h-32 w-full"></div>
              <div className="skeleton h-4 w-28"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
            </div>
          )}
          {plan && plan.length > 0 && !finalOutputData && !isLoading && (
            <Plans
              plans={plan}
              onReject={() => {
                setPromptExecuted(false);
                setIsLoading(false);
                setPlan(undefined);
                setPrompt("");
              }}
              onAccept={onAccept}
            />
          )}
          {finalOutputData && finalOutputData.length > 0 && <FinalOutput output={finalOutputData} txHash={txHash} />}
          {/* Subtle Background Effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
