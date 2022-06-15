import { useQuery } from '@apollo/client';
import { useSafe } from '@features/safe/SafeProvider';
import { apiGql } from '@gql/clients';
import { Tx } from './tx/useTxs';
import { CommentsQuery, CommentsQueryVariables } from '@gql/api.generated';
import { useApiClient } from '@gql/GqlProvider';
import { address, Address, Id, toId } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';

export const REACTION_FIELDS = apiGql`
fragment ReactionFields on Reaction {
  id
  safeId
  key
  nonce
  approverId
  emojis
}
`;

export const COMMENT_FIELDS = apiGql`
${REACTION_FIELDS}

fragment CommentFields on Comment {
  id
  safeId
  key
  nonce
  authorId
  content
  createdAt
  updatedAt
  reactions {
    ...ReactionFields
  }
}
`;

export const COMMENTS_QUERY = apiGql`
${COMMENT_FIELDS}

query CommentsQuery($safe: Address!, $key: Id!) {
  comments(safe: $safe, key: $key) {
    ...CommentFields
  }
}
`;

export interface Comment {
  id: Id;
  key: Id;
  nonce: number;
  author: Address;
  content: string;
  reactions: Reaction[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface Reaction {
  approver: Address;
  emojis: string[];
}

export type Commentable = Tx;

export const getCommentableKey = (c: Commentable): Id => toId(`tx:${c.id}`);

export const useComments = (commentable: Commentable) => {
  const { safe } = useSafe();
  const key = getCommentableKey(commentable);

  const { data, ...rest } = useQuery<CommentsQuery, CommentsQueryVariables>(
    COMMENTS_QUERY,
    {
      client: useApiClient(),
      variables: {
        safe: safe.address,
        key,
      },
    },
  );

  const comments: Comment[] = useMemo(
    () =>
      data?.comments.map(
        (c): Comment => ({
          id: toId(c.id),
          key: toId(c.key),
          nonce: c.nonce,
          author: address(c.authorId),
          content: c.content,
          reactions: c.reactions.map(
            (r): Reaction => ({
              approver: address(r.approverId),
              emojis: r.emojis,
            }),
          ),
          createdAt: DateTime.fromISO(c.createdAt),
          updatedAt: DateTime.fromISO(c.updatedAt),
        }),
      ),
    [data],
  );

  return { comments, ...rest };
};
