var Plugin = require('../plugin'),
    os = require('os'),
    mongo = require('mongodb'),
    Db = mongo.Db,
    Server = mongo.Server,
    error = function(msg) {
        Plugin.error('mongodb', msg);
    }
;

var defaults = {
    host: 'localhost',
    port: 27017,
    poll_time: 1000, // ms
    profile: {
        level: 1
    }
};

var Mongodb = module.exports = function(options) {
    Plugin.apply(this, arguments);
    self = this;
    this.timer = null;
    this.poll_time = options.poll_time || defaults.poll_time;
    this.profiling_level = options.profile.level || defaults.profile.level;
    this.status = {
        is_connected: false,
        is_master: false,
        is_replSet: false,
        server_status: null,
        collection_stats: {}
    },
    this.db = new Db(
        options.db_name,
        new Server(options.host || defaults.host, options.port || defaults.port, {})
    );
    this.db.on('error', function(err) {
        var body = error(err);
        self.alert({
            email: {
                subject: "ALERT: commando(mongodb): db error",
                body: body
            }
        });
    });
    this.db.on('close', function(conn) {
        var body = error('connection closed to '+conn.host+":"+conn.port);
        self.alert({
            email: {
                subject: "ALERT: commando(mongodb): connection closed",
                body: body
            }
        });
        self.status.is_connected = false;
        self.monitor();
    });
};

Mongodb.prototype.__proto__ = Plugin.prototype;

Mongodb.prototype.monitor = function() {
    var self = this;

    // We might be trying to reconnect, cancel the old timer
    if (self.timer) clearInterval(self.timer);

    this.db.open(function(err, client) {
        if (err) {
            error("Failed to open database. "+err);
            return setTimeout(function() {
                self.monitor();
            }, self.poll_time);
        }
        self.status.is_connected = true;
        self.timer = setInterval(function() {
            self.collect_data();
        }, self.poll_time);
    });
};

Mongodb.prototype.collect_data = function() {
    self.db.executeDbCommand({isMaster: 1}, function(err, result) {
        if (err) return error('Failed to get master status. '+err);
        self.status.is_master = result.documents[0].ismaster;

        // Only check rest of status if we are talking to the master
        if (self.status.is_master) {

            self.db.executeDbCommand({serverStatus: 1}, function(err, result) {
                if (err) return error('Failed to get server status. '+err);
                self.status.server_status = result.documents[0];
            });

            self.db.collectionNames(function(err, docs) {
                if (err) return error('Failed to retrieve collection names. '+err);
                docs.forEach(function(doc) {
                    // strip the db name off collection name
                    var name = doc.name.substr(doc.name.indexOf('.')+1);
                    self.db.executeDbCommand({collStats: name}, function(err, result) {
                        if (err) return error('Failed to retrieve collection stats for '+doc.name+'. '+err);
                        self.status.collection_stats[name] = result.documents[0];
                    });
                });
            });
        }
    });
};

Mongodb.prototype.data = function() {
    return this.status;
};

Mongodb.prototype.action = function(action, callback) {
    this[action.name](action, callback);
};


Mongodb.prototype.profile = function(action, callback) {
};
