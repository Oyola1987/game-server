import { connection, audio, video } from '../libs/common.js';


$(document).ready(function () {   
    video('videos/intro');
    // play();
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

    connection.listen('back', (data) => {
        console.log('back =>', data);
    });
});