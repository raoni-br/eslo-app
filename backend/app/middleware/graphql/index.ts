import * as path from 'path';

import { makeSchema } from 'nexus';
import { ApolloServer } from 'apollo-server-express';

import * as allTypes from './schema';

import { createModels } from '../../models';
import { UserWithSubscription } from '../../models/user-profile.model';
import { apiAuthorizationPlugin } from './authentication-plugin';

// Reference: https://gist.github.com/djm/a7e29eea33b636d0d839be9e56118b15
const schema = makeSchema({
    features: {
        abstractTypeStrategies: {
            resolveType: true,
            isTypeOf: false,
            __typename: false,
        },
    },
    types: allTypes,
    // By default this is true when your NODE_ENV is development
    // but you can control this however you like. It controls all
    // file generation, including the 2 typegen files & the one
    // schema file.
    // shouldGenerateArtifacts: true,

    // Auto-generate the GraphQL schema (in SDL format) &
    // TypeScript types for our Nexus-defined GraphQL types.
    //
    // These are the generation paths for `nexus` itself. The
    // schema is for the generated GraphQL schema - this is helpful
    // to commit so you can see overtime how changes to the Nexus code
    // affect your public GraphQL schema. The types are what you need
    // to make VSCode + TypeScript happy.
    outputs: {
        schema: path.join(__dirname, '.nexus-generated', 'schema.graphql'),
        typegen: path.join(__dirname, '.nexus-generated', 'nexus-typegen.ts'),
    },
    // Tell Nexus where to find our Prisma client types.
    // This will depend on your setup, but by default
    // Prisma v2 outputs to your node_modules directory.
    // This is where Nexus looks for the client types.
    sourceTypes: {
        modules: [{ module: '.prisma/client', alias: 'PrismaClient' }],
    },
    contextType: {
        module: path.join(__dirname, 'context.ts'),
        export: 'EsloContext',
    },
});

export const graphqlServer = new ApolloServer({
    schema,
    context: (expressContext) => ({
        ...expressContext,
        models: createModels(expressContext.req.user as UserWithSubscription),
    }),
    plugins: [apiAuthorizationPlugin],
});
