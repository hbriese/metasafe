import { gql, useMutation } from '@apollo/client';
import { useWallet } from '@features/wallet/useWallet';
import {
  DeleteContactMutation,
  DeleteContactMutationVariables,
  ContactsQuery,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { toId } from 'lib';
import { useCallback } from 'react';
import { Contact, API_CONTACTS_QUERY } from '~/queries/useContacts.api';

const API_MUTATION = gql`
  mutation DeleteContact($addr: Address!) {
    deleteContact(addr: $addr) {
      id
    }
  }
`;

export const useDeleteContact = () => {
  const wallet = useWallet();

  const [mutation] = useMutation<
    DeleteContactMutation,
    DeleteContactMutationVariables
  >(API_MUTATION, { client: useApiClient() });

  const del = useCallback(
    (contact: Contact) =>
      mutation({
        variables: {
          addr: contact.addr,
        },
        optimisticResponse: {
          deleteContact: {
            __typename: 'DeleteContactResp',
            id: toId(`${wallet.address}-${contact.addr}`),
          },
        },
        update: (cache) => {
          // Remove from query list
          const data = cache.readQuery<ContactsQuery>({
            query: API_CONTACTS_QUERY,
          });

          cache.writeQuery<ContactsQuery>({
            query: API_CONTACTS_QUERY,
            overwrite: true,
            data: {
              contacts: (data?.contacts ?? []).filter(
                (c) => c.id !== contact.id,
              ),
            },
          });
        },
      }),
    [mutation, wallet.address],
  );

  return del;
};
