export interface IPlan {
  agentName: string;
  agentDescription: string;
  agentAddress: string;
  agentPrompt: string;
  agentPrice: number;
  apiUrl: string;
  agentImage: string;
}

export interface IServerExecutionPlan {
  agentAddress: string;
  agentPrompt: string;
  agentDescription: string;
  agentImage: string;
  agentName: string;
  agentPrice: number;
  agentUrl: string;
}

export interface IOutput {
  agentAddress: string;
  response: string;
  prompt: string;
  attestationId: string;
  score: number;
  agentPrice: number;
}
