export const OrchestratorAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AgentAlreadyRegistered',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidArrayLengths',
    type: 'error',
  },
  {
    inputs: [],
    name: 'JobAlreadyExists',
    type: 'error',
  },
  {
    inputs: [],
    name: 'JobDoesNotExist',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnauthorizedAgent',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'mpcWallet',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'metadataId',
        type: 'string',
      },
    ],
    name: 'AgentRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'jobId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'agents',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
    ],
    name: 'FundsAccepted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'jobId',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'agents',
        type: 'address[]',
      },
    ],
    name: 'FundsDisbursed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'jobId',
        type: 'string',
      },
      {
        internalType: 'address[]',
        name: 'agentAddresses',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'string',
        name: 'promptMetadataUri',
        type: 'string',
      },
    ],
    name: 'acceptFunds',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'jobId',
        type: 'string',
      },
      {
        internalType: 'bytes32[]',
        name: 'attestationUids',
        type: 'bytes32[]',
      },
    ],
    name: 'disburseFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAgents',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'mpcWalletAddress',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'ownerAddress',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'metadataId',
            type: 'string',
          },
        ],
        internalType: 'struct AgentMarketPlace.Agent[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'userAddress',
        type: 'address',
      },
    ],
    name: 'getJobsByUser',
    outputs: [
      {
        components: [
          {
            internalType: 'address[]',
            name: 'agentAddresses',
            type: 'address[]',
          },
          {
            internalType: 'uint256[]',
            name: 'amounts',
            type: 'uint256[]',
          },
          {
            internalType: 'string',
            name: 'promptMetadataUri',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'userAddress',
            type: 'address',
          },
          {
            internalType: 'enum AgentMarketPlace.JobStatus',
            name: 'jobStatus',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'totalAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct AgentMarketPlace.Job[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    name: 'jobs',
    outputs: [
      {
        internalType: 'string',
        name: 'promptMetadataUri',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'userAddress',
        type: 'address',
      },
      {
        internalType: 'enum AgentMarketPlace.JobStatus',
        name: 'jobStatus',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'mpcWalletAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'ownerAddress',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'metadataId',
        type: 'string',
      },
    ],
    name: 'registerAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'registeredAgentAddresses',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'registeredAgents',
    outputs: [
      {
        internalType: 'address',
        name: 'mpcWalletAddress',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'ownerAddress',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'metadataId',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'userAddressToJobIds',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
