import { File } from "src/domain";

export const FileFactory = (
  overrides: Partial<File> = {}
): NonNullable<File> => {
  const defaults: File = {
    sha: "5e7d0c3f74aef60373c83edf063b42cdd09041b4",
    filename: "EIPS/eip-2930.md",
    status: "modified",
    additions: 5,
    deletions: 5,
    changes: 10,
    blob_url:
      "https://github.com/ethereum/EIPs/blob/f661efb56fee4a4cdffe1ba3efe119d19c0ae9a7/EIPS/eip-2930.md",
    raw_url:
      "https://github.com/ethereum/EIPs/raw/f661efb56fee4a4cdffe1ba3efe119d19c0ae9a7/EIPS/eip-2930.md",
    contents_url:
      "https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-2930.md?ref=f661efb56fee4a4cdffe1ba3efe119d19c0ae9a7",
    patch: [
      "@@ -16,9 +16,9 @@ Adds a transaction type which contains an access list, a list of addresses and s\n",
      " \n",
      " ## Abstract\n",
      " \n",
      "-We introduce a new [EIP-2718](./eip-2718.md) transaction type, with the format `0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, access_list, yParity, senderR, senderS])`.\n",
      "+We introduce a new [EIP-2718](./eip-2718.md) transaction type, with the format `0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])`.\n",
      " \n",
      "-The `access_list` specifies a list of addresses and storage keys; these addresses and storage keys are added into the `accessed_addresses` and `accessed_storage_keys` global sets (introduced in [EIP-2929](./eip-2929.md)). A gas cost is charged, though at a discount relative to the cost of accessing outside the list.\n",
      "+The `accessList` specifies a list of addresses and storage keys; these addresses and storage keys are added into the `accessed_addresses` and `accessed_storage_keys` global sets (introduced in [EIP-2929](./eip-2929.md)). A gas cost is charged, though at a discount relative to the cost of accessing outside the list.\n",
      " \n",
      " ## Motivation\n",
      " \n",
      "@@ -48,13 +48,13 @@ This EIP serves two functions:\n",
      " \n",
      " As of `FORK_BLOCK_NUMBER`, a new [EIP-2718](./eip-2718.md) transaction is introduced with `TransactionType` `1`.\n",
      " \n",
      "-The [EIP-2718](./eip-2718.md) `TransactionPayload` for this transaction is `rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, access_list, yParity, senderR, senderS])`.\n",
      "+The [EIP-2718](./eip-2718.md) `TransactionPayload` for this transaction is `rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS])`.\n",
      " \n",
      "-The `yParity, senderR, senderS` elements of this transaction represent a secp256k1 signature over `keccak256(0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, access_list]))`.\n",
      "+The `signatureYParity, signatureR, signatureS` elements of this transaction represent a secp256k1 signature over `keccak256(0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList]))`.\n",
      " \n",
      " The [EIP-2718](./eip-2718.md) `ReceiptPayload` for this transaction is `rlp([status, cumulativeGasUsed, logsBloom, logs])`.\n",
      " \n",
      '-For the transaction to be valid, `access_list` must be of type `[[{20 bytes}, [{32 bytes}...]]...]`, where `...` means "zero or more of the thing to the left". For example, the following is a valid access list (all hex strings would in reality be in byte representation):\n',
      '+For the transaction to be valid, `accessList` must be of type `[[{20 bytes}, [{32 bytes}...]]...]`, where `...` means "zero or more of the thing to the left". For example, the following is a valid access list (all hex strings would in reality be in byte representation):\n',
      " \n",
      " ```\n",
      " ["
    ].join("")
  };

  return { ...defaults, ...overrides };
};
