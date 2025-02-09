import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { WalrusModule } from 'src/walrus/walrus.module';
import { LitProtocolModule } from 'src/lit-protocol/lit-protocol.module';
import { LitProtocolService } from 'src/lit-protocol/lit-protocol.service';
import { WalrusService } from 'src/walrus/walrus.service';
import { EncryptionService } from 'src/encryption/encryption.service';
import { KeyValueStoreService } from 'src/key-value-store/key-value-store.service';

@Module({
  imports: [WalrusModule, LitProtocolModule],
  controllers: [AgentsController],
  providers: [
    AgentsService,
    WalrusService,
    LitProtocolService,
    EncryptionService,
    KeyValueStoreService,
  ],
})
export class AgentsModule {}
