import { expect } from 'chai'
import { ethers } from 'ethers'
import { JsonRpcProvider } from 'ethers/providers'

interface AgentMarketPlace extends ethers.BaseContract {
	registerAgent(mpcWalletAddress: string, ownerAddress: string, metadataId: string): Promise<any>
	acceptFunds(jobId: string, agentAddresses: string[], amounts: bigint[], promptMetadataUri: string, overrides?: { value: bigint }): Promise<any>
	disburseFunds(jobId: string, agentAddresses: string[]): Promise<any>
	jobs(jobId: string): Promise<any>
}

const AgentMarketPlaceABI = [/* Copy ABI from your compiled contract */]
const AgentMarketPlaceBytecode = '0x...' // Copy bytecode from your compiled contract

async function main() {
	console.log('Deploying AgentMarketPlace...')

	// Setup provider and wallet
	const provider = new JsonRpcProvider('http://localhost:8545')
	const privateKey = 'YOUR_PRIVATE_KEY' // Replace with actual private key
	const wallet = new ethers.Wallet(privateKey, provider)

	// Create test wallets
	const agent1 = ethers.Wallet.createRandom().connect(provider)
	const agent2 = ethers.Wallet.createRandom().connect(provider)
	const user = ethers.Wallet.createRandom().connect(provider)

	// Deploy contract with proper typing
	const factory = new ethers.ContractFactory(
		AgentMarketPlaceABI,
		AgentMarketPlaceBytecode,
		wallet
	)
	const marketplace = (await factory.deploy()) as unknown as AgentMarketPlace
	await marketplace.waitForDeployment()
	const marketplaceAddress = await marketplace.getAddress()
	console.log(`AgentMarketPlace deployed to: ${marketplaceAddress}`)

	// Test 1: Register Agents
	console.log('\nTesting agent registration...')
	await marketplace.registerAgent(
			await agent1.getAddress(),
			await wallet.getAddress(),
			'ipfs://agent1-metadata'
	)
	await marketplace.registerAgent(
			await agent2.getAddress(),
			await wallet.getAddress(),
			'ipfs://agent2-metadata'
	)
	console.log('✅ Agents registered successfully')

	// Test 2: Accept Funds
	console.log('\nTesting fund acceptance...')
	const jobId = 'test-job-1'
	const amounts = [
		ethers.parseEther('0.5'),
		ethers.parseEther('0.5')
	]
	const totalAmount = amounts.reduce((a, b) => a + b)

	const marketplaceAsUser = marketplace.connect(user) as unknown as AgentMarketPlace
	await marketplaceAsUser.acceptFunds(
		jobId,
		[await agent1.getAddress(), await agent2.getAddress()],
		amounts,
		'ipfs://prompt-metadata',
		{ value: totalAmount }
	)
	console.log('✅ Funds accepted successfully')

	// Test 3: Disburse Funds
	console.log('\nTesting fund disbursement...')
	const agent1BalanceBefore = await provider.getBalance(await agent1.getAddress())
	const agent2BalanceBefore = await provider.getBalance(await agent2.getAddress())

	await marketplace.disburseFunds(
		jobId,
		[await agent1.getAddress(), await agent2.getAddress()]
	)

	const agent1BalanceAfter = await provider.getBalance(await agent1.getAddress())
	const agent2BalanceAfter = await provider.getBalance(await agent2.getAddress())

	expect(agent1BalanceAfter - agent1BalanceBefore).to.equal(amounts[0])
	expect(agent2BalanceAfter - agent2BalanceBefore).to.equal(amounts[1])
	console.log('✅ Funds disbursed successfully')

	// Test 4: Verify Job Status
	const job = await marketplace.jobs(jobId)
	expect(job.jobStatus).to.equal(2) // Completed
	console.log('✅ Job status verified')

	console.log('\n🎉 All tests passed!')
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
