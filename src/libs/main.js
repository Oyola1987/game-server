
const COUNTDOWN = 5;
const TIME_TO_RESPOND = 60;
const range = _.range(21);

let time;
let sound;
let list = window[window.location.hash.replace('#','')];

const clearTime = () => {
    clearTimeout(time);
};

const remove = (el) => {
    if (el) {
        el.remove();
    }
};

const add = (id, content) => {
    _.each(document.querySelectorAll('#' + id), (el) => {
        el.innerHTML = content;
    });    
};

const setAudio = (src) => {
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
}

const audioPlay = function () {
    sound.play();
}

const clickOnce = (id, cb) => {
    const el = document.getElementById(id);
    const fn = () => {        
        el.removeEventListener("click", fn);
        cb(el);
    }
    el.addEventListener("click", fn);
    el.focus();
};

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getItem = () => {    
    const random = _.random(0, list.length - 1);
    const name = list[random];
    list = _.without(list, name);
    return capitalizeFirstLetter(name);
};


const addToContent = (content, name) => {  
    _.each(['', '-ext'], (key, index) => {
        const el = document.getElementById("content" + key);
        if (name && index === 1) {
            content = content.replace(name, '******');
        }
        el.innerHTML = content;
    });   
};

const countdown = (number, cb, end) => {
    const counter = (num) => {
        if (num > 0) {
            cb(num);
            time = setTimeout(() => {
                counter(num - 1);
            }, 1000);
        } else {
            end();
        }
    };

    counter(number);
};

const finishedItem = (key, txt) => {
    setAudio(key);
    const randomValue = _.random(0, range.length - 1);
    addToContent(
            `${txt}
            <image class="mw-100" src="images/${key}${randomValue}.jpg" />
            <div class="w-100 d-block mt-5"><button type="button" class="btn btn-secondary btn-lg" id="next">Siguiente</button></div>`
    );
    audioPlay();
    clickOnce('next', (el) => {
        selectBtn();
    });
};

const lostItem = (name) => {
    finishedItem('lose', '<h2 class="mb-3">' + name + '</h2><h2 class="text-danger mb-3">Has fallado</h2>');
};

const winItem = (name) => {
    clearTime();
    finishedItem('win', '<h2 class="mb-3">' + name + '</h2><h2 class="text-success mb-3">Acertado</h2>');
};

const showItem = () => {
    const name = getItem();

    addToContent('<h1>' + name + '</h1><div id="timer"></div><button type="button" class="btn btn-success btn-lg" id="win">Acertado</button>', name);

    clickOnce('win', () => {
        winItem(name);
    });

    setAudio('start');
    audioPlay();

    countdown(TIME_TO_RESPOND, (number) => {
        if (number === 25) {
            setAudio('time_pass');
            audioPlay();
        } else if (number <= 10) {
            if (number === 10) {
                setAudio('time_finished');
            }
            audioPlay();
        }  
        add('timer', '<h4 class="text-right mr-5">' + number + ' segundos</h4>');
    }, () => {
        lostItem(name);
    });
};

const waitToShow = () => {
    setAudio('countdown');
    countdown(COUNTDOWN, (number) => {
        if (number <= 5) {
            audioPlay();
        }        
        addToContent('<h4>Se mostrará en <strong>' + number + '</strong> segundos</h4>');
    }, showItem);
};

const finishedGame = () => {
    setAudio('applause');
    addToContent(
        `<image class="mw-100" src="images/finished.gif" />
            <div class="w-100 d-block mt-5"><button type="button" class="btn btn-secondary btn-lg" id="reload">Volver a empezar</button></div>`
    );
    audioPlay();
    clickOnce('reload', (el) => {
        window.location.href = 'index.html';
    });
};

const startGame = () => {
    addToContent(
        `<button type="button" class="btn btn-secondary btn-lg" id="show">Show title</button>
            <div><p class="text-right mr-5">Quedan: ${list.length}</p></div>`
    );
    clickOnce('show', (el) => {
        waitToShow();
    });
};

const selectBtn = (content) => {
    if (list.length) {
        startGame();
    } else {
        finishedGame();
    }    
};

document.addEventListener('DOMContentLoaded', () => {
    clickOnce('start', (el) => {
        selectBtn();
    });

}, false);