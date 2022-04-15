import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageGraphQLPlaygroundOptions } from 'apollo-server-core';

import { IS_DEV } from 'config';

export const GQL_ENDPOINT = '/graphql';

const settings: ApolloServerPluginLandingPageGraphQLPlaygroundOptions['settings'] = {
  'request.credentials': 'include',
};

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      debug: IS_DEV,
      introspection: true,
      path: GQL_ENDPOINT,
      playground: {
        settings,
      },
      // Http error on dev
      //   playground: false,
      //   plugins: IS_DEV
      //     ? [
      //         ApolloServerPluginLandingPageLocalDefault({
      //           includeCookies: true,
      //           variables: settings,
      //         }),
      //       ]
      //     : [],
    }),
  ],
})
export class GqlModule {}