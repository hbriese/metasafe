import { gql, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useIsDeployed } from '@features/safe/useIsDeployed';
import {
  UserSafesQuery,
  UpsertGroupMutation,
  UpsertGroupMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import produce from 'immer';
import { useWallet } from '@features/wallet/useWallet';
import { toId } from 'lib';
import { CombinedGroup } from '~/queries/safe';
import {
  API_GROUP_FIELDS_FRAGMENT,
  AQUERY_USER_SAFES,
} from '~/queries/safe/useSafes.api';

const API_MUTATION = gql`
  ${API_GROUP_FIELDS_FRAGMENT}

  mutation UpsertGroup($safe: Address!, $group: GroupInput!) {
    upsertGroup(safe: $safe, group: $group) {
      ...GroupFields
    }
  }
`;

export const useUpsertApiGroup = () => {
  const wallet = useWallet();
  const { safe } = useSafe();
  const isDeployed = useIsDeployed();

  const [mutation] = useMutation<
    UpsertGroupMutation,
    UpsertGroupMutationVariables
  >(API_MUTATION, { client: useApiClient() });

  const upsert = (g: CombinedGroup) => {
    return mutation({
      variables: {
        safe: safe.address,
        group: {
          ref: g.ref,
          name: g.name,
          // Only maintain a list of approvers if the safe is counterfactual
          approvers: isDeployed ? [] : g.approvers,
        },
      },
      optimisticResponse: {
        upsertGroup: {
          __typename: 'Group',
          id: g.id,
          ref: g.ref,
          safeId: safe.address,
          approvers: g.approvers.map((a) => ({
            __typename: 'Approver',
            userId: a.addr,
            weight: a.weight,
          })),
          name: g.name,
        },
      },
      update: (cache, res) => {
        const group = res?.data?.upsertGroup;
        if (!group) return;

        const opts: QueryOpts<never> = { query: AQUERY_USER_SAFES };
        const data = cache.readQuery<UserSafesQuery>(opts) ?? { user: null };

        cache.writeQuery<UserSafesQuery>({
          ...opts,
          overwrite: true,
          data: produce(data, (data) => {
            if (!data.user)
              data.user = {
                __typename: 'User',
                id: wallet.address,
                safes: [],
              };

            const safeId = toId(safe.address);
            const safeIndex = data.user.safes.findIndex((s) => s.id === safeId);

            if (safeIndex >= 0) {
              const groupIndex = data.user.safes[safeIndex].groups!.findIndex(
                (g) => g.id === group.id,
              );
              if (groupIndex >= 0) {
                data.user.safes[safeIndex].groups![groupIndex] = group;
              } else {
                data.user.safes[safeIndex].groups!.push(group);
              }
            } else {
              data.user.safes.push({
                __typename: 'Safe',
                id: toId(safe.address),
                deploySalt: '',
                name: '',
                groups: [group],
              });
            }
          }),
        });
      },
    });
  };

  return upsert;
};
