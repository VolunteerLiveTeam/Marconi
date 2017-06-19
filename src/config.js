/**
 * Created by joe on 19/06/17.
 */
import convict from 'convict';
const fs = require("fs");

const config = convict({
    reddit: {
        userAgent: {
            env: 'USER_AGENT',
            default: 'vlt team bot (by /u/youlikethaaaat)'
        },
        clientId: {
            env: 'REDDIT_CLIENT_ID',
            default: undefined
        },
        clientSecret: {
            env: 'REDDIT_CLIENT_SECRET',
            default: undefined
        },
        refreshToken: {
            env: 'REDDIT_REFRESH_TOKEN',
            default: undefined
        },
        username: {
            env: 'REDDIT_USERNAME',
            default: undefined
        },
        password: {
            env: 'REDDIT_PASSWORD',
            default: undefined
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
    }
});
try {
    config.loadFile([process.cwd() + '/config/config.json5']);
}
catch(e) {

}
export default config;