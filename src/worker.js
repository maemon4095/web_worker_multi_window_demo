importScripts("https://unpkg.com/dexie/dist/dexie.js");
const observationChannel = new BroadcastChannel('observation');
const db = new Dexie("db");
db.version(1).stores({ db: "id" });

self.addEventListener('connect', (e) => {
    const port = e.ports[0];

    port.addEventListener('message', async (e) => {
        console.log(`receive`, e.data);
        const command = e.data.command;
        switch (command) {
            case 'store': {
                const id = e.data.id;
                await db.db.put({ id, body: e.data.body });
                console.log('event', { event: "db_changed", id, body: e.data.body });
                observationChannel.postMessage({ event: "db_changed", id, body: e.data.body });
                break;
            }
            case 'load': {
                const id = e.data.id;
                const entry = await db.db.get(id);

                port.postMessage({ event: "load", id, body: entry?.body });
                break;
            }
        }
    });

    port.start();
});
