import { useSafe } from '@features/safe/SafeProvider';
import { useDeploySafe } from '@features/safe/useDeploySafe';
import { useFeeToken } from '@features/tx/useFeeToken';
import { executeTx, Signerish } from 'lib';
import { useCallback } from 'react';
import { CombinedGroup } from '~/queries/safe';
import { ProposedTx } from '~/queries/tx';
import { useApiSubmitExecution } from './useSubmitExecution.api';

export const useSubmitExecute = () => {
  const { safe } = useSafe();
  const submitExecution = useApiSubmitExecution();
  const deploy = useDeploySafe();
  const feeToken = useFeeToken();

  const execute = useCallback(
    async (tx: ProposedTx, group: CombinedGroup) => {
      // Deploy if not already deployed
      await deploy?.();

      const signers: Signerish[] = tx.approvals.map((approval) => ({
        addr: approval.addr,
        weight: group.approvers.find((a) => a.addr === approval.addr)!.weight,
        signature: approval.signature,
      }));

      const resp = await executeTx(safe, tx, group, signers, {
        customData: {
          feeToken: feeToken.addr,
        },
      });
      await submitExecution(tx, resp);
    },
    [deploy, feeToken.addr, safe, submitExecution],
  );

  return execute;
};
