import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { LangchainService } from 'src/langchain/langchain.service';
import { AttestationService } from 'src/attestation/attestation.service';
import { AgentsService } from 'src/agents/agents.service';
import { WalrusService } from 'src/walrus/walrus.service';
import { LitProtocolService } from 'src/lit-protocol/lit-protocol.service';
import { KeyValueStoreService } from 'src/key-value-store/key-value-store.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Module({
  imports: [],
  controllers: [PromptController],
  providers: [
    PromptService,
    LangchainService,
    AttestationService,
    WalrusService,
    AgentsService,
    LitProtocolService,
    KeyValueStoreService,
    EncryptionService,
    KeyValueStoreService,
  ],
})
export class PromptModule {}
