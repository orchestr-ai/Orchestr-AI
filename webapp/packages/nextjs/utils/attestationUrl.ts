export const getAttestationUrl = (attestationId: string) => {
  return `https://base-sepolia.easscan.org/attestation/view/${attestationId}`;
};

export const getSepoliaTxURL = (txHash: string) => {
  return `https://sepolia.basescan.org/tx/${txHash}`;
};
