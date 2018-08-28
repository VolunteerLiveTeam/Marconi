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

        let snooconf = config.get('reddit.oauth');
        this.snoowrap = new Snoowrap(snooconf);

        this.snoowrap.getMe().then(me => {
            console.log("Authentication successful.");
        });


        this.influx = new InfluxDB({
            host: config.get('influx.host'),
            database: config.get('influx.database'),
            username: config.get('influx.username'),
            password: config.get('influx.password')
        });

        this.db = lowdb(config.get('database.path'));
        this.db.defaults({
            'tracking': [],
            'users': []
        }).write();



        this.db.get('tracking').value().forEach(feed => {
            if (feed.state == "live" || feed.state == "unknown") {
                this.startTracking(feed.slug, false);
            }
        });


        setInterval(this.pollMessages.bind(this), this.config.get('reddit.inboxInterval') * 1000);
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


    startTracking(token, persist = false) {
        let tm = new ThreadMonitor(this, token);

        let tracking = this.db.get('tracking').find({slug: token});

        /*if (tm.wrap.fetch(info => {
                if (info.state == 'live') {
                    if (!tracking) {
                        //this.db.
                        this.db.get('tracking').push({
                            slug: token,
                            title: info.title
                        })
                    }
                }
            }));*/

    }
}

new MonitorCore();
