import request from 'request';
import WebSocket from 'ws';
import EventEmitter from 'eventemitter3';


export default class LiveThread {
    constructor(snoowrap, slug) {

        this.slug = slug;
        this.snoowrap = snoowrap;

        this.settings = undefined;
        this.emitter = new EventEmitter();
        this.connected = false;

        this._connect();
    }

    geturl(path) {
        return 'https://reddit.com/live/' + this.slug + (path ? "/" + path : "");
    }

    _connect() {
        this._fetchSettings().then(settings => {
                if (this.settings.state === 'live') {
                    this.ws = new WebSocket(settings.websocket_url);
                    this.ws.on('open', () => {
                        this.emitter.emit('connected');
                        this.connected = true;
                    });
                    this.ws.on('message', (data) => {
                        data = JSON.parse(data);

                        this.emitter.emit('data', data); //good for debug

                        if (data.type === 'activity') {
                            this.settings.viewer_count = data.payload['count'];
                            this.settings.viewer_count_fuzzed = data.payload.fuzzed;

                            this.emitter.emit('activity', data);
                            this.emitter.emit('settings.viewer_count', data.payload['count']);
                        }
                        else if (data.type === 'settings') {
                            for (let key in data.payload) {
                                let value = data.payload[key];
                                let oldVal = this.settings[key];

                                this.settings[key] = value;
                                this.emitter.emit('settings.' + key, value, oldVal);
                            }
                        }

                        /*
                         updates
                         */
                        else if (data.type === 'update') {
                            this.emitter.emit('update', data.payload.data);
                        }
                        else if (data.type === 'delete') {
                            this.emitter.emit('delete', data.payload);
                        }
                        else if (data.type === 'strike') {
                            this.emitter.emit('strike', data.payload);
                        }
                        else if (data.type === 'embeds_ready') {
                            this.emitter.emit('embeds_ready', data.payload);
                        }


                        else if (data.type === 'complete') { // :(
                            let oldVal = this.settings.state;
                            this.settings.state = 'complete';

                            this.emitter.emit('settings.state', 'complete', oldVal);
                        }
                    });
                    this.ws.on('error', (err) => {
                        if (connected) { //was previously connected, connect right away
                            this.connected = false;

                            this._connect();
                        }
                    });
                    this.ws.on('close', () => {
                        this._connect();
                    });
                }
            }
        );
    }


    _fetchSettings() {
        return new Promise((resolve, reject) => {
            request(this.geturl('about.json'), (error, response, body) => {
                if (error)
                    reject();
                //console.log(body);
                let data = JSON.parse(body);
                this.settings = data.data;
                resolve(data.data);


            });
        });
    }

    _fetchDiscussions() {
        return new Promise((resolve, reject) => {
            this.snoowrap.oauthRequest({
                url: this.geturl('discussions.json'),
                method: 'get'
            }).then((error, response, body) => {
                if (error)
                    reject();

                let data = JSON.parse(body);

                resolve(data);
            });
        });
    }

    on() {
        this.emitter.on.apply(this.emitter, arguments);
    }

    once() {
        this.emitter.once.apply(this.emitter, arguments);
    }

    off() {
        this.emitter.off.apply(this.emitter, arguments);
    }
}

