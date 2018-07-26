import { connection, audio, video } from '../libs/common.js';
import { questions } from './questions.js';

const showLetters = () => {
    connection.send({
        event: 'letters',
        data: Object.keys(questions)
    });
};

$(document).ready(function () {
    showLetters();
    connection.listen('get-letters', showLetters);
});