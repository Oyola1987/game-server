import { connection, audio, video } from '../libs/common.js';
import { responseOptions, range, getState, setState } from './utils.js';

let audioEl;

const resetSelectedItem = () => {
    responseOptions.forEach(item => {
        const el = $(`#option-${item}`);

        el.removeClass('bg-warning bg-danger bg-success');
        el.addClass('square-bg');
    });
};

const addItemClass = (option, className) => {    
    resetSelectedItem();

    const el = $(`#option-${option}`);

    if (el.length) {
        el.addClass(className);
        el.removeClass('square-bg');
    }
};

const answerSelected = (option) => {    
    addItemClass(option, 'bg-warning');
};

const wrongAnswer = (data) => {
    const selectedItem = $(`.bg-warning`).attr('id').replace('option-', '');

    if (selectedItem !== data.answer) {
        audioDelayed('wrong', 7000, () => {
            addItemClass(selectedItem, 'bg-danger'); 
            questionResolved(data.item, 'danger');
            setState.wrong(data.item);
        });        
    }    
};

const questionResolved = (item, clrClass) => {
    $(`#response-${item}`).removeClass('text-light').addClass(`text-${clrClass}`);
};

const rightAnswer = (data) => {    
    audioDelayed('rigth', 20000, () => {
        addItemClass(data.answer, 'bg-success');
        questionResolved(data.item, 'success');
        setState.success(data.item);
    }); 
};

const launchCountdown = () => {
    let counter = 60;
    const el = $('#wildcard-countdown');

    const interval = setInterval(() => { 
        if(counter < 0) {
            el.html('');
            clearInterval(interval);
        } else {
            el.html(counter);
            counter -= 1;
        }
    }, 1000);
};

const wildcardUsed = (wildcard, optionsToRemove) => {
    setState.wildcardsUsed(wildcard);
    $(`#wildcard-${wildcard}`).addClass('used');
    if(wildcard === 'phone') {
        launchCountdown();
    }

    if(optionsToRemove){
        optionsToRemove.forEach(item => {
            $(`#option-${item}`).addClass('ghost');          
        });
    }
};

const showQuestion = (data) => {
    const el = $('#question-contain');
    const answers = data.answers.map((item, index) => {
        const option = responseOptions[index];

        return `<div class="col-6 mt-2 text-center square square-item square-bg" id="option-${option}">
            <p><strong class="text-uppercase mr-2">${option} : </strong>${item}</p>
        </div>`;
    });

    el.html(`<div class="row mb-2 text-white">
            <div class="col-12 mt-2 text-center square square-bg">
                <p>${data.question}</p>
            </div>
            ${answers.join('')}
            <div class="col-12 text-center question-number">
               <h5>${data.item}</h5>
            </div>
        </div>`);
};

const hideQuestion = () => {
    $('#question-contain').html(``);
};

const createQuestionsStatus = () => {
    const state = getState();
    const el = $('.responses-list');
    const newRange = [...range];
    newRange.reverse();

    newRange.forEach(item => {
        const id = `response-${item}`;
        let classText = 'white';

        if(state.success.includes(item)) {
            classText = 'success';
        } else if(state.wrong.includes(item)) {
            classText = 'danger';
        }

        el.append(`<div class="col-12 text-left text-${classText}" id="${id}">
            <span>${item}</span>
        </div>`);
    });
};

const repeat = () => {
    audioEl.onended = () => {
        if (audioEl) {           
            audioEl.play();
            repeat();
        }
    };
};

const startAudio = (item) => {
    let audioFile = '1-5';

    if (item === 15) {
        audioFile = '15';
    } else if (item > 10) {
        audioFile = '11-14';
    } else if (item > 5) {
        audioFile = '6-10';
    }

    removeAudio();
    audioEl = audio(`./audios/${audioFile}`);
    repeat();
};

const removeAudio = () => {
    if (audioEl) {
        audioEl.pause();
        audioEl = null;
    }
};

const audioDelayed = (src, timeout, cb) => {
    removeAudio();
    audio(`./audios/${src}`);
    setTimeout(cb, timeout);
};

const loadWildCards = () => {
    const state = getState();
    state.wildcardsUsed.forEach((wildcard) => {
        $(`#wildcard-${wildcard}`).addClass('used');
    });    
};

$(document).ready(function () {   
    // video('videos/intro');

    createQuestionsStatus();
    loadWildCards();

    connection.listen('question', (data) => {
        console.log('question =>', data);
        showQuestion(data);        
        startAudio(data.item);
    });

    connection.listen('wrong', (data) => {
        console.log('wrong =>', data);        
        wrongAnswer(data.data);
    });

    connection.listen('correct', (data) => {
        console.log('correct =>', data);
        rightAnswer(data.data);
    });

    connection.listen('selected', (data) => {
        console.log('selected =>', data);
        answerSelected(data.data);        
    });

    connection.listen('back', (data) => {
        console.log('back =>', data);
        removeAudio();
        hideQuestion();
    });

    connection.listen('wildcard', (data) => {
        console.log('wildcard =>', data);
        wildcardUsed(data.data, data.optionsToRemove);
    });
});