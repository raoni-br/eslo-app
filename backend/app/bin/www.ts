#!/usr/bin/env node

/**
 * Module dependencies.
 */

import { AddressInfo } from 'net';
import http from 'http';

import { HttpError } from 'http-errors';

import app from '../app';
import { logger } from '../utils/logger';
import { esloConfig } from '../secrets';

/**
 * Get port from environment and store in Express.
 */

const port = esloConfig.serverPort;

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: HttpError) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // const bind = typeof port === 'string' ?
    //       'Pipe ' + port :
    //       'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            process.exit(1);
        // break;
        // eslint-disable-next-line no-fallthrough
        case 'EADDRINUSE':
            process.exit(1);
        // break;
        // eslint-disable-next-line no-fallthrough
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr: AddressInfo = server.address() as AddressInfo;
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    logger.info({ message: `Listening on ${bind}`, source: 'server' });
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
