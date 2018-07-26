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

const addLetters = (letters) => {
    const html = letters.map((item) => {
        return `<div class="letter-item text-center" id="letter-${item}">
            <h4 class="letter-content bg-primary d-inline-block"><strong>${item.toUpperCase()}</strong></h4>
        </div>`
    });

    $('#content-letters').html(html);
    circle(4.74);
};

const getLetterOfMaster = () => {
    connection.send({
        event: 'get-letters'
    }); 
};

$(document).ready(function () {
    // video('videos/intro');

    connection.listen('letters', (data) => {
        console.log('letters =>', data);
        addLetters(data.data);
    });

    getLetterOfMaster();
});