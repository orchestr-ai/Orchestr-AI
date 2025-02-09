export class CreateAgentDto {
  userAddress: string;
  apiUrl: string;
  agentName: string;
  agentDescription: string;
  costPerOutputToken: number;
  agentImage: string;
  agentAddress?: string;
}

export class AgentDto {
  agentAddress: string;
  userAddress: string;
  blobId: string;
}

export class AgentMetadata {
  agentImage: string;
  apiUrl: string;
  agentDescription: string;
  costPerOutputToken: number;
  agentName: string;
}

export class FullAgentDto {
  agentAddress: string;
  userAddress: string;
  blobId: string;
  agentImage: string;
  apiUrl: string;
  agentDescription: string;
  costPerOutputToken: number;
  agentName: string;
}
