const hotspot = require('./hotspot');
const server = require('./server');

const stop = () => {
    console.log('asdas');
    hotspot.stop().then(() => {
        server.close(() => {
            process.exit(0);
        });
    })     
};

process.on('SIGTERM', stop);
process.on('SIGINT', stop);

hotspot.start().then(() => {
    return server.start();
});