import { Module } from '@nestjs/common';
import { EncryptionModule } from '../encryption/encryption.module';
import { LitProtocolService } from './lit-protocol.service';
import { WalrusModule } from 'src/walrus/walrus.module';
import { EncryptionService } from 'src/encryption/encryption.service';
import { WalrusService } from 'src/walrus/walrus.service';
import { KeyValueStoreService } from 'src/key-value-store/key-value-store.service';

@Module({
  imports: [EncryptionModule, WalrusModule],
  providers: [
    LitProtocolService,
    EncryptionService,
    WalrusService,
    KeyValueStoreService,
  ],
  exports: [LitProtocolService],
})
export class LitProtocolModule {}
