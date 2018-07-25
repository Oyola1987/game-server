import { connection } from '../libs/common.js';
import { responseOptions, wildCardsIds, range } from './utils.js';
import { questions } from './questions.js';
 
const detailsBtn = [{
    text: 'Acierto',
    class: 'success',
    event: 'correct'
}, {
    text: 'Fallo',
    class: 'danger',
    event: 'wrong'
}];

let events = [];

const clickEvent = () => {
    events.forEach(item => {
        $(`#${item.id}`).bind('click', () => {
            connection.send({
                event: item.event,
                data: item.data
            });

            if (item.resolved) {
                questionResolved(item.resolved, item.className);
            }

            if (item.return) {
                $('#btns-detail').hide();
                $('#btns-ask').show();
            }           
        });
    });
};

const resultButtons = (number, options) => {
    let content = '';

    detailsBtn.forEach((item) => {
        const id = `${item.class}${number}`;
        const text = (item.class === 'success' ? `(${options.response}) ` : '') + `${item.text}`;

        events.push({
            id: id,
            resolved: item.event === 'back' ? '' : number,
            event: item.event,
            data: {
                item: number,
                answer: options.response
            },
            className: item.class,
            return: item.event === 'back'
        });

        content += `<div class="col-4 mt-5 text-center">
            <button type="button" class="btn btn-${item.class} text-capitalize" id="${id}">${text}</button>
        </div>`;
    });

    return content;
};

const createQuestions = () => {
    const el = $('#btns-ask');

    range.forEach(item => {
        const id = `ask${item}`;

        el.append(`<div class="col-2 mb-3 text-center"><button type="button" class="btn btn-light" id="${id}">${item}</button></div>`);

        $(`#${id}`).bind('click', () => {
            const msg = Object.assign({
                event: 'question',
                item: item
            }, {
                    question: questions[0].question,
                    answers: questions[0].answers
            });

            el.hide();
            showDetails(item, Object.assign({
                response: questions[0].answer
            }, msg));

            connection.send(msg);
        });
    });
};

const alertConfirm = (text, cb) => {    
    const response = confirm(text);

    if (response === true) {
        cb();        
    } 
};

const wildCards = () => {
    wildCardsIds.forEach(item => {
        const id = `#wildcard-${item}`;

        $(id).bind('click', () => {
            alertConfirm(`¿Quieres usar el comodín "${item.toUpperCase()}"?`, () => {
                connection.send({
                    event: 'wildcard',
                    data: item
                });

                $(id).unbind('click').addClass('used');
            });
        });
    });
};

const showQuestion = (data, answer) => {
    const el = $('#question-contain');
    const answers = data.answers.map((item, index) => {
        const option = responseOptions[index];
        const className = answer === option ? 'text-success' : '';
        const letterClassName = className || 'text-warning';

        return `<div class="col-6 mt-2 text-center square square-item square-bg c-pointer" id="option-${option}">
            <p class="${className}"><strong class="text-uppercase mr-2 ${letterClassName}">${option} : </strong>${item}</p>
        </div>`;
    });

    el.html(`<div class="row mb-2 text-white">
            <div class="col-12 mt-2 text-center square square-bg">
                <p>${data.question}</p>
            </div>
            ${answers.join('')}
        </div>`);
};

const listeningOptions = () => {
    responseOptions.forEach((option) => {
        $(`#option-${option}`).bind('click', () => {
            alertConfirm(`¿Quieres elegir la opción: "${option.toUpperCase()}"?`, () => {
                connection.send({
                    event: 'selected',
                    data: option
                });
            });
        });
    });
};

const createQuestionsStatus = () => {
    const el = $('.questions-list');

    range.forEach(item => {
        const id = `question-${item}`;

        el.append(`<div class="col-12 text-left mt-2">
            <button type="button" class="btn btn-light" id="${id}">${item}</button>
        </div>`);

        $(`#${id}`).bind('click', () => {
            const quest = questions.find((question) => {
                return question.order === item;
            });

            const msg = {
                event: 'question',
                item: item,
                question: quest.question,
                answers: quest.answers
            };

            showQuestion(msg, quest.answer);
            listeningOptions();
            connection.send(msg);
        });
    });
};

const startBackButton = () => {    
    $(`#back-btn`).bind('click', () => {
        responseOptions.forEach((option) => {
            $(`#option-${option}`).unbind('click');
        });

        $('#question-contain').html(``);
        connection.send({
            event: 'back'
        });
    });
};

$(document).ready(function () {   
//    createQuestions();    
    createQuestionsStatus();

    startBackButton();
    wildCards();
});