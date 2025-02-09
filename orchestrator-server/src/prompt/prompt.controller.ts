import { Controller, Get, Post, Body } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { TestPromptDto } from './dto/test-prompt.dto';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { StartExecutionDto } from './dto/start-execution.dto';
import { PromptHistoryDto } from './dto/prompt-history.dto';
import { CreateAttestationDto } from 'src/attestation/dto/create-attestation.dto';

@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post('/test')
  create(@Body() testPrompt: TestPromptDto) {
    return this.promptService.test(testPrompt);
  }

  @Post('/create')
  createPrompt(@Body() createPromptDto: CreatePromptDto) {
    return this.promptService.create(createPromptDto);
  }

  @Post('/execute')
  execute(@Body() startExecutionDto: StartExecutionDto) {
    return this.promptService.startExecution(startExecutionDto);
  }

  @Get('/history')
  getHistory(@Body() promptHistoryDto: PromptHistoryDto) {
    return this.promptService.getHistory(promptHistoryDto);
  }

  @Post('/make-attestation')
  makeAttestion(@Body() createAttestationDto: CreateAttestationDto) {
    return this.promptService.makeAttestion(createAttestationDto);
  }
}
