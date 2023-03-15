# eslo Plataform -  Backend
 
 At this stage, the platform is desigend as a monolithic application, where one service (backend) fulfils all the business logic.

 The main components are:
   * Node.js (Typescript)
   * Express.js
   * Prisma (ORM)
   * GraphQL (API)

## Configuration
1. Run `npm install` from this directory so auto-completion/intellisense can be properly applied.

### Code Structure

### Create Models

##### Migration

./node_modules/.bin/sequelize migration:generate --name <migration_name>

`curl --location --request POST 'localhost:3000/admin/migrate'`

##### Seeder


./node_modules/.bin/sequelize seed:generate --name <seed_name>

`curl --location --request POST 'localhost:3000/admin/seed'`

#### GraphQL

##### Type Definitions

##### Custom Types

##### Resolvers

##### Query

##### Mutations

