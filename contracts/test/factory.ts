import { SafeEvent } from 'lib';
import { expect, deploy, deployFactory } from './util';

describe('Factory', () => {
  it('Deploys', async () => {
    await deployFactory();
  });

  it('Calculated address matches deploy', async () => {
    const { safe, deployTx } = await deploy([100]);
    await expect(deployTx).to.emit(safe, SafeEvent.GroupUpserted);
  });

  it('Deploys safe', async () => {
    const { safe, deployTx } = await deploy([100]);
    await expect(deployTx).to.emit(safe, SafeEvent.GroupUpserted);
  });
});
