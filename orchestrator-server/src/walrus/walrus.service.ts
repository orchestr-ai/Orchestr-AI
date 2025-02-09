import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WalrusService {
  async upload(data: string) {
    const response = await axios.put(
      'https://publisher.walrus-testnet.walrus.space/v1/store',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      },
    );

    let blobId = '';

    if (response.data.alreadyCertified) {
      blobId = response.data.alreadyCertified.blobId;
    } else {
      blobId = response.data.newlyCreated.blobObject.blobId;
    }

    return blobId;
  }

  async fetch(blobId: string) {
    const metadata = await fetch(
      `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`,
    );

    const data = await metadata.json();
    return data.body;
  }
}
