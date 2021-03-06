import { gql, useMutation } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import {
  CommentsQuery,
  CommentsQueryVariables,
  ReactToCommentMutation,
  ReactToCommentMutationVariables,
} from '@gql/generated.api';
import { useApiClient } from '@gql/GqlProvider';
import { QueryOpts } from '@gql/update';
import { Address, Id, toId } from 'lib';
import { useCallback } from 'react';
import {
  Comment,
  COMMENTS_QUERY,
  REACTION_FIELDS,
} from '~/queries/useComments.api';
import { createCommentId } from './useCreateComment.api';

const MUTATION = gql`
  ${REACTION_FIELDS}

  mutation ReactToComment(
    $safe: Address!
    $key: Id!
    $nonce: Int!
    $emojis: [String!]!
  ) {
    reactToComment(safe: $safe, key: $key, nonce: $nonce, emojis: $emojis) {
      ...ReactionFields
    }
  }
`;

export const createReactionId = (
  safe: Address,
  c: Comment,
  wallet: Address,
): Id => toId(`${createCommentId(safe, c.key, c.nonce)}-${wallet}`);

export const useReactToComment = () => {
  const { safe } = useSafe();
  const wallet = useWallet();

  const [mutate] = useMutation<
    ReactToCommentMutation,
    ReactToCommentMutationVariables
  >(MUTATION, { client: useApiClient() });

  const react = useCallback(
    (c: Comment, emojis: string[]) =>
      mutate({
        variables: {
          safe: safe.address,
          key: c.key,
          nonce: c.nonce,
          emojis,
        },
        update: (cache, res) => {
          const reaction = res?.data?.reactToComment;
          if (!reaction) return;

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
              comments: (data?.comments ?? []).map((comment) => {
                if (comment.id !== c.id) return comment;

                const reactionsWithoutCur = (comment.reactions ?? []).filter(
                  (r) => r.userId !== reaction.userId,
                );

                return {
                  ...comment,
                  reactions: [...reactionsWithoutCur, reaction].filter(
                    (r) => (r.emojis ?? []).length,
                  ),
                };
              }),
            },
          });
        },
        optimisticResponse: {
          reactToComment: {
            __typename: 'Reaction',
            id: createReactionId(safe.address, c, wallet.address),
            safeId: safe.address,
            key: c.key,
            nonce: c.nonce,
            userId: wallet.address,
            emojis,
          },
        },
      }),
    [mutate, safe.address, wallet.address],
  );

  return react;
};
