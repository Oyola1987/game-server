import Connection from './connection.js';

let sound;

const connection = new Connection();
const audio = (src) => {
    const el = document.getElementById('sounds');
    if (sound) {
        remove(el);
    }

    sound = document.createElement("audio");
    sound.id = 'sounds'
    sound.src = 'audios/' + src + '.mp3';
    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");
    sound.style.display = "none";
    document.body.appendChild(sound);    
};

$(document).ready(function () {     
    connection.listen('index', () => {
        connection.close();
        location.href = location.origin;
    });  
});

export {
    connection, audio
};