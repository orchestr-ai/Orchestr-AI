import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import { type HardhatUserConfig } from 'hardhat/config'
import * as dotenv from 'dotenv'

dotenv.config()

const mnemnoc =
	typeof process.env.MNEMONIC === 'undefined' ? '' : process.env.MNEMONIC

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.27',
		settings: {
			optimizer: {
				enabled: true,
				runs: 1000,
			},
		},
	},
	sourcify: {
		enabled: true
	  },
	networks: {
		mainnet: {
			url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		arbitrumOne: {
			url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		arbitrumRinkeby: {
			url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		polygonMumbai: {
			url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		polygonMainnet: {
			url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		lineaMainnet: {
			url: `https://linea-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		morphMainnet: {
			url: `https://rpc-holesky.morphl2.io`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		gnosisTestnet: {
			url: `https://rpc.chiadochain.net`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		baseMainnet: {
			url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		baseSepolia: {
			url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		lineaSepolia: {
			url: `https://linea-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY!}`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
		morphHolesky: {
			url: `https://rpc-quicknode-holesky.morphl2.io`,
			accounts: {
				mnemonic: mnemnoc,
			},
		},
	},
	etherscan: {
		apiKey: {
			...((k) => (k ? { mainnet: k } : undefined))(process.env.ETHERSCAN_KEY),
			...((k) => (k ? { arbitrumOne: k, arbitrumTestnet: k } : undefined))(
				process.env.ARBISCAN_KEY,
			),
			...((k) => (k ? { polygon: k, polygonMumbai: k } : undefined))(
				process.env.POLYGONSCAN_KEY,
			),
			gnosisTestnet: 'empty',
		},
		customChains: [
			{
			  network: "gnosisTestnet",
			  chainId: 10200,
			  urls: {
				apiURL: "https://gnosis-chiado.blockscout.com/api",
				browserURL: "https://gnosis-chiado.blockscout.com"
			  }
			}
		]
	},
}

export default config
