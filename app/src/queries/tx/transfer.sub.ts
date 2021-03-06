import { gql } from '@apollo/client';
import { Activity } from '@features/activity/ActivityItem';
import { TransfersQuery, TransferType } from '@gql/generated.sub';
import { BigNumber, BytesLike } from 'ethers';
import { Id, Address, toId, address } from 'lib';
import { DateTime } from 'luxon';

export const TRANSFER_FIELDS = gql`
  fragment TransferFields on Transfer {
    id
    type
    token
    from
    to
    value
    blockHash
    timestamp
  }
`;

interface Base {
  id: Id;
  tokenAddr: Address;
  addr: Address;
  value: BigNumber;
  blockHash: BytesLike;
  timestamp: DateTime;
}

export interface InTransfer extends Base {
  from: Address;
}

export interface OutTransfer extends Base {
  to: Address;
}

export type Transfer = InTransfer | OutTransfer;

export const fieldsToTransfer = (
  t: TransfersQuery['transfers'][0],
): Transfer => ({
  id: toId(t.id),
  tokenAddr: address(t.token),
  addr: address(t.type === TransferType.In ? t.from : t.to),
  value: BigNumber.from(t.value),
  blockHash: t.blockHash,
  timestamp: DateTime.fromSeconds(parseInt(t.timestamp)),
  ...(t.type === TransferType.In
    ? { from: address(t.from) }
    : { to: address(t.to) }),
});

export const isTransfer = (a: Activity): a is Transfer =>
  'tokenAddr' in a && 'timestamp' in a && 'value' in a;
export const isInTransfer = (t: Transfer): t is InTransfer => 'from' in t;
export const isOutTransfer = (t: Transfer): t is OutTransfer =>
  !isInTransfer(t);
