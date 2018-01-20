var util = require('gulp-util');

var production = util.env.production || util.env.prod || false;
var destPath = 'dist';

var config = {
    env       : 'development',
    production: production,

    src: {
        root         : 'app',
        js           : 'app/js',
        lib          : 'app/libs'
    },
    dest: {
        root : destPath,
        html : destPath,
        css  : destPath + '/styles',
        js   : destPath + '/js',
        lib  : destPath + '/libs'
    },

    setEnv: function(env) {
        if (typeof env !== 'string') return;
        this.env = env;
        this.production = env === 'production';
        process.env.NODE_ENV = env;
    },

    logEnv: function() {
        util.log(
            'Environment:',
            util.colors.white.bgRed(' ' + process.env.NODE_ENV + ' ')
        );
    },

    errorHandler: require('./util/handle-errors')
};

config.setEnv(production ? 'production' : 'development');

module.exports = config;
