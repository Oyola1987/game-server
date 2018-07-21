function Connection(cb) {
    const connection = new WebSocket('ws://localhost:4001', "echo-protocol");
    const that = this;    

    this.__events = {};

    connection.onopen = function (data) {
        console.log('onopen', data);
        if (typeof cb === 'function') {
            cb();
        }
    };

    connection.onerror = function (error) {
        console.log('onerror', error);
    };

    connection.onmessage = function (message) {
        const data = JSON.parse(message.data);

        if (data.event && that.__events[data.event]) {
            that.__events[data.event](data);
        }
    };

    this.listen = function (event, cb) {
        that.__events[event] = cb;
    };  

    this.unlisten = function (event) {
        delete that.__events[event];
    };

    this.send = function (data) {
        connection.send(JSON.stringify(data));
    }

    this.close = function () {
        connection.close();
    };
};

export default Connection;