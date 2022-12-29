const input = document.getElementById('input');
const observationChannel = new BroadcastChannel('observation');
const worker = new SharedWorker('./worker.js');
startup();
worker.port.start();
worker.port.postMessage({ command: "load", id: "input" });


function startup() {
    observationChannel.addEventListener('message', e => {
        console.log("event", e);
        switch (e.data.event) {
            case 'db_changed': {
                console.log('changed event');
                input.value = e.data.body;
            }
        }
    });

    worker.port.addEventListener('message', e => {
        switch (e.data.event) {
            case 'load': {
                console.log('load event');
                input.value = e.data.body ?? null;
                break;
            }
        }
    });

    input.addEventListener('input', e => {
        const val = e.target.value;
        const msg = { command: "store", id: "input", body: val };
        console.log('send', msg);
        worker.port.postMessage(msg);
    });
}