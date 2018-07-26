import { connection, audio, video } from '../libs/common.js';
import { questions } from './questions.js';

const showLetters = () => {
    setTimeout(() => {
        connection.send({
            event: 'letters',
            data: Object.keys(questions)
        });
    }, 1000);
};

$(document).ready(function () {
    showLetters();
});