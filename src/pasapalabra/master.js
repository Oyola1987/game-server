import { connection, audio, video } from '../libs/common.js';
import { questions } from './questions.js';

const lettersWithoutResolve = Object.keys(questions);
const body = $('html, body');

let time = 120;
let currentItem = lettersWithoutResolve[0];
let interval;

const showNextLetter = (item) => {
    $(`.controls-footer .letter`).html(`(${item.toUpperCase()})`);
};

const checkFinished = () => {
    if (!lettersWithoutResolve.length) {
        clearInterval(interval);
        $('.controls-footer .btn').unbind('click').addClass('ghost');
    }
};

const questionSuccess = (letter, className, event, done) => {
    const el = $(`#question-${letter}`);

    if (el.hasClass('selected')) {
        done();
        lettersWithoutResolve.splice(lettersWithoutResolve.indexOf(letter), 1);

        connection.send({
            event: event,
            data: letter
        });

        el.addClass('bg-' + className);
        $(`#question-${letter} .btn`).unbind('click').remove();
        checkFinished();
    }
};

const listenClick = (letter) => {
    $(`#question-${letter} #success`).bind('click', () => {
        questionSuccess(letter, 'success', 'success', nextQuestion);
    });

    $(`#question-${letter} #wrong`).bind('click', () => {
        questionSuccess(letter, 'danger', 'wrong', () => {
            $(`#pause`).click();
        });
    });
};

const buildQuestions = () => {
    $('#questions').html('<div class="list-group"></div>');

    const elContent = $('#questions .list-group');

    Object.keys(questions).forEach(letter => {
        const question = questions[letter];

        elContent.append(`<div class="list-group-item list-group-item-action flex-column align-items-start" id="question-${letter}">
            <div class="row">
                <div class="col-10">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${letter.toUpperCase()}</h5>
                    </div>
                    <p class="mb-1">${question.question}</p>
                    <small>Respuesta: ${question.answer}</small>
                </div>
                <div class="col-2 text-center">
                    <button type="button" id="success" class="btn btn-outline-success mb-2 w-100">Acierto</button>
                    <button type="button" id="wrong" class="btn btn-outline-danger w-100">Fallo</button>
                </div>
            </div>            
        </div>`);

        listenClick(letter);
    });
};

const listenTimeBtns = () => {
    $(`#remove10`).bind('click', () => {
        time -= 10;
        showTime();
    });

    $(`#add10`).bind('click', () => {
        time += 10;
        showTime();
    });
};

const showTime = () => {
    let prettyTime = '00:00';

    if (time > 0) {
        const date = new Date(null);
        date.setSeconds(time);
        prettyTime = date.toISOString().substr(14, 5);
    } else {
        clearInterval(interval);
    }

    connection.send({
        event: 'time',
        data: prettyTime
    });

    $('#time').html(prettyTime);
};

const sendLetters = () => {
    connection.send({
        event: 'letters',
        data: Object.keys(questions)
    });

    showTime();
};

const markCurrentItem = () => {
    const el = $(`#question-${currentItem}`);

    connection.send({
        event: 'selected',
        data: currentItem
    });

    body.animate({
        scrollTop: el.offset().top + 'px'
    }, 'fast');
    
    el.addClass('selected');   
};

const unmarkCurrentItem = () => {
    $(`#question-${currentItem}`).removeClass('selected');
};

const getNextAvailableLetter = () => {
    let index = lettersWithoutResolve.indexOf(currentItem) + 1;
    index = index > lettersWithoutResolve.length - 1 ? 0 : index;
    return lettersWithoutResolve[index];
};

const nextQuestion = (avoidMark) => {
    if (lettersWithoutResolve.length) {
        unmarkCurrentItem();
        currentItem = getNextAvailableLetter();

        showNextLetter(getNextAvailableLetter());

        if (!avoidMark) {
            markCurrentItem();
        }        
    } 
};

const initListeners = () => {
    const elPlay = $(`#play`);
    const elPause = $(`#pause`);
    const elNext = $(`#next`);
    const hide = 'd-none';

    elNext.bind('click', () => {
        nextQuestion();
    });

    elPlay.bind('click', () => {
        markCurrentItem();
        showNextLetter(getNextAvailableLetter());
        elPlay.addClass(hide);
        elPause.removeClass(hide);
        elNext.removeClass(hide);
        interval = setInterval(() => {
            time -= 1;
            showTime();
        }, 1000);
    });

    elPause.bind('click', () => {
        connection.send({
            event: 'pause'
        });

        nextQuestion(true);
        showNextLetter(currentItem);
        elPause.addClass(hide);
        elNext.addClass(hide);
        elPlay.removeClass(hide);
        clearInterval(interval);
    });
};

$(document).ready(function () {
    sendLetters();
    connection.listen('get-letters', sendLetters);

    buildQuestions();
    listenTimeBtns();
    showNextLetter(currentItem);    
    initListeners();
});