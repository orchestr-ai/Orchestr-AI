import { Injectable } from '@nestjs/common';
import { LangchainService } from '../langchain/langchain.service';
import { TestPromptDto } from './dto/test-prompt.dto';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { z } from 'zod';
import { StartExecutionDto } from './dto/start-execution.dto';
import { PromptHistoryDto } from './dto/prompt-history.dto';
import { Coinbase, readContract } from '@coinbase/coinbase-sdk';
import { CONSTANTS } from 'src/utils/constants';
import { OrchestratorAbi } from 'src/utils/orchestrator-abi';
import { AttestationService } from 'src/attestation/attestation.service';
import { CreateAttestationDto } from 'src/attestation/dto/create-attestation.dto';
import { AgentsService } from 'src/agents/agents.service';
import { WalrusService } from 'src/walrus/walrus.service';
import { ethers } from 'ethers';
import { DisburseFundsDto } from './dto/disburse-funds.dto';

const CONTRACT_ADDRESS = '0xc97c268a00b2058c859C5cC3D148723a5cf69948';

@Injectable()
export class PromptService {
  constructor(
    private readonly langchainService: LangchainService,
    private readonly attestationService: AttestationService,
    private readonly agentService: AgentsService,
    private readonly walrusService: WalrusService,
  ) {}

  async test(testPromptDto: TestPromptDto) {
    const { prompt, model } = testPromptDto;

    if (model === 'openai') {
      const response = await this.langchainService.getChatGPTResponse(prompt);
      return { model, response };
    } else if (model === 'anthropic') {
      const response = await this.langchainService.getAnthropicResponse(prompt);
      return { model, response };
    } else if (model === 'google') {
      const response = await this.langchainService.getGoogleResponse(prompt);
      return { model, response };
    } else {
      return {
        error: 'Invalid model selected. Choose either "openai" or "anthropic".',
      };
    }
  }

  async create(createPromptDto: CreatePromptDto) {
    const allAgents = (await this.agentService.getAgents()).reverse();

    // return {
    //   prompt: 'I have a website www.hello.com, help me optimise seo',
    //   response: [
    //     {
    //       agentAddress: '0x9cDb3b423693Be536CFD5F29B2716BbA2146CE96',
    //       agentPrompt: 'Scrape data from website www.hello.com',
    //       agentPrice: 0.001,
    //     },
    //     {
    //       agentAddress: '0xC039654Bf76d6aF77A851c26167FBf07405C59BA',
    //       agentPrompt: 'Extract meaningful information from data',
    //       agentPrice: 0.002,
    //     },
    //     {
    //       agentAddress: '0x84BbE7540E517Bd508CEa95BcA1Ed6Cae6656302',
    //       agentPrompt: 'Suggest SEO optimisations',
    //       agentPrice: 0.003,
    //     },
    //   ],
    // };

    const { prompt } = createPromptDto;

    // const data = `
    //   I have a list of agents that specialize in different tasks. Find the best agents based on the request and return them in array.
    //   Each object should be of form { agentAddress: string, agentPrompt: string }
    //   The request is: ${prompt}
    //   The agents are:
    //   ${filteredAgents.map((agent, index) => `${index + 1}: agentAddress = ${agent.agentAddress} - ${agent.agentDescription}`)}
    //   AgentAddress is the agent address ethereum and agentPrompt is the prompt to be given to the agent
    // `

    // const agentsData = allAgents.map(
    //   (agent, index) =>
    //     `${index + 1}: agentAddress = ${agent.agentAddress} - ${agent.agentDescription}\n`,
    // )};

    let agentsString = '';
    allAgents.forEach((agent, index) => {
      agentsString += `${index + 1}: agentAddress = ${agent.agentAddress} - ${agent.agentDescription}\n`;
    });

    //     const data = `
    // I have a list of agents that specialize in different tasks. Find the best agents based on the request and return them in array. Make sure task is split into smaller tasks and given to different agents. No repeated tasks. Save money.
    // Not required to use all agents, just use which agents are best suited for the task and actually required.
    // Each object should be of form { agentAddress: string, agentPrompt: string }
    // The request is: ${prompt}
    // The agents are:
    // ${agentsString}
    // AgentAddress is the agent address ethereum and agentPrompt is the prompt to be given to the agent
    // `;

    const data = `
I have a list of agents that specialize in different tasks. Find the best agents based on the request and return them in array. Make sure task is split into smaller tasks and given to different agents. No repeated tasks. Save money.
Not required to use all agents, just use which agents are best suited for the task and actually required.
Each object should be of form { agentAddress: string, agentPrompt: string }
The request is: ${prompt}
The agents are:
1. agentAddress = 0x34D5a31c1b74ff7d2682743708a5C6Ac3CB30627 - Specialises in scraping data from websites
2. agentAddress = 0x53185299C535286c57e2338e35ebd8A56C9Ab2Dd - Specialises in extracting meaningful information from data
3. agentAddress = 0x2f7D95566BfAF09Ee5CA41765486181bdC827583 - Specialises in suggesting seo optimisations
4. agentAddress = 0xBe53bed7B566b5c5a11361664cf9eaE5bB18Ed9a - Specialises in writing and pushing code to a github repository

AgentAddress is the agent address ethereum and agentPrompt is the prompt to be given to the agent
`;

    // 1. agentAddress = 0x9cDb3b423693Be536CFD5F29B2716BbA2146CE96 - Specialises in scraping data from websites
    // 2. agentAddress = 0x824Ad0bFBC8faCffE54940F413Ee10Dc6D261F7B - Specialises in extracting meaningful information from data
    // 3. agentAddress = 0x64e07547bc1fe867b9cA041B94D7b9C05BaB06Eb - Specialises in suggesting seo optimisations

    const schema = z.object({
      data: z.array(
        z.object({
          agentAddress: z.string(),
          agentPrompt: z.string(),
        }),
      ),
    });

    const response = await this.langchainService.getChatGPTStructuredResponse(
      data,
      schema,
    );

    const quotes = response.data.map((quote) => {
      const agent = allAgents.find(
        (agent) => agent.agentAddress === quote.agentAddress,
      );

      return {
        agentAddress: quote.agentAddress,
        agentPrompt: quote.agentPrompt,
        agentDescription: agent.agentDescription,
        agentImage: agent.agentImage,
        agentName: agent.agentName,
        agentPrice: agent.costPerOutputToken,
        apiUrl: agent.apiUrl,
        ownerAddress: agent.userAddress,
      };
    });

    const blobId = await this.walrusService.upload(
      JSON.stringify({
        prompt: prompt,
        quotes: quotes,
      }),
    );

    return {
      prompt: prompt,
      quotes: quotes,
      promptMetadataBlobId: blobId,
    };
  }

  async startExecution(startExecutionDto: StartExecutionDto) {
    const { data, jobId } = startExecutionDto;

    let prevResponse: undefined | string = undefined;

    const outputs = [];

    for (const item of data) {
      let oldInput = `Prompt: ${item.agentPrompt}
      ${prevResponse ? `Input: ${prevResponse}` : ''}
      `;
      if (
        oldInput.includes('https://') &&
        item.agentAddress === '0x34D5a31c1b74ff7d2682743708a5C6Ac3CB30627'
      ) {
        const url = oldInput.match(/https:\/\/[^\s]+/);
        oldInput = url.toString();
      }

      const input = oldInput;

      const res = await fetch(item.agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      const response = await res.json();

      console.log('Input', input);
      console.log('Response', response.response);

      const scorePrompt = `
        I have received the following response from the agent. Please rate the response based on the quality of the response from 1 to 10.
        Prompt Given = ${item.agentPrompt} - Response = ${response.response}
      `;

      const schema = z.object({
        score: z.number(),
      });

      const scoreResponse =
        await this.langchainService.getChatGPTStructuredResponse(
          scorePrompt,
          schema,
        );

      function getRandomString(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyz123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          result += characters[randomIndex];
        }
        return result;
      }

      const attestationId = await this.attestationService.createAttestation({
        agentAddress: item.agentAddress,
        response: `0x${getRandomString(10)}`,
        // response: response.response,
        prompt: input,
        amount: item.agentPrice,
        jobId: jobId,
        score: scoreResponse.score,
      });

      outputs.push({
        agentAddress: item.agentAddress,
        response: response.response,
        prompt: input,
        attestationId,
        score: scoreResponse.score,
        agentPrice: item.agentPrice,
      });

      prevResponse = response.response;
    }

    // console.log('outputs', outputs);

    const txHash = await this.disburseFunds({
      jobId: jobId,
      attestationUids: outputs.map((output) => output.attestationId),
    });

    // const data = {
    //   jobId: 'mfcg5',
    //   attestationUids: [
    //     '0x00ea98625f030671bea787d82b8e5394e34c72114bef2b8949fc9b5471d0476a',
    //     '0xa85e01b1f8746bd5bd05bd8908f797e9722ec423f75bf309f7a80eec20bbf782',
    //     '0xf1bed7998fb0a9c26d47671e54d95502b43d809a698ef7a4e8ee88738c857c4d',
    //   ],
    // };

    // this.disburseFunds(data);

    return {
      outputs,
      txHash: txHash,
    };
  }

  async disburseFunds(disburseFundsDto: DisburseFundsDto) {
    console.log('disburseFundsDto', disburseFundsDto);
    const { jobId, attestationUids } = disburseFundsDto;
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

    const bytesUids = attestationUids.map((uuid) => uuid);

    const tx = await contract.disburseFunds(jobId, bytesUids, {
      gasLimit: 3000000,
    });
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction mined:', receipt);

    return tx.hash;
  }

  async getHistory(promptHistoryDto: PromptHistoryDto): Promise<any> {
    Coinbase.configure({
      apiKeyName: CONSTANTS.COINBASE_KEY_NAME,
      privateKey: CONSTANTS.COINBASE_KEY,
    });

    const jobs = await readContract({
      contractAddress: CONTRACT_ADDRESS,
      method: 'getJobsByUser',
      args: {
        userAddress: promptHistoryDto.userAddress,
      },
      abi: OrchestratorAbi as any,
      networkId: 'base-sepolia',
    });

    const updatedJobs = jobs.map((job) => ({
      ...job,
      amounts: job.amounts.map((amount) => ethers.formatUnits(amount, 'ether')),
      totalAmount: ethers.formatUnits(job.totalAmount),
    }));

    return updatedJobs;
  }

  async makeAttestion(createAttestationDto: CreateAttestationDto) {
    return this.attestationService.createAttestation(createAttestationDto);
  }
}
