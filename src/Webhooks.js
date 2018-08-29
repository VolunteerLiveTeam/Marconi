const request = require("request");

import config from './config';

export default class Webhooks {
    constructor(liveThread) {
        this.live = liveThread;

        this.listeners = {};

        const hooks = config.get("webhooks");
        Object.keys(hooks).filter(x => hooks[x].length > 0).forEach(key => {
            const listener = payload => this.sendWebhook(key, payload);
            this.live.on(key, listener);
            if (!(key in this.listeners)) {
                this.listeners[key] = [];
            }
            this.listeners[key].push(listener);
        });
    }

    disconnect() {
        Object.keys(this.listeners).forEach(key => {
            const listeners = this.listeners[key];
            listeners.forEach(listener => {
                this.live.off(key, listener);
            });
        });
    }

    sendWebhook(eventType, payload) {
        const targets = config.get(`webhooks.${eventType}`);
        if (!Array.isArray(targets)) {
            console.error(`config.${eventType} is not an array! (unexpected event type?)`);
        }
        targets.forEach(url => {
            request
                .post({
                    url,
                    body: {
                        type: eventType,
                        liveThreadId: this.live.slug,
                        payload: (payload && ('payload' in payload)) ? payload.payload : payload
                    },
                    json: true
                }, function(err, response, body) {
                    if (err) {
                        console.error(`Error from webhook ${eventType} ${url}:\r\n\r\n${err}`);
                    }
                });
        });
    }
}
