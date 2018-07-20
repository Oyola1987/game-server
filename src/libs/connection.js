$(function () {
    "use strict";

    function Connection() {
        const connection = new WebSocket('ws://localhost:4001', "echo-protocol");
        const that = this;
        const send = function (data) {
            that.connection.send(JSON.stringify(data));
        };

        //connection.onopen = function (data) {
        //    console.log('onopen', data);
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

        this.send = function (msg) {
            send({
                initialize: msg
            });
        }

        this.destroy = function (mg) {
            send({
                destroy: true
            });
        }
    };

    const connection = new Connection();

    window.iAmHost = function () {
        connection.send('host')
    };

    window.iAmContestant = function () {
        connection.send('contestant')
    };

});