/**
 * Created by joe on 15/06/17.
 */

import Snoowrap from 'snoowrap';
import ThreadMonitor from './ThreadMonitor';
import moment from 'moment';
import {InfluxDB} from 'influx';
import lowdb from 'lowdb';

import config from './config';

class MonitorCore {
    constructor() {

        this.config = config;

        let snooconf = config.get('reddit');

        this.snoowrap = new Snoowrap(snooconf);

        this.influx = new InfluxDB({
            host: config.get('influx.host'),
            database: config.get('influx.database')
        });

        this.database = lowdb(config.get('database.path'));

        setInterval(this.pollMessages.bind(this), 30000);
    }

    pollMessages() {
        this.snoowrap.getUnreadMessages().then(inbox => {
            for (let message of inbox) {
                if (message.author.name === 'reddit') {
                    if (message.subject.startsWith('invitation to contribute to')) {
                        let info = /\[(.+)\]\((\/live\/([a-zA-Z0-9]+))\)/.exec(message.body);

                        if (info) {
                            let title = info[1];
                            let link = info[2];
                            let token = info[3];

                            let lt = this.snoowrap.getLivethread(token);
                            lt.acceptContributorInvite().then(() => {
                                this.startTracking(token);
                            });

                        }

                        message.markAsRead();
                    }
                }
            }
        })
    }

    startTracking(token) {
        let tm = new ThreadMonitor(this, token);


    }
}

new MonitorCore();