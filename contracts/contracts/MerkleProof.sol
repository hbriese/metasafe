// SPDX-License-Identifier: MIT
// Modification of https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/MerkleProof.sol
// TODO: replace with the original code once issue is fixed: https://github.com/OpenZeppelin/openzeppelin-contracts/issues/3492

pragma solidity ^0.8.0;

import {BoolArray} from './BoolArray.sol';

library MerkleProof {
  function merkleRoot(bytes32[] memory leaves)
    internal
    pure
    returns (bytes32 root)
  {
    // This function rebuild the root hash by traversing the tree up from the leaves. The root is rebuilt by
    // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
    // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
    // the merkle tree.
    uint256 leavesLen = leaves.length;
    require(leavesLen > 0, 'MerkleProof: leaves required to create merkle root');

    uint256 totalHashes = leavesLen - 1;

    // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
    // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
    bytes32[] memory hashes = new bytes32[](totalHashes);
    uint256 leafPos = 0;
    uint256 hashPos = 0;
    // At each step, we compute the next hash using two values:
    // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
    //   get the next hash.
    // - depending on the flag, either another value for the "main queue" (merging branches) or an element from the
    //   `proof` array.
    for (uint256 i = 0; i < totalHashes; i++) {
      bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
      bytes32 b = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
      hashes[i] = _hashPair(a, b);
    }

    if (totalHashes > 0) {
      return hashes[totalHashes - 1];
    } else {
      return leaves[0];
    }
  }

  function processMultiProof(
    bytes32[] calldata proof,
    uint256[] calldata proofFlags,
    bytes32[] memory leaves
  ) internal pure returns (bytes32 root) {
    // This function rebuild the root hash by traversing the tree up from the leaves. The root is rebuilt by
    // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
    // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
    // the merkle tree.
    uint256 leavesLen = leaves.length;
    uint256 totalHashes = BoolArray.length(proofFlags);

    // Check proof validity.
    require(
      leavesLen + proof.length - 1 == totalHashes,
      'MerkleProof: invalid multiproof'
    );

    // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
    // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
    bytes32[] memory hashes = new bytes32[](totalHashes);
    uint256 leafPos = 0;
    uint256 hashPos = 0;
    uint256 proofPos = 0;
    // At each step, we compute the next hash using two values:
    // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
    //   get the next hash.
    // - depending on the flag, either another value for the "main queue" (merging branches) or an element from the
    //   `proof` array.
    for (uint256 i = 0; i < totalHashes; i++) {
      bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
      bytes32 b = BoolArray.atIndex(proofFlags, i)
        ? leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++]
        : proof[proofPos++];
      hashes[i] = _hashPair(a, b);
    }

    if (totalHashes > 0) {
      return hashes[totalHashes - 1];
    } else if (leavesLen > 0) {
      return leaves[0];
    } else {
      return proof[0];
    }
  }

  function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
    return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
  }

  function _efficientHash(bytes32 a, bytes32 b)
    private
    pure
    returns (bytes32 value)
  {
    /// @solidity memory-safe-assembly
    assembly {
      mstore(0x00, a)
      mstore(0x20, b)
      value := keccak256(0x00, 0x40)
    }
  }
}