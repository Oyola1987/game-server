var WebSocketServer = require('websocket').server;
var http = require('http');
const fs = require('fs');
const _ = require('lodash');
const express = require('express');
const libs = 'libs';
const app = express();

const users = [];
const connections = [];

app.get('/*', (req, res) => {
    let route = 'src/' + (req.params[0] || 'index.html');
    // console.log('Send file =>', route);

    res.sendFile(route, {
        root: __dirname
    });    
});

app.listen(4000, () => console.log('http://localhost:4000'))

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(4001, function () {
    console.log((new Date()) + ' Server is listening on port 3003');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {   
    return true;
}

const getMessage = (message) => {
    let data = message;

    if (message.type === 'utf8') {
        data = message.utf8Data;
    } else if (message.type === 'binary') {
        data = message.binaryData;
    }

    return JSON.parse(data);
};

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    const connection = request.accept('echo-protocol', request.origin);
    connection.sessionId = _.uniqueId('sesion_id_');

    connections.push(connection);

    console.log((new Date()) + ' Connection accepted.', connections.length);

    connection.on('message', function (message) {
        console.log('message ', message);
        const data = getMessage(message);

        if (data.redirect) {
            connections.forEach((con) => {
                if (con.sessionId !== connection.sessionId) {
                    con.sendUTF(JSON.stringify({
                        redirect: data.redirect
                    }));
                }                
            });
        } else if (data.destroy) {
            const index = connections.findIndex((con) => {
                return con.sessionId === connection.sessionId;
            });            
            
            connections.splice(index, 1);
            connection.close();
        }
    });

    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});