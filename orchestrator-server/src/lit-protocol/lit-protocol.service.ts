import { Injectable } from '@nestjs/common';
import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import { CONSTANTS } from 'src/utils/constants';
import { EncryptionService } from 'src/encryption/encryption.service';
import { WalrusService } from 'src/walrus/walrus.service';
import { KeyValueStoreService } from 'src/key-value-store/key-value-store.service';

export const getEthersSigner = (ethereumPrivateKey: string) => {
  return new ethers.Wallet(
    ethereumPrivateKey,
    new ethers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE),
  );
};

export const getLitNodeClient = async () => {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: false,
  });
  await litNodeClient.connect();
  return litNodeClient;
};

@Injectable()
export class LitProtocolService {
  private litNodeClient: LitNodeClient;

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly walrusService: WalrusService,
    private readonly keyValueStoreService: KeyValueStoreService,
  ) {}

  encryptLit = async (key: string, data: string) => {
    try {
      const ethersSigner = getEthersSigner(CONSTANTS.MAIN_ADDRESS_PRIVATE_KEY);
      this.litNodeClient = await getLitNodeClient();

      const accessControlConditions: any = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: '',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: '=',
            value: await ethersSigner.getAddress(),
          },
        },
      ];

      const { ciphertext, dataToEncryptHash } =
        await this.litNodeClient.encrypt({
          dataToEncrypt: new TextEncoder().encode(data),
          accessControlConditions,
        });

      console.log(`ciphertext: ${ciphertext}`);
      console.log(`dataToEncryptHashh: ${dataToEncryptHash}`);

      const sessionSignatures = await this.litNodeClient.getSessionSigs({
        chain: 'ethereum',
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        resourceAbilityRequests: [
          {
            resource: new LitAccessControlConditionResource('*'),
            ability: LitAbility.AccessControlConditionDecryption,
          },
        ],
        authNeededCallback: async ({
          uri,
          expiration,
          resourceAbilityRequests,
        }) => {
          const toSign = await createSiweMessage({
            uri,
            expiration,
            resources: resourceAbilityRequests,
            walletAddress: await ethersSigner.getAddress(),
            nonce: await this.litNodeClient.getLatestBlockhash(),
            litNodeClient: this.litNodeClient,
          });

          return await generateAuthSig({
            signer: ethersSigner,
            toSign,
          });
        },
      });

      const encryptedData = this.encryptionService.encrypt(
        JSON.stringify({
          sessionSignatures,
          ciphertext,
          dataToEncryptHash,
        }),
      );

      const blobId = await this.walrusService.upload(
        JSON.stringify(encryptedData),
      );

      await this.keyValueStoreService.set(key, blobId);
      console.log(`blobId: ${blobId}`);

      return blobId;
    } catch (error) {
      console.error(error);
    } finally {
      this.litNodeClient.disconnect();
    }
  };

  async decyptLit(key: string) {
    try {
      const ethersSigner = getEthersSigner(CONSTANTS.MAIN_ADDRESS_PRIVATE_KEY);
      this.litNodeClient = await getLitNodeClient();

      const blobId = await this.keyValueStoreService.get(key);
      const encryptedDataString = await this.walrusService.fetch(blobId);
      const { encryptedData, iv } = JSON.parse(encryptedDataString);
      const { sessionSignatures, ciphertext, dataToEncryptHash } = JSON.parse(
        this.encryptionService.decrypt(encryptedData, iv),
      );

      const accessControlConditions: any = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: '',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: '=',
            value: await ethersSigner.getAddress(),
          },
        },
      ];

      const decryptionResponse = await this.litNodeClient.decrypt({
        chain: 'ethereum',
        sessionSigs: sessionSignatures,
        ciphertext,
        dataToEncryptHash,
        accessControlConditions,
      });

      const decryptedString = new TextDecoder().decode(
        decryptionResponse.decryptedData,
      );

      return decryptedString;
    } catch (error) {
      console.error(error);
    } finally {
      this.litNodeClient.disconnect();
    }
  }
}
