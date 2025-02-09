import { IAgent } from "./type";

export const serializeAgents = (response: any[]): IAgent[] => {
  const result: IAgent[] = [];
  response.forEach((item: any) => {
    const agent: IAgent = {
      username: item.agentName,
      address: item.agentAddress,
      agentImage: item.agentImage,
      apiUrl: item.apiUrl,
      costPerOutputToken: item.costPerOutputToken,
      description: item.agentDescription,
      balance: item.balance,
    };

    result.push(agent);
  });

  return result;
};
