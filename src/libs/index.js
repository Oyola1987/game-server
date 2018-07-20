import Connection from './connection.js';

const connection = new Connection();

$(document).ready(function() {   
    const games = ['50x15', 'pasapalabra'];
    const rolls = ['master', 'slave'];

    games.forEach((item, index) => {
        rolls.forEach((roll) => {
            $(`#game${index}${roll}`).click(function() {
                const redirect = _.first(_.difference(rolls, [roll]));

                connection.send({                            
                    redirect: `${item}/${redirect}.html`,
                });

                location.href = `${location.origin}/${item}/${roll}.html`;
            });
        });       
    });            
});