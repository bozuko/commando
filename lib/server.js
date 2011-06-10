var express = require('express');

var app = express.createServer(
    express.logger(),
    express.bodyParser()
);

exports.listen = function(options) {
    if (!options) return app.listen(30001);

    if (options.host) {
        app.listen(options.port || 30001, options.host);
    } else {
        app.listen(options.port || 30001);
    }
};

// Keep alive endpoint
app.get('/alive', function(req, res) {
});

// Return all monitored data for this host. The data is retrieved from the plugins.
app.get('/data', function(req, res) {
});

