import { Module } from '@nestjs/common';
import { KeyValueStoreService } from './key-value-store.service';

@Module({
  providers: [KeyValueStoreService],
})
export class KeyValueStoreModule {}
