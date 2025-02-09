import { initializeAgent1, initializeAgent2 } from "./agent.js";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});

const responseSchema = z.object({
  github_repo_url: z.string(),
  improvements: z.string(),
});

const intermediateResponseSchema = z.object({
  updated_content: z.string(),
});

async function getChatGPTStructuredResponse(prompt, schema) {
  const structuredLlm = openai.withStructuredOutput(schema);
  const response = await structuredLlm.invoke(prompt);
  return response;
}

export const handleRequest = async (input) => {
  // Modify the input string, add to it that divide it into chunks of 1000 characters
  const modifiedInput = `${input} \n\n\n From the above text, give me structured output in the following format: ${JSON.stringify(
    responseSchema
  )} containing the github repo url and improvements to the code.`;

  const response = await getChatGPTStructuredResponse(
    modifiedInput,
    responseSchema
  );

  const { github_repo_url, improvements } = response;

  const { agent, config } = await initializeAgent1();
  const inputForAgent1 = `The github repo url is ${github_repo_url}. Extract the content of file from the repo.`;
  const stream = await agent.stream(
    { messages: [new HumanMessage(inputForAgent1)] },
    config
  );
  let htmlContent = "";
  for await (const chunk of stream) {
    if ("agent" in chunk) {
      console.log("Agent: ", chunk.agent.messages[0].content);
    } else if ("tools" in chunk) {
      console.log("Tools: ", chunk.tools.messages[0].content);
      htmlContent += chunk.tools.messages[0].content;
      break;
    }
    console.log("-------------------");
  }

  const inputForIntermediateAgent = `The content of the file is ${htmlContent}. The improvements to the code are ${improvements}. Update the content of the HTML file and give me the updated HTML content.`;
  const intermediateResponse = await getChatGPTStructuredResponse(
    inputForIntermediateAgent,
    intermediateResponseSchema
  );
  const { updated_content } = intermediateResponse;

  const { agent: agent2, config: config2 } = await initializeAgent2();
  const inputForAgent2 = `The updated HTMLcontent of the file is: \n\n\n ${updated_content}. \n\n\n Create a Github PR with the updated content. The github repo url is ${github_repo_url}.`;
  await agent2.stream(
    { messages: [new HumanMessage(inputForAgent2)] },
    config2
  );
};
