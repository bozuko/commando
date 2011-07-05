var http = require('http'),
    async = require('async'),
    commando = require('./commando')
;

var error = function(msg) {
    var str = "mycroft: "+msg;
    console.error(str);
    return str;
};

var defaults = {
    keepalive_poll_time: 5000,
    timeout: 5000,
    poll_time: 10000
};

var config = exports.config = {};
var nodes = exports.nodes = {};

exports.start = function(options) {
    config.poll_time = options.mycroft.poll_time || defaults.poll_time;
    config.timeout = options.mycroft.timeout || defaults.timeout;
    config.keepalive_poll_time = options.mycroft.keepalive_poll_time || defaults.keepalive_poll_time;
    config.nodes = options.mycroft.nodes;

    options.mycroft.nodes.forEach(function(node) {
        var key = node.host+':'+node.port;
        nodes[key] = {
            alive: false
        };
    });

    commando.configure(options);

    // Collect Data from the commandos at an interval
    setInterval(function() {
        async.forEach(options.mycroft.nodes, collect, function(err) {
            if (err) console.error(err);
        });
    }, config.poll_time);

    // Ensure commandos are alive at an interval
    setInterval(function() {
        async.forEach(options.mycroft.nodes, keepalive, function(err) {
            if (err) console.error(err);
        });
    }, config.keepalive_poll_time);
};

function collect(node, callback) {
    var opts = Object.create(node);
    opts.path = '/data';
    var key = node.host+':'+node.port;

    return get(opts, function(err, data) {
        if (err) {
            nodes[key].last_error = {
                error: err,
                timestamp: Date.now()
            };
            var body = error(err);
            commando.alert({
                key: "mycroft/collect/"+key,
                email: {
                    subject: "ALERT: mycroft: collect() error",
                    body: body
                 }
            });
            return callback(null);
        }
        nodes[key].alive = true;
        nodes[key].data = data;
        return callback(null);
    });
}

function keepalive(node, callback) {
    var opts = Object.create(node);
    opts.path = '/alive';
    var key = node.host+':'+node.port;

    return get(opts, function(err) {
        if (err) {
            nodes[key].last_error = {
                error: err,
                timestamp: Date.now()
            };
            nodes[key].alive = false;
            var body = error(err);
            commando.alert({
                key: "mycroft/keepalive/"+key,
                email: {
                    subject: "ALERT: mycroft: Node "+key+" Down!!!",
                    body: body
                 }
            });
            return callback(null);
        }
        nodes[key].alive = true;
        return callback(null);
    });
}


function get(opts, callback) {
    opts.method = 'GET';

    var tid;
    var req = http.request(opts, function(res) {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            clearTimeout(tid);

            if (res.statusCode != 200) {
                return callback(data);
            }
            if (data == '') return callback(null, data);

            try {
                var result = JSON.parse(data);
            } catch(e) {
                return callback(e);
            }

            return callback(null, result);
        });
        res.on('error', function(err) {
            return callback(err);
        });
    });

    req.on('error', function(err) {
        return callback(err);
    });

    req.end();

    tid = setTimeout(function() {
        req.abort();
        return callback('HTTP timeout: '+ opts.host+':'+opts.port+opts.path);
    }, config.timeout);
}
