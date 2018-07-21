
const { spawn } = require('child_process');
const _ = require('lodash');

const startHotspot = process.argv.includes('--hotspot');
const ssid = 'SSID_NAME_' + _.random(0, Date.now());
const pass = 'DINAMYC_PASSWORD_' + _.random(0, Date.now());

const exec = (command) => {
    return new Promise((resolve, reject) => {
        const args = command.split(' ');
        const cmd = args.shift();
        const ls = spawn(cmd, args);

        ls.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            if (code) {
                reject();
            } else {
                resolve();
            }
        });

    });
};

const start = () => {
    if (!startHotspot) {
        return Promise.resolve();
    }

    return exec(`netsh wlan set hostednetwork mode=allow ssid=${ssid} key=${pass}`).then(() => {
        return exec('netsh wlan start hostednetwork').then(() => {
            console.log(`WIFI:\t  ${ssid}`);
            console.log(`PASSWORD: ${pass}`);
        });
    });
};


const stop = () => {
    if (!startHotspot) {
        return Promise.resolve();
    }

    return exec('netsh wlan stop hostednetwork');
};

module.exports = {
    start: start,
    stop: stop
};
