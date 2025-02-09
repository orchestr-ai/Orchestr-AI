import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpTool, CdpToolkit } from "@coinbase/cdp-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import { z } from "zod";
import {
  getDetailsFromRepo,
  updateTitleAndCreatePR,
} from "./github_interaction.js";

// Define the input schema using Zod
export const GetGithubRepoContentInput = z
  .object({
    repo_url: z
      .string()
      .describe(
        "The url of the github repo. e.g. `https://github.com/coinbase/cdp-agentkit-core`"
      ),
  })
  .strip()
  .describe("Instructions for getting the content of a github repo");

// Define the input schema using Zod
export const UpdateContentAndCreatePRInput = z
  .object({
    repo_url: z
      .string()
      .describe(
        "The url of the github repo. e.g. `https://github.com/coinbase/cdp-agentkit-core`"
      ),
    newContent: z.string().describe("The new content of the file"),
  })
  .strip()
  .describe("Updated content of a file and creating a PR");

dotenv.config();

/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
function validateEnvironment() {
  const missingVars = [];

  // Check required variables
  const requiredVars = [
    "OPENAI_API_KEY",
    "CDP_API_KEY_NAME",
    "CDP_API_KEY_PRIVATE_KEY",
  ];
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Exit if any required variables are missing
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  // Warn about optional NETWORK_ID
  if (!process.env.NETWORK_ID) {
    console.warn(
      "Warning: NETWORK_ID not set, defaulting to base-sepolia testnet"
    );
  }
}

// Add this right after imports and before any other code
validateEnvironment();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE_1 = "wallet_data_1.txt";

export async function initializeAgent1() {
  try {
    // Initialize LLM with xAI configuration
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    let walletDataStr = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE_1)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE_1, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data
      }
    }

    // Configure CDP Agentkit
    const config = {
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    // Initialize CDP agentkit
    const agentkit = await CdpAgentkit.configureWithWallet(config);

    // Initialize CDP Agentkit Toolkit and get tools
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    const getGithubRepoContentTool = new CdpTool(
      {
        name: "get_github_repo_content",
        description: "Get the content of a github repo",
        argsSchema: GetGithubRepoContentInput,
        func: getDetailsFromRepo,
      },
      agentkit
    );
    tools.push(getGithubRepoContentTool);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "CDP Agentkit Chatbot Example!" },
    };

    // Create React Agent using the LLM and CDP Agentkit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier:
        "You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet if you are on network ID `base-sepolia`. If not, you can provide your wallet details and request funds from the user. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested. Fetch content from public github repos.",
    });

    // Save wallet data
    const exportedWallet = await agentkit.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE_1, exportedWallet);

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}

const WALLET_DATA_FILE_2 = "wallet_data_2.txt";
export async function initializeAgent2() {
  try {
    // Initialize LLM with xAI configuration
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    let walletDataStr = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE_2)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE_2, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data
      }
    }

    // Configure CDP Agentkit
    const config = {
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    // Initialize CDP agentkit
    const agentkit = await CdpAgentkit.configureWithWallet(config);

    // Initialize CDP Agentkit Toolkit and get tools
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    const raisePRTool = new CdpTool(
      {
        name: "update_content_and_create_pr",
        description: "Update the content of a file and create a PR",
        argsSchema: UpdateContentAndCreatePRInput,
        func: updateTitleAndCreatePR,
      },
      agentkit
    );
    tools.push(raisePRTool);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "CDP Agentkit Chatbot Example!" },
    };

    // Create React Agent using the LLM and CDP Agentkit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier:
        "You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet if you are on network ID `base-sepolia`. If not, you can provide your wallet details and request funds from the user. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested. You can update the content of a file and create a PR.",
    });

    // Save wallet data
    const exportedWallet = await agentkit.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE_2, exportedWallet);

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}
