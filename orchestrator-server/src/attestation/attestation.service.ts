import { Injectable } from '@nestjs/common';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { CreateAttestationDto } from './dto/create-attestation.dto';
import { CONSTANTS } from 'src/utils/constants';

// const SCHEMA_REGISTRY = '0x4200000000000000000000000000000000000020';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';

@Injectable()
export class AttestationService {
  constructor() {}

  async createAttestation(createAttestationDto: CreateAttestationDto) {
    const eas = new EAS(EAS_ADDRESS);
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org	');
    const signer = new ethers.Wallet(
      CONSTANTS.MAIN_ADDRESS_PRIVATE_KEY,
      provider,
    );
    eas.connect(signer);

    const schemaEncoder = new SchemaEncoder(
      'string response, string prompt, string jobId, address agentAddress, uint256 amount, uint256 score',
    );

    // const formattedResponse = createAttestationDto.response.replace(/\n/g, '');
    // const newResponse = formattedResponse.slice(0, 10);
    // console.log('New response:', newResponse);

    // console.log('Create attestation DTO:', {
    //   ...createAttestationDto,
    //   response: newResponse,
    // });

    const encodedData = schemaEncoder.encodeData([
      {
        name: 'response',
        value: createAttestationDto.response,
        type: 'string',
      },
      { name: 'prompt', value: createAttestationDto.prompt, type: 'string' },
      { name: 'jobId', value: createAttestationDto.jobId, type: 'string' },
      {
        name: 'agentAddress',
        value: createAttestationDto.agentAddress,
        type: 'address',
      },
      {
        name: 'amount',
        value: ethers.parseEther(createAttestationDto.amount.toString()),
        type: 'uint256',
      },
      {
        name: 'score',
        value: createAttestationDto.score,
        type: 'uint256',
      },
    ]);

    const schemaUID =
      '0xd617d3736b46f32659067edefbd73941bb6fd74f6a7ba97ff6d701baa976ca65';

    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: createAttestationDto.agentAddress,
        expirationTime: BigInt(0),
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    console.log('New attestation UID:', newAttestationUID);

    return newAttestationUID;
  }
}
