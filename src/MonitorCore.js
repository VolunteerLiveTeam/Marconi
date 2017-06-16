/**
 * Created by joe on 15/06/17.
 */

import Snoowrap from 'snoowrap';
import ThreadMonitor from './ThreadMonitor';
import moment from 'moment';
import {InfluxDB} from 'influx';
import config from 'config';

class MonitorCore {
    /*
    snoowrap = undefined;
    influx = undefined;

    livethreads = [];
*/
    constructor() {
        let snooconf = {
            userAgent: 'vlt team bot by (/u/youlikethaaaat)',
            clientId: 'HczUbGQrASITSw'
        };

        snooconf = config.get('reddit');

        console.log(snooconf);

        this.snoowrap = new Snoowrap(snooconf);



        this.influx = new InfluxDB({
            host: '10.48.0.3',
            database: 'reddit'
        });

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

                            var lt = this.snoowrap.getLivethread(token);
                            lt.acceptContributorInvite().then(() => {
                                var tm = new ThreadMonitor(this, token);
                            });
                        }

                        message.markAsRead();
                    }
                }
            }
        })
    }
}

new MonitorCore();