import {connection} from '../libs/common.js';


$(document).ready(function () {   
    connection.listen('question', (data) => {
        console.log('question =>', data);
    });

    connection.listen('wrong', (data) => {
        console.log('wrong =>', data);
    });

    connection.listen('correct', (data) => {
        console.log('correct =>', data);
    });

    connection.listen('selected', (data) => {
        console.log('selected =>', data);
    });
});