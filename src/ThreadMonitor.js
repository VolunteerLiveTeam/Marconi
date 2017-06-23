/**
 * Created by joe on 16/06/17.
 */

import LiveThread from './LiveThread';

export default class SnooMonitor {
    /**
     *
     * @param {snoowrap} snoowrap
     * @param slug
     */
    constructor(core, slug) {
        this.core = core;
        this.slug = slug;

        this.live = new LiveThread(this.snoo, slug);

        this.num_posts = 0;

        //we add in the snoowrap for its api methods
        this.wrap = this.snoo.getLivethread(slug);
        this.wrap.closeStream();

        this.db = this.core.db.get('tracking').find({slug: slug});

        if (!this.db.value()) {
            this.db = this.core.db.get('tracking').push({slug: slug, state: 'unknown'});
            this.db.write();
        }
        this.wrap.fetch().then(info => {
            this.db
                .set('state', info.state)
                .set('title', info.title)
                .write();
        });

        this.live.on('settings.state', state => {
            this.db
                .set('state', state)
                .write();
        });

        this.live.on('settings.title', title => {
            this.db
                .set('title', title)
                .write();
        });


        this.live.on('update', update => {
            if (update.body.startsWith('/echo')) {
                this.wrap.deleteUpdate({id: update.id});
                this.wrap.addUpdate(update.body.substr(6));
            }
            else {
                this.num_posts += 1;

                this.core.influx.writePoints([{
                    measurement: this.core.config.get('influx.measurements.posts'),
                    tags: {
                        slug: this.slug,
                    },
                    fields: {
                        num_posts: this.num_posts
                    }
                }]);
            }
        });

        this.live.on('settings.viewer_count', count => {
            this.core.influx.writePoints([{
                measurement: this.core.config.get('influx.measurements.viewers'),
                tags: {
                    slug: this.slug,
                },
                fields: {
                    viewers: this.live.settings.viewer_count,
                    fuzzed: this.live.settings.viewer_count_fuzzed
                }
            }]);
        });
    }

    get snoo() {
        return this.core.snoowrap;
    }


}