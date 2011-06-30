var server = require('./lib/server');
var commando = require('./lib/commando');
var plugin = require('./lib/plugin');

exports.start = function(options) {
    commando.start(server, options);
};

exports.use = commando.use;

exports.Plugin = plugin;

exports.master = require('./lib/master');
