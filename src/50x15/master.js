import {connection} from '../libs/common.js';

const responseOptions = ['a', 'b', 'c', 'd'];
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

            if (item.return) {
                $('#btns-detail').hide();
                $('#btns-ask').show();
            }
        });
    });
};

const resultButtons = (number) => {
    let content = '';

    detailsBtn.forEach((item) => {
        const id = `${item.class}${number}`;

        events.push({
            id: id,
            event: item.event || item.class,
            return: true
        });

        content += `<div class="col-sm-6 mb-5 text-center">
            <button type="button" class="btn btn-${item.class} text-capitalize" id="${id}">${item.text}</button>
        </div>`
    });

    return content;
};

const selectedButtons = (number, options) => {
    let content = '';

    responseOptions.forEach((item) => {
        const id = `${item}-option${number}`;

        events.push({
            id: id,
            event: 'selected',
            data: item
        });
        content += `<div class="col-sm-9"><p><span class="text-uppercase">${item}: </span>${options.question}</p></div>`;

        content += `<div class="col-sm-3 mb-3 text-right">
            <button type="button" class="btn btn-info text-capitalize" id="${id}">Seleccionar <span class="text-uppercase">${item}</span></button>
        </div>`
    });

    return content;
};

const cleanEvents = () => {
    events.forEach(item => {
        $(`#${item.id}`).unbind('click');
    });

    events = [];
};

const showDetails = (number, message) => {
    cleanEvents();
    const el = $('#btns-detail');    
    const content = resultButtons(number) + selectedButtons(number, message);

    el.html(content);

    clickEvent();

    el.show();
};

$(document).ready(function () {   
    const range = _.range(1, 16);
    const el = $('#btns-ask');

    range.forEach(item => {
        const id = `ask${item}`;

        el.append(`<div class="col-sm-2 mb-3 text-center"><button type="button" class="btn btn-primary" id="${id}">${item}</button></div>`);

        $(`#${id}`).click(() => {
            const msg = {                
                event: 'question',
                item: item,
                question: 'Loram ipsum',
                answers: ['aa', 'bb', 'cc', 'dd']
            };

            el.hide();
            showDetails(item, msg);
            connection.send(msg);
        });
    });

});