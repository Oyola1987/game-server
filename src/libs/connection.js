function Connection() {
    const connection = new WebSocket('ws://localhost:4001', "echo-protocol");
    const that = this;
    const send = function (data) {
        that.connection.send(JSON.stringify(data));
    };

    //connection.onopen = function (data) {
    //    if(/^\S+:\/\/\S+:\d+(\/|)$/g.test(location.href)){
    //        console.log('should redirect to =>', `${location.href}#redirected`);
    //        send({                            
    //            redirect: `${location.href}#redirected`,
    //        });
    //    }
    //};

    connection.onerror = function (error) {
        console.log('onerror', error);
    };

    connection.onmessage = function (message) {
        const data = JSON.parse(message.data);

        if (data.redirect) {    
            connection.onclose = function (error) {
                // console.log('onclose', error);
                location.href = data.redirect;
            };
            send({
                destroy: true
            });                
        }
    };

    this.connection = connection;

    this.send = function (opts) {
        send(opts);
    }

    this.destroy = function (mg) {
        send({
            destroy: true
        });
    }
};

export default Connection;