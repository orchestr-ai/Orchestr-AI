import express from "express";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { handleRequest } from "./utils.js";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Create a new Coinbase instance
const coinbase = new Coinbase({
  apiKeyName: process.env.CDP_API_KEY_NAME,
  privateKey: process.env.CDP_API_KEY_PRIVATE_KEY.replaceAll("\\n", "\n"),
});
let userWallet;

let WALLET_DATA = "";
if (fs.existsSync("wallet_data.txt")) {
  WALLET_DATA = fs.readFileSync("wallet_data.txt", "utf8");
}

// Check if the wallet data is provided
if (WALLET_DATA && WALLET_DATA?.length > 0) {
  try {
    // Parse the wallet data
    const seedFile = JSON.parse(WALLET_DATA || "{}");

    // Get the wallet ids from the seed file. The seed file is a JSON object with wallet ids as keys.
    const walletIds = Object.keys(seedFile);

    // Get a random wallet id
    const walletId = getRandomItems(walletIds, 1)[0];

    // Get the seed of the wallet
    const seed = seedFile[walletId]?.seed;

    // Import the wallet
    userWallet = await Wallet.import({ seed, walletId });
    await userWallet.listAddresses();
  } catch (e) {
    console.error({ message: "Failed to import wallet" }, { status: 500 });
  }
} else {
  // Otherwise, create a new wallet
  userWallet = await Wallet.create();
  fs.writeFileSync("wallet_data.txt", JSON.stringify(userWallet));
}

console.log("Wallet created/fetched", userWallet);

const app = express();
app.use(express.json());

const CONSTANTS = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  PORT: process.env.PORT || 3000,
};

app.get("/api", (req, res) => {
  res.send("Hello World");
});

app.post("/api", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    userWallet?.faucet();

    // Handle the request
    await handleRequest(input);

    if (
      fs.existsSync("wallet_data_1.txt") &&
      fs.existsSync("wallet_data_2.txt")
    ) {
      const agent1Address = JSON.parse(
        fs.readFileSync("wallet_data_1.txt", "utf8")
      ).defaultAddressId;
      const transfer1 = await userWallet?.createTransfer({
        amount: 0.0001,
        assetId: "eth",
        destination: agent1Address,
      });
      await transfer1.wait();

      const agent2Address = JSON.parse(
        fs.readFileSync("wallet_data_2.txt", "utf8")
      ).defaultAddressId;
      const transfer2 = await userWallet?.createTransfer({
        amount: 0.0002,
        assetId: "eth",
        destination: agent2Address,
      });
      await transfer2.wait();
    }

    return res.json({
      response: "PR created successfully",
      timeTaken: 0,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(CONSTANTS.PORT, () => {
  console.log(`Server running on port ${CONSTANTS.PORT}`);
});
