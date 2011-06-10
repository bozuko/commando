var monitor = require('./monitor');

var Plugin = module.exports = function(config) {
    this.config = config;
};

// Start monitoring whatever the plugin monitors
//
Plugin.prototype.monitor = function() {
    throw new Error("This method MUST be overidden by the plugin");
};

// Issue an alert based on configured options
Plugin.prototype.alert = function(options) {
    monitor.alert(options);
};

// Return all collected data for this plugin
Plugin.prototype.data = function() {
    throw new Error("This method MUST be overidden by the plugin");
};
