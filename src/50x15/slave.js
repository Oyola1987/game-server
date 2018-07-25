import { connection, audio, video } from '../libs/common.js';
import { responseOptions, wildCardsIds, range } from './common.js';

const showQuestion = (data) => {
    const el = $('#question-contain');
    const answers = data.answers.map((item, index) => {
        const option = responseOptions[index];

        return `<div class="col-6 mt-2 text-center" id="option-${option}">
            <p><strong class="text-uppercase text-warning mr-2">${option} : </strong>${item}</p>
        </div>`;
    });

    el.html(`<div class="row mb-2 text-white">
            <div class="col-12 mt-2 text-center">
                <p>${data.question}</p>
            </div>
            ${answers.join('')}
        </div>`);
};

const hideQuestion = () => {
    $('#question-contain').html(``);
};

const createQuestionsStatus = () => {
    const el = $('.responses-list');

    range.forEach(item => {
        const id = `response-${item}`;

        el.append(`<div class="col-12 text-left" id="${id}">
            <span class="text-white">${item}</span>
        </div>`);
    });
};

$(document).ready(function () {   
    // video('videos/intro');
    // play();
    createQuestionsStatus();

    connection.listen('question', (data) => {
        console.log('question =>', data);
        showQuestion(data);
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
        hideQuestion();
    });

    connection.listen('wildcard', (data) => {
        console.log('wildcard =>', data);
    });
});