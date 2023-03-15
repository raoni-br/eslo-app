import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLRequestContext } from 'apollo-server-types';
import { FieldNode } from 'graphql';
import { ForbiddenError } from 'apollo-server-errors';

import { EsloContext } from './context';
import { UserWithSubscription } from '../../models/user-profile.model';
import { esloIAM } from '../../services/iam-client';

export const apiAuthorizationPlugin = (): ApolloServerPlugin => {
    return {
        async requestDidStart<TContext>(
            // eslint-disable-next-line no-unused-vars
            requestContext: GraphQLRequestContext<TContext>,
        ): Promise<GraphQLRequestListener<EsloContext>> {
            return {
                async didResolveOperation(context) {
                    const graphqlAction = {
                        type: context.operation.operation,
                        name: (context.operation.selectionSet.selections[0] as FieldNode).name.value,
                    };
                    const loggedUser = context.context.req.user as UserWithSubscription;
                    const permissions = await esloIAM.getApiAccess(loggedUser);

                    const hasAccess =
                        (graphqlAction.type === 'query' && permissions.queries[graphqlAction.name]) ||
                        (graphqlAction.type === 'mutation' && permissions.mutations[graphqlAction.name]);

                    if (!hasAccess) {
                        throw new ForbiddenError(
                            `GraphQL API: You do not have access to ${graphqlAction.name} ${graphqlAction.type}`,
                        );
                    }
                },
            };
        },
    };
};
