const responseOptions = ['a', 'b', 'c', 'd'];
const wildCardsIds = ['phone', '50', 'public'];
const range = _.range(1, 16);

const none = 'none';

const updateHash = (ok, ko, wildcardsUsed) => {
    let url = [none, none, none];

    if(ok && ok.length) {
        url[0] = ok.join('_')
    }

    if(ko && ko.length) {
        url[1] = ko.join('_')
    }

    if(wildcardsUsed && wildcardsUsed.length) {
        url[2] = wildcardsUsed.join('_')
    }

    location.href = `#${url.join('/')}`; 
};

const convertHash = () => {
    let data = location.hash.replace('#', '').split('/');

    const state = {
        success: data[0] === none ? [] : data[0].split('_').map(item => parseInt(item, 10)),
        wrong: data[1] === none ? [] : data[1].split('_').map(item => parseInt(item, 10)),
        wildcardsUsed: data[2] === none ? [] : data[2].split('_')
    };

    return state;
};

const getState = () => {
    const hash = location.hash;

    if(!hash || !/^#(\d+|_|none)+\/(\d+|_|none)+\/\S+$/.test(hash)) {
        location.href = `#${none}/${none}/${none}`;    
    } 

    return convertHash();
};

const removeDuplicated = (dataArray, newValue) => {
    if(dataArray.includes(newValue)) {
        dataArray = _.remove(dataArray, (n) => {
            return n === newValue;
        });
    }

    return dataArray;
};

const setState = {
    wildcardsUsed: (wildcardsUsed) => {
        const data = convertHash();
        data.wildcardsUsed.push(wildcardsUsed);

        updateHash(data.success, data.wrong, _.uniq(data.wildcardsUsed));
    },
    wrong: (ko) => {
        let data = convertHash();

        data.success = removeDuplicated(data.success, ko);
        data.wrong.push(ko);

        updateHash(data.success, _.uniq(data.wrong), data.wildcardsUsed);
    },
    success: (ok) => {
        let data = convertHash();

        data.wrong = removeDuplicated(data.wrong, ok)
        data.success.push(ok);

        updateHash(_.uniq(data.success), data.wrong, data.wildcardsUsed);
    }
}

export {
    responseOptions, 
    wildCardsIds,
    range,
    getState,
    setState
};