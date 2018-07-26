import Connection from './libs/connection.js';

const connection = new Connection();

$(document).ready(function() {   
    const games = ['50x15', 'pasapalabra'];
    const rolls = ['master', 'slave'];

    connection.send({
        event: 'index'
    });

    connection.listen('redirect', (data) => {
        connection.close();
        location.href = data.url;
    });    

    games.forEach((item, index) => {
        rolls.forEach((roll) => {
            $(`#game${index}${roll}`).click(function() {
                const redirect = _.first(_.difference(rolls, [roll]));

                connection.unlisten('redirect');

                connection.send({                            
                    url: `${location.origin}/${item}/${redirect}.html`,
                    event: 'redirect'
                });

                connection.close();
                location.href = `${location.origin}/${item}/${roll}.html`;
            });
        });       
    });            
});