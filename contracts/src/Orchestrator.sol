// SPDX-License-Identifier: MPL-2.0
pragma solidity ^0.8.27;

contract AgentMarketPlace {
	enum JobStatus {
		InProgress,
		Completed,
		Canceled
	}

	struct Job {
		address[] agentAddresses;
		uint256[] amounts;
		string promptMetadataUri;
		address userAddress;
		JobStatus jobStatus;
		uint256 totalAmount;
	}

	struct Agent {
		address mpcWalletAddress;
		address ownerAddress;
		string metadataId;
	}

	struct AttestationSchema {
		string response;
		string prompt;
		string jobId; // associated job id
		address agentAddress; // mpc wallet address of the agent
		uint256 amount; // amount of ETH sent to the agent
		uint256 score; // score of the agent
	}

	// State variables
	mapping(address => string[]) public userAddressToJobIds; // user address -> job ids
	mapping(string => Job) public jobs; // job id -> Job

	address[] public registeredAgentAddresses; // all registered agent addresses
	mapping(address => Agent) public registeredAgents; // agent address -> Agent

	event AgentRegistered(address mpcWallet, address owner, string metadataId);
	event FundsAccepted(
		string indexed jobId,
		address[] agents,
		uint256[] amounts
	);
	event FundsDisbursed(string indexed jobId, address[] agents);

	error InvalidArrayLengths();
	error JobAlreadyExists();
	error JobDoesNotExist();
	error UnauthorizedAgent();
	error InvalidAmount();
	error AgentAlreadyRegistered();

	constructor() {}

	function getJobsByUser(address userAddress) external view returns (Job[] memory) {
		string[] memory jobIds = userAddressToJobIds[userAddress];
		Job[] memory jobsByUser = new Job[](jobIds.length);
		for (uint256 i = 0; i < jobIds.length; i++) {
			jobsByUser[i] = jobs[jobIds[i]];
		}
		return jobsByUser;
	}

	function getAgents() external view returns (Agent[] memory) {
		Agent[] memory agents = new Agent[](registeredAgentAddresses.length);
		for (uint256 i = 0; i < registeredAgentAddresses.length; i++) {
			agents[i] = registeredAgents[registeredAgentAddresses[i]];
		}
		return agents;
	}

	function registerAgent(
		address mpcWalletAddress,
		address ownerAddress,
		string calldata metadataId
	) external {
		if (registeredAgents[mpcWalletAddress].mpcWalletAddress != address(0))
			revert AgentAlreadyRegistered();

		registeredAgents[mpcWalletAddress] = Agent({
			mpcWalletAddress: mpcWalletAddress,
			ownerAddress: ownerAddress,
			metadataId: metadataId
		});
		registeredAgentAddresses.push(mpcWalletAddress);

		emit AgentRegistered(mpcWalletAddress, ownerAddress, metadataId);
	}

	function acceptFunds(
		string calldata jobId,
		address[] calldata agentAddresses,
		uint256[] calldata amounts,
		string calldata promptMetadataUri
	) external payable {
		if (agentAddresses.length != amounts.length)
			revert InvalidArrayLengths();
		if (jobs[jobId].userAddress != address(0)) revert JobAlreadyExists();

		uint256 totalAmount;

		for (uint256 i = 0; i < agentAddresses.length; i++) {
			require(
				registeredAgents[agentAddresses[i]].mpcWalletAddress !=
					address(0),
				"Agent not registered"
			);
			totalAmount += amounts[i];
		}

		require(msg.value == totalAmount, "Incorrect ETH amount sent");

		jobs[jobId] = Job({
			agentAddresses: agentAddresses,
			amounts: amounts,
			promptMetadataUri: promptMetadataUri,
			userAddress: msg.sender,
			jobStatus: JobStatus.InProgress,
			totalAmount: totalAmount
		});
		userAddressToJobIds[msg.sender].push(jobId);

		emit FundsAccepted(jobId, agentAddresses, amounts);
	}

	function disburseFunds(
		string calldata jobId,
		bytes32[] calldata attestationUids
	) external {
		Job storage job = jobs[jobId];
		if (job.userAddress == address(0)) revert JobDoesNotExist();
		require(job.jobStatus == JobStatus.InProgress, "Job not in progress");
		require(attestationUids.length == job.agentAddresses.length, "Invalid attestation count");

		uint256 totalRefunded = 0;
		address[] memory agentAddresses = job.agentAddresses;

		for (uint256 i = 0; i < agentAddresses.length; i++) {
			try EAS.getAttestation(attestationUids[i]) returns (IEAS.Attestation memory attestation) {
				// AttestationSchema memory decodedData = abi.decode(attestation.data, (AttestationSchema));

				// bool isValid =
				// 	decodedData.agentAddress == agentAddresses[i] &&
				// 	decodedData.amount == job.amounts[i] &&
				// 	keccak256(bytes(decodedData.jobId)) == keccak256(bytes(jobId)) &&
				// 	bytes(decodedData.response).length > 0 &&
				// 	decodedData.score > 3;

				// if (isValid) {
					// Valid attestation, pay the agent
					payable(agentAddresses[i]).transfer(job.amounts[i]);
				// } else {
					// Invalid attestation, add to refund amount
				// 	totalRefunded += job.amounts[i];
				// }
			} catch {
				// Failed to get attestation, add to refund amount
				totalRefunded += job.amounts[i];
			}
		}

		// Refund failed attestations to user
		if (totalRefunded > 0) {
			payable(job.userAddress).transfer(totalRefunded);
		}

		job.jobStatus = JobStatus.Completed;
		emit FundsDisbursed(jobId, agentAddresses);
	}
}
