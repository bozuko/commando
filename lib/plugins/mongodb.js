var Plugin = require('../plugin'),
    os = require('os')
;

var defaults = {
    profile: {
        level:
    }
};

var Mongodb = module.exports = function(options) {
    Plugin.apply(this, arguments);
    this.replicas = [],
    this.profiling_level = options.profile.level || defaults.profile.level
};

Mongodb.prototype.__proto__ = Plugin.prototype;

Mongodb.prototype.monitor = function() {
};

Mongodb.prototype.data = function() {
};

Mongodb.prototype.action = function(action, callback) {
    this[action.name](action, callback);
};

Mongodb.prototype.profile = function(action, callback) {
};

