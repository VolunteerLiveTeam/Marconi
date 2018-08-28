/**
 * Created by joe on 19/06/17.
 */
import convict from 'convict';
const fs = require("fs");

const config = convict({
    reddit: {
        oauth: {
            userAgent: {
                env: 'USER_AGENT',
                default: 'node:github/writhem/marconi:v0.1 (by /u/youlikethaaaat + /u/pironic)',
                doc: 'See https://github.com/reddit/reddit/wiki/API#rules'
            },
            clientId: {
                env: 'REDDIT_CLIENT_ID',
                default: undefined,
                doc: 'see https://snoocore.readme.io/docs/oauth-overview'
            },
            clientSecret: {
                env: 'REDDIT_CLIENT_SECRET',
                default: undefined,
                sensitive: true
            },
            refreshToken: {
                env: 'REDDIT_REFRESH_TOKEN',
                default: undefined,
                sensitive: true
            },
            username: {
                env: 'REDDIT_USERNAME',
                default: undefined
            },
            password: {
                env: 'REDDIT_PASSWORD',
                default: undefined,
                sensitive: true
            }
        },
        inboxInterval: {
            env: 'REDDIT_INBOX_INTERVAL',
            default: 30
        }
    },
    influx: {
        enabled: {
            env: 'INFLUX_ENABLED',
            format: 'Boolean',
            default: true
        },
        host: {
            env: 'INFLUX_HOST',
            format: 'String',
            default: undefined
        },
        database: {
            env: 'INFLUX_DATABASE',
            default: 'reddit'
        },
        measurements: {
            posts: {
                env: 'INFLUX_MEASUREMENT_POSTS',
                default: 'posts'
            },
            viewers: {
                env: 'INFLUX_MEASUREMENT_VIEWERS',
                default: 'viewers'
            }
        }
    },
    database: {
        type: {
            env: 'INFLUX_DATABASE_TYPE',
            default: 'lowdb'
        },
        path: {
            env: 'INFLUX_DATABASE_PATH',
            default: 'config/database.json'
        }
    },
    webhooks: {
        connected: {
            format: Array,
            default: []
        },
        activity: {
            format: Array,
            default: []
        },
        update: {
            format: Array,
            default: []
        },
        strike: {
            format: Array,
            default: []
        },
        delete: {
            format: Array,
            default: []
        },
        embeds_ready: {
            format: Array,
            default: []
        },
        settings: {
            viewer_count: {
                format: Array,
                default: []
            },
            state: {
                format: Array,
                default: []
            },
            description: {
                format: Array,
                default: []
            },
            title: {
                format: Array,
                default: []
            },
            resources: {
                format: Array,
                default: []
            }
        }
    }
});
console.log(process.cwd());
try {
    config.loadFile('./config/config.json5');
}
catch(e) {

}

console.log(config.toString());


export default config;