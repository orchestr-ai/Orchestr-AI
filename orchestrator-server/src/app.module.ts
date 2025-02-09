import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PromptModule } from './prompt/prompt.module';
import { LangchainService } from './langchain/langchain.service';
import { AgentsModule } from './agents/agents.module';
import { AttestationService } from './attestation/attestation.service';
import { LitProtocolService } from './lit-protocol/lit-protocol.service';
import { EncryptionService } from './encryption/encryption.service';
import { WalrusModule } from './walrus/walrus.module';
import { EncryptionModule } from './encryption/encryption.module';
import { LitProtocolModule } from './lit-protocol/lit-protocol.module';
import { KeyValueStoreModule } from './key-value-store/key-value-store.module';
import { KeyValueStoreService } from './key-value-store/key-value-store.service';

@Module({
  imports: [
    PromptModule,
    AgentsModule,
    WalrusModule,
    EncryptionModule,
    LitProtocolModule,
    KeyValueStoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LangchainService,
    AttestationService,
    LitProtocolService,
    EncryptionService,
    KeyValueStoreService,
  ],
})
export class AppModule {}
