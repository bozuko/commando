var server = require('./lib/server');
var commander = require('./lib/commander');
var plugin = require('./lib/plugin');

exports.start = function(options) {
    commander.start(server, options);
};

exports.use = commander.use;

exports.Plugin = plugin;
