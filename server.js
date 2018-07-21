const WebSocketServer = require('websocket').server;
const http = require('http');
const _ = require('lodash');
const express = require('express');
const app = express();
const internalIp = require('internal-ip');
const ip = internalIp.v4.sync();

const connections = [];

const log = (msg, connection) => {
    console.log(msg, connection.sessionId, connections.length);
};

app.get('/*', (req, res) => {
    let route = 'src/' + (req.params[0] || 'index.html');

    res.sendFile(route, {
        root: __dirname
    });
});

const server = app.listen(4000, () => {
    console.log(`\nhttp://${ip}:4000\n`);
});

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

const getMessage = (message) => {
    let data = message;

    if (message.type === 'utf8') {
        data = message.utf8Data;
    } else if (message.type === 'binary') {
        data = message.binaryData;
    }

    return data;
};

wsServer.on('request', function (request) {
    const connection = request.accept('echo-protocol', request.origin);

    connection.sessionId = _.uniqueId('sesion_id_');
    connections.push(connection);

    log('Connection accepted =>', connection);

    connection.on('message', function (message) {
        const data = getMessage(message);

        connections.forEach((con) => {
            con.sendUTF(data);
        });
    });

    connection.on('close', function () {
        const index = connections.findIndex((con) => {
            return con.sessionId === connection.sessionId;
        });

        connections.splice(index, 1);
        connection.close();
        log('Connection closed =>', connection);
    });
});