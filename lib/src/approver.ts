import { BigNumber, ethers } from 'ethers';
import { Address } from './addr';
import { percentToFixedWeight } from './weight';
import keccak256 from 'keccak256';

export interface SafeApprover {
  addr: Address;
  weight: BigNumber;
}

export interface Approver {
  addr: Address;
  weight: number;
}

export type Approverish = SafeApprover | Approver;

export const toSafeApprover = (approver: Approverish): SafeApprover => ({
  addr: approver.addr,
  weight:
    typeof approver.weight === 'number'
      ? percentToFixedWeight(approver.weight)
      : approver.weight,
});

// Sort approvers by the hash to get them into the correct ordering of leaves
export const toSafeApprovers = (approvers: Approverish[]): SafeApprover[] =>
  approvers
    .map((a) => ({ approver: toSafeApprover(a), hash: hashApprover(a) }))
    .sort((a, b) => Buffer.compare(a.hash, b.hash))
    .map((a) => a.approver);

export const abiEncodeApprover = (approverish: Approverish): string =>
  ethers.utils.defaultAbiCoder.encode(
    ['(address addr, uint96 weight)'],
    [toSafeApprover(approverish)],
  );

export const hashApprover = (approver: Approverish) =>
  keccak256(abiEncodeApprover(approver));

export const approversToLeaves = (approvers: Approverish[]) =>
  approvers.map(hashApprover).sort(Buffer.compare);
