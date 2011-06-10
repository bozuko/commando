var server = require('./lib/server');
var monitor = require('./lib/monitor');

exports.start = function(options) {
    monitor.start(server, options);
};

exports.use = monitor.use;