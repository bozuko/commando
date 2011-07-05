var express = require('express'),
    commando = require('./commando')
;

var app = express.createServer(
    express.bodyParser()
);

exports.listen = function(options) {
    if (!options) return app.listen(10000);

    if (options.host) {
        app.listen(options.port || 10000, options.host);
    } else {
        app.listen(options.port || 10000);
    }
};

// Keep alive endpoint
app.get('/alive', function(req, res) {
    return res.end();
});

// Return all monitored data for this host. The data is retrieved from the plugins.
app.get('/data', function(req, res) {
    var plugins = req.param('plugins');
    if (!plugins) plugins = 'all';
    return res.send(commando.data(plugins));
});

