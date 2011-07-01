var mail = require('./util/mail'),
    async = require('async')
;

var config;
var plugins = exports.plugins = {};

var errlog = console.error;
console.error = function(msg) {
    errlog(new Date().toString() + " " + msg);
};

exports.error = function(plugin_name, msg) {
    var str = "commando: plugin/"+plugin_name+": "+msg;
    console.error(str);
    return str;
};

exports.start = function(server, options) {
    config = options;
    if (!(options.nolisten || !options.host)) {
        var port = options.port || 10000;
        server.listen({host: options.host, port: port});
    }

    if (options.alert.email) mail.configure(options.alert.email);

    if (options.plugins) {
        for (var i = 0; i < options.plugins.length; i++) {
            exports.use(options.plugins[i]);
        }
    }
};

exports.use = function(plugin_opts) {
    var name = plugin_opts.name;
    var Plugin;
    try {
        Plugin = require('./plugins/'+name);
    } catch(e) {
        Plugin = require(config.plugins_dir+"/"+name);
    }
    plugins[name] = new Plugin(plugin_opts.config);
    plugins[name].monitor();
};

exports.data = function(plugin_names) {
    var data = {};

    function all() {
        var i = 0;
        var keys = Object.keys(plugins);
        for (i = 0; i < keys.length; i++) {
            data[keys[i]] = plugins[keys[i]].data();
        }
    }

    if (plugin_names instanceof Array) {
        var name;
        for (var i = 0; i < plugin_names.length; i++) {
            name = plugin_names[i];
            data[name] = plugins[name].data();
        }
    } else if (plugin_names instanceof String) {
        if (plugin_names = 'all') {
            all();
        } else {
            data[plugin_names] = plugins[plugin_names].data();
        }
    } else {
        // plugin_names is either not there or in a format we don't understand
        // Collect data for all plugins
        all();
    }
    return data;
};

exports.alert = function(options, callback) {
    if (options.noAlert) return callback(null);

    if (options.email) {
        async.forEach(config.alert.email.addresses,
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
