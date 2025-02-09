import { Injectable } from '@nestjs/common';
import {
  AgentDto,
  AgentMetadata,
  CreateAgentDto,
  FullAgentDto,
} from './dto/create-agent.dto';
import {
  Wallet as CoinbaseWallet,
  Coinbase,
  readContract,
} from '@coinbase/coinbase-sdk';
import { CONSTANTS } from 'src/utils/constants';
import { OrchestratorAbi } from 'src/utils/orchestrator-abi';
import { ethers } from 'ethers';
import { ExtractFundsDto } from './dto/extract-funds.dto';
import { WalrusService } from 'src/walrus/walrus.service';
import { LitProtocolService } from 'src/lit-protocol/lit-protocol.service';

const CONTRACT_ADDRESS = '0xc97c268a00b2058c859C5cC3D148723a5cf69948';

@Injectable()
export class AgentsService {
  constructor(
    private readonly walrusService: WalrusService,
    private readonly litprotocolService: LitProtocolService,
  ) {}

  async create(createAgentDto: CreateAgentDto) {
    const {
      agentDescription,
      agentImage,
      apiUrl,
      costPerOutputToken,
      userAddress,
      agentName,
      agentAddress: prefilledAgentAddress,
    } = createAgentDto;

    // return {
    //   agent: {
    //     agentAddress: '0x7181Cf608695c09158523469D3bCA24CC95e304E',
    //     blobId: 'Uh2u9XvOCiaQo2BX281AS03wqM6yPaEktfvWW9F3KQc',
    //     userAddress: '0x73b794FcA37Dc5951dcdb2674401C299f9775493',
    //   },
    //   hash: '0xa5c2f2756479792bc4e1deb48c8a72f35a57cfd08cb0f0b4dfbdf1506e5e7208',
    // };

    if (prefilledAgentAddress) {
      const agentData: AgentMetadata = {
        agentDescription,
        agentImage,
        apiUrl,
        costPerOutputToken,
        agentName,
      };

      const data = JSON.stringify(agentData);

      const blobId = await this.walrusService.upload(data);

      console.log('Blob ID:', blobId);

      const agent: AgentDto = {
        agentAddress: prefilledAgentAddress,
        blobId: blobId,
        userAddress: userAddress,
      };

      const provider = new ethers.JsonRpcProvider('https://sepolia.base.org	');
      const signer = new ethers.Wallet(
        CONSTANTS.MAIN_ADDRESS_PRIVATE_KEY,
        provider,
      );

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        OrchestratorAbi,
        signer,
      );

      console.log('agent', agent);

      const registerTx = await contract.registerAgent(
        prefilledAgentAddress,
        userAddress,
        blobId,
        {
          gasLimit: 3000000,
        },
      );

      console.log('Transaction sent:', registerTx.hash);

      const receipt = await registerTx.wait();
      console.log('Transaction mined:', receipt);

      return {
        agent: agent,
        hash: registerTx.hash,
      };
    }

    Coinbase.configure({
      apiKeyName: CONSTANTS.COINBASE_KEY_NAME,
      privateKey: CONSTANTS.COINBASE_KEY,
    });

    const wallet = await CoinbaseWallet.create();

    const address = await wallet.getDefaultAddress();

    const agentAddress = address.getId();

    const tx = await wallet.faucet();
    await tx.wait();

    console.log('Tx waited');

    await this.litprotocolService.encryptLit(
      agentAddress,
      JSON.stringify(wallet.export()),
    );

    const agentData: AgentMetadata = {
      agentDescription,
      agentImage,
      apiUrl,
      costPerOutputToken,
      agentName,
    };

    const data = JSON.stringify(agentData);

    const blobId = await this.walrusService.upload(data);

    console.log('Blob ID:', blobId);

    const agent: AgentDto = {
      agentAddress: agentAddress,
      blobId: blobId,
      userAddress: userAddress,
    };

    // const invocation = await wallet.invokeContract({
    //   contractAddress: CONTRACT_ADDRESS,
    //   method: 'registerAgent',
    //   args: {
    //     mpcWalletAddress: agentAddress,
    //     metadataId: agent.blobId,
    //     ownerAddress: userAddress,
    //   },
    //   abi: OrchestratorAbi,
    // });

    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org	');
    const signer = new ethers.Wallet(
      CONSTANTS.MAIN_ADDRESS_PRIVATE_KEY,
      provider,
    );

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      OrchestratorAbi,
      signer,
    );

    const registerTx = await contract.registerAgent(
      agentAddress,
      userAddress,
      blobId,
      {
        gasLimit: 3000000,
      },
    );

    console.log('Transaction sent:', registerTx.hash);

    const receipt = await registerTx.wait();
    console.log('Transaction mined:', receipt);

    // const newInvocation = await invocation.wait();
    // const txHash = newInvocation.getTransactionHash();

    return {
      agent: agent,
      hash: registerTx.hash,
    };
  }

  async extractFunds({
    agentAddress,
    signature,
    userAddress,
  }: ExtractFundsDto) {
    Coinbase.configure({
      apiKeyName: CONSTANTS.COINBASE_KEY_NAME,
      privateKey: CONSTANTS.COINBASE_KEY,
    });

    const message = `Extract funds from ${agentAddress}`;

    const signerAddress = ethers.verifyMessage(message, signature);

    if (signerAddress !== userAddress) {
      throw new Error('Invalid signature');
    }

    const res = await this.litprotocolService.decyptLit(agentAddress);
    const walletData = JSON.parse(res);

    const wallet = await CoinbaseWallet.import(walletData);

    const balance = await wallet.getBalance(Coinbase.assets.Eth);

    if (balance.lt(0.00001)) {
      throw new Error('Insufficient funds');
    }

    const transfer = await wallet.createTransfer({
      amount: balance.sub(0.00001),
      assetId: Coinbase.assets.Eth,
      destination: userAddress,
    });

    const newTransfer = await transfer.wait();

    return {
      message: 'Funds extracted successfully',
      txHash: newTransfer.getTransactionHash(),
    };
  }

  async getAgents(): Promise<FullAgentDto[]> {
    Coinbase.configure({
      apiKeyName: CONSTANTS.COINBASE_KEY_NAME,
      privateKey: CONSTANTS.COINBASE_KEY,
    });

    const agents = await readContract({
      contractAddress: CONTRACT_ADDRESS,
      method: 'getAgents',
      args: {},
      abi: OrchestratorAbi as any,
      networkId: 'base-sepolia',
    });

    const agentsArray: FullAgentDto[] = [];

    if (agents) {
      for (const agent of agents) {
        const agentAddress = agent.mpcWalletAddress;
        const metadataId = agent.metadataId;
        const ownerAddress = agent.ownerAddress;

        try {
          const data = await this.walrusService.fetch(metadataId);
          const dataObj = JSON.parse(data);

          const fullAgent: FullAgentDto = {
            agentAddress,
            ...dataObj,
            ownerAddress,
            metadataId,
          };

          agentsArray.push(fullAgent);
        } catch (err) {
          console.error('Error fetching agent data:', err);
        }
      }

      return agentsArray;
    }
  }

  async getMyAgent(userAddress: string): Promise<FullAgentDto[]> {
    Coinbase.configure({
      apiKeyName: CONSTANTS.COINBASE_KEY_NAME,
      privateKey: CONSTANTS.COINBASE_KEY,
    });

    const agents = await readContract({
      contractAddress: CONTRACT_ADDRESS,
      method: 'getAgents',
      args: {},
      abi: OrchestratorAbi as any,
      networkId: 'base-sepolia',
    });

    async function getBalance(address: string): Promise<string> {
      try {
        const provider = new ethers.JsonRpcProvider('https://sepolia.base.org	');
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }

    const agentsArray: FullAgentDto[] = [];

    if (agents) {
      const myAgents = agents.filter(
        (agent) =>
          agent.ownerAddress.toLowerCase() === userAddress.toLowerCase(),
      );

      for (const agent of myAgents) {
        const data = await this.walrusService.fetch(agent.metadataId);
        const dataObj = JSON.parse(data);
        const balance = await getBalance(agent.mpcWalletAddress);

        const fullAgent: FullAgentDto = {
          agentAddress: agent.mpcWalletAddress,
          ...dataObj,
          ownerAddress: agent.ownerAddress,
          metadataId: agent.metadataId,
          balance,
        };

        agentsArray.push(fullAgent);
      }
    }

    return agentsArray;
  }
}
