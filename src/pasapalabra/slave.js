import { connection, audio, video } from '../libs/common.js';

const circle = (angle) => {
    const radius = 200;
    const fields = $('.letter-item');
    const container = $(window);
    const width = container.width();
    const height = container.height();        
    const step = (2 * Math.PI) / fields.length;

    fields.each(function () {
        const x = Math.round(width / 2 + radius * Math.cos(angle) - $(this).width() / 2);
        const y = Math.round(height / 2 + radius * Math.sin(angle) - $(this).height() / 2);

        $(this).css({
            left: x + 'px',
            top: y + 'px'
        });

        angle += step;
    })
};

const centeredLetters = () => {
    circle(4.74);
};

const addLetters = (letters) => {
    const html = letters.map((item) => {
        return `<div class="letter-item text-center" id="letter-${item}">
            <h4 class="letter-content bg-primary d-inline-block"><strong>${item.toUpperCase()}</strong></h4>
        </div>`
    });

    $('#content-letters').html(html);
    centeredLetters();
};

const getLetterOfMaster = () => {
    connection.send({
        event: 'get-letters'
    }); 
};

let timeout;

const resolveLetter = (letter, className, answer) => {
    const alertEl = $(`#anwser-alert`);
    alertEl.html(`<span class="bg-primary d-inline-block">${letter.toUpperCase()}: ${answer}</span>`);

    if(timeout) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
        const el = alertEl.find('span');
        el.fadeOut(2000, () => {
            el.remove();
        }); 
    }, 3000);

    $(`#letter-${letter}`).removeClass('selected-letter');
    $(`#letter-${letter} .letter-content`).addClass('bg-' + className).removeClass('bg-primary');
};

const wrongLetter = (letter, answer) => {
    resolveLetter(letter, 'danger', answer);
    audio(`./audios/lose`);
};

const successLetter = (letter, answer) => {
    resolveLetter(letter, 'success', answer);
    const successQuestions = $('.letter-item .letter-content.bg-success').length;
    $('#question-correct').html(successQuestions);
    audio(`./audios/win`);
};

const selectedLetter = (letter) => {
    nothingSelected();
    $(`#letter-${letter}`).addClass('selected-letter');
};

const nothingSelected = () => {
    $(`.letter-item.selected-letter`).removeClass('selected-letter');
};

$(document).ready(function () {
    const timeEl = $('#time-slave');

    video('videos/intro');

    connection.listen('letters', (data) => {
        console.log('letters =>', data);
        addLetters(data.data);
    });

    connection.listen('success', (data) => {
        console.log('success =>', data);
        successLetter(data.data, data.answer);
    });

    connection.listen('wrong', (data) => {
        console.log('wrong =>', data);
        wrongLetter(data.data, data.answer);
    });

    connection.listen('time', (data) => {
        console.log('time =>', data);
        timeEl.html(data.data);
    });

    connection.listen('selected', (data) => {
        console.log('selected =>', data);
        selectedLetter(data.data);
    });

    connection.listen('pause', (data) => {
        console.log('pause =>', data);
        nothingSelected();
    });

    connection.listen('time-ended', (data) => {
        console.log('time-ended =>', data);
        audio(`./audios/timeout`);
    });

    $(window).on('resize', _.debounce(centeredLetters, 150));

    getLetterOfMaster();
});