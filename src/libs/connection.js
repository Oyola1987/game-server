function Connection() {
    const host = location.host;
    const connection = new WebSocket('ws://' + host, "echo-protocol");
    const that = this;    

    this.__ready = false;
    this.__events = {};
    this.__sendsPendings = [];

    connection.onopen = function () {
        that.__ready = true;
        that.__sendsPendings.forEach(data => {
            that.send(data);
        });
        that.__sendsPendings = [];
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
        if(that.__ready) {
            connection.send(JSON.stringify(data));
        } else {
            that.__sendsPendings.push(data);
        }
    }

    this.close = function () {
        connection.close();
    };
};

export default Connection;