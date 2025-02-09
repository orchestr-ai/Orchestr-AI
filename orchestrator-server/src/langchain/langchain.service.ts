import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import { CONSTANTS } from 'src/utils/constants';
import { z } from 'zod';
@Injectable()
export class LangchainService {
  private openai: ChatOpenAI;
  private anthropic: ChatAnthropic;
  private google: ChatGoogleGenerativeAI;

  constructor() {
    this.openai = new ChatOpenAI({
      openAIApiKey: CONSTANTS.OPENAI_API_KEY,
      temperature: 0,
      apiKey: CONSTANTS.OPENAI_API_KEY,
    });

    this.anthropic = new ChatAnthropic({
      apiKey: CONSTANTS.ANTHROPIC_API_KEY,
      temperature: 0.7,
    });

    this.google = new ChatGoogleGenerativeAI({
      apiKey: CONSTANTS.GOOGLE_API_KEY,
      temperature: 0,
      // model: 'gemini-1.5-pro',
      model: 'gemini-1.5-pro-002',
      maxOutputTokens: 7000,
      maxConcurrency: 1,
    });
  }

  async getChatGPTResponse(prompt: string) {
    const response = await this.openai.call([
      { role: 'user', content: prompt },
    ]);
    return response?.content;
  }

  async getChatGPTStructuredResponse(prompt: string, schema: z.Schema) {
    const structuredLlm = this.openai.withStructuredOutput(schema);
    const response = await structuredLlm.invoke(prompt);
    return response;
  }

  async getAnthropicResponse(prompt: string) {
    const response = await this.anthropic.call([prompt]);
    return response?.content;
  }

  async getGoogleResponse(prompt: string) {
    const response = await this.google.call([prompt]);
    return response?.content;
  }

  async getGoogleResponseStructured(prompt: string, schmema: z.Schema) {
    const structuredLlm = this.google.withStructuredOutput(schmema);
    const response = await structuredLlm.invoke([prompt]);
    return response;
  }
}
