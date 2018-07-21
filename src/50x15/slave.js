import connection from '../libs/common.js';

$(document).ready(function () {   
    connection.listen('question', (data) => {
        console.log('=>', data);
    });
});