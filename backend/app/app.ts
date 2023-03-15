// node imports
import path from 'path';

// 3rd party imports
import express from 'express';
import cookieParser from 'cookie-parser';
import errorhandler from 'errorhandler';
import helmet from 'helmet';
import cors from 'cors';

// app imports
import { esloPassport } from './middleware/auth/passport';
import { router } from './routes';
import { graphqlServer } from './middleware/graphql';

const isProduction: boolean = process.env.NODE_ENV === 'production';

class App {
    express: express.Express;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.startGraphqlServer();
    }

    private async startGraphqlServer(): Promise<void> {
        await graphqlServer.start();
        graphqlServer.applyMiddleware({ app: this.express });
    }

    middleware(): void {
        if (!isProduction) {
            this.express.use(errorhandler());
        }

        this.express.use(express.static(path.join(__dirname, 'public')));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(cookieParser());
        this.express.use(helmet(), cors());

        this.express.use(esloPassport.initialize());
    }

    routes(): void {
        this.express.use(router);
    }
}

export default new App().express;
