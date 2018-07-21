import Connection from './connection.js';

const connection = new Connection();

$(document).ready(function () {     
    connection.listen('index', (data) => {
        connection.close();
        location.href = location.origin;
    });  
});