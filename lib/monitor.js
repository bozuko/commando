var mail = require('./util/mail');

var config;
var plugins = exports.plugins = {};

exports.start = function(server, options) {
    config = options;
    server.listen({host: options.host, port: options.port});
    if (options.plugins) {
        for (var i = 0; i < options.plugins.length; i++) {
            exports.use(options.plugins[i]);
        }
    }
};

exports.use = function(plugin) {
    plugins[plugin] = require(plugin);
};

exports.data = function(plugin_names) {
    var data = {};
    if (plugins instanceof Array) {
        var name;
        for (var i = 0; i < plugin_names.length; i++) {
            name = plugin_names[i];
            data[name] = plugins[name].data();
        }
    } else if (plugin_names instanceof String) {
        data[plugin_names] = plugins[plugin_names].data();
    } else {
        // plugin_names is either not there or in a format we don't understand
        // Collect data for all plugins
        var i = 0;
        var keys = Object.keys(plugins);
        for (i = 0; i < keys.length; i++) {
            data[keys[i]] = plugins[keys[i]].data();
        }
    }
    return data;
};

exports.alert = function(options, callback) {
    if (options.email) {
        async.forEach(config.alert.email_addresses,
            function(email_address, callback) {
                return mail.send({
                    to: email_address,
                    subject: options.email.subject,
                    body: options.email.body
                }, function(err, success) {
                    if (err || !success) {
                        console.error("Failed to send alert email with subject: "+
                            options.email.subject+"to "+email_address+". "+err);
                    }
                    return callback(null);
                });
            },
            function(err) {
                if (callback) return callback(null);
            }
        );
    }
};
