import { gql, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  CommentsQuery,
  CommentsQueryVariables,
  DeleteCommentMutation,
  DeleteCommentMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { useCallback } from 'react';
import { Comment, COMMENTS_QUERY } from '~/queries/useComments.api';

const MUTATION = gql`
  mutation DeleteComment($safe: Address!, $key: Id!, $nonce: Int!) {
    deleteComment(safe: $safe, key: $key, nonce: $nonce) {
      id
    }
  }
`;

export const useDeleteComment = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutate] = useMutation<
    DeleteCommentMutation,
    DeleteCommentMutationVariables
  >(MUTATION, { client: useApiClient() });

  const del = useCallback(
    (c: Comment) => {
      if (c.author !== wallet.address)
        throw new Error("Can't delete comment that you didn't write");

      return mutate({
        variables: {
          safe: safe.address,
          key: c.key,
          nonce: c.nonce,
        },
        update: (cache, res) => {
          const id = res?.data?.deleteComment?.id;
          if (!id) return;

          const opts: QueryOpts<CommentsQueryVariables> = {
            query: COMMENTS_QUERY,
            variables: { safe: safe.address, key: c.key },
          };
          const data = cache.readQuery<CommentsQuery, CommentsQueryVariables>(
            opts,
          );

          cache.writeQuery<CommentsQuery, CommentsQueryVariables>({
            ...opts,
            overwrite: true,
            data: {
              comments: (data?.comments ?? []).filter((c) => c.id !== id),
            },
          });
        },
        optimisticResponse: {
          deleteComment: {
            __typename: 'Comment',
            id: c.id,
          },
        },
      });
    },
    [mutate, safe.address, wallet.address],
  );

  return del;
};
