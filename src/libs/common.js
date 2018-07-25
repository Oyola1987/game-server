import Connection from './connection.js';

const connection = new Connection();

const audio = (src) => {
    const el = $('#sounds');
    if (el) {
        el.remove();
    }

    const sound = document.createElement("audio");
    sound.id = 'sounds'
    sound.src = src + '.mp3';
    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");
    sound.style.display = "none";
    document.body.appendChild(sound);    
    sound.play();
    return sound;
};

const video = (src) => {
    const el = $('#videos');
    const videoEl = document.createElement("video");
    const sourceMP4 = document.createElement("source");

    if (el) {
        el.remove();
    }

    videoEl.id = 'videos'
    sourceMP4.type = "video/mp4";
    sourceMP4.src = src + '.mp4';
    videoEl.appendChild(sourceMP4);
    document.body.appendChild(videoEl);    
    videoEl.onended = () => {
        const vid = $('#videos');
        vid.fadeOut(5000, () => {
            vid.remove();
        }); 
    };

    videoEl.play();
}

$(document).ready(function () {     
    connection.listen('index', () => {
        connection.close();
        location.href = location.origin;
    });  
});

export {
    connection, 
    audio,
    video
};