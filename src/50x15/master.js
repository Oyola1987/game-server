import { connection } from '../libs/common.js';
import { responseOptions, wildCardsIds, range, getState, setState } from './utils.js';
import { questions } from './questions.js';
 
const alertConfirm = (text, cb) => {    
    if (confirm(text)) {
        cb();        
    } 
};

const getOptionsToRemove = (wildcardItem) => {
    let optionsToRemove = false;

    if (wildcardItem === '50') {
        const question = getCurrentQuestion();

        let random = _.random(0, 3);

        if (responseOptions[random] === question.answer && random < 3) {
            random += 1;
        } else if (responseOptions[random] === question.answer && random === 3) {
            random = 0;
        }

        optionsToRemove = _.difference(responseOptions, [question.answer, responseOptions[random]]);
        optionsToRemove.forEach(item => {
            $(`#option-${item}`).unbind('click').addClass('ghost');
        });
    }   

    return optionsToRemove;
};

const wildCards = () => {
    const state = getState();

    wildCardsIds.forEach(item => {
        const id = `#wildcard-${item}`;

        if(state.wildcardsUsed.includes(item)) {            
            $(id).addClass('used');
        } else {
            $(id).bind('click', () => {
                alertConfirm(`¿Quieres usar el comodín "${item.toUpperCase()}"?`, () => {
                    connection.send({
                        event: 'wildcard',
                        data: item,
                        optionsToRemove: getOptionsToRemove(item)
                    });
                    setState.wildcardsUsed(item);

                    $(id).unbind('click').addClass('used');
                });
            });
        }       
    });
};

const resetSelectedItem = () => {
    responseOptions.forEach(item => {
        const el = $(`#option-${item}`);

        el.removeClass('bg-warning bg-danger bg-success');
        el.addClass('square-bg');
    });
};

const showQuestion = (data, answer) => {
    const el = $('#question-contain');
    const answers = data.answers.map((item, index) => {
        const option = responseOptions[index];
        const className = answer === option ? 'text-success' : '';

        return `<div class="col-6 mt-2 text-center square square-item square-bg c-pointer" id="option-${option}">
            <p class="${className}"><strong class="text-uppercase mr-2 ${className}">${option} : </strong>${item}</p>
        </div>`;
    });

    el.html(`<div class="row mb-2 text-white" id="current-question-${data.item}">
            <div class="col-12 mt-2 text-center square square-bg">
                <p>${data.question}</p>
            </div>
            ${answers.join('')}
            <div class="col-12 text-center question-number">
               <h5>${data.item}</h5>
            </div>
        </div>`);
};

const questionResolved = (item, answer, isCorrect) => {
    const clrClass = isCorrect ? 'success' : 'danger';

    $(`#question-${item}`).removeClass('bg-light').addClass(`bg-${clrClass}`);

    if(isCorrect) {
        setState.success(item);
    } else {
        setState.wrong(item);
    }    

    connection.send({
        event: isCorrect ? 'correct' : 'wrong',
        data: {
            item: item,
            answer: answer
        },
    });
};

const listeningOptions = (options, answer) => {
    responseOptions.forEach((option) => {
        const el = $(`#option-${option}`);

        el.bind('click', () => {
            if(el.hasClass('bg-warning')) {
                alertConfirm(`¿Quieres que la opción "${option.toUpperCase()}" sea tu respuesta definitiva?`, () => {
                    const optionSelected = el.attr('id').replace('option-', '');                    

                    questionResolved(options.item, answer, optionSelected === answer);
                });
            } else {
                alertConfirm(`¿Quieres elegir la opción: "${option.toUpperCase()}"?`, () => {
                    resetSelectedItem();
                    el.addClass('bg-warning').removeClass('square-bg');

                    connection.send({
                        event: 'selected',
                        data: option
                    });
                });
            }            
        });
    });
};

const getCurrentQuestion = (item) => {
    const el = $('#question-contain > div');
    const id = el.attr('id');
    const questionItem = id && parseInt(id.replace('current-question-', ''), 10);
    return getQuestion(questionItem);
};

const getQuestion = (item) => {
    return questions.find((question) => {
        return question.order === item;
    });
};

const questionClicked = (item) => {
    const quest = getQuestion(item);

    const msg = {
        event: 'question',
        item: item,
        question: quest.question,
        answers: quest.answers
    };

    showQuestion(msg, quest.answer);
    listeningOptions(msg, quest.answer);
    connection.send(msg);
};

const createQuestionsStatus = () => {
    const el = $('.questions-list');
    const state = getState();

    range.forEach((item, index) => {
        const id = `question-${item}`;
        const col = (index + 1) % 3 === 0 ? '10' : '1';
        let textClass = 'light';

        if(state.success.includes(item)) {
            textClass = 'success';
        } else if(state.wrong.includes(item)) {
            textClass = 'danger';
        }

        if (!getQuestion(item)) {
            textClass = 'dark';
        }

        el.append(`<div class="col-${col} text-left mt-2">
            <button type="button" class="btn btn-lg btn-${textClass}" id="${id}">${item}</button>
        </div>`);

        $(`#${id}`).bind('click', () => {
            questionClicked(item);
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
    createQuestionsStatus();

    startBackButton();
    wildCards();
});