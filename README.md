# eslo Plataform
  
 At this stage, the platform is designed as a monolithic application, where one service (backend) fulfils all the business logic to the client application (frontend).

 The platform is developed with a full Typescript stack, with Node.js + Express.js in the backend and Angular in the frontend. The application is hosted in GCP and provisioned with Terraform (IaC - Infrastructure as Code).

 Further details of the architecture to be added.


 ## Install development tools (MacOS)
 * [Brew](https://brew.sh/)
   * [NVM](https://github.com/nvm-sh/nvm)
 * [VS Code](https://code.visualstudio.com/) and plugins:
   * [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
   * [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
   * [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
   * [GraphQL](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql)
 * [Docker](https://docs.docker.com/get-docker/)
 * [Insomnia](https://insomnia.rest/products/insomnia)


## Set up and run server
1. With all development tools installed, make sure Docker is up and running.
2. Run `docker-compose up -d` on the terminal. This will:
    * Pull required images from Docker Hub.
    * Build the platform images (backend, frontend and db)
    * Create containers and required network.
3. If that is the first time running the server or if the database needs to be reset, run the prisma migration and seeder as follows:
    * Attach the local terminal to the backend container and run the migrations. 
      Local machine: `docker exec -it <backend_image> sh`
      
      This can also be done with the VS Code Docker extension or from the Docker

    * Once connected to the container, run: `npm run reset-db`
    * Now the database should be initiated and seeded
4. The backend should be running on (http://localhost:3000) and the frontend on (http://localhost:4200)


## Contribute
At eslo, [GitHub flow](https://guides.github.com/introduction/flow/) is the branch strategy for the development.
The basic flow is as follows:

### 1. Create a feature branch from the main branch
The branch name follows the pattern: `[jira-task]/[short-description]` (all in lowercase)

For example: `plat-1234/user-registration`. Keep it simple and short, no more than four words in the description.

If you are creating a branch to fix a broken pipeline or a bug in your feature/user story, prefix the description with `fix-`. 

For example `plat-1234/fix-user-registration-ui`

Feature branches are meant to be short-lived. That means that a feature branch should only exist for a couple of days at the most.

### 2. Commit your code frequently

Push you changes constantly to the repository to avoid losing any work. When comminting code, follow the [Angular Commit Message Conventions](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit-body).

The one-liner header will follow the pattern:
`<type>(<scope>): <short summary>`

**Types**

Must be one of the following:

* build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* ci: Changes to our CI configuration files and scripts (example scopes: Circle, BrowserStack, SauceLabs)
* docs: Documentation only changes
* feat: A new feature
* fix: A bug fix
* perf: A code change that improves performance
* refactor: A code change that neither fixes a bug nor adds a feature
* test: Adding missing tests or correcting existing tests


### 3. Create a pull request from your branch
Create a pull request as soon as there is a meaningful change or if you want to trigger a discussion. Make changes on your branch as needed. Your pull request will update automatically.

### 4. Merge the pull request after code review
A peer review is necessary in order to merge the feature into the main branch.

Only deployable and approved feature should be merged!

### 5. Delete the feature branch after merging
Tidy up your branches using the delete button in the pull request or on the branches page.

### 5. Demo your changes in order to get the task done.
Show your changes to the Produco Owner. With they approval you can also mark the Jira task as done.
