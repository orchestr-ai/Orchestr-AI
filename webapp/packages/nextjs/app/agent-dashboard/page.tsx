"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IAgent } from "./type";
import { serializeAgents } from "./utils";
import { useAccount, useSignMessage } from "wagmi";
import Button from "~~/components/Button";
import { NGROK_BASE_URL } from "~~/services/api";

const AIAgentDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState<IAgent | undefined>(undefined);
  const [agents, setAgents] = useState<IAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleWithDrawMessage = async () => {
    const agent = selectedAgent;
    if (agent != null) {
      const signature = await signMessageAsync({
        message: `Extract funds from ${agent.address}`,
        account: address,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

      console.log(`signature is ${signature}`);
      const body = {
        agentAddress: agent.address,
        userAddress: address,
        signature: signature,
      };

      const res = await fetch(`${NGROK_BASE_URL}/agents/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.log("failedddd");
      }

      const data = await res.json();
      console.log("Withdraw successful:", data);
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      if (!address) return;
      try {
        const res = await fetch(`${NGROK_BASE_URL}/agents/get-agent/${address}`, {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });
        const data = await res.json();
        const serializedAgents = serializeAgents(data);
        setAgents(serializedAgents);
        setSelectedAgent(serializedAgents?.[0]);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch agents, Please refresh and retry");
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [address]);
  // List of agents (can be fetched from an API)
  // const agents = [
  //     { username: "agent_1", name: "Agent One" },
  //     { username: "agent_2", name: "Agent Two" },
  //     { username: "agent_3", name: "Agent Three" },
  //     // Add more agents here
  // ];

  return !loading ? (
    <div className="w-full h-full flex">
      {/* Sidebar (left part) */}
      <div className="w-1/4 p-4 text-white flex flex-col items-start space-y-4">
        <h3 className="text-xl font-semibold">Your Agents</h3>
        {agents.map((agent, index) => (
          <div
            key={index}
            className={`cursor-pointer w-full hover:bg-purple-600/40 p-2 flex flex-row rounded-lg ${selectedAgent && selectedAgent.username === agent.username ? "bg-purple-600/80" : ""}`}
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex flex-row h-full w-full items-center justify-between">
              <div className="flex flex-row h-full items-center">
                <Image
                  src="https://img.freepik.com/premium-photo/friendly-looking-ai-agent-as-logo-white-background-style-raw-job-id-ef2c5ef7e19b4dadbef969fcb37e_343960-69677.jpg"
                  alt="ORCHSTR.AI Assistant"
                  className="object-cover rounded-full"
                  width={30}
                  height={30}
                />
                {/* Agent Name */}
                <div>
                  <div className="text-white font-semibold ml-2">{agent.username}</div>
                </div>
              </div>
              <div className="text-white font-semibold">{parseFloat(agent.balance).toFixed(6)} ETH</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right part: Agent details */}
      <div className="flex-1 h-full w-3/4 bg-purple-600/10 rounded-lg shadow-lg relative">
        {selectedAgent ? (
          <div className="flex flex-col">
            <div className="flex flex-row justify-between mt-3 ml-3">
              <div className="flex flex-row h-full w-3/4 items-center justify-start">
                <Image
                  src="https://img.freepik.com/premium-photo/friendly-looking-ai-agent-as-logo-white-background-style-raw-job-id-ef2c5ef7e19b4dadbef969fcb37e_343960-69677.jpg"
                  alt="ORCHSTR.AI Assistant"
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%" }}
                  objectFit="contain"
                />
                <div className="flex flex-col items-start justify-start">
                  <div className="text-white text-sm font-bold mx-5">{selectedAgent.username}</div>
                  <div className="text-green-300 mx-5 font-bold mt-1 text-sm">Healthy</div>
                </div>
              </div>
            </div>

            <div className="text-center flex flex-col justify-center items-center mt-10">
              <div className="text-3xl font-extrabold h-16 text-white mt-10">Your Agents Current Wallet Balance </div>
              <div className="text-8xl font-extrabold h-16 text-white mt-5">
                {parseFloat(selectedAgent.balance).toFixed(4)} ETH
              </div>
              {/* <div className="text-8xl font-extrabold h-16 text-white mt-10">ETH</div> */}
              <div className="w-1/2 flex justify-center items-center mt-20">
                <Button
                  type="submit"
                  style={{
                    width: "300px",
                    height: "40px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  }}
                  onClick={handleWithDrawMessage}
                >
                  Withdraw Funds From Agent
                </Button>
              </div>
            </div>

            <div className="text-3xl font-extrabold h-16 text-white ml-10 mt-10">On going Tasks </div>
            <div className="mx-10 mb-5">
              <div className="cursor-pointer w-full p-2 flex flex-row rounded-lg bg-purple-600/10 p-10">
                <div className="flex flex-row w-full items-center justify-between">
                  <div className="flex flex-row h-full items-center space-x-5">
                    <Image
                      src="/logo.gif"
                      alt="ORCHSTR.AI Assistant"
                      className="object-cover rounded-full"
                      width={50}
                      height={50}
                    />
                    {/* Agent Name */}
                    <div className="flex flex-col">
                      <div className="text-white font-semibold">Task 1</div>
                      <div className="text-green-300 font-semibold">Completed</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Started By : 0xDE5E8af298722f813AC2693Dd3c66c1FA49568cA
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-10 mb-5">
              <div className="cursor-pointer w-full p-2 flex flex-row rounded-lg bg-purple-600/10 p-10">
                <div className="flex flex-row w-full items-center justify-between">
                  <div className="flex flex-row h-full items-center space-x-5">
                    <Image
                      src="/logo.gif"
                      alt="ORCHSTR.AI Assistant"
                      className="object-cover rounded-full"
                      width={50}
                      height={50}
                    />
                    {/* Agent Name */}
                    <div className="flex flex-col">
                      <div className="text-white font-semibold">Task 2</div>
                      <div className="text-orange-300 font-semibold">In Progress</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Started By : 0xDE5E8af298722f813AC2693Dd3c66c1FA49568cA
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-10 mb-5">
              <div className="cursor-pointer w-full p-2 flex flex-row rounded-lg bg-purple-600/10 p-10">
                <div className="flex flex-row w-full items-center justify-between">
                  <div className="flex flex-row h-full items-center space-x-5">
                    <Image
                      src="/logo.gif"
                      alt="ORCHSTR.AI Assistant"
                      className="object-cover rounded-full"
                      width={50}
                      height={50}
                    />
                    {/* Agent Name */}
                    <div className="flex flex-col">
                      <div className="text-white font-semibold">Task 3</div>
                      <div className="text-red-300 font-semibold">Rejected</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Started By : 0xDE5E8af298722f813AC2693Dd3c66c1FA49568cA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-center text-white h-full w-full">
            <h2 className="text-2xl font-semibold">Select an Agent to View Details</h2>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex w-3/4 flex-col gap-4 my-4">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    </div>
  );
};

export default AIAgentDashboard;
