import { createTx, createTxSignature } from 'lib';
import {
  deploy,
  allSigners,
  toSafeTransaction,
  provider,
  getSigners,
  wallet,
  expect,
} from './util';

describe('executeTransactionFromOutside', () => {
  it('should be callable from any address', async () => {
    const { safe, group } = await deploy([100]);

    const to = allSigners[2].address;
    const value = 1;
    const tx = createTx({ to, value });
    const preBalance = await provider.getBalance(to);

    const signers = await getSigners(safe, group.approvers, tx);
    const signature = createTxSignature(group, signers);

    const txResp = await safe
      .connect(wallet)
      .executeTransactionFromOutside(toSafeTransaction(safe, tx, signature));

    await txResp.wait();

    expect(await provider.getBalance(to)).to.eq(preBalance.add(value));
  });
});
