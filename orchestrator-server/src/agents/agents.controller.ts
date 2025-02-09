import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { ExtractFundsDto } from './dto/extract-funds.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  @Post('/withdraw')
  extractFunds(@Body() extractFundsDto: ExtractFundsDto) {
    return this.agentsService.extractFunds(extractFundsDto);
  }

  @Get('/get-agents')
  getAgents() {
    return this.agentsService.getAgents();
  }

  @Get('/get-agent/:userAddress')
  getAgent(@Param() params: any) {
    return this.agentsService.getMyAgent(params.userAddress);
  }
}
