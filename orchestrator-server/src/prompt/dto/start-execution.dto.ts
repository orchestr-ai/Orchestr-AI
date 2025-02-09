export class StartExecutionDto {
  data: Array<{
    agentAddress: string;
    agentPrompt: string;
    agentPrice: number;
    agentUrl: string;
  }>;
  jobId: string;
}
